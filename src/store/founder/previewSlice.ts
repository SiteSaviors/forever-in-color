import type { StateCreator } from 'zustand';
import { cachePreviewEntry, getCachedPreviewEntry, clearPreviewCache } from '@/store/previewCacheStore';
import { useAuthModal } from '@/store/useAuthModal';
import type { FounderState, PreviewSlice, StyleOption } from './storeTypes';
import {
  startStylePreviewEngine,
  generatePreviewsEngine,
  resumePendingAuthPreviewEngine,
  abortPreviewGenerationEngine,
} from './previewEngine/loader';

export type { PreviewSlice, PreviewState, StartPreviewOptions, StylePreviewCacheEntry, StylePreviewStatus } from './storeTypes';


export const createPreviewSlice = (
  initialStyles: StyleOption[]
): StateCreator<FounderState, [], [], PreviewSlice> => {
  const abortControllerRef = { current: null as AbortController | null };

  return (set, get) => ({
    previewStatus: 'idle',
    previewGenerationPromise: null,
    previews: Object.fromEntries(initialStyles.map((style) => [style.id, { status: 'idle' as const }])),
    pendingStyleId: null,
    stylePreviewStatus: 'idle',
    stylePreviewMessage: null,
    stylePreviewError: null,
    stylePreviewStartAt: null,
    firstPreviewCompleted: false,
    authGateOpen: false,
    pendingAuthStyleId: null,
    pendingAuthOptions: null,
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
    cacheStylePreview: (styleId, entry) => {
      cachePreviewEntry(styleId, entry);
    },
    getCachedStylePreview: (styleId, orientation) => getCachedPreviewEntry(styleId, orientation),
    clearStylePreviewCache: () => {
      clearPreviewCache();
    },
    setAuthGateOpen: (open) => {
      if (open) {
        const pendingStyleId = get().pendingAuthStyleId ?? get().pendingStyleId;
        if (pendingStyleId) {
          useAuthModal.getState().registerGateIntent({
            styleId: pendingStyleId,
            options: get().pendingAuthOptions ?? null,
            source: 'preview',
            autoOpen: true,
          });
        }
        set({ authGateOpen: true });
      } else {
        useAuthModal.getState().clearGateIntent('dismiss');
        set({ authGateOpen: false });
      }
    },
    registerAuthGateIntent: (styleId, options) => {
      const normalizedOptions = options ?? null;
      useAuthModal.getState().registerGateIntent({
        styleId,
        options: normalizedOptions,
        source: 'preview',
        autoOpen: true,
      });
      set({
        authGateOpen: true,
        pendingAuthStyleId: styleId,
        pendingAuthOptions: normalizedOptions,
      });
    },
    clearAuthGateIntent: () => {
      useAuthModal.getState().clearGateIntent('dismiss');
      set({
        authGateOpen: false,
        pendingAuthStyleId: null,
        pendingAuthOptions: null,
      });
    },
    startStylePreview: async (style, options = {}) =>
      startStylePreviewEngine({ set, get, abortControllerRef }, style, options),
    resetPreviews: () =>
      set((state) => {
        clearPreviewCache();
        return {
          previews: Object.fromEntries(
            state.styles.map((style) => [style.id, { status: 'idle' as const }])
          ),
          previewStatus: 'idle',
          pendingStyleId: null,
          stylePreviewStatus: 'idle',
          stylePreviewMessage: null,
          stylePreviewError: null,
          stylePreviewStartAt: null,
          orientationPreviewPending: false,
        };
      }),
    generatePreviews: async (ids, options = {}) =>
      generatePreviewsEngine({ set, get, abortControllerRef }, ids, options),
    resumePendingAuthPreview: async () =>
      resumePendingAuthPreviewEngine({ set, get, abortControllerRef }),
    abortPreviewGeneration: () => {
      void abortPreviewGenerationEngine({ set, get, abortControllerRef });
    },
  });
};
