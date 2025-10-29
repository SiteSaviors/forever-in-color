import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useStudioUiState = () =>
  useFounderStore(
    (state) => ({
      launchpadExpanded: state.launchpadExpanded,
      livingCanvasModalOpen: state.livingCanvasModalOpen,
      showTokenToast: state.showTokenToast,
      showQuotaModal: state.showQuotaModal,
      canvasModalOpen: state.canvasModalOpen,
      canvasModalSource: state.canvasModalSource,
    }),
    shallow
  );
