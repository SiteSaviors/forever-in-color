import { describe, expect, it, vi } from 'vitest';
import { createCanvasConfigSlice } from '@/store/founder/slices/canvas/canvasConfigSlice';
import type { Enhancement, FounderState } from '@/store/founder/storeTypes';

const seedEnhancements: Enhancement[] = [
  { id: 'floating-frame', name: 'Floating Frame', description: '', price: 29, enabled: false },
  { id: 'living-canvas', name: 'Living Canvas', description: '', price: 59, enabled: false },
];

const createTestStore = () => {
  let state = {
    orientation: 'square',
    canvasModalOpen: false,
    closeCanvasModal: vi.fn(),
    livingCanvasModalOpen: false,
    styles: [],
  } as unknown as FounderState;

  const get = () => state;
  const set = vi.fn((partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
  });

  const slice = createCanvasConfigSlice(seedEnhancements)(set, get, {} as never);
  state = { ...state, ...slice };

  return { getState: () => state };
};

describe('canvasConfigSlice', () => {
  it('persistCanvasSelection captures snapshot per style', () => {
    const store = createTestStore();
    store.getState().selectedStyleId = 'style-1';
    store.getState().selectedCanvasSize = '24x24';
    store.getState().selectedFrame = 'black';
    store.getState().enhancements[0].enabled = true;

    store.getState().persistCanvasSelection();

    expect(store.getState().canvasSelections['style-1']).toEqual({
      size: '24x24',
      frame: 'black',
      enhancements: ['floating-frame'],
    });
  });

  it('loadCanvasSelectionForStyle hydrates saved values', () => {
    const store = createTestStore();
    store.getState().canvasSelections['style-1'] = {
      size: '30x40',
      frame: 'white',
      enhancements: ['floating-frame'],
    };

    store.getState().loadCanvasSelectionForStyle('style-1');

    expect(store.getState().selectedCanvasSize).toBe('30x40');
    expect(store.getState().selectedFrame).toBe('white');
    expect(store.getState().enhancements.find((e) => e.id === 'floating-frame')?.enabled).toBe(true);
  });

  it('loadCanvasSelectionForStyle seeds defaults when missing', () => {
    const store = createTestStore();

    store.getState().loadCanvasSelectionForStyle('style-2');

    expect(store.getState().selectedCanvasSize).toBeDefined();
    expect(store.getState().canvasSelections['style-2']).toBeTruthy();
  });
});
