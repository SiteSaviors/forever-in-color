import { describe, expect, it, vi } from 'vitest';
import type { FounderState } from '@/store/founder/storeTypes';
import { createUploadPipelineSlice } from '@/store/founder/slices/canvas/uploadPipelineSlice';

const createStore = (overrides: Partial<FounderState> = {}) => {
  let state = {
    selectedStyleId: 'style-1',
    pendingStyleId: null,
    croppedImage: 'data:crop',
    uploadedImage: null,
    setPreviewState: vi.fn(),
    loadCanvasSelectionForStyle: vi.fn(),
    persistCanvasSelection: vi.fn(),
    currentStyle: () => ({ id: 'style-1' }),
    styles: [],
    ...overrides,
  } as unknown as FounderState;

  const get = () => state;
  const set = vi.fn((partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
  });

  state = { ...state, ...createUploadPipelineSlice(set, get, {} as never), ...overrides };
  return { getState: () => state, set };
};

describe('uploadPipelineSlice', () => {
  it('setOrientation sets preview pending when style requires new preview', () => {
    const store = createStore();

    store.getState().setOrientation('horizontal');

    expect(store.getState().orientation).toBe('horizontal');
    expect(store.getState().orientationPreviewPending).toBe(true);
  });

  it('setOrientation restores preview immediately for original-image style', () => {
    const store = createStore({
      selectedStyleId: 'original-image',
      croppedImage: 'data:crop',
    });

    store.getState().setOrientation('horizontal');

    expect(store.getState().orientationPreviewPending).toBe(false);
    expect(store.getState().setPreviewState).toHaveBeenCalledWith(
      'original-image',
      expect.objectContaining({
        orientation: 'horizontal',
      })
    );
  });
});
