import { shallow } from 'zustand/shallow';
import { useCanvasConfigState } from '@/store/hooks/useFounderCanvasStore';
import { useFounderStore } from '@/store/useFounderStore';

export type LivingCanvasStatus = {
  livingCanvasModalOpen: boolean;
  livingCanvasEnabled: boolean;
};

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
