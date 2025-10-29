import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';
import { createMemoizedSelector } from '@/store/utils/memo';
import type { FounderState, PreviewState } from '@/store/founder/storeTypes';

const selectCurrentPreview = createMemoizedSelector(
  (previews: FounderState['previews'], currentStyleId: string | null): PreviewState | undefined =>
    currentStyleId ? previews[currentStyleId] : undefined
);

export const useStudioPreviewState = () =>
  useFounderStore(
    (state) => {
      const currentStyle = state.currentStyle();
      const currentStyleId = currentStyle?.id ?? null;
      const currentPreview = selectCurrentPreview(state.previews, currentStyleId);

      const previewHasData = Boolean(currentPreview?.data?.previewUrl);
      const previewReady = currentPreview?.status === 'ready';
      const orientationMismatch =
        currentPreview?.orientation != null && currentPreview.orientation !== state.orientation;

      return {
        styles: state.styles,
        currentStyle,
        currentStyleId,
        croppedImage: state.croppedImage,
        orientation: state.orientation,
        pendingStyleId: state.pendingStyleId,
        stylePreviewStatus: state.stylePreviewStatus,
        stylePreviewMessage: state.stylePreviewMessage,
        stylePreviewError: state.stylePreviewError,
        orientationPreviewPending: state.orientationPreviewPending,
        previewStatus: state.previewStatus,
        preview: currentPreview,
        hasCroppedImage: Boolean(state.croppedImage),
        previewHasData,
        previewReady,
        orientationMismatch,
      };
    },
    shallow
  );
