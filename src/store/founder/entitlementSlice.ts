import type { StateCreator } from 'zustand';
import { mintAnonymousToken, fetchAuthenticatedEntitlements } from '@/utils/entitlementsApi';
import { getOrCreateFingerprintHash, getStoredFingerprintHash } from '@/utils/deviceFingerprint';
import { canGenerateStylePreview, computeAnonymousRemaining, type GateResult } from '@/utils/entitlementGate';
import { loadAnonTokenFromStorage, persistAnonToken } from '../utils/anonTokenStorage';
import { getSupabaseClient } from '../utils/supabaseClient';
import type { FounderState } from '../useFounderStore';

export type EntitlementTier = 'anonymous' | 'free' | 'creator' | 'plus' | 'pro' | 'dev';
export type EntitlementPriority = 'normal' | 'priority' | 'pro';

export type EntitlementState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  tier: EntitlementTier;
  quota: number | null;
  remainingTokens: number | null;
  requiresWatermark: boolean;
  priority: EntitlementPriority;
  renewAt: string | null;
  hardLimit: number | null;
  softRemaining: number | null;
  hardRemaining: number | null;
  softLimit: number | null;
  dismissedPrompt: boolean;
  lastSyncedAt: number | null;
  error: string | null;
};

export type FingerprintStatus = 'idle' | 'resolving' | 'ready' | 'error';

export type EntitlementSlice = {
  entitlements: EntitlementState;
  anonToken: string | null;
  fingerprintHash: string | null;
  fingerprintStatus: FingerprintStatus;
  fingerprintError: string | null;
  showTokenToast: boolean;
  showQuotaModal: boolean;
  generationCount: number;
  accountPromptShown: boolean;
  accountPromptDismissed: boolean;
  accountPromptTriggerAt: number | null;
  setShowTokenToast: (show: boolean) => void;
  setShowQuotaModal: (show: boolean) => void;
  hydrateEntitlements: () => Promise<void>;
  reconcileEntitlements: () => Promise<void>;
  updateEntitlementsFromResponse: (payload: {
    remainingTokens?: number | null;
    requiresWatermark?: boolean;
    tier?: string;
    priority?: string;
    softRemaining?: number | null;
    hardRemaining?: number | null;
  }) => void;
  setAnonToken: (token: string | null) => void;
  incrementGenerationCount: () => void;
  setAccountPromptShown: (shown: boolean) => void;
  dismissAccountPrompt: () => void;
  shouldShowAccountPrompt: () => boolean;
  canGenerateMore: () => boolean;
  evaluateStyleGate: (styleId: string | null) => GateResult;
  canUseStyle: (styleId: string | null) => boolean;
  getGenerationLimit: () => number;
  getDisplayableRemainingTokens: () => number | null;
  ensureFingerprintHash: () => Promise<string | null>;
};

const getInitialGenerationCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.sessionStorage.getItem('generation_count');
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const getInitialAccountPromptDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem('account_prompt_dismissed') === 'true';
  } catch {
    return false;
  }
};

const persistGenerationCount = (value: number) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem('generation_count', value.toString());
  } catch {
    // ignore session storage failures silently
  }
};

const persistAccountPromptDismissed = (dismissed: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem('account_prompt_dismissed', dismissed ? 'true' : 'false');
  } catch {
    // ignore session storage failures silently
  }
};

const debugToken = (message: string, payload?: unknown) => {
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  const hasWindow = typeof window !== 'undefined';
  const debugFlag = hasWindow ? (window as typeof window & { DEBUG_TOKENS?: boolean }).DEBUG_TOKENS : false;
  if (!isDev && !debugFlag) {
    return;
  }

  if (typeof payload === 'undefined') {
    console.log(`[FounderStore][Token] ${message}`);
    return;
  }

  console.log(`[FounderStore][Token] ${message}`, payload);
};

const tierFromServer = (value?: string | null, devOverride = false): EntitlementTier => {
  if (devOverride) return 'dev';
  switch ((value ?? '').toLowerCase()) {
    case 'anonymous':
      return 'anonymous';
    case 'creator':
    case 'plus':
    case 'pro':
      return value as EntitlementTier;
    case 'free':
    default:
      return 'free';
  }
};

const priorityFromTier = (tier: EntitlementTier): EntitlementPriority => {
  switch (tier) {
    case 'pro':
    case 'dev':
      return 'pro';
    case 'creator':
    case 'plus':
      return 'priority';
    default:
      return 'normal';
  }
};

