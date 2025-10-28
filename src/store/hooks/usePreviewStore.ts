import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';
import type { Orientation } from '@/utils/imageUtils';

export const usePreviewState = () =>
  useFounderStore(
    (state) => ({
      previews: state.previews,
      stylePreviewCache: state.stylePreviewCache,
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
        Boolean(useFounderStore.getState().stylePreviewCache[styleId]?.[orientation]),
    }),
    shallow
  );
