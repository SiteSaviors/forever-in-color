import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export type PriorityLevel = 'normal' | 'priority' | 'pro';

export type TierLabel = 'anonymous' | 'free' | 'creator' | 'plus' | 'pro' | 'dev';

export interface EntitlementContext {
  actor: 'authenticated' | 'anonymous';
  tierLabel: TierLabel;
  tierForDb: 'free' | 'creator' | 'plus' | 'pro' | null;
  quota: number | null;
  remainingBefore: number | null;
  requiresWatermark: boolean;
  priority: PriorityLevel;
  userId?: string;
  anonToken?: string;
  devBypass: boolean;
  email?: string;
  softLimit?: number | null;
  softRemaining?: number | null;
  hardLimit?: number | null;
  usedThisPeriod?: number;
  fingerprintHash?: string | null;
  fingerprintGenerationCount?: number;
  fingerprintFirstSeen?: string | null;
  fingerprintRemaining?: number | null;
  ipAddress?: string | null;
}

export interface ResolveEntitlementsParams {
  supabase: SupabaseClient;
  accessToken?: string | null;
  anonToken?: string | null;
  devBypassEmails: Set<string>;
  fingerprintHash?: string | null;
  ipAddress?: string | null;
}

export interface ResolveResult {
  context: EntitlementContext;
}

const HARD_LIMIT_ANON = 10;
const SOFT_LIMIT_ANON = 5;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? null;

const priorityForTier = (tier: TierLabel, devBypass: boolean): PriorityLevel => {
  if (devBypass || tier === 'pro' || tier === 'dev') return 'pro';
  if (tier === 'creator' || tier === 'plus') return 'priority';
  return 'normal';
};

