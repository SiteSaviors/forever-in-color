import type { StateCreator } from 'zustand';
import { fetchAuthenticatedEntitlements } from '@/utils/entitlementsApi';
import { canGenerateStylePreview } from '@/utils/entitlementGate';
import { getSupabaseClient } from '@/utils/supabaseClient.loader';
import type { EntitlementPriority, EntitlementSlice, EntitlementState, EntitlementTier, FounderState } from './storeTypes';
import { createMemoizedSelector } from '../utils/memo';

export type { EntitlementPriority, EntitlementSlice, EntitlementState, EntitlementTier } from './storeTypes';

const createInitialEntitlements = (): EntitlementState => ({
  status: 'idle',
  tier: 'free',
  quota: null,
  remainingTokens: null,
  premiumTokens: null,
  freeMonthlyTokens: null,
  hasPremiumAccess: false,
  requiresWatermark: true,
  priority: 'normal',
  renewAt: null,
  lastSyncedAt: null,
  error: null,
});

const getInitialGenerationCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.sessionStorage.getItem('generation_count');
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const persistGenerationCount = (value: number) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem('generation_count', value.toString());
  } catch {
    // ignore storage failures silently
  }
};

const tierFromServer = (value?: string | null, devOverride = false): EntitlementTier => {
  if (devOverride) return 'dev';
  switch ((value ?? 'free').toLowerCase()) {
    case 'creator':
    case 'plus':
    case 'pro':
      return value as EntitlementTier;
    case 'dev':
      return 'dev';
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

const requiresWatermarkFromTier = (tier: EntitlementTier, hasPremium = false): boolean =>
  tier === 'free' ? !hasPremium : false;

const computeDisplayableTokens = (entitlements: {
  premiumTokens: number | null;
  freeMonthlyTokens: number | null;
  remainingTokens: number | null;
}): number | null => {
  const hasPremiumBucket = typeof entitlements.premiumTokens === 'number';
  const hasFreeBucket = typeof entitlements.freeMonthlyTokens === 'number';
  if (hasPremiumBucket || hasFreeBucket) {
    const total =
      Math.max(0, entitlements.premiumTokens ?? 0) + Math.max(0, entitlements.freeMonthlyTokens ?? 0);
    return total;
  }
  return entitlements.remainingTokens;
};

const selectDisplayableRemainingTokens = createMemoizedSelector((entitlements: EntitlementState) =>
  computeDisplayableTokens(entitlements)
);

const deriveHasPremiumAccess = (tier: EntitlementTier, premiumTokens: number | null) => {
  if (tier !== 'free') return true;
  return (premiumTokens ?? 0) > 0;
};

export const createEntitlementSlice: StateCreator<FounderState, [], [], EntitlementSlice> = (set, get) => ({
  entitlements: createInitialEntitlements(),
  showTokenToast: false,
  showQuotaModal: false,
  generationCount: getInitialGenerationCount(),
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
      if (!state.sessionUser) {
        set({
      entitlements: {
        status: 'ready',
        tier: 'free',
        quota: null,
        remainingTokens: null,
        premiumTokens: null,
        freeMonthlyTokens: null,
        hasPremiumAccess: false,
        requiresWatermark: true,
        priority: 'normal',
        renewAt: null,
        lastSyncedAt: Date.now(),
        error: null,
          },
        });
        return;
      }

      const supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        throw new Error('Supabase client unavailable');
      }

      const snapshot = await fetchAuthenticatedEntitlements();
      if (!snapshot) {
        set((current) => ({
          entitlements: {
            ...current.entitlements,
            status: 'loading',
            error: null,
          },
        }));
        return;
      }

      const tokensUsedRaw =
        typeof snapshot.quota === 'number' && typeof snapshot.remainingTokens === 'number'
          ? snapshot.quota - snapshot.remainingTokens
          : 0;
      const tokensUsed = Math.max(0, tokensUsedRaw);
      persistGenerationCount(tokensUsed);

      const premiumTokens = snapshot.premiumTokens ?? snapshot.remainingTokens ?? null;
      const freeMonthlyTokens = snapshot.freeMonthlyTokens ?? null;
      const computedHasPremium =
        typeof snapshot.hasPremiumAccess === 'boolean'
          ? snapshot.hasPremiumAccess
          : deriveHasPremiumAccess(snapshot.tier, premiumTokens);
      const requiresWatermark =
        typeof snapshot.requiresWatermark === 'boolean'
          ? snapshot.requiresWatermark
          : requiresWatermarkFromTier(snapshot.tier, computedHasPremium);
      const displayableTokens = computeDisplayableTokens({
        premiumTokens,
        freeMonthlyTokens,
        remainingTokens: snapshot.remainingTokens,
      });

      set({
        entitlements: {
          status: 'ready',
          tier: snapshot.tier,
          quota: snapshot.quota,
          remainingTokens: displayableTokens,
          premiumTokens,
          freeMonthlyTokens,
          hasPremiumAccess: computedHasPremium,
          requiresWatermark,
          priority: snapshot.priority,
          renewAt: snapshot.renewAt,
          lastSyncedAt: Date.now(),
          error: null,
        },
        generationCount: tokensUsed,
      });
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
  updateEntitlementsFromResponse: ({
    remainingTokens,
    premiumTokens,
    freeMonthlyTokens,
    hasPremiumAccess,
    requiresWatermark,
    tier,
    priority,
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
      if (typeof premiumTokens === 'number') {
        next.premiumTokens = premiumTokens;
      }
      if (typeof freeMonthlyTokens === 'number') {
        next.freeMonthlyTokens = freeMonthlyTokens;
      }
      if (typeof hasPremiumAccess === 'boolean') {
        next.hasPremiumAccess = hasPremiumAccess;
      }

      if (tier) {
        const mappedTier = tierFromServer(tier, next.tier === 'dev');
        next.tier = mappedTier;
        next.priority = priorityFromTier(mappedTier);
      }

      if (priority) {
        const normalized = priority.toLowerCase();
        if (normalized === 'normal' || normalized === 'priority' || normalized === 'pro') {
          next.priority = normalized as EntitlementPriority;
        }
      }

      if (typeof hasPremiumAccess !== 'boolean') {
        next.hasPremiumAccess = deriveHasPremiumAccess(next.tier, next.premiumTokens);
      }
      next.requiresWatermark =
        typeof requiresWatermark === 'boolean'
          ? requiresWatermark
          : requiresWatermarkFromTier(next.tier, next.hasPremiumAccess);
      if (typeof remainingTokens === 'number' || typeof premiumTokens === 'number' || typeof freeMonthlyTokens === 'number') {
        next.remainingTokens = computeDisplayableTokens({
          premiumTokens: next.premiumTokens,
          freeMonthlyTokens: next.freeMonthlyTokens,
          remainingTokens: typeof remainingTokens === 'number' ? remainingTokens : next.remainingTokens,
        });
      }

      return { entitlements: next };
    });
  },
  incrementGenerationCount: () => {
    set((current) => {
      const nextCount = current.generationCount + 1;
      persistGenerationCount(nextCount);
      return { generationCount: nextCount };
    });
  },
  canGenerateMore: () => {
    const state = get();
    return canGenerateStylePreview({
      styleId: null,
      entitlements: state.entitlements,
      sessionUser: state.sessionUser,
    }).allowed;
  },
  evaluateStyleGate: (styleId) => {
    const state = get();
    return canGenerateStylePreview({
      styleId,
      entitlements: state.entitlements,
      sessionUser: state.sessionUser,
    });
  },
  canUseStyle: (styleId) => get().evaluateStyleGate(styleId).allowed,
  getGenerationLimit: () => {
    const { entitlements } = get();
    if (entitlements.quota == null) {
      return Infinity;
    }
    return entitlements.quota;
  },
  getDisplayableRemainingTokens: () => selectDisplayableRemainingTokens(get().entitlements),
  consumePreviewToken: () => {
    set((current) => {
      const next = { ...current.entitlements };
      let consumed = false;
      let tokensRemoved = 0;
      const consumeFromBucket = (key: 'premiumTokens' | 'freeMonthlyTokens', amount: number) => {
        const value = next[key];
        if (typeof value === 'number' && value > 0) {
          const consumedAmount = Math.min(value, amount);
          next[key] = Math.max(0, value - consumedAmount);
          tokensRemoved += consumedAmount;
          return consumedAmount;
        }
        return 0;
      };

      let delta = 1;
      let removed = consumeFromBucket('premiumTokens', delta);
      if (removed > 0) {
        consumed = true;
        delta -= removed;
      }

      if (delta > 0) {
        removed = consumeFromBucket('freeMonthlyTokens', delta);
        if (removed > 0) {
          consumed = true;
          delta -= removed;
        }
      }

      if (delta > 0 && typeof next.remainingTokens === 'number') {
        const removal = Math.min(next.remainingTokens, delta);
        next.remainingTokens = Math.max(0, next.remainingTokens - removal);
        tokensRemoved += removal;
        consumed = removal > 0 || consumed;
        delta -= removal;
      }

      if (!consumed) {
        return current;
      }

      next.hasPremiumAccess = deriveHasPremiumAccess(next.tier, next.premiumTokens);
      const computedDisplayable = computeDisplayableTokens(next);
      if (computedDisplayable != null) {
        next.remainingTokens = computedDisplayable;
      } else if (typeof next.remainingTokens === 'number') {
        next.remainingTokens = Math.max(0, next.remainingTokens - tokensRemoved);
      }
      next.requiresWatermark = requiresWatermarkFromTier(next.tier, next.hasPremiumAccess);

      return { entitlements: next };
    });
  },
});
