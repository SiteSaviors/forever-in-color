import type { StateCreator } from 'zustand';
import type { FounderState } from '@/store/founder/storeTypes';
import {
  handleOrientationChange,
  resetPreviewToEmptyStateHelper,
  restoreOriginalImagePreviewHelper,
} from '@/store/utils/canvasPreviewHelpers';

export type UploadPipelineSlice = Pick<
  FounderState,
  | 'uploadedImage'
  | 'croppedImage'
  | 'currentImageHash'
  | 'orientation'
  | 'orientationTip'
  | 'cropReadyAt'
  | 'isDragging'
  | 'launchpadExpanded'
  | 'launchpadSlimMode'
  | 'uploadIntentAt'
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
  | 'orientationChanging'
  | 'orientationPreviewPending'
  | 'setOrientationChanging'
  | 'setOrientationPreviewPending'
  | 'setLaunchpadExpanded'
  | 'setLaunchpadSlimMode'
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
  | 'markCropReady'
  | 'setDragging'
  | 'requestUpload'
  | 'setCurrentImageHash'
  | 'restoreOriginalImagePreview'
  | 'resetPreviewToEmptyState'
>;

export const createUploadPipelineSlice: StateCreator<FounderState, [], [], UploadPipelineSlice> = (set, get) => ({
  uploadedImage: null,
  croppedImage: null,
  currentImageHash: null,
  orientation: 'square',
  orientationTip: null,
  cropReadyAt: null,
  isDragging: false,
  launchpadExpanded: false,
  launchpadSlimMode: false,
  uploadIntentAt: null,
  originalImage: null,
  originalImageDimensions: null,
  originalImageStoragePath: null,
  originalImagePublicUrl: null,
  originalImageSignedUrl: null,
  originalImageSignedUrlExpiresAt: null,
  originalImageHash: null,
  originalImageBytes: null,
  originalImagePreviewLogId: null,
  smartCrops: {},
  orientationChanging: false,
  orientationPreviewPending: false,
  setOrientationChanging: (loading) => set({ orientationChanging: loading }),
  setOrientationPreviewPending: (pending) => set({ orientationPreviewPending: pending }),
  setLaunchpadExpanded: (expanded) => set({ launchpadExpanded: expanded }),
  setLaunchpadSlimMode: (slim) => set({ launchpadSlimMode: slim }),
  setUploadedImage: (dataUrl) =>
    set({
      uploadedImage: dataUrl,
      currentImageHash: null,
      pendingStyleId: null,
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
      launchpadExpanded: true,
      ...(dataUrl === null
        ? {
            originalImageStoragePath: null,
            originalImagePublicUrl: null,
            originalImageSignedUrl: null,
            originalImageSignedUrlExpiresAt: null,
            originalImageHash: null,
            originalImageBytes: null,
          }
        : {}),
    }),
  setCroppedImage: (dataUrl) =>
    set({
      croppedImage: dataUrl,
      currentImageHash: null,
      launchpadSlimMode: !!dataUrl,
    }),
  setOriginalImage: (dataUrl) =>
    set({
      originalImage: dataUrl,
      originalImagePreviewLogId: null,
      ...(dataUrl === null
        ? {
            originalImageStoragePath: null,
            originalImagePublicUrl: null,
            originalImageSignedUrl: null,
            originalImageSignedUrlExpiresAt: null,
            originalImageHash: null,
            originalImageBytes: null,
          }
        : {}),
    }),
  setOriginalImageDimensions: (dimensions) => set({ originalImageDimensions: dimensions }),
  setOriginalImageSource: (payload) =>
    set({
      originalImageStoragePath: payload?.storagePath ?? null,
      originalImagePublicUrl: payload?.publicUrl ?? null,
      originalImageSignedUrl: payload?.signedUrl ?? null,
      originalImageSignedUrlExpiresAt: payload?.signedUrlExpiresAt ?? null,
      originalImageHash: payload?.hash ?? null,
      originalImageBytes: payload?.bytes ?? null,
    }),
  setOriginalImagePreviewLogId: (previewLogId) => set({ originalImagePreviewLogId: previewLogId }),
  setSmartCropForOrientation: (orientation, result) =>
    set((state) => ({
      smartCrops: {
        ...state.smartCrops,
        [orientation]: result,
      },
    })),
  clearSmartCrops: () => set({ smartCrops: {} }),
  setOrientation: (orientation) => handleOrientationChange(orientation, get, set),
  setOrientationTip: (tip) => set({ orientationTip: tip }),
  markCropReady: () =>
    set((state) => ({
      cropReadyAt: Date.now(),
      launchpadSlimMode: true,
      launchpadExpanded: state.launchpadExpanded,
    })),
  setDragging: (isDragging) => set({ isDragging }),
  requestUpload: (options) =>
    set((state) => {
      const now = Date.now();
      const timestamp = state.uploadIntentAt && state.uploadIntentAt >= now ? state.uploadIntentAt + 1 : now;
      const next: Partial<FounderState> = {
        uploadIntentAt: timestamp,
        launchpadExpanded: true,
      };

      const desiredStyleId = options?.preselectedStyleId?.trim().toLowerCase();
      if (desiredStyleId) {
        const matchingStyle = state.styles.find((style) => style.id === desiredStyleId);
        if (matchingStyle) {
          next.preselectedStyleId = matchingStyle.id;
          next.selectedStyleId = matchingStyle.id;
        } else {
          next.preselectedStyleId = desiredStyleId;
        }
      }

      return next;
    }),
  setCurrentImageHash: (hash) => set({ currentImageHash: hash }),
  restoreOriginalImagePreview: (styleId = null) => restoreOriginalImagePreviewHelper(get, set, styleId),
  resetPreviewToEmptyState: (styleId = null) => resetPreviewToEmptyStateHelper(get, set, styleId),
});
