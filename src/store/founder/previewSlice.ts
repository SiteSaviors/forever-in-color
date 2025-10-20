import type { StateCreator } from 'zustand';
import { fetchPreviewForStyle, type PreviewResult } from '@/utils/previewClient';
import { startFounderPreviewGeneration } from '@/utils/founderPreviewGeneration';
import type { Orientation } from '@/utils/imageUtils';
import { emitStepOneEvent } from '@/utils/telemetry';
import { logPreviewStage } from '@/utils/previewAnalytics';
import { playPreviewChime } from '@/utils/playPreviewChime';
import { ENABLE_PREVIEW_QUERY_EXPERIMENT } from '@/config/featureFlags';
import { executeStartPreview } from '@/features/preview';
import { buildPreviewIdempotencyKey } from '@/utils/previewIdempotency';
import type { FounderState, StyleOption } from '../useFounderStore';

export type StylePreviewStatus =
  | 'idle'
  | 'animating'
  | 'generating'
  | 'polling'
  | 'ready'
  | 'error';

export type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data?: PreviewResult;
  orientation?: Orientation;
  error?: string;
};

export type StylePreviewCacheEntry = {
  url: string;
  orientation: Orientation;
  generatedAt: number;
  storageUrl?: string | null;
  storagePath?: string | null;
};

export type StartPreviewOptions = {
  force?: boolean;
  orientationOverride?: Orientation;
};

export type PreviewSlice = {
  previewStatus: 'idle' | 'generating' | 'ready';
  previewGenerationPromise: Promise<void> | null;
  previews: Record<string, PreviewState>;
  pendingStyleId: string | null;
  stylePreviewStatus: StylePreviewStatus;
  stylePreviewMessage: string | null;
  stylePreviewError: string | null;
  stylePreviewCache: Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>>;
  stylePreviewCacheOrder: string[];
  stylePreviewStartAt: number | null;
  firstPreviewCompleted: boolean;
  setPreviewStatus: (status: PreviewSlice['previewStatus']) => void;
  setPreviewState: (id: string, previewState: PreviewState) => void;
  setPendingStyle: (styleId: string | null) => void;
  setStylePreviewState: (status: StylePreviewStatus, message?: string | null, error?: string | null) => void;
  cacheStylePreview: (styleId: string, entry: StylePreviewCacheEntry) => void;
  getCachedStylePreview: (styleId: string, orientation: Orientation) => StylePreviewCacheEntry | undefined;
  clearStylePreviewCache: () => void;
  startStylePreview: (style: StyleOption, options?: StartPreviewOptions) => Promise<void>;
  resetPreviews: () => void;
  generatePreviews: (ids?: string[], options?: { force?: boolean; orientationOverride?: Orientation }) => Promise<void>;
};

const STYLE_PREVIEW_CACHE_LIMIT = 50;

const cacheMetrics = {
  hits: 0,
  misses: 0,
  evictions: 0,
};

const shouldLogMetrics = () =>
  typeof window !== 'undefined' && (import.meta.env?.DEV || (window as typeof window & { DEBUG_PREVIEW_CACHE?: boolean }).DEBUG_PREVIEW_CACHE);

const logCacheMetrics = () => {
  if (!shouldLogMetrics()) {
    return;
  }
  const total = cacheMetrics.hits + cacheMetrics.misses;
  const hitRate = total > 0 ? Number(((cacheMetrics.hits / total) * 100).toFixed(1)) : 0;
  console.info(
    `[PreviewCache] hits=${cacheMetrics.hits} misses=${cacheMetrics.misses} evictions=${cacheMetrics.evictions} hitRate=${hitRate}%`
  );
};

const ORIENTATION_TO_ASPECT: Record<Orientation, string> = {
  square: '1:1',
  horizontal: '3:2',
  vertical: '2:3',
};

const STAGE_MESSAGES = {
  animating: 'Summoning the Wondertone studio…',
  generating: 'Sketching base strokes…',
  polling: 'Layering textures…',
  ready: 'Preview ready',
  error: 'Generation failed',
} as const;

