import type { StateCreator } from 'zustand';
import { getSupabaseClient } from '@/utils/supabaseClient.loader';
import type { FounderState, SessionSlice } from './storeTypes';

export type { SessionSlice, SessionUser } from './storeTypes';

export const createSessionSlice: StateCreator<FounderState, [], [], SessionSlice> = (set, get) => ({
  sessionUser: null,
  accessToken: null,
  sessionHydrated: false,
  isAuthenticated: false,
  getSessionAccessToken: () => get().accessToken,
  setSession: (user, accessToken) => {
    const current = get();
    const currentUserId = current.sessionUser?.id ?? null;
    const nextUserId = user?.id ?? null;
    const tokenChanged = current.accessToken !== accessToken;

    if (current.sessionHydrated && currentUserId === nextUserId && !tokenChanged) {
      return;
    }

    set({
      sessionHydrated: true,
      sessionUser: user,
      accessToken: accessToken ?? null,
      isAuthenticated: Boolean(user),
    });

    void get().hydrateEntitlements();
    if (user) {
      void get().resumePendingAuthPreview();
    }
  },
  signOut: async () => {
    const supabaseClient = await getSupabaseClient();
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    get().setSession(null, null);
  },
});
