import { STYLE_CATALOG, type StyleCatalogEntry } from '@/config/styleCatalog';
import type { EntitlementState } from '@/store/founder/entitlementSlice';
import type { SessionUser } from '@/store/founder/sessionSlice';

export type GateReason =
  | 'allowed'
  | 'entitlements_loading'
  | 'fingerprint_required'
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
  anonymous: 0,
  free: 1,
  creator: 2,
  plus: 3,
  pro: 4,
  dev: 5,
};

const PREMIUM_DEFAULT_REQUIRED_TIER: 'creator' | 'plus' | 'pro' = 'creator';

export const findStyleMetadata = (styleId: string): StyleCatalogEntry | null => {
  return STYLE_CATALOG.find((entry) => entry.id === styleId) ?? null;
};

export const computeAnonymousRemaining = (
  entitlements: EntitlementState,
  generationCount: number
): number | null => {
  const hardRemaining =
    typeof entitlements.hardRemaining === 'number' ? entitlements.hardRemaining : null;
  const softRemaining =
    typeof entitlements.softRemaining === 'number' ? entitlements.softRemaining : null;
  const softLimit =
    typeof entitlements.softLimit === 'number' ? entitlements.softLimit : null;

  if (hardRemaining != null && hardRemaining <= 0) {
    return 0;
  }

  const softBudget =
    softLimit != null ? Math.max(softLimit - Math.min(generationCount, softLimit), 0) : null;

  if (softBudget == null) {
    return softRemaining;
  }

  if (softRemaining == null) {
    return softBudget;
  }

  return Math.min(softRemaining, softBudget);
};

const isTierSatisfied = (current: EntitlementState['tier'], required: 'creator' | 'plus' | 'pro') => {
  const currentScore = TIER_ORDER[current] ?? -1;
  const requiredScore = TIER_ORDER[required] ?? Number.MAX_SAFE_INTEGER;
  return currentScore >= requiredScore;
};

type FingerprintStatus = 'idle' | 'resolving' | 'ready' | 'error';

type GateParams = {
  styleId: string | null | undefined;
  entitlements: EntitlementState;
  sessionUser: SessionUser | null;
  fingerprintStatus: FingerprintStatus;
  generationCount: number;
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
  fingerprintStatus,
  generationCount,
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

  if (entitlements.tier === 'anonymous' && fingerprintStatus === 'error') {
    return {
      allowed: false,
      reason: 'fingerprint_required',
      message: 'Please enable device features to continue generating previews.',
      ctaText: 'Retry',
    };
  }

  if (
    entitlements.tier === 'anonymous' &&
    typeof entitlements.hardRemaining === 'number' &&
    entitlements.hardRemaining <= 0
  ) {
    return quotaExceededResult;
  }

  if (entitlements.tier === 'anonymous') {
    const remaining = computeAnonymousRemaining(entitlements, generationCount);
    if (typeof remaining === 'number' && remaining <= 0) {
      return quotaExceededResult;
    }
  } else if (
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