const requiresWatermarkFromTier = (tier: EntitlementTier): boolean => tier === 'anonymous' || tier === 'free';

export const createEntitlementSlice: StateCreator<FounderState, [], [], EntitlementSlice> = (set, get) => {
  const storedFingerprintHash = typeof window !== 'undefined' ? getStoredFingerprintHash() : null;

  return {
    entitlements: {
      status: 'idle',
      tier: 'anonymous',
      quota: 10,
      remainingTokens: 10,
      requiresWatermark: true,
      priority: 'normal',
      renewAt: null,
      hardLimit: 10,
      softRemaining: 5,
      hardRemaining: 10,
      softLimit: 5,
      dismissedPrompt: false,
      lastSyncedAt: null,
      error: null,
    },
    anonToken: loadAnonTokenFromStorage(),
    fingerprintHash: storedFingerprintHash,
    fingerprintStatus: storedFingerprintHash ? 'ready' : 'idle',
    fingerprintError: null,
    showTokenToast: false,
    showQuotaModal: false,
    generationCount: getInitialGenerationCount(),
    accountPromptShown: false,
    accountPromptDismissed: getInitialAccountPromptDismissed(),
    accountPromptTriggerAt: null,
    setShowTokenToast: (show) => set({ showTokenToast: show }),
    setShowQuotaModal: (show) => set({ showQuotaModal: show }),
  hydrateEntitlements: async () => {
    const state = get();

    debugToken('hydrateEntitlements called', {
      hasSessionUser: !!state.sessionUser,
      sessionUserEmail: state.sessionUser?.email,
      sessionUserId: state.sessionUser?.id,
      entitlementsStatus: state.entitlements.status
    });

    if (state.entitlements.status === 'loading') {
      return;
    }

    set((current) => ({
      entitlements: {
        ...current.entitlements,
        status: 'loading',
        error: null,
      },
    }));

    try {
      if (state.sessionUser) {
        debugToken('Authenticated user detected - fetching entitlements from v_entitlements');
        const supabaseClient = await getSupabaseClient();
        if (!supabaseClient) {
          throw new Error('Supabase client unavailable');
        }
        const snapshot = await fetchAuthenticatedEntitlements();
        debugToken('fetchAuthenticatedEntitlements returned', {
          hasSnapshot: !!snapshot,
          tier: snapshot?.tier,
          quota: snapshot?.quota,
          remainingTokens: snapshot?.remainingTokens,
          fullSnapshot: snapshot
        });

        if (!snapshot) {
          debugToken('Authenticated entitlements unavailable, awaiting provisioning');
          set((current) => ({
            entitlements: {
              ...current.entitlements,
              status: 'loading',
              error: null,
            },
          }));
        } else {
          debugToken('Applying authenticated entitlements to store', snapshot);
          const tokensUsedRaw =
            typeof snapshot.quota === 'number' && typeof snapshot.remainingTokens === 'number'
              ? snapshot.quota - snapshot.remainingTokens
              : 0;
          const tokensUsed = Math.max(0, tokensUsedRaw);
          persistGenerationCount(tokensUsed);
          set((current) => ({
            entitlements: {
              status: 'ready',
              tier: snapshot.tier,
              quota: snapshot.quota,
              remainingTokens: snapshot.remainingTokens,
              requiresWatermark: snapshot.requiresWatermark,
          priority: snapshot.priority,
          renewAt: snapshot.renewAt,
          hardLimit: snapshot.quota,
          hardRemaining:
            typeof snapshot.remainingTokens === 'number'
              ? Math.max(0, snapshot.remainingTokens)
              : snapshot.remainingTokens ?? null,
          softRemaining: null,
          softLimit: null,
          dismissedPrompt: current.entitlements.dismissedPrompt,
          lastSyncedAt: Date.now(),
          error: null,
        },
        generationCount: tokensUsed,
      }));
        }
      } else {
        debugToken('No authenticated user - minting anonymous token');
        const minted = await mintAnonymousToken({
          token: state.anonToken ?? undefined,
          dismissedPrompt: state.accountPromptDismissed,
        });

        if (get().sessionUser) {
          debugToken('Aborting anonymous mint – session established mid-flight');
          return;
        }

        debugToken('Minted anonymous token', minted);
        persistAccountPromptDismissed(minted.dismissed_prompt);
        persistAnonToken(minted.anon_token);
        const hardUsedRaw = minted.hard_limit - minted.hard_remaining;
        const hardUsed = Math.max(0, hardUsedRaw);
        persistGenerationCount(hardUsed);

        set({
          anonToken: minted.anon_token,
          accountPromptDismissed: minted.dismissed_prompt,
          generationCount: hardUsed,
          entitlements: {
            status: 'ready',
            tier: 'anonymous',
            quota: minted.hard_limit,
            remainingTokens: minted.free_tokens_remaining,
            requiresWatermark: true,
            priority: 'normal',
            renewAt: null,
            hardLimit: minted.hard_limit,
            softRemaining: minted.free_tokens_remaining,
            hardRemaining: minted.hard_remaining,
            softLimit: minted.soft_limit,
            dismissedPrompt: minted.dismissed_prompt,
            lastSyncedAt: Date.now(),
            error: null,
          },
          accountPromptShown: false,
          accountPromptTriggerAt: null,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load entitlements';
      debugToken('Failed to hydrate entitlements', message);
      set((current) => ({
        entitlements: {
          ...current.entitlements,
          status: 'error',
          error: message,
          lastSyncedAt: Date.now(),
        },
      }));
    }
  },
  reconcileEntitlements: async () => {
    const state = get();
    if (state.sessionUser) {
      return;
    }

    const anonToken = state.anonToken ?? loadAnonTokenFromStorage();
    if (!anonToken) {
      return;
    }

    try {
      const minted = await mintAnonymousToken({
        token: anonToken,
        dismissedPrompt: state.accountPromptDismissed,
      });

      if (get().sessionUser) {
        debugToken('Skipping anonymous reconciliation – session established mid-flight');
        return;
      }

      debugToken('Reconciled anonymous entitlements', minted);
      persistAnonToken(minted.anon_token);
      persistAccountPromptDismissed(minted.dismissed_prompt);
      const hardUsedRaw = minted.hard_limit - minted.hard_remaining;
      const hardUsed = Math.max(0, hardUsedRaw);
      persistGenerationCount(hardUsed);

      set({
        anonToken: minted.anon_token,
        accountPromptDismissed: minted.dismissed_prompt,
        generationCount: hardUsed,
        entitlements: {
          status: 'ready',
          tier: 'anonymous',
          quota: minted.hard_limit,
          remainingTokens: minted.free_tokens_remaining,
          requiresWatermark: true,
          priority: 'normal',
          renewAt: null,
          hardLimit: minted.hard_limit,
          softRemaining: minted.free_tokens_remaining,
          hardRemaining: minted.hard_remaining,
          softLimit: minted.soft_limit,
          dismissedPrompt: minted.dismissed_prompt,
          lastSyncedAt: Date.now(),
          error: null,
        },
        accountPromptShown: false,
        accountPromptTriggerAt: null,
      });
    } catch (error) {
      console.warn('[FounderStore] Failed to reconcile anonymous entitlements', error);
    }
  },
  updateEntitlementsFromResponse: ({
    remainingTokens,
    requiresWatermark,
    tier,
    priority,
    softRemaining,
    hardRemaining,
  }) => {
    set((current) => {
      const next: EntitlementState = {
        ...current.entitlements,
        status: 'ready',
        lastSyncedAt: Date.now(),
        error: null,
      };

      if (typeof remainingTokens === 'number') {
        next.remainingTokens = remainingTokens;
      }

      if (typeof softRemaining === 'number') {
        next.softRemaining = softRemaining;
      }

      if (typeof hardRemaining === 'number') {
        next.hardRemaining = hardRemaining;
      }

      if (typeof requiresWatermark === 'boolean') {
        next.requiresWatermark = requiresWatermark;
      }

      if (tier) {
        const mappedTier = tierFromServer(tier, next.tier === 'dev');
        next.tier = mappedTier;
        next.priority = priorityFromTier(mappedTier);
        next.requiresWatermark = requiresWatermark ?? requiresWatermarkFromTier(mappedTier);
      }

      if (priority) {
        const normalized = priority.toLowerCase();
        if (normalized === 'normal' || normalized === 'priority' || normalized === 'pro') {
          next.priority = normalized as EntitlementPriority;
        }
      }

      return { entitlements: next };
    });
  },
  setAnonToken: (token) => {
    persistAnonToken(token);
    set({ anonToken: token });
  },
  incrementGenerationCount: () => {
    const state = get();
    const newCount = state.generationCount + 1;
    persistGenerationCount(newCount);

    const remainingAfter = computeAnonymousRemaining(state.entitlements, newCount);
    const shouldPrompt =
      state.entitlements.tier === 'anonymous' &&
      typeof remainingAfter === 'number' &&
      remainingAfter <= 0 &&
      !state.accountPromptDismissed &&
      !state.accountPromptShown;

    set({
      generationCount: newCount,
      accountPromptShown: shouldPrompt ? true : state.accountPromptShown,
      accountPromptTriggerAt: shouldPrompt ? Date.now() : state.accountPromptTriggerAt,
    });
  },
  setAccountPromptShown: (shown) =>
    set({
      accountPromptShown: shown,
      accountPromptTriggerAt: shown ? Date.now() : null,
    }),
  dismissAccountPrompt: () => {
    persistAccountPromptDismissed(true);
    set({ accountPromptDismissed: true, accountPromptShown: false, accountPromptTriggerAt: null });

    const token = get().anonToken;
    if (token) {
      void mintAnonymousToken({ token, dismissedPrompt: true })
        .then((response) => {
          debugToken('Dismissed account prompt, refreshed anon token', response);
          persistAnonToken(response.anon_token);
          persistAccountPromptDismissed(response.dismissed_prompt);
          const hardUsedRaw = response.hard_limit - response.hard_remaining;
          const hardUsed = Math.max(0, hardUsedRaw);
          persistGenerationCount(hardUsed);
          set((current) => ({
            anonToken: response.anon_token,
            generationCount: hardUsed,
            entitlements: {
              ...current.entitlements,
              dismissedPrompt: response.dismissed_prompt,
              softRemaining: response.free_tokens_remaining,
              hardLimit: response.hard_limit,
              hardRemaining: response.hard_remaining,
              softLimit: response.soft_limit ?? current.entitlements.softLimit,
              quota: response.hard_limit,
              remainingTokens: response.free_tokens_remaining,
            },
          }));
        })
        .catch(() => {
          /* noop */
        });
    }
  },
  shouldShowAccountPrompt: () => {
    const { entitlements, accountPromptShown, accountPromptDismissed, generationCount } = get();
    if (entitlements.tier !== 'anonymous') {
      return false;
    }

    const remaining = computeAnonymousRemaining(entitlements, generationCount);
    const shouldPrompt = typeof remaining === 'number' && remaining <= 0;

    return shouldPrompt && !accountPromptShown && !accountPromptDismissed;
  },
  canGenerateMore: () => {
    const state = get();
    return canGenerateStylePreview({
      styleId: null,
      entitlements: state.entitlements,
      sessionUser: state.sessionUser,
      fingerprintStatus: state.fingerprintStatus,
      generationCount: state.generationCount,
    }).allowed;
  },
  evaluateStyleGate: (styleId) => {
    const state = get();
    return canGenerateStylePreview({
      styleId,
      entitlements: state.entitlements,
      sessionUser: state.sessionUser,
      fingerprintStatus: state.fingerprintStatus,
      generationCount: state.generationCount,
    });
  },
  canUseStyle: (styleId) => {
    return get().evaluateStyleGate(styleId).allowed;
  },
  getGenerationLimit: () => {
    const { entitlements } = get();
    if (entitlements.quota == null) {
      return Infinity;
    }

    return entitlements.quota;
  },
  getDisplayableRemainingTokens: () => {
    const { entitlements, generationCount } = get();
    if (entitlements.tier === 'anonymous') {
      return computeAnonymousRemaining(entitlements, generationCount);
    }
    return entitlements.remainingTokens;
  },
  ensureFingerprintHash: async () => {
    const { fingerprintHash, fingerprintStatus } = get();
    if (fingerprintHash) {
      if (fingerprintStatus !== 'ready') {
        set({ fingerprintStatus: 'ready', fingerprintError: null });
      }
      return fingerprintHash;
    }
    if (fingerprintStatus === 'resolving') {
      return null;
    }

    set({ fingerprintStatus: 'resolving', fingerprintError: null });
    try {
      const hash = await getOrCreateFingerprintHash();
      if (hash) {
        set({ fingerprintHash: hash, fingerprintStatus: 'ready', fingerprintError: null });
        return hash;
      }
      debugToken('Fingerprint generation returned empty hash');
      set({ fingerprintStatus: 'error', fingerprintError: 'Fingerprint required for free previews' });
      return null;
    } catch (error) {
      console.warn('[FounderStore] Failed to resolve device fingerprint', error);
      set({
        fingerprintStatus: 'error',
        fingerprintError: error instanceof Error ? error.message : 'Fingerprint blocked',
      });
      return null;
    }
  },
  };
};
