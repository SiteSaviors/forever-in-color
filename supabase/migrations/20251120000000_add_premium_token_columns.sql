-- Add premium token columns to v_entitlements view
-- This migration adds placeholder support for premium/free token buckets
-- to enable pay-as-you-go token pack functionality.
--
-- Placeholder logic (until token_purchases table is implemented):
-- - premium_tokens: remaining tokens for paid tiers, 0 for free
-- - free_monthly_tokens: remaining tokens for free tier, 0 for paid
-- - has_premium_access: true for any paid tier
--
-- When token purchases are implemented, update this view to:
-- - Query token_purchases table for purchased pack balances
-- - Track consumption separately for premium vs free buckets

-- Drop the existing view to allow column reordering
DROP VIEW IF EXISTS public.v_entitlements;

-- Recreate with new columns
CREATE VIEW public.v_entitlements AS
WITH base AS (
  SELECT
    p.id AS user_id,
    p.dev_override,
    COALESCE(s.tier, 'free'::public.subscription_tier) AS tier,
    COALESCE(s.tokens_quota, 10) AS tokens_quota,
    COALESCE(s.current_period_start, DATE_TRUNC('month', TIMEZONE('utc', NOW()))) AS period_start,
    COALESCE(s.current_period_end, (DATE_TRUNC('month', TIMEZONE('utc', NOW())) + INTERVAL '1 month')) AS period_end
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id
),
token_calc AS (
  SELECT
    b.user_id,
    b.tier,
    b.tokens_quota,
    b.period_start,
    b.period_end,
    b.dev_override,
    GREATEST(
      b.tokens_quota -
      COALESCE(SUM(pl.tokens_spent) FILTER (
        WHERE pl.user_id = b.user_id
          AND pl.outcome = 'success'
          AND pl.created_at >= b.period_start
          AND pl.created_at < b.period_end
      ), 0),
      0
    ) AS remaining_tokens
  FROM base b
  LEFT JOIN public.preview_logs pl ON pl.user_id = b.user_id
  GROUP BY b.user_id, b.tier, b.tokens_quota, b.period_start, b.period_end, b.dev_override
)
SELECT
  tc.user_id,
  tc.tier,
  tc.tokens_quota,
  tc.remaining_tokens,
  -- Premium tokens: For paid tiers, show remaining subscription tokens
  -- For free tier, show 0 (premium tokens come from purchases only)
  CASE
    WHEN tc.tier != 'free' THEN tc.remaining_tokens
    ELSE 0
  END AS premium_tokens,
  -- Free monthly tokens: For free tier, show their 10-token monthly allowance
  -- For paid tiers, show 0 (they use premium bucket)
  CASE
    WHEN tc.tier = 'free' THEN tc.remaining_tokens
    ELSE 0
  END AS free_monthly_tokens,
  -- Has premium access: Any paid tier qualifies
  -- In future: also check if user has purchased token packs (premium_tokens > 0)
  (tc.tier != 'free') AS has_premium_access,
  tc.period_start,
  tc.period_end,
  tc.dev_override
FROM token_calc tc;

-- Ensure RLS policies apply to caller instead of the view owner
ALTER VIEW public.v_entitlements
  SET (security_invoker = true);

-- Preserve existing grants
GRANT SELECT ON public.v_entitlements TO authenticated, service_role;

-- Add comment for future reference
COMMENT ON VIEW public.v_entitlements IS
  'User entitlement snapshot with premium/free token buckets. '
  'Premium tokens: subscription allowance (future: + purchased packs). '
  'Free monthly tokens: 10-token allowance for free tier users. '
  'See docs/SUPABASE_TOKEN_PACK_RUNBOOK.md for token pack implementation.';