export const createPreviewSlice = (
  initialStyles: StyleOption[]
): StateCreator<FounderState, [], [], PreviewSlice> => {
  let inFlightPreviewAbortController: AbortController | null = null;

  return (set, get) => ({
    previewStatus: 'idle',
    previewGenerationPromise: null,
    previews: Object.fromEntries(initialStyles.map((style) => [style.id, { status: 'idle' as const }])),
    pendingStyleId: null,
    stylePreviewStatus: 'idle',
    stylePreviewMessage: null,
    stylePreviewError: null,
    stylePreviewCache: {},
    stylePreviewCacheOrder: [],
    stylePreviewStartAt: null,
    firstPreviewCompleted: false,
    setPreviewStatus: (status) => set({ previewStatus: status }),
    setPreviewState: (id, previewState) =>
      set((state) => ({
        previews: {
          ...state.previews,
          [id]: previewState,
        },
      })),
    setPendingStyle: (styleId) =>
      set({
        pendingStyleId: styleId,
      }),
    setStylePreviewState: (status, message = null, error = null) =>
      set((state) => ({
        stylePreviewStatus: status,
        stylePreviewMessage: message,
        stylePreviewError: status === 'error' ? (error ?? state.stylePreviewError ?? 'Preview failed') : null,
      })),
    cacheStylePreview: (styleId, entry) =>
      set((state) => {
        const existingForStyle = state.stylePreviewCache[styleId] ?? {};
        const key = `${styleId}:${entry.orientation}`;

        const filteredOrder = state.stylePreviewCacheOrder.filter((existingKey) => existingKey !== key);
        filteredOrder.push(key);

        const cacheCopy: Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>> = {
          ...state.stylePreviewCache,
          [styleId]: {
            ...existingForStyle,
            [entry.orientation]: entry,
          },
        };

        while (filteredOrder.length > STYLE_PREVIEW_CACHE_LIMIT) {
          const oldestKey = filteredOrder.shift();
          if (!oldestKey) break;
          const [oldStyleId, oldOrientation] = oldestKey.split(':') as [string, Orientation];
          const map = cacheCopy[oldStyleId];
          if (map && map[oldOrientation]) {
            const { [oldOrientation]: _removed, ...rest } = map;
            if (Object.keys(rest).length === 0) {
              delete cacheCopy[oldStyleId];
            } else {
              cacheCopy[oldStyleId] = rest as Partial<Record<Orientation, StylePreviewCacheEntry>>;
            }
          }
          cacheMetrics.evictions += 1;
          logCacheMetrics();
        }

        return {
          stylePreviewCache: cacheCopy,
          stylePreviewCacheOrder: filteredOrder,
        };
      }),
    getCachedStylePreview: (styleId, orientation) => {
      const state = get();
      const entry = state.stylePreviewCache[styleId]?.[orientation];
      if (entry) {
        cacheMetrics.hits += 1;
      } else {
        cacheMetrics.misses += 1;
      }
      const totalLookups = cacheMetrics.hits + cacheMetrics.misses;
      if (totalLookups % 10 === 0) {
        logCacheMetrics();
      }
      return entry;
    },
    clearStylePreviewCache: () =>
      set(() => {
        cacheMetrics.hits = 0;
        cacheMetrics.misses = 0;
        cacheMetrics.evictions = 0;
        return {
          stylePreviewCache: {},
          stylePreviewCacheOrder: [],
        };
      }),
    startStylePreview: async (style, options = {}) => {
      const state = get();
      const { force = false, orientationOverride } = options;
      const targetOrientation = orientationOverride ?? state.orientation;

      if (state.pendingStyleId && state.pendingStyleId !== style.id) {
        return;
      }

      set({ selectedStyleId: style.id });

      if (style.id === 'original-image') {
        const source = state.croppedImage ?? state.uploadedImage;
        if (source) {
          const timestamp = Date.now();
          state.setPreviewState('original-image', {
            status: 'ready',
            data: {
              previewUrl: source,
              watermarkApplied: false,
              startedAt: timestamp,
              completedAt: timestamp,
              storageUrl: source,
              storagePath: null,
            },
            orientation: targetOrientation,
          });
          set({
            pendingStyleId: null,
            stylePreviewStatus: 'idle',
            stylePreviewMessage: null,
            stylePreviewError: null,
            orientationPreviewPending: false,
          });
        }
        return;
      }

      const sourceImage =
        state.croppedImage ??
        state.smartCrops[targetOrientation]?.dataUrl ??
        state.uploadedImage ??
        state.originalImage ??
        null;
      if (!sourceImage) {
        set({
          stylePreviewStatus: 'error',
          stylePreviewMessage: 'Upload a photo to generate a preview.',
          stylePreviewError: 'No image uploaded',
          pendingStyleId: null,
          orientationPreviewPending: false,
        });
        return;
      }

      if (state.entitlements.status === 'idle' || state.entitlements.status === 'error') {
        await get().hydrateEntitlements();
      }

      const entitlementState = get().entitlements;

      if (entitlementState.status === 'error') {
        set({
          stylePreviewStatus: 'error',
          stylePreviewMessage: 'Unable to verify preview allowance. Please try again.',
          stylePreviewError: entitlementState.error ?? 'Entitlement check failed',
          pendingStyleId: null,
          orientationPreviewPending: false,
        });
        return;
      }

      const gate = get().evaluateStyleGate(style.id);
      if (!gate.allowed) {
        set((current) => ({
          stylePreviewStatus: 'idle',
          stylePreviewMessage: gate.message ?? current.stylePreviewMessage,
          stylePreviewError: gate.message ?? current.stylePreviewError,
          pendingStyleId: null,
          orientationPreviewPending: false,
          showQuotaModal: gate.reason === 'quota_exceeded' ? true : current.showQuotaModal,
        }));
        return;
      }

      const cached = !force ? state.getCachedStylePreview(style.id, targetOrientation) : undefined;
      const startTime = Date.now();
      set({ stylePreviewStartAt: startTime });
      logPreviewStage({ styleId: style.id, stage: 'start', elapsedMs: 0, timestamp: startTime });
      if (cached) {
        const timestamp = Date.now();
        state.setPreviewState(style.id, {
          status: 'ready',
          data: {
            previewUrl: cached.url,
            watermarkApplied: get().entitlements.requiresWatermark,
            startedAt: cached.generatedAt ?? timestamp,
            completedAt: cached.generatedAt ?? timestamp,
            storageUrl: cached.storageUrl ?? cached.url,
            storagePath: cached.storagePath ?? null,
          },
          orientation: targetOrientation,
        });
        set({
          pendingStyleId: null,
          stylePreviewStatus: 'idle',
          stylePreviewMessage: null,
          stylePreviewError: null,
          stylePreviewStartAt: null,
          orientationPreviewPending: false,
        });
        playPreviewChime();
        logPreviewStage({
          styleId: style.id,
          stage: 'complete',
          elapsedMs: Date.now() - startTime,
          timestamp: Date.now(),
        });
        return;
      }

      set({
        pendingStyleId: style.id,
        stylePreviewStatus: 'animating',
        stylePreviewMessage: STAGE_MESSAGES.animating,
        stylePreviewError: null,
      });

      const aspectRatio = ORIENTATION_TO_ASPECT[targetOrientation] ?? '1:1';
      emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'start' });
      try {
        const existing = state.previews[style.id];
        state.setPreviewState(style.id, {
          status: 'loading',
          data: existing?.data,
          orientation: existing?.orientation,
          error: existing?.error,
        });
        const sessionUser = get().sessionUser;
        const anonToken = sessionUser ? null : get().anonToken;
        const accessToken = get().accessToken;
        const fingerprintHash = await get().ensureFingerprintHash();
        const cachedImageHash = get().currentImageHash;

        let idempotencyImageKey = cachedImageHash;
        if (!idempotencyImageKey) {
          setTimeout(() => {
            console.warn('[PreviewIdempotency] Missing cached image hash; falling back to hashing image data directly');
          });
          idempotencyImageKey = await computeImageDigest(sourceImage);
          get().setCurrentImageHash(idempotencyImageKey);
        }

        const idempotencyKey = await buildPreviewIdempotencyKey({
          styleId: style.id,
          orientation: targetOrientation,
          imageHash: idempotencyImageKey,
          sessionUserId: sessionUser?.id ?? null,
          anonToken,
          fingerprintHash,
        });

        const handleStage = (stage: 'generating' | 'polling' | 'watermarking') => {
          if (get().pendingStyleId !== style.id) {
            return;
          }
          set({
            stylePreviewStatus: stage,
            stylePreviewMessage: STAGE_MESSAGES[stage],
            stylePreviewError: null,
          });
          emitStepOneEvent({ type: 'preview', styleId: style.id, status: stage });
          const startAt = get().stylePreviewStartAt ?? startTime;
          logPreviewStage({
            styleId: style.id,
            stage,
            elapsedMs: Date.now() - startAt,
            timestamp: Date.now(),
          });
        };

        const requestPayload = {
          imageUrl: sourceImage,
          styleId: style.id,
          styleName: style.name,
          aspectRatio,
          anonToken,
          accessToken,
          idempotencyKey,
          fingerprintHash,
          onStage: handleStage,
        } as const;

        let result: Awaited<ReturnType<typeof startFounderPreviewGeneration>>;

        if (ENABLE_PREVIEW_QUERY_EXPERIMENT) {
          if (inFlightPreviewAbortController) {
            inFlightPreviewAbortController.abort();
            inFlightPreviewAbortController = null;
          }

          const controller = new AbortController();
          inFlightPreviewAbortController = controller;

          try {
            result = await executeStartPreview({
              ...requestPayload,
              signal: controller.signal,
            });
          } finally {
            if (inFlightPreviewAbortController === controller) {
              inFlightPreviewAbortController = null;
            }
          }
        } else {
          result = await startFounderPreviewGeneration(requestPayload);
        }

        const timestamp = Date.now();
        state.cacheStylePreview(style.id, {
          url: result.previewUrl,
          orientation: targetOrientation,
          generatedAt: timestamp,
          storageUrl: result.storageUrl ?? null,
          storagePath: result.storagePath ?? null,
        });
        state.setPreviewState(style.id, {
          status: 'ready',
          data: {
            previewUrl: result.previewUrl,
            watermarkApplied: result.requiresWatermark,
            startedAt: timestamp,
            completedAt: timestamp,
            storageUrl: result.storageUrl ?? null,
            storagePath: result.storagePath ?? null,
          },
          orientation: targetOrientation,
        });

        get().updateEntitlementsFromResponse({
          remainingTokens: result.remainingTokens,
          requiresWatermark: result.requiresWatermark,
          tier: result.tier,
          priority: result.priority,
          softRemaining: result.softRemaining,
        });
        get().incrementGenerationCount();

        set({ showTokenToast: true });

        set({
          pendingStyleId: null,
          stylePreviewStatus: 'ready',
          stylePreviewMessage: STAGE_MESSAGES.ready,
          stylePreviewError: null,
          stylePreviewStartAt: null,
          orientationPreviewPending: get().orientation === targetOrientation ? false : get().orientationPreviewPending,
        });
        emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'complete' });
        playPreviewChime();
        logPreviewStage({
          styleId: style.id,
          stage: 'complete',
          elapsedMs: Date.now() - startTime,
          timestamp: Date.now(),
        });

        window.setTimeout(() => {
          if (get().stylePreviewStatus === 'ready') {
            set({ stylePreviewStatus: 'idle', stylePreviewMessage: null });
          }
        }, 400);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        const existingPreview = get().previews[style.id];
        state.setPreviewState(style.id, {
          status: 'error',
          data: existingPreview?.data,
          orientation: existingPreview?.orientation ?? targetOrientation,
          error: error instanceof Error ? error.message : 'Preview failed',
        });

        set({
          pendingStyleId: null,
          stylePreviewStatus: 'error',
          stylePreviewMessage: STAGE_MESSAGES.error,
          stylePreviewError: error instanceof Error ? error.message : 'Preview failed',
          stylePreviewStartAt: null,
        });
        emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'error' });
        logPreviewStage({
          styleId: style.id,
          stage: 'error',
          elapsedMs: Date.now() - startTime,
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : String(error),
        });

        if (error instanceof Error && (error as Error & { code?: string }).code === 'ENTITLEMENT_EXCEEDED') {
          const remaining = (error as Error & { remainingTokens?: number | null }).remainingTokens ?? 0;
          get().updateEntitlementsFromResponse({ remainingTokens: remaining });
        }

        window.setTimeout(() => {
          if (get().stylePreviewStatus === 'error') {
            set({ stylePreviewStatus: 'idle', stylePreviewMessage: null });
          }
        }, 1600);

        if (get().orientation === targetOrientation) {
          set({ orientationPreviewPending: false });
        }
      }
    },
    resetPreviews: () =>
      set((state) => ({
        previews: Object.fromEntries(
          state.styles.map((style) => [style.id, { status: 'idle' as const }])
        ),
        previewStatus: 'idle',
        stylePreviewCache: {},
        stylePreviewCacheOrder: [],
        pendingStyleId: null,
        stylePreviewStatus: 'idle',
        stylePreviewMessage: null,
        stylePreviewError: null,
        stylePreviewStartAt: null,
        orientationPreviewPending: false,
      })),
    generatePreviews: async (ids, options = {}) => {
      const store = get();
      const state = get();
      const targetOrientation = options.orientationOverride ?? state.orientation;

      if (state.previewGenerationPromise) {
        console.warn('[generatePreviews] In-flight request detected, reusing existing promise');
        return state.previewGenerationPromise;
      }

      let targetStyles: StyleOption[];
      if (ids && ids.length > 0) {
        targetStyles = store.styles.filter((style) => ids.includes(style.id));
      } else {
        const prioritized: StyleOption[] = [];
        if (state.selectedStyleId) {
          const selected = store.styles.find((style) => style.id === state.selectedStyleId);
          if (selected) {
            prioritized.push(selected);
          }
        }

        for (const style of store.styles) {
          if (prioritized.length >= 3) break;
          if (prioritized.some((item) => item.id === style.id)) continue;
          prioritized.push(style);
        }

        targetStyles = prioritized;
      }

      if (!targetStyles.length) return;

      const shouldGenerate = targetStyles.some((style) => {
        if (options.force) return true;
        const previewState = state.previews[style.id];
        return previewState?.status !== 'ready';
      });

      if (!shouldGenerate) {
        return;
      }

      let generatedAny = false;

      const generationRun = (async () => {
        set({ previewStatus: 'generating' });

        await Promise.all(
          targetStyles.map(async (style) => {
            const stateBefore = get();

            if (!options.force && stateBefore.previews[style.id]?.status === 'ready') {
              return;
            }

            const gate = stateBefore.evaluateStyleGate(style.id);
            if (!gate.allowed) {
              const existing = stateBefore.previews[style.id];
              store.setPreviewState(style.id, {
                status: 'idle',
                data: existing?.data,
                orientation: existing?.orientation,
                error: existing?.error,
              });
              if (gate.reason === 'quota_exceeded') {
                set((current) => ({
                  showQuotaModal: true,
                  stylePreviewStatus: current.stylePreviewStatus === 'loading' ? 'idle' : current.stylePreviewStatus,
                }));
              }
              return;
            }

            store.setPreviewState(style.id, {
              status: 'loading',
              data: stateBefore.previews[style.id]?.data,
              orientation: stateBefore.previews[style.id]?.orientation,
              error: stateBefore.previews[style.id]?.error,
            });

            try {
              const baseImage =
                stateBefore.croppedImage ??
                stateBefore.smartCrops[targetOrientation]?.dataUrl ??
                stateBefore.uploadedImage ??
                stateBefore.originalImage ??
                undefined;

              if (!baseImage) {
                const previous = get().previews[style.id];
                store.setPreviewState(style.id, {
                  status: 'idle',
                  data: previous?.data,
                  orientation: previous?.orientation,
                  error: previous?.error,
                });
                return;
              }

              const result = await fetchPreviewForStyle(style, baseImage);
              store.setPreviewState(style.id, {
                status: 'ready',
                data: result,
                orientation: targetOrientation,
              });
              generatedAny = true;
              store.incrementGenerationCount();
            } catch (error) {
              const previous = get().previews[style.id];
              store.setPreviewState(style.id, {
                status: 'error',
                data: previous?.data,
                orientation: previous?.orientation,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          })
        );

        set((current) => {
          const nextState: Partial<FounderState> = {
            previewStatus: 'ready',
          };
          if (generatedAny && !current.firstPreviewCompleted) {
            nextState.firstPreviewCompleted = true;
            nextState.celebrationAt = Date.now();
          }
          return nextState;
        });
      })();

      set({ previewGenerationPromise: generationRun });

      try {
        await generationRun;
      } finally {
        set({ previewGenerationPromise: null });
      }
    },
  });
};
