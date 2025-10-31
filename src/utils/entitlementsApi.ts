import { getSupabaseClient } from '@/utils/supabaseClient.loader';

export type EntitlementTier = 'free' | 'creator' | 'plus' | 'pro' | 'dev';
export type EntitlementPriority = 'normal' | 'priority' | 'pro';

export type EntitlementSnapshot = {
  tier: EntitlementTier;
  quota: number | null;
  remainingTokens: number | null;
  renewAt: string | null;
  priority: EntitlementPriority;
  requiresWatermark: boolean;
  devOverride: boolean;
};

const mapTier = (raw: string | null | undefined, devOverride: boolean): EntitlementTier => {
  if (devOverride) return 'dev';
  switch ((raw ?? 'free').toLowerCase()) {
    case 'creator':
    case 'plus':
    case 'pro':
      return raw as EntitlementTier;
    case 'free':
    default:
      return 'free';
  }
};

const priorityForTier = (tier: EntitlementTier): EntitlementPriority => {
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

const coerceNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const coerceBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return Boolean(value);
};

export const fetchAuthenticatedEntitlements = async (): Promise<EntitlementSnapshot | null> => {
  const supabaseClient = await getSupabaseClient();
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }

  let response;
  try {
    response = await supabaseClient
      .from('v_entitlements')
      .select('tier,tokens_quota,remaining_tokens,period_end,dev_override')
      .maybeSingle();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access token unavailable')) {
      devWarn('entitlementsApi', 'Access token missing while fetching entitlements');
      return null;
    }
    throw error;
  }

  const { data, error } = response;

  devLog('entitlementsApi', 'v_entitlements query result', {
    hasData: !!data,
    hasError: !!error,
    errorMessage: error?.message ?? null,
  });
  if (data) {
    devLog('entitlementsApi', 'Entitlement row payload', data);
  }

  if (error) {
    console.error('[entitlementsApi] Query error:', error);
    throw error;
  }

  if (!data) {
    devWarn('entitlementsApi', 'No data returned from v_entitlements');
    return null;
  }

  const tier = mapTier(data.tier as string, coerceBoolean(data.dev_override));
  const quota = coerceNumber(data.tokens_quota);
  const remaining = coerceNumber(data.remaining_tokens);
  const renewAt = data.period_end ?? null;
  const requiresWatermark = tier === 'free';

  const result = {
    tier,
    quota,
    remainingTokens: remaining,
    renewAt,
    priority: priorityForTier(tier),
    requiresWatermark,
    devOverride: coerceBoolean(data.dev_override),
  };

  devLog('entitlementsApi', 'Mapped entitlement snapshot', result);

  return result;
};
import { devLog, devWarn } from '@/utils/devLogger';
