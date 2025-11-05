import { ENABLE_PREVIEW_QUERY_EXPERIMENT } from '@/config/featureFlags';
import { executeStartPreview } from '@/features/preview';
import { fetchPreviewForStyle } from '@/utils/previewClient';
import { startFounderPreviewGeneration } from '@/utils/founderPreviewGeneration';
import type { Orientation } from '@/utils/imageUtils';
import { computeImageDigest } from '@/utils/imageHash';
import { buildPreviewIdempotencyKey } from '@/utils/previewIdempotency';
import { shouldRequireAuthGate } from '@/utils/authGate';
import { emitStepOneEvent } from '@/utils/telemetry';
import { logPreviewStage } from '@/utils/previewAnalytics';
import { playPreviewChime } from '@/utils/playPreviewChime';
import type { FounderState, StartPreviewOptions, StyleOption } from '../storeTypes';

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

export type PreviewEngineRuntime = {
  set: (
    partial: Partial<FounderState> | ((state: FounderState) => Partial<FounderState>),
    replace?: boolean
  ) => void;
  get: () => FounderState;
  debugPreviewStage?: (stage: string, context?: Record<string, unknown>) => void;
  abortControllerRef: { current: AbortController | null };
};

export const startStylePreviewFlow = async (
  runtime: PreviewEngineRuntime,
  style: StyleOption,
  options: StartPreviewOptions = {}
): Promise<void> => {
  const { get, set, debugPreviewStage, abortControllerRef } = runtime;
  const state = get();
  const { force = false, orientationOverride } = options;
  const targetOrientation = orientationOverride ?? state.orientation;

  const inFlightStyleId = state.pendingStyleId;
  if (inFlightStyleId) {
    const isSameStyle = inFlightStyleId === style.id;
    const canOverride = force && isSameStyle;
    if (!canOverride) {
      if (import.meta.env?.DEV) {
        console.info('[startStylePreview] Preview already in progress, ignoring additional request', {
          inFlightStyleId,
          requestedStyleId: style.id,
        });
      }
      return;
    }
  }

  set({ selectedStyleId: style.id });
  debugPreviewStage?.('start', {
    styleId: style.id,
    force,
    orientation: targetOrientation,
  });

  if (style.id === 'original-image') {
    const originalState = get();
    const source = originalState.croppedImage ?? originalState.uploadedImage;
    if (source) {
      const timestamp = Date.now();
      originalState.setPreviewState('original-image', {
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

  const latestState = get();
  const sourceImage =
    latestState.croppedImage ??
    latestState.smartCrops[targetOrientation]?.dataUrl ??
    latestState.uploadedImage ??
    latestState.originalImage ??
    null;
  if (!sourceImage) {
    set({
      stylePreviewStatus: 'error',
      stylePreviewMessage: 'Upload a photo to generate a preview.',
      stylePreviewError: 'No image uploaded',
      pendingStyleId: null,
      orientationPreviewPending: false,
    });
    debugPreviewStage?.('no_source_image', { styleId: style.id });
    return;
  }

  if (latestState.entitlements.status === 'idle' || latestState.entitlements.status === 'error') {
    debugPreviewStage?.('hydrate_entitlements', { styleId: style.id, status: latestState.entitlements.status });
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
    debugPreviewStage?.('entitlement_error', { styleId: style.id, error: entitlementState.error });
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
    debugPreviewStage?.('gate_blocked', { styleId: style.id, reason: gate.reason ?? 'unknown' });
    return;
  }

  const cached = !force ? get().getCachedStylePreview(style.id, targetOrientation) : undefined;
  const startTime = Date.now();
  set({ stylePreviewStartAt: startTime });
  logPreviewStage({ styleId: style.id, stage: 'start', elapsedMs: 0, timestamp: startTime });
  if (cached) {
    const timestamp = Date.now();
    const current = get();
    current.setPreviewState(style.id, {
      status: 'ready',
      data: {
        previewUrl: cached.url,
        watermarkApplied: get().entitlements.requiresWatermark,
        startedAt: cached.generatedAt ?? timestamp,
        completedAt: cached.generatedAt ?? timestamp,
        storageUrl: cached.storageUrl ?? cached.url,
        storagePath: cached.storagePath ?? null,
        sourceStoragePath: cached.sourceStoragePath ?? null,
        sourceDisplayUrl: cached.sourceDisplayUrl ?? cached.storageUrl ?? null,
        previewLogId: cached.previewLogId ?? null,
        cropConfig: cached.cropConfig ?? null,
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
    debugPreviewStage?.('cache_hit', {
      styleId: style.id,
      orientation: targetOrientation,
      generatedAt: cached.generatedAt ?? null,
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

  const latest = get();
  const sessionUser = latest.sessionUser;
  const accessToken = latest.accessToken;
  const gateRequired = shouldRequireAuthGate(sessionUser?.id ?? null);

  if (!sessionUser && gateRequired) {
    const existing = latest.previews[style.id];
    if (existing) {
      latest.setPreviewState(style.id, existing);
    } else {
      latest.setPreviewState(style.id, { status: 'idle' });
    }
    latest.registerAuthGateIntent(style.id, options);
    set({
      pendingStyleId: null,
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
    });
    return;
  }

  const cachedImageHash = latest.currentImageHash;

  emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'start' });

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
    debugPreviewStage?.('stage_update', { styleId: style.id, stage });
    const startAt = get().stylePreviewStartAt ?? startTime;
    logPreviewStage({
      styleId: style.id,
      stage,
      elapsedMs: Date.now() - startAt,
      timestamp: Date.now(),
    });
  };

  const cropResult = latest.smartCrops[targetOrientation] ?? null;
  const cropConfigForRequest = cropResult
    ? {
        x: cropResult.region.x,
        y: cropResult.region.y,
        width: cropResult.region.width,
        height: cropResult.region.height,
        orientation: cropResult.orientation,
        imageWidth: cropResult.imageDimensions.width,
        imageHeight: cropResult.imageDimensions.height,
        generatedAt: cropResult.generatedAt,
        generatedBy: cropResult.generatedBy,
      }
    : null;

  const sourceStoragePath = latest.originalImageStoragePath ?? null;
  const signedExpiry = latest.originalImageSignedUrlExpiresAt ?? null;
  const now = Date.now();
  const signedUrlValid = Boolean(latest.originalImageSignedUrl && signedExpiry && signedExpiry > now + 5000);
  const sourceDisplayUrl = signedUrlValid ? latest.originalImageSignedUrl : latest.originalImagePublicUrl ?? null;

  const aspectRatio = ORIENTATION_TO_ASPECT[targetOrientation] ?? '1:1';

  try {
    let result: Awaited<ReturnType<typeof startFounderPreviewGeneration>>;
    if (ENABLE_PREVIEW_QUERY_EXPERIMENT) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        debugPreviewStage?.('execute_preview_experiment', { styleId: style.id });
        result = await executeStartPreview({
          imageUrl: sourceImage,
          styleId: style.id,
          styleName: style.name,
          aspectRatio,
          accessToken,
          idempotencyKey,
          onStage: handleStage,
          sourceStoragePath,
          sourceDisplayUrl,
          cropConfig: cropConfigForRequest,
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    } else {
      debugPreviewStage?.('execute_preview_standard', { styleId: style.id });
      result = await startFounderPreviewGeneration({
        imageUrl: sourceImage,
        styleId: style.id,
        styleName: style.name,
        aspectRatio,
        accessToken,
        idempotencyKey,
        onStage: handleStage,
        sourceStoragePath,
        sourceDisplayUrl,
        cropConfig: cropConfigForRequest,
      });
    }

    debugPreviewStage?.('result_received', {
      styleId: style.id,
      requiresWatermark: result.requiresWatermark,
      remainingTokens: result.remainingTokens ?? null,
    });

    const timestamp = Date.now();
    get().cacheStylePreview(style.id, {
      url: result.previewUrl,
      orientation: targetOrientation,
      generatedAt: timestamp,
      storageUrl: result.storageUrl ?? null,
      storagePath: result.storagePath ?? null,
      sourceStoragePath: result.sourceStoragePath ?? null,
      sourceDisplayUrl: result.sourceDisplayUrl ?? null,
      previewLogId: result.previewLogId ?? null,
      cropConfig: result.cropConfig ?? null,
    });
    get().setPreviewState(style.id, {
      status: 'ready',
      data: {
        previewUrl: result.previewUrl,
        watermarkApplied: result.requiresWatermark,
        startedAt: timestamp,
        completedAt: timestamp,
        storageUrl: result.storageUrl ?? null,
        storagePath: result.storagePath ?? null,
        sourceStoragePath: result.sourceStoragePath ?? null,
        sourceDisplayUrl: result.sourceDisplayUrl ?? result.storageUrl ?? null,
        previewLogId: result.previewLogId ?? null,
        cropConfig: result.cropConfig ?? null,
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
    debugPreviewStage?.('complete', {
      styleId: style.id,
      elapsedMs: Date.now() - startTime,
      source: 'network',
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
    get().setPreviewState(style.id, {
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
    debugPreviewStage?.('error', {
      styleId: style.id,
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
  } finally {
    if (get().pendingStyleId === style.id) {
      set({ pendingStyleId: null });
    }
    if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
  }
};

export const generatePreviewsFlow = async (
  runtime: PreviewEngineRuntime,
  ids?: string[],
  options: { force?: boolean; orientationOverride?: Orientation } = {}
): Promise<void> => {
  const { get, set } = runtime;
  const store = get();
  const targetOrientation = options.orientationOverride ?? store.orientation;

  if (store.previewGenerationPromise) {
    console.warn('[generatePreviews] In-flight request detected, reusing existing promise');
    return store.previewGenerationPromise;
  }

  let targetStyles: StyleOption[];
  if (ids && ids.length > 0) {
    targetStyles = store.styles.filter((style) => ids.includes(style.id));
  } else {
    const prioritized: StyleOption[] = [];
    if (store.selectedStyleId) {
      const selected = store.styles.find((style) => style.id === store.selectedStyleId);
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
    const previewState = store.previews[style.id];
    return previewState?.status !== 'ready';
  });

  if (!shouldGenerate) {
    return;
  }

  let generatedAny = false;

  const generationRun = (async () => {
    set({ previewStatus: 'generating' });

    for (const style of targetStyles) {
      const stateBefore = get();

      if (!options.force && stateBefore.previews[style.id]?.status === 'ready') {
        continue;
      }

      const gate = stateBefore.evaluateStyleGate(style.id);
      if (!gate.allowed) {
        const existing = stateBefore.previews[style.id];
        stateBefore.setPreviewState(style.id, {
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
        continue;
      }

      stateBefore.setPreviewState(style.id, {
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
          stateBefore.setPreviewState(style.id, {
            status: 'idle',
            data: previous?.data,
            orientation: previous?.orientation,
            error: previous?.error,
          });
          continue;
        }

        const result = await fetchPreviewForStyle(style, baseImage);
        stateBefore.setPreviewState(style.id, {
          status: 'ready',
          data: result,
          orientation: targetOrientation,
        });
        generatedAny = true;
        stateBefore.incrementGenerationCount();
      } catch (error) {
        const previous = get().previews[style.id];
        stateBefore.setPreviewState(style.id, {
          status: 'error',
          data: previous?.data,
          orientation: previous?.orientation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

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
};

export const resumePendingAuthPreviewFlow = async (runtime: PreviewEngineRuntime): Promise<void> => {
  const { get, set } = runtime;
  const state = get();
  const styleId = state.pendingAuthStyleId;
  if (!styleId) {
    return;
  }

  const style = state.styles.find((entry) => entry.id === styleId);
  if (!style) {
    set({ pendingAuthStyleId: null, pendingAuthOptions: null, authGateOpen: false });
    return;
  }

  set({ authGateOpen: false });

  try {
    await state.startStylePreview(style, state.pendingAuthOptions ?? undefined);
  } finally {
    set({ pendingAuthStyleId: null, pendingAuthOptions: null });
  }
};

export const abortPreviewGenerationFlow = (runtime: PreviewEngineRuntime): void => {
  const { abortControllerRef, set } = runtime;
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
  set({ pendingStyleId: null });
};
