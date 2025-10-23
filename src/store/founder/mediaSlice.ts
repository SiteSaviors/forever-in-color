import type { StateCreator } from 'zustand';
import type { Orientation } from '@/utils/imageUtils';
import type { SmartCropResult } from '@/utils/smartCrop';
import { CANVAS_SIZE_OPTIONS } from '@/utils/canvasSizes';
import type { FounderState } from '../useFounderStore';

export type MediaSlice = {
  uploadedImage: string | null;
  croppedImage: string | null;
  originalImage: string | null;
  originalImageDimensions: { width: number; height: number } | null;
  smartCrops: Partial<Record<Orientation, SmartCropResult>>;
  orientation: Orientation;
  orientationTip: string | null;
  orientationChanging: boolean;
  orientationPreviewPending: boolean;
  cropReadyAt: number | null;
  isDragging: boolean;
  setUploadedImage: (dataUrl: string | null) => void;
  setCroppedImage: (dataUrl: string | null) => void;
  setOriginalImage: (dataUrl: string | null) => void;
  setOriginalImageDimensions: (dimensions: { width: number; height: number } | null) => void;
  setSmartCropForOrientation: (orientation: Orientation, result: SmartCropResult) => void;
  clearSmartCrops: () => void;
  setOrientation: (orientation: Orientation) => void;
  setOrientationTip: (tip: string | null) => void;
  setOrientationChanging: (loading: boolean) => void;
  setOrientationPreviewPending: (pending: boolean) => void;
  markCropReady: () => void;
  setDragging: (dragging: boolean) => void;
};

export const createMediaSlice: StateCreator<FounderState, [], [], MediaSlice> = (set, get) => ({
  uploadedImage: null,
  croppedImage: null,
  originalImage: null,
  originalImageDimensions: null,
  smartCrops: {},
  orientation: 'square',
  orientationTip: null,
  orientationChanging: false,
  orientationPreviewPending: false,
  cropReadyAt: null,
  isDragging: false,
  setUploadedImage: (dataUrl) =>
    set({
      uploadedImage: dataUrl,
      stylePreviewCache: {},
      stylePreviewCacheOrder: [],
      pendingStyleId: null,
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
      launchpadExpanded: true,
    }),
  setCroppedImage: (dataUrl) =>
    set({
      croppedImage: dataUrl,
      launchpadSlimMode: !!dataUrl,
    }),
  setOriginalImage: (dataUrl) => set({ originalImage: dataUrl }),
  setOriginalImageDimensions: (dimensions) => set({ originalImageDimensions: dimensions }),
  setSmartCropForOrientation: (orientation, result) =>
    set((state) => ({
      smartCrops: {
        ...state.smartCrops,
        [orientation]: result,
      },
    })),
  clearSmartCrops: () => set({ smartCrops: {} }),
  setOrientationChanging: (loading) => set({ orientationChanging: loading }),
  setOrientationPreviewPending: (pending) => set({ orientationPreviewPending: pending }),
  setOrientation: (orientation) => {
    const current = get();
    if (current.orientation === orientation) return;

    const availableOptions = CANVAS_SIZE_OPTIONS[orientation];
    const hasCurrentSize = current.selectedCanvasSize
      ? availableOptions.some((option) => option.id === current.selectedCanvasSize)
      : false;
    const nextCanvasSize = hasCurrentSize ? current.selectedCanvasSize : null;

    const previousOrientation = current.orientation;
    set({ orientation, selectedCanvasSize: nextCanvasSize });

    const updated = get();
    if (updated.pendingStyleId) return;

    const styleId = updated.selectedStyleId;
    if (!styleId) {
      set({ orientationPreviewPending: false });
      return;
    }

    if (styleId === 'original-image') {
      const source = updated.croppedImage ?? updated.uploadedImage;
      if (source) {
        const timestamp = Date.now();
        updated.setPreviewState('original-image', {
          status: 'ready',
          data: {
            previewUrl: source,
            watermarkApplied: false,
            startedAt: timestamp,
            completedAt: timestamp,
          },
          orientation,
        });
      }
      set({ orientationPreviewPending: false });
      return;
    }

    const cached = updated.stylePreviewCache[styleId]?.[orientation];
    if (cached) {
      updated.setPreviewState(styleId, {
        status: 'ready',
        data: {
          previewUrl: cached.url,
          watermarkApplied: false,
          startedAt: cached.generatedAt,
          completedAt: cached.generatedAt,
        },
        orientation,
      });
      set({
        stylePreviewStatus: 'idle',
        stylePreviewMessage: null,
        stylePreviewError: null,
        orientationPreviewPending: false,
      });
    } else {
      const existing = updated.previews[styleId];
      if (existing?.data) {
        updated.setPreviewState(styleId, {
          status: existing.status,
          data: existing.data,
          orientation: existing.orientation ?? previousOrientation,
          error: existing.error,
        });
      }
      set({ orientationPreviewPending: true });
    }
  },
  setOrientationTip: (tip) => set({ orientationTip: tip }),
  markCropReady: () =>
    set((state) => ({
      cropReadyAt: Date.now(),
      launchpadSlimMode: true,
      launchpadExpanded: state.launchpadExpanded,
    })),
  setDragging: (dragging) => set({ isDragging: dragging }),
});
