import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useStudioActions = () =>
  useFounderStore(
    (state) => ({
      setLaunchpadExpanded: state.setLaunchpadExpanded,
      openCanvasModal: state.openCanvasModal,
      closeCanvasModal: state.closeCanvasModal,
      hydrateEntitlements: state.hydrateEntitlements,
      setLivingCanvasModalOpen: state.setLivingCanvasModalOpen,
      setShowTokenToast: state.setShowTokenToast,
      setShowQuotaModal: state.setShowQuotaModal,
    }),
    shallow
  );
