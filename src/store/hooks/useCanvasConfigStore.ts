import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useCanvasConfigState = () =>
  useFounderStore(
    (state) => ({
      canvasModalOpen: state.canvasModalOpen,
      livingCanvasModalOpen: state.livingCanvasModalOpen,
      livingCanvasEnabled: state.livingCanvasEnabled(),
      selectedCanvasSize: state.selectedCanvasSize,
      selectedFrame: state.selectedFrame,
      enhancements: state.enhancements,
      orientationPreviewPending: state.orientationPreviewPending,
    }),
    shallow
  );

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
