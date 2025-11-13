import { shallow } from 'zustand/shallow';
import { type FounderState, useFounderStore } from '@/store/useFounderStore';

type CanvasConfigSlice = Pick<
  FounderState,
  | 'canvasModalOpen'
  | 'livingCanvasModalOpen'
  | 'livingCanvasEnabled'
  | 'selectedCanvasSize'
  | 'selectedFrame'
  | 'enhancements'
  | 'orientationPreviewPending'
>;

export type CanvasSelectionState = Pick<CanvasConfigSlice, 'selectedCanvasSize' | 'selectedFrame' | 'enhancements'>;
export type CanvasModalFlags = Pick<CanvasConfigSlice, 'canvasModalOpen' | 'orientationPreviewPending'>;
export type LivingCanvasStatus = {
  livingCanvasModalOpen: CanvasConfigSlice['livingCanvasModalOpen'];
  livingCanvasEnabled: ReturnType<CanvasConfigSlice['livingCanvasEnabled']>;
};

export const useCanvasConfigState = <T,>(
  selector: (state: CanvasConfigSlice) => T,
  equalityFn: (a: T, b: T) => boolean = shallow
) => useFounderStore((state) => selector(state as CanvasConfigSlice), equalityFn);

export const useCanvasModalStatus = () =>
  useCanvasConfigState<CanvasModalFlags>((state) => ({
    canvasModalOpen: state.canvasModalOpen,
    orientationPreviewPending: state.orientationPreviewPending,
  }));

export const useCanvasSelection = () =>
  useCanvasConfigState<CanvasSelectionState>((state) => ({
    selectedCanvasSize: state.selectedCanvasSize,
    selectedFrame: state.selectedFrame,
    enhancements: state.enhancements,
  }));

export const useLivingCanvasStatus = () =>
  useCanvasConfigState<LivingCanvasStatus>((state) => ({
    livingCanvasModalOpen: state.livingCanvasModalOpen,
    livingCanvasEnabled: state.livingCanvasEnabled(),
  }));

export const useCanvasConfigActions = () =>
  useFounderStore(
    (state) => ({
      closeCanvasModal: state.closeCanvasModal,
      setCanvasSize: state.setCanvasSize,
      setFrame: state.setFrame,
      toggleEnhancement: state.toggleEnhancement,
      setLivingCanvasModalOpen: state.setLivingCanvasModalOpen,
      setEnhancementEnabled: state.setEnhancementEnabled,
      computedTotal: state.computedTotal,
    }),
    shallow
  );
