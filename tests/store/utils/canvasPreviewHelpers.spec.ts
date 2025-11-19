import { describe, expect, it, vi } from 'vitest';
import {
  handleOrientationChange,
  restoreOriginalImagePreviewHelper,
  resetPreviewToEmptyStateHelper,
} from '@/store/utils/canvasPreviewHelpers';
import type { FounderState } from '@/store/founder/storeTypes';

const createState = (overrides: Partial<FounderState> = {}) => {
  const base: Partial<FounderState> = {
    orientation: 'square',
    selectedCanvasSize: null,
    selectedStyleId: null,
    pendingStyleId: null,
    croppedImage: null,
    uploadedImage: null,
    originalImage: null,
    orientationPreviewPending: false,
    launchpadSlimMode: false,
    setPreviewState: vi.fn(),
    selectStyle: vi.fn(),
    clearSmartCrops: vi.fn(),
    setOriginalImageSource: vi.fn(),
    setOriginalImageDimensions: vi.fn(),
    setOriginalImage: vi.fn(),
    setCroppedImage: vi.fn(),
    setUploadedImage: vi.fn(),
  };

  return Object.assign(base, overrides) as FounderState;
};

const createStoreBindings = (state: FounderState) => {
  const get = () => state;
  const set = vi.fn((partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    Object.assign(state, next);
  });
  return { get, set };
};

describe('canvas preview helpers', () => {
  it('handleOrientationChange updates orientation and emits preview for original image', () => {
    const state = createState({
      selectedStyleId: 'original-image',
      croppedImage: 'data:crop',
    });
    const { get, set } = createStoreBindings(state);

    handleOrientationChange('horizontal', get, set);

    expect(state.orientation).toBe('horizontal');
    expect(state.setPreviewState).toHaveBeenCalledWith(
      'original-image',
      expect.objectContaining({
        orientation: 'horizontal',
      })
    );
    expect(state.orientationPreviewPending).toBe(false);
  });

  it('restoreOriginalImagePreview hydrates preview and resets pending flags', () => {
    const state = createState({
      originalImage: 'data:image',
      orientation: 'square',
    });
    const { get, set } = createStoreBindings(state);

    const result = restoreOriginalImagePreviewHelper(get, set, null);

    expect(result).toBe(true);
    expect(state.setPreviewState).toHaveBeenCalledWith(
      'original-image',
      expect.objectContaining({
        data: expect.objectContaining({ previewUrl: 'data:image' }),
      })
    );
    expect(state.previewStatus).toBe('ready');
    expect(state.orientationPreviewPending).toBe(false);
  });

  it('resetPreviewToEmptyState clears preview data and selection', () => {
    const state = createState({
      selectedStyleId: 'style-1',
      previewStatus: 'ready',
      stylePreviewStatus: 'ready',
      orientationPreviewPending: true,
      launchpadSlimMode: true,
    } as Partial<FounderState>);
    const { get, set } = createStoreBindings(state);

    resetPreviewToEmptyStateHelper(get, set, 'style-1');

    expect(state.setPreviewState).toHaveBeenCalledWith('style-1', { status: 'idle' });
    expect(state.selectedStyleId).toBeNull();
    expect(state.previewStatus).toBe('idle');
    expect(state.launchpadSlimMode).toBe(false);
  });
});