const requiresWatermarkForTier = (tier: TierLabel, devBypass: boolean): boolean => {
  if (devBypass) return false;
  return tier === 'anonymous' || tier === 'free';
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
    case 'free':
      return 10;
    case 'anonymous':
      return HARD_LIMIT_ANON;
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
  anonToken,
  devBypassEmails,
  fingerprintHash,
  ipAddress
}: ResolveEntitlementsParams): Promise<ResolveResult> => {
  const bearer = parseJwtBearer(accessToken ?? undefined);
  const bearerIsAnonKey = Boolean(SUPABASE_ANON_KEY && bearer && bearer === SUPABASE_ANON_KEY);

  if (bearer && !bearerIsAnonKey) {
    const { data: userData, error: userError } = await supabase.auth.getUser(bearer);
    if (userError || !userData?.user) {
      if (anonToken) {
        // Fall back to anonymous entitlements when bearer token is invalid but anon token is present
        return resolveEntitlements({
          supabase,
          accessToken: null,
          anonToken,
          devBypassEmails,
          fingerprintHash,
          ipAddress
        });
      }
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
        : tierLabel === 'anonymous'
          ? null
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
        softLimit: null,
        softRemaining: null,
        hardLimit: quotaForTier(tierLabel, devBypass),
        usedThisPeriod: quota && entitlementRow
          ? quota - (entitlementRow.remaining_tokens ?? quota)
          : undefined
      }
    };
  }

  const normalizedAnon = anonToken?.trim();
  if (!normalizedAnon) {
    throw new Error('ANON_TOKEN_MISSING');
  }

  const monthStart = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    1
  ));
  const monthEnd = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth() + 1,
    1
  ));

  const normalizedFingerprint = fingerprintHash?.trim().toLowerCase() ?? null;

  const { data: anonRow } = await supabase
    .from('anonymous_tokens')
    .select('*')
    .eq('token', normalizedAnon)
    .maybeSingle();

  if (!anonRow) {
    await supabase
      .from('anonymous_tokens')
      .insert({
        token: normalizedAnon,
        free_tokens_remaining: SOFT_LIMIT_ANON,
        month_bucket: monthStart.toISOString().slice(0, 10)
      });
  } else if (anonRow.month_bucket && new Date(anonRow.month_bucket).getTime() !== monthStart.getTime()) {
    await supabase
      .from('anonymous_tokens')
      .update({
        free_tokens_remaining: SOFT_LIMIT_ANON,
        dismissed_prompt: false,
        month_bucket: monthStart.toISOString().slice(0, 10)
      })
      .eq('token', normalizedAnon);
  }

  const { data: usageRows } = await supabase
    .from('preview_logs')
    .select('tokens_spent')
    .eq('anon_token', normalizedAnon)
    .eq('outcome', 'success')
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', monthEnd.toISOString());

  const tokensUsed = usageRows?.reduce((sum, row) => sum + (row.tokens_spent ?? 0), 0) ?? 0;
  const hardRemaining = Math.max(HARD_LIMIT_ANON - tokensUsed, 0);
  const tokenSoftRemaining = Math.max(SOFT_LIMIT_ANON - Math.min(tokensUsed, SOFT_LIMIT_ANON), 0);

  let fingerprintGenerationCount = 0;
  let fingerprintFirstSeen: string | null = null;
  let fingerprintRemaining: number | null = null;

  if (normalizedFingerprint) {
    const { data: fingerprintRow } = await supabase
      .from('anonymous_usage')
      .select('id, generation_count, first_seen, ip_address')
      .eq('fingerprint_hash', normalizedFingerprint)
      .eq('month_bucket', monthStart.toISOString().slice(0, 10))
      .maybeSingle();

    if (!fingerprintRow) {
      const nowIso = new Date().toISOString();
      await supabase
        .from('anonymous_usage')
        .insert({
          fingerprint_hash: normalizedFingerprint,
          month_bucket: monthStart.toISOString().slice(0, 10),
          generation_count: 0,
          first_seen: nowIso,
          last_seen: nowIso,
          ip_address: ipAddress ?? null
        });
      fingerprintFirstSeen = nowIso;
      fingerprintGenerationCount = 0;
    } else {
      fingerprintGenerationCount = fingerprintRow.generation_count ?? 0;
      fingerprintFirstSeen = fingerprintRow.first_seen ?? null;
      await supabase
        .from('anonymous_usage')
        .update({
          last_seen: new Date().toISOString(),
          ip_address: ipAddress ?? fingerprintRow.ip_address ?? null
        })
        .eq('id', fingerprintRow.id);
    }

    fingerprintRemaining = Math.max(
      SOFT_LIMIT_ANON - Math.min(fingerprintGenerationCount, SOFT_LIMIT_ANON),
      0
    );
  }

  const softRemaining = Math.min(
    tokenSoftRemaining,
    fingerprintRemaining ?? tokenSoftRemaining
  );

  await supabase
    .from('anonymous_tokens')
    .update({
      free_tokens_remaining: softRemaining,
      month_bucket: monthStart.toISOString().slice(0, 10)
    })
    .eq('token', normalizedAnon);

  return {
    context: {
      actor: 'anonymous',
      anonToken: normalizedAnon,
      tierLabel: 'anonymous',
      tierForDb: null,
      quota: HARD_LIMIT_ANON,
      remainingBefore: Math.min(hardRemaining, fingerprintRemaining ?? hardRemaining),
      requiresWatermark: true,
      priority: 'normal',
      devBypass: false,
      softLimit: SOFT_LIMIT_ANON,
      softRemaining,
      hardLimit: HARD_LIMIT_ANON,
      usedThisPeriod: tokensUsed,
      fingerprintHash: normalizedFingerprint,
      fingerprintGenerationCount,
      fingerprintFirstSeen,
      fingerprintRemaining,
      ipAddress: ipAddress ?? null
    }
  };
};

export const computeRemainingAfterDebet = (context: EntitlementContext, tokensSpent: number): number | null => {
  if (context.devBypass) return null;
  if (context.remainingBefore == null) return null;
  return Math.max(context.remainingBefore - tokensSpent, 0);
};
