import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useUploadState = () =>
  useFounderStore(
    (state) => ({
      originalImage: state.originalImage,
      originalImageDimensions: state.originalImageDimensions,
      smartCrops: state.smartCrops,
      croppedImage: state.croppedImage,
      orientation: state.orientation,
      orientationTip: state.orientationTip,
      orientationChanging: state.orientationChanging,
      cropReadyAt: state.cropReadyAt,
      isDragging: state.isDragging,
      uploadIntentAt: state.uploadIntentAt,
    }),
    shallow
  );

export const useUploadActions = () =>
  useFounderStore(
    (state) => ({
      setUploadedImage: state.setUploadedImage,
      setCroppedImage: state.setCroppedImage,
      setOriginalImage: state.setOriginalImage,
      setOriginalImageDimensions: state.setOriginalImageDimensions,
      setOriginalImageSource: state.setOriginalImageSource,
      setOriginalImagePreviewLogId: state.setOriginalImagePreviewLogId,
      setOrientation: state.setOrientation,
      setOrientationTip: state.setOrientationTip,
      setOrientationChanging: state.setOrientationChanging,
      markCropReady: state.markCropReady,
      setDragging: state.setDragging,
      setSmartCropForOrientation: state.setSmartCropForOrientation,
      clearSmartCrops: state.clearSmartCrops,
      setPreviewState: state.setPreviewState,
      setCurrentImageHash: state.setCurrentImageHash,
      getSessionAccessToken: state.getSessionAccessToken,
    }),
    shallow
  );
