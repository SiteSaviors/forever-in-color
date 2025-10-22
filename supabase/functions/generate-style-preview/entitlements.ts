import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export type PriorityLevel = 'normal' | 'priority' | 'pro';

export type TierLabel = 'free' | 'creator' | 'plus' | 'pro' | 'dev';

export interface EntitlementContext {
  actor: 'authenticated';
  tierLabel: TierLabel;
  tierForDb: 'free' | 'creator' | 'plus' | 'pro' | null;
  quota: number | null;
  remainingBefore: number | null;
  requiresWatermark: boolean;
  priority: PriorityLevel;
  userId: string;
  devBypass: boolean;
  email?: string;
  hardLimit?: number | null;
  usedThisPeriod?: number;
}

export interface ResolveEntitlementsParams {
  supabase: SupabaseClient;
  accessToken?: string | null;
  devBypassEmails: Set<string>;
}

export interface ResolveResult {
  context: EntitlementContext;
}

const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? null;

const priorityForTier = (tier: TierLabel, devBypass: boolean): PriorityLevel => {
  if (devBypass || tier === 'pro' || tier === 'dev') return 'pro';
  if (tier === 'creator' || tier === 'plus') return 'priority';
  return 'normal';
};

const requiresWatermarkForTier = (tier: TierLabel, devBypass: boolean): boolean => {
  if (devBypass) return false;
  return tier === 'free';
};

const quotaForTier = (tier: TierLabel, devBypass: boolean): number | null => {
  if (devBypass) return null;
  switch (tier) {
    case 'creator':
      return 50;
    case 'plus':
      return 250;
    case 'pro':
      return 500;
    default:
      return 10;
  }
};

const parseJwtBearer = (headerValue?: string | null): string | null => {
  if (!headerValue) return null;
  const parts = headerValue.trim().split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return headerValue.trim().length > 0 ? headerValue.trim() : null;
};

const ensureProfile = async (supabase: SupabaseClient, userId: string) => {
  await supabase.from('profiles').upsert(
    { id: userId },
    { onConflict: 'id' }
  );
};

export const resolveEntitlements = async ({
  supabase,
  accessToken,
  devBypassEmails
}: ResolveEntitlementsParams): Promise<ResolveResult> => {
  const bearer = parseJwtBearer(accessToken ?? undefined);
  const bearerIsAnonKey = Boolean(SUPABASE_ANON_KEY && bearer && bearer === SUPABASE_ANON_KEY);

  if (!bearer || bearerIsAnonKey) {
    throw new Error('UNAUTHORIZED');
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(bearer);

  if (userError || !userData?.user) {
    throw new Error('UNAUTHORIZED');
  }

  const userId = userData.user.id;
  const email = userData.user.email?.toLowerCase() ?? '';

  await ensureProfile(supabase, userId);

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('dev_override, stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  const devOverride = Boolean(profileRow?.dev_override);
  const devBypass = devOverride || (email && devBypassEmails.has(email));

  const { data: entitlementRow } = await supabase
    .from('v_entitlements')
    .select('tier, tokens_quota, remaining_tokens, dev_override')
    .eq('user_id', userId)
    .maybeSingle();

  const tier = entitlementRow?.tier ?? 'free';
  const fallbackQuota = quotaForTier('free', false) ?? 10;
  const resolvedQuota = entitlementRow?.tokens_quota ?? fallbackQuota;
  const quota = devBypass ? null : resolvedQuota;
  const remainingTokens = devBypass
    ? null
    : (entitlementRow?.remaining_tokens ?? resolvedQuota);

  const tierLabel: TierLabel = devBypass
    ? 'dev'
    : (tier as TierLabel ?? 'free');

  const tierForDb: 'free' | 'creator' | 'plus' | 'pro' | null =
    tierLabel === 'dev'
      ? 'pro'
      : (tierLabel as 'free' | 'creator' | 'plus' | 'pro');

  return {
    context: {
      actor: 'authenticated',
      userId,
      email,
      tierLabel,
      tierForDb,
      quota,
      remainingBefore: remainingTokens,
      requiresWatermark: requiresWatermarkForTier(tierLabel, devBypass),
      priority: priorityForTier(tierLabel, devBypass),
      devBypass,
      hardLimit: quotaForTier(tierLabel, devBypass),
      usedThisPeriod: quota && entitlementRow
        ? quota - (entitlementRow.remaining_tokens ?? quota)
        : undefined
    }
  };
};

export const computeRemainingAfterDebet = (context: EntitlementContext, tokensSpent: number): number | null => {
  if (context.devBypass) return null;
  if (context.remainingBefore == null) return null;
  return Math.max(context.remainingBefore - tokensSpent, 0);
};
