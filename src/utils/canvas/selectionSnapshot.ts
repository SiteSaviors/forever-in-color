import type { CanvasSelectionSnapshot } from '@/utils/studioV2Analytics';
import type { FounderBaseState } from '@/store/founder/storeTypes';

/**
 * Builds a normalized snapshot of the current canvas configuration.
 * TODO (Phase 3.1): move ownership into canvasConfigSlice once extracted.
 */
export const createCanvasSelectionSnapshot = (state: FounderBaseState): CanvasSelectionSnapshot => {
  const enabledEnhancements = state.enhancements
    .filter((item) => item.enabled)
    .map((item) => item.id);

  return {
    canvasSize: state.selectedCanvasSize,
    frame: state.selectedFrame,
    enhancements: enabledEnhancements,
    orientation: state.orientation,
  };
};
