import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useStyleCatalogState = () =>
  useFounderStore(
    (state) => ({
      styles: state.styles,
      hoveredStyleId: state.hoveredStyleId,
      selectedStyleId: state.selectedStyleId,
      currentStyle: state.currentStyle(),
    }),
    shallow
  );

export const useStyleCatalogActions = () =>
  useFounderStore(
    (state) => ({
      evaluateStyleGate: state.evaluateStyleGate,
      setShowQuotaModal: state.setShowQuotaModal,
      toggleFavoriteStyle: state.toggleFavoriteStyle,
    }),
    shallow
  );
