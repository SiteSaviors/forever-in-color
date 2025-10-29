import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useSessionState = () =>
  useFounderStore(
    (state) => ({
      sessionUser: state.sessionUser,
      sessionHydrated: state.sessionHydrated,
      accessToken: state.accessToken,
    }),
    shallow
  );

export const useSessionActions = () =>
  useFounderStore(
    (state) => ({
      signOut: state.signOut,
      setSession: state.setSession,
      getSessionAccessToken: state.getSessionAccessToken,
    }),
    shallow
  );
