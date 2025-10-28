import type { StateCreator } from 'zustand';
import { createSessionSlice } from './sessionSlice';
import { createEntitlementSlice } from './entitlementSlice';
import { prefetchSupabaseClient } from '@/utils/supabaseClient.loader';
import type { AuthSlice, FounderState } from './storeTypes';

export type { AuthSlice } from './storeTypes';

/**
 * Bundles session + entitlement responsibilities into a single slice so auth
 * hydration can evolve independently of preview/orientation state.
 */
export const createAuthSlice: StateCreator<FounderState, [], [], AuthSlice> = (set, get, api) => ({
  ...createSessionSlice(set, get, api),
  ...createEntitlementSlice(set, get, api),
  prefetchAuthClient: () => {
    prefetchSupabaseClient();
  },
});
