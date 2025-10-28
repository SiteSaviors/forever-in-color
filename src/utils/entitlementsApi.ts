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

export const fetchAuthenticatedEntitlements = async (): Promise<EntitlementSnapshot | null> => {
  const supabaseClient = await getSupabaseClient();
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }

  const { data, error } = await supabaseClient
    .from('v_entitlements')
    .select('tier, tokens_quota, remaining_tokens, period_end, dev_override')
    .maybeSingle();

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

  const tier = mapTier(data.tier as string, Boolean(data.dev_override));
  const quota = typeof data.tokens_quota === 'number' ? data.tokens_quota : null;
  const remaining = typeof data.remaining_tokens === 'number' ? data.remaining_tokens : null;
  const renewAt = data.period_end ?? null;
  const requiresWatermark = tier === 'free';

  const result = {
    tier,
    quota,
    remainingTokens: remaining,
    renewAt,
    priority: priorityForTier(tier),
    requiresWatermark,
    devOverride: Boolean(data.dev_override)
  };

  devLog('entitlementsApi', 'Mapped entitlement snapshot', result);

  return result;
};
import { devLog, devWarn } from '@/utils/devLogger';
