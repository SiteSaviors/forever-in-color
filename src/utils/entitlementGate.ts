import { STYLE_CATALOG, type StyleCatalogEntry } from '@/config/styleCatalog';
import type { EntitlementState } from '@/store/founder/entitlementSlice';
import type { SessionUser } from '@/store/founder/sessionSlice';

export type GateReason =
  | 'allowed'
  | 'entitlements_loading'
  | 'quota_exceeded'
  | 'style_locked'
  | 'unknown_style';

export type GateResult = {
  allowed: boolean;
  reason: GateReason;
  message?: string;
  ctaText?: string;
  requiredTier?: 'creator' | 'plus' | 'pro';
  style?: StyleCatalogEntry | null;
};

const TIER_ORDER: Record<string, number> = {
  free: 0,
  creator: 1,
  plus: 2,
  pro: 3,
  dev: 4,
};

const PREMIUM_DEFAULT_REQUIRED_TIER: 'creator' | 'plus' | 'pro' = 'creator';

export const findStyleMetadata = (styleId: string): StyleCatalogEntry | null => {
  return STYLE_CATALOG.find((entry) => entry.id === styleId) ?? null;
};

const isTierSatisfied = (current: EntitlementState['tier'], required: 'creator' | 'plus' | 'pro') => {
  const currentScore = TIER_ORDER[current] ?? -1;
  const requiredScore = TIER_ORDER[required] ?? Number.MAX_SAFE_INTEGER;
  return currentScore >= requiredScore;
};

type GateParams = {
  styleId: string | null | undefined;
  entitlements: EntitlementState;
  sessionUser: SessionUser | null;
};

const quotaExceededResult: GateResult = {
  allowed: false,
  reason: 'quota_exceeded',
  message: 'You have reached the current generation limit.',
  ctaText: 'Upgrade for more generations',
};

export const canGenerateStylePreview = ({
  styleId,
  entitlements,
  sessionUser,
}: GateParams): GateResult => {
  if (entitlements.status !== 'ready') {
    if (sessionUser) {
      return {
        allowed: false,
        reason: 'entitlements_loading',
        message: 'Loading your usage limits. Please try again in a moment.',
      };
    }
    return { allowed: true, reason: 'allowed' };
  }

  if (
    entitlements.remainingTokens != null &&
    entitlements.remainingTokens <= 0
  ) {
    return quotaExceededResult;
  }

  if (!styleId) {
    return { allowed: true, reason: 'allowed' };
  }

  const styleMeta = findStyleMetadata(styleId);
  if (!styleMeta) {
    return { allowed: true, reason: 'unknown_style' };
  }

  const requiresPremium =
    styleMeta.tier === 'premium' || styleMeta.isPremium || styleMeta.tone === 'signature';

  if (!requiresPremium) {
    return { allowed: true, reason: 'allowed', style: styleMeta };
  }

  const requiredTier = styleMeta.requiredTier ?? PREMIUM_DEFAULT_REQUIRED_TIER;

  if (entitlements.tier === 'dev') {
    return { allowed: true, reason: 'allowed', style: styleMeta };
  }

  if (!isTierSatisfied(entitlements.tier, requiredTier)) {
    return {
      allowed: false,
      reason: 'style_locked',
      message: `Upgrade to ${requiredTier === 'creator' ? 'Creator' : requiredTier === 'plus' ? 'Plus' : 'Pro'} to unlock this premium style.`,
      ctaText: 'View Plans',
      requiredTier,
      style: styleMeta,
    };
  }

  return { allowed: true, reason: 'allowed', style: styleMeta };
};
