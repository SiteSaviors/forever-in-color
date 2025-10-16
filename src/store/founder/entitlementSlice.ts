import type { StateCreator } from 'zustand';
import { mintAnonymousToken, fetchAuthenticatedEntitlements } from '@/utils/entitlementsApi';
import { getOrCreateFingerprintHash, getStoredFingerprintHash } from '@/utils/deviceFingerprint';
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
  dismissedPrompt: boolean;
  lastSyncedAt: number | null;
  error: string | null;
};

export type EntitlementSlice = {
  entitlements: EntitlementState;
  anonToken: string | null;
  fingerprintHash: string | null;
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
  }) => void;
  setAnonToken: (token: string | null) => void;
  incrementGenerationCount: () => void;
  setAccountPromptShown: (shown: boolean) => void;
  dismissAccountPrompt: () => void;
  shouldShowAccountPrompt: () => boolean;
  canGenerateMore: () => boolean;
  getGenerationLimit: () => number;
  ensureFingerprintHash: () => Promise<string | null>;
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

export const createEntitlementSlice: StateCreator<FounderState, [], [], EntitlementSlice> = (set, get) => ({
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
    dismissedPrompt: false,
    lastSyncedAt: null,
    error: null,
  },
  anonToken: loadAnonTokenFromStorage(),
  fingerprintHash: typeof window !== 'undefined' ? getStoredFingerprintHash() : null,
  showTokenToast: false,
  showQuotaModal: false,
  generationCount: parseInt(sessionStorage.getItem('generation_count') || '0'),
  accountPromptShown: false,
  accountPromptDismissed: sessionStorage.getItem('account_prompt_dismissed') === 'true',
  accountPromptTriggerAt: null,
  setShowTokenToast: (show) => set({ showTokenToast: show }),
  setShowQuotaModal: (show) => set({ showQuotaModal: show }),
  hydrateEntitlements: async () => {
    const state = get();
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
        const supabaseClient = await getSupabaseClient();
        if (!supabaseClient) {
          throw new Error('Supabase client unavailable');
        }
        const snapshot = await fetchAuthenticatedEntitlements();
        if (!snapshot) {
          set((current) => ({
            entitlements: {
              ...current.entitlements,
              status: 'ready',
              tier: 'free',
              quota: 10,
              remainingTokens: 10,
              requiresWatermark: true,
              priority: 'normal',
              renewAt: null,
              hardLimit: 10,
              softRemaining: null,
              lastSyncedAt: Date.now(),
              error: null,
            },
          }));
        } else {
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
              softRemaining: null,
              dismissedPrompt: current.entitlements.dismissedPrompt,
              lastSyncedAt: Date.now(),
              error: null,
            },
          }));
        }
      } else {
        const minted = await mintAnonymousToken({
          token: state.anonToken ?? undefined,
          dismissedPrompt: state.accountPromptDismissed,
        });

        sessionStorage.setItem('account_prompt_dismissed', minted.dismissed_prompt ? 'true' : 'false');
        persistAnonToken(minted.anon_token);

        set({
          anonToken: minted.anon_token,
          accountPromptDismissed: minted.dismissed_prompt,
          entitlements: {
            status: 'ready',
            tier: 'anonymous',
            quota: minted.hard_limit,
            remainingTokens: Math.min(minted.hard_remaining, minted.free_tokens_remaining),
            requiresWatermark: true,
            priority: 'normal',
            renewAt: null,
            hardLimit: minted.hard_limit,
            softRemaining: minted.free_tokens_remaining,
            dismissedPrompt: minted.dismissed_prompt,
            lastSyncedAt: Date.now(),
            error: null,
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load entitlements';
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

      persistAnonToken(minted.anon_token);

      set({
        anonToken: minted.anon_token,
        accountPromptDismissed: minted.dismissed_prompt,
        entitlements: {
          status: 'ready',
          tier: 'anonymous',
          quota: minted.hard_limit,
          remainingTokens: Math.min(minted.hard_remaining, minted.free_tokens_remaining),
          requiresWatermark: true,
          priority: 'normal',
          renewAt: null,
          hardLimit: minted.hard_limit,
          softRemaining: minted.free_tokens_remaining,
          dismissedPrompt: minted.dismissed_prompt,
          lastSyncedAt: Date.now(),
          error: null,
        },
      });
    } catch (error) {
      console.warn('[FounderStore] Failed to reconcile anonymous entitlements', error);
    }
  },
  updateEntitlementsFromResponse: ({ remainingTokens, requiresWatermark, tier, priority, softRemaining }) => {
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
    sessionStorage.setItem('generation_count', newCount.toString());

    const shouldPrompt =
      state.entitlements.tier === 'anonymous' &&
      typeof state.entitlements.softRemaining === 'number' &&
      state.entitlements.softRemaining <= 0 &&
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
    sessionStorage.setItem('account_prompt_dismissed', 'true');
    set({ accountPromptDismissed: true, accountPromptShown: false, accountPromptTriggerAt: null });

    const token = get().anonToken;
    if (token) {
      void mintAnonymousToken({ token, dismissedPrompt: true })
        .then((response) => {
          persistAnonToken(response.anon_token);
          set((current) => ({
            anonToken: response.anon_token,
            entitlements: {
              ...current.entitlements,
              dismissedPrompt: response.dismissed_prompt,
              softRemaining: response.free_tokens_remaining,
              hardLimit: response.hard_limit,
              quota: response.hard_limit,
              remainingTokens: Math.min(response.hard_remaining, response.free_tokens_remaining),
            },
          }));
        })
        .catch(() => {
          /* noop */
        });
    }
  },
  shouldShowAccountPrompt: () => {
    const { entitlements, accountPromptShown, accountPromptDismissed } = get();
    const softRemaining = entitlements.softRemaining;
    const shouldPrompt =
      entitlements.tier === 'anonymous' &&
      typeof softRemaining === 'number' &&
      softRemaining <= 0;

    return shouldPrompt && !accountPromptShown && !accountPromptDismissed;
  },
  canGenerateMore: () => {
    const { entitlements } = get();

    if (entitlements.status !== 'ready') {
      return true;
    }

    if (entitlements.remainingTokens == null) {
      return true;
    }

    return entitlements.remainingTokens > 0;
  },
  getGenerationLimit: () => {
    const { entitlements } = get();
    if (entitlements.quota == null) {
      return Infinity;
    }

    return entitlements.quota;
  },
  ensureFingerprintHash: async () => {
    const existing = get().fingerprintHash;
    if (existing) return existing;
    try {
      const hash = await getOrCreateFingerprintHash();
      if (hash) {
        set({ fingerprintHash: hash });
      }
      return hash ?? null;
    } catch (error) {
      console.warn('[FounderStore] Failed to resolve device fingerprint', error);
      return null;
    }
  },
});
