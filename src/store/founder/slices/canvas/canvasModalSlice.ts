import type { StateCreator } from 'zustand';
import type { FounderState } from '@/store/founder/storeTypes';
import { createCanvasSelectionSnapshot } from '@/utils/canvas/selectionSnapshot';
import { emitCanvasModalClose, emitCanvasModalOpen, emitCanvasPanelOpen } from '@/utils/canvas/telemetry';

export type CanvasModalSlice = Pick<
  FounderState,
  'canvasModalOpen' | 'canvasModalSource' | 'canvasModalOpenedAt' | 'lastCanvasModalSource' | 'openCanvasModal' | 'closeCanvasModal'
>;

export const createCanvasModalSlice: StateCreator<FounderState, [], [], CanvasModalSlice> = (set, get) => ({
  canvasModalOpen: false,
  canvasModalSource: null,
  canvasModalOpenedAt: null,
  lastCanvasModalSource: null,
  openCanvasModal: (source) => {
    const state = get();
    if (!state.croppedImage) return;
    const style = state.currentStyle();
    if (!style) return;
    state.loadCanvasSelectionForStyle(style.id);
    state.persistCanvasSelection();
    if (state.canvasModalOpen) return;
    const snapshot = createCanvasSelectionSnapshot(state);
    emitCanvasPanelOpen(state.entitlements?.tier ?? 'unknown');
    set({
      canvasModalOpen: true,
      canvasModalSource: source,
      canvasModalOpenedAt: Date.now(),
      lastCanvasModalSource: source,
    });
    emitCanvasModalOpen({
      styleId: style.id,
      sourceCTA: source,
      canvasSize: snapshot.canvasSize,
      frame: snapshot.frame,
      enhancements: snapshot.enhancements,
      orientation: snapshot.orientation,
    });
  },
  closeCanvasModal: (reason) => {
    const state = get();
    if (!state.canvasModalOpen) return;
    const style = state.currentStyle();
    const snapshot = createCanvasSelectionSnapshot(state);
    const openedAt = state.canvasModalOpenedAt ?? Date.now();
    set({
      canvasModalOpen: false,
      canvasModalSource: null,
      canvasModalOpenedAt: null,
    });
    if (style) {
      emitCanvasModalClose({
        styleId: style.id,
        reason,
        timeSpentMs: Math.max(0, Date.now() - openedAt),
        configuredItems: snapshot,
      });
    }
  },
});
