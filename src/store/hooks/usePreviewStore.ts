import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';
import type { Orientation } from '@/utils/imageUtils';
import type { PreviewState } from '@/store/founder/previewSlice';
import {
  usePreviewCacheEntry as useCacheEntry,
  useHasCachedPreviewEntry,
  getCachedPreviewEntry,
} from '@/store/previewCacheStore';

export const usePreviewState = () =>
  useFounderStore(
    (state) => ({
      pendingStyleId: state.pendingStyleId,
      stylePreviewStatus: state.stylePreviewStatus,
      stylePreviewMessage: state.stylePreviewMessage,
      stylePreviewError: state.stylePreviewError,
      previewStatus: state.previewStatus,
      firstPreviewCompleted: state.firstPreviewCompleted,
      orientationPreviewPending: state.orientationPreviewPending,
    }),
    shallow
  );

export const usePreviewActions = () =>
  useFounderStore(
    (state) => ({
      startStylePreview: state.startStylePreview,
      generatePreviews: state.generatePreviews,
      resetPreviews: state.resetPreviews,
      setPreviewState: state.setPreviewState,
      setPendingStyle: state.setPendingStyle,
      setStylePreviewState: state.setStylePreviewState,
      setOrientationPreviewPending: state.setOrientationPreviewPending,
      shouldAutoGeneratePreviews: state.shouldAutoGeneratePreviews,
      registerAuthGateIntent: state.registerAuthGateIntent,
      clearAuthGateIntent: state.clearAuthGateIntent,
      resumePendingAuthPreview: state.resumePendingAuthPreview,
      hasCachedPreview: (styleId: string, orientation: Orientation) =>
        Boolean(getCachedPreviewEntry(styleId, orientation)),
    }),
    shallow
  );

export const usePreviewEntry = (styleId: string | null): PreviewState | undefined =>
  useFounderStore((state) => (styleId ? state.previews[styleId] : undefined));

export const usePreviewUrl = (styleId: string | null, orientationOverride?: Orientation): string | null => {
  const { previewUrl, orientation } = useFounderStore(
    (state) => ({
      previewUrl: styleId ? state.previews[styleId]?.data?.previewUrl ?? null : null,
      orientation: orientationOverride ?? state.orientation,
    }),
    shallow
  );

  const cacheEntry = useCacheEntry(styleId, orientation);
  return previewUrl ?? cacheEntry?.url ?? null;
};

export const usePreviewCacheEntry = (styleId: string | null, orientation: Orientation | null) =>
  useCacheEntry(styleId, orientation);

export const useHasCachedPreview = (styleId: string | null, orientation: Orientation | null): boolean =>
  useHasCachedPreviewEntry(styleId, orientation);

export { usePreviewReadiness } from './usePreviewReadiness';
