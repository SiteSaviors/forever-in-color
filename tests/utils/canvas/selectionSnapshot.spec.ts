import { describe, expect, it } from 'vitest';
import { createCanvasSelectionSnapshot } from '@/utils/canvas/selectionSnapshot';
import type { FounderBaseState } from '@/store/founder/storeTypes';

const buildState = (overrides: Partial<FounderBaseState>): FounderBaseState =>
  ({
    enhancements: [],
    selectedCanvasSize: null,
    selectedFrame: 'none',
    orientation: 'square',
    ...overrides,
  } as unknown as FounderBaseState);

describe('createCanvasSelectionSnapshot', () => {
  it('captures enabled enhancements only', () => {
    const state = buildState({
      enhancements: [
        { id: 'floating-frame', name: 'Floating', description: '', price: 10, enabled: true },
        { id: 'living-canvas', name: 'Living', description: '', price: 20, enabled: false },
      ],
      selectedCanvasSize: '24x24',
      selectedFrame: 'black',
      orientation: 'horizontal',
    });

    const snapshot = createCanvasSelectionSnapshot(state);

    expect(snapshot).toEqual({
      canvasSize: '24x24',
      frame: 'black',
      enhancements: ['floating-frame'],
      orientation: 'horizontal',
    });
  });
});
