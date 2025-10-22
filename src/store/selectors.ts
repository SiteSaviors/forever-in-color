import { useFounderStore } from './useFounderStore';

export type FounderStoreState = ReturnType<typeof useFounderStore.getState>;

export const selectEntitlements = (state: FounderStoreState) => state.entitlements;
export const selectEntitlementTier = (state: FounderStoreState) => state.entitlements.tier;
export const selectIsAuthenticated = (state: FounderStoreState) => state.isAuthenticated;
export const selectLaunchpadExpanded = (state: FounderStoreState) => state.launchpadExpanded;
export const selectShowTokenToast = (state: FounderStoreState) => state.showTokenToast;
export const selectRemainingTokens = (state: FounderStoreState) => state.entitlements.remainingTokens;
export const selectSessionUser = (state: FounderStoreState) => state.sessionUser;
export const selectSessionHydrated = (state: FounderStoreState) => state.sessionHydrated;
export const selectSignOut = (state: FounderStoreState) => state.signOut;
export const selectAccessToken = (state: FounderStoreState) => state.accessToken;
export const selectHydrateEntitlements = (state: FounderStoreState) => state.hydrateEntitlements;
export const selectEntitlementStatus = (state: FounderStoreState) => state.entitlements.status;
export const selectEntitlementQuota = (state: FounderStoreState) => state.entitlements.quota;
export const selectEvaluateStyleGate =
  (styleId: string | null) => (state: FounderStoreState) => state.evaluateStyleGate(styleId);
export const selectCanUseStyle =
  (styleId: string | null) => (state: FounderStoreState) => state.canUseStyle(styleId);
