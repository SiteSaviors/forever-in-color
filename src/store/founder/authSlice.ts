import type { StateCreator } from 'zustand';
import {
  createSessionSlice,
  type SessionSlice,
} from './sessionSlice';
import {
  createEntitlementSlice,
  type EntitlementSlice,
} from './entitlementSlice';
import { prefetchSupabaseClient } from '@/utils/supabaseClient.loader';
import type { FounderState } from '../useFounderStore';

/**
 * Bundles session + entitlement responsibilities into a single slice so auth
 * hydration can evolve independently of preview/orientation state.
 */
export type AuthSlice = SessionSlice &
  EntitlementSlice & {
    /**
     * Prefetches the Supabase client for upcoming auth flows. Safe to call
     * multiple times; subsequent invocations are no-ops.
     */
    prefetchAuthClient: () => void;
  };

export const createAuthSlice: StateCreator<FounderState, [], [], AuthSlice> = (set, get, api) => ({
  ...createSessionSlice(set, get, api),
  ...createEntitlementSlice(set, get, api),
  prefetchAuthClient: () => {
    prefetchSupabaseClient();
  },
});
