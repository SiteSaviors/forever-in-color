import type { StateCreator } from 'zustand';
import { REQUIRE_AUTH_FOR_PREVIEW } from '@/config/featureFlags';
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
  /**
   * Derivative accessor for the current Supabase session JWT.
   * Prefer this getter when wiring authenticated API calls so we keep a single source of truth.
   */
  getSessionAccessToken: () => string | null;
  setSession: (user: SessionUser | null, accessToken: string | null) => void;
  signOut: () => Promise<void>;
};

const AUTH_PREVIEW_REQUIRED = REQUIRE_AUTH_FOR_PREVIEW;

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

    set((state) => ({
      sessionHydrated: true,
      sessionUser: user,
      accessToken: accessToken ?? null,
      isAuthenticated: Boolean(user),
      accountPromptShown: user ? false : state.accountPromptShown,
      accountPromptTriggerAt: user ? null : state.accountPromptTriggerAt,
      accountPromptDismissed: user ? false : state.accountPromptDismissed,
      anonToken: AUTH_PREVIEW_REQUIRED ? null : state.anonToken ?? loadAnonTokenFromStorage(),
    }));

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
