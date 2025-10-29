import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useAuthGateState = () =>
  useFounderStore(
    (state) => ({
      authGateOpen: state.authGateOpen,
    }),
    shallow
  );

export const useAuthGateActions = () =>
  useFounderStore(
    (state) => ({
      setAuthGateOpen: state.setAuthGateOpen,
      clearAuthGateIntent: state.clearAuthGateIntent,
    }),
    shallow
  );
