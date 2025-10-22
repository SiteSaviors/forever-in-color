import type { StateCreator } from 'zustand';
import { fetchAuthenticatedEntitlements } from '@/utils/entitlementsApi';
import { canGenerateStylePreview, type GateResult } from '@/utils/entitlementGate';
import { getSupabaseClient } from '../utils/supabaseClient';
import type { FounderState } from '../useFounderStore';

export type EntitlementTier = 'free' | 'creator' | 'plus' | 'pro' | 'dev';
export type EntitlementPriority = 'normal' | 'priority' | 'pro';

export type EntitlementState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  tier: EntitlementTier;
  quota: number | null;
  remainingTokens: number | null;
  requiresWatermark: boolean;
  priority: EntitlementPriority;
  renewAt: string | null;
  lastSyncedAt: number | null;
  error: string | null;
};

export type EntitlementSlice = {
  entitlements: EntitlementState;
  showTokenToast: boolean;
  showQuotaModal: boolean;
  generationCount: number;
  setShowTokenToast: (show: boolean) => void;
  setShowQuotaModal: (show: boolean) => void;
  hydrateEntitlements: () => Promise<void>;
  updateEntitlementsFromResponse: (payload: {
    remainingTokens?: number | null;
    requiresWatermark?: boolean;
    tier?: string;
    priority?: string;
  }) => void;
  incrementGenerationCount: () => void;
  canGenerateMore: () => boolean;
  evaluateStyleGate: (styleId: string | null) => GateResult;
  canUseStyle: (styleId: string | null) => boolean;
  getGenerationLimit: () => number;
  getDisplayableRemainingTokens: () => number | null;
};

const createInitialEntitlements = (): EntitlementState => ({
  status: 'idle',
  tier: 'free',
  quota: null,
  remainingTokens: null,
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

const requiresWatermarkFromTier = (tier: EntitlementTier): boolean => tier === 'free';

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

      set({
        entitlements: {
          status: 'ready',
          tier: snapshot.tier,
          quota: snapshot.quota,
          remainingTokens: snapshot.remainingTokens,
          requiresWatermark: snapshot.requiresWatermark,
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
  updateEntitlementsFromResponse: ({ remainingTokens, requiresWatermark, tier, priority }) => {
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

      if (tier) {
        const mappedTier = tierFromServer(tier, next.tier === 'dev');
        next.tier = mappedTier;
        next.priority = priorityFromTier(mappedTier);
        next.requiresWatermark = requiresWatermark ?? requiresWatermarkFromTier(mappedTier);
      } else if (typeof requiresWatermark === 'boolean') {
        next.requiresWatermark = requiresWatermark;
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
  getDisplayableRemainingTokens: () => get().entitlements.remainingTokens,
});
