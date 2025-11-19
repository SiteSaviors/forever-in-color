import { shallow } from 'zustand/shallow';
import { useFounderStore, type FounderState } from '@/store/useFounderStore';

/**
 * Interim proxy hooks that expose the major canvas slices through useFounderStore.
 * These enable incremental refactors (see docs/FOUNDER_STORE_RESEARCH.md Phase 1.2).
 */

export type CanvasConfigSlice = Pick<
  FounderState,
  | 'styles'
  | 'selectedStyleId'
  | 'selectedCanvasSize'
  | 'selectedFrame'
  | 'enhancements'
  | 'canvasSelections'
  | 'selectStyle'
  | 'clearSelectedStyle'
  | 'setCanvasSize'
  | 'setFrame'
  | 'toggleEnhancement'
  | 'setEnhancementEnabled'
  | 'persistCanvasSelection'
  | 'loadCanvasSelectionForStyle'
  | 'computedTotal'
  | 'livingCanvasEnabled'
>;

export const useCanvasConfigState = <T,>(
  selector: (state: CanvasConfigSlice) => T,
  equalityFn: (a: T, b: T) => boolean = shallow
) => useFounderStore((state) => selector(state as CanvasConfigSlice), equalityFn);

export type CanvasModalSlice = Pick<
  FounderState,
  | 'canvasModalOpen'
  | 'canvasModalSource'
  | 'canvasModalOpenedAt'
  | 'lastCanvasModalSource'
  | 'openCanvasModal'
  | 'closeCanvasModal'
  | 'livingCanvasModalOpen'
  | 'setLivingCanvasModalOpen'
>;

export const useCanvasModalState = <T,>(
  selector: (state: CanvasModalSlice) => T,
  equalityFn: (a: T, b: T) => boolean = shallow
) => useFounderStore((state) => selector(state as CanvasModalSlice), equalityFn);

export type UploadPipelineSlice = Pick<
  FounderState,
  | 'uploadedImage'
  | 'croppedImage'
  | 'originalImage'
  | 'originalImageDimensions'
  | 'originalImageStoragePath'
  | 'originalImagePublicUrl'
  | 'originalImageSignedUrl'
  | 'originalImageSignedUrlExpiresAt'
  | 'originalImageHash'
  | 'originalImageBytes'
  | 'originalImagePreviewLogId'
  | 'smartCrops'
  | 'orientation'
  | 'orientationTip'
  | 'orientationChanging'
  | 'orientationPreviewPending'
  | 'cropReadyAt'
  | 'isDragging'
  | 'launchpadExpanded'
  | 'launchpadSlimMode'
  | 'uploadIntentAt'
  | 'currentImageHash'
  | 'setUploadedImage'
  | 'setCroppedImage'
  | 'setOriginalImage'
  | 'setOriginalImageDimensions'
  | 'setOriginalImageSource'
  | 'setOriginalImagePreviewLogId'
  | 'setSmartCropForOrientation'
  | 'clearSmartCrops'
  | 'setOrientation'
  | 'setOrientationTip'
  | 'setOrientationChanging'
  | 'setOrientationPreviewPending'
  | 'markCropReady'
  | 'setDragging'
  | 'setLaunchpadExpanded'
  | 'setLaunchpadSlimMode'
  | 'requestUpload'
  | 'setCurrentImageHash'
  | 'restoreOriginalImagePreview'
  | 'resetPreviewToEmptyState'
>;

export const useUploadPipelineState = <T,>(
  selector: (state: UploadPipelineSlice) => T,
  equalityFn: (a: T, b: T) => boolean = shallow
) => useFounderStore((state) => selector(state as UploadPipelineSlice), equalityFn);
