import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useStudioUserState = () =>
  useFounderStore(
    (state) => {
      const sessionUser = state.sessionUser;
      const sessionAccessToken = state.getSessionAccessToken();
      return {
        sessionUser,
        sessionAccessToken,
        sessionHydrated: state.sessionHydrated,
        isAuthenticated: Boolean(sessionUser),
      };
    },
    shallow
  );
