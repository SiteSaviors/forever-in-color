import { CANVAS_SIZE_OPTIONS } from '@/utils/canvasSizes';
import type { FounderState } from '@/store/founder/storeTypes';
import type { Orientation } from '@/utils/imageUtils';

type StoreGetter = () => FounderState;
type StoreSetter = (
  partial: Partial<FounderState> | ((state: FounderState) => Partial<FounderState>),
  replace?: boolean
) => void;

export const handleOrientationChange = (
  orientation: Orientation,
  get: StoreGetter,
  set: StoreSetter
) => {
  const current = get();
  if (current.orientation === orientation) return;

  const availableOptions = CANVAS_SIZE_OPTIONS[orientation];
  const hasCurrentSize = current.selectedCanvasSize
    ? availableOptions.some((option) => option.id === current.selectedCanvasSize)
    : false;

  const nextCanvasSize = hasCurrentSize ? current.selectedCanvasSize : null;

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
      updated.setPreviewState(styleId, {
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

  set({ orientationPreviewPending: true });
};

export const restoreOriginalImagePreviewHelper = (
  get: StoreGetter,
  set: StoreSetter,
  styleId: string | null = null
) => {
  const state = get();
  const source = state.originalImage ?? state.croppedImage ?? state.uploadedImage;
  if (!source) {
    return false;
  }

  if (styleId) {
    state.setPreviewState(styleId, { status: 'idle' });
  }

  if (state.selectedStyleId !== 'original-image') {
    state.selectStyle('original-image');
  }

  const timestamp = Date.now();
  state.setPreviewState('original-image', {
    status: 'ready',
    data: {
      previewUrl: source,
      watermarkApplied: false,
      startedAt: timestamp,
      completedAt: timestamp,
    },
    orientation: state.orientation,
  });

  set({
    pendingStyleId: null,
    previewStatus: 'ready',
    stylePreviewStatus: 'idle',
    stylePreviewMessage: null,
    stylePreviewError: null,
    stylePreviewStartAt: null,
    orientationPreviewPending: false,
  });

  return true;
};

export const resetPreviewToEmptyStateHelper = (
  get: StoreGetter,
  set: StoreSetter,
  styleId: string | null = null
) => {
  const state = get();
  if (styleId) {
    state.setPreviewState(styleId, { status: 'idle' });
  }
  state.setPreviewState('original-image', { status: 'idle' });

  state.clearSmartCrops();
  state.setOriginalImageSource(null);
  state.setOriginalImageDimensions(null);
  state.setOriginalImage(null);
  state.setCroppedImage(null);
  state.setUploadedImage(null);

  set({
    selectedStyleId: null,
    pendingStyleId: null,
    previewStatus: 'idle',
    stylePreviewStatus: 'idle',
    stylePreviewMessage: null,
    stylePreviewError: null,
    stylePreviewStartAt: null,
    orientationPreviewPending: false,
    launchpadSlimMode: false,
  });
};
