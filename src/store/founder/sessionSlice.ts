import type { StateCreator } from 'zustand';
import { getSupabaseClient } from '../utils/supabaseClient';
import { loadAnonTokenFromStorage } from '../utils/anonTokenStorage';
import type { FounderState } from '../useFounderStore';

export type SessionUser = {
  id: string;
  email: string | null;
};

export type SessionSlice = {
  sessionUser: SessionUser | null;
  accessToken: string | null;
  sessionHydrated: boolean;
  isAuthenticated: boolean;
  setSession: (user: SessionUser | null, accessToken: string | null) => void;
  signOut: () => Promise<void>;
};

export const createSessionSlice: StateCreator<FounderState, [], [], SessionSlice> = (set, get) => ({
  sessionUser: null,
  accessToken: null,
  sessionHydrated: false,
  isAuthenticated: false,
  setSession: (user, accessToken) => {
    const current = get();
    const currentUserId = current.sessionUser?.id ?? null;
    const nextUserId = user?.id ?? null;
    const tokenChanged = current.accessToken !== accessToken;

    if (current.sessionHydrated && currentUserId === nextUserId && !tokenChanged) {
      return;
    }

    set((state) => ({
      sessionHydrated: true,
      sessionUser: user,
      accessToken: accessToken ?? null,
      isAuthenticated: Boolean(user),
      accountPromptShown: user ? false : state.accountPromptShown,
      accountPromptTriggerAt: user ? null : state.accountPromptTriggerAt,
      accountPromptDismissed: user ? false : state.accountPromptDismissed,
      anonToken: state.anonToken ?? loadAnonTokenFromStorage(),
    }));

    void get().hydrateEntitlements();
  },
  signOut: async () => {
    const supabaseClient = await getSupabaseClient();
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    get().setSession(null, null);
  },
});
