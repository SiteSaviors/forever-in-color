-- Entitlement Diagnostics Query
-- Run this in Supabase SQL Editor to diagnose the tier/token issue

-- 1. Check if the view has the new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'v_entitlements'
ORDER BY ordinal_position;

-- 2. Check your current user's profile
SELECT
  id,
  dev_override,
  created_at,
  updated_at
FROM profiles
WHERE id = auth.uid();

-- 3. Check your current user's subscription
SELECT
  user_id,
  tier,
  tokens_quota,
  current_period_start,
  current_period_end,
  stripe_subscription_id,
  created_at,
  updated_at
FROM subscriptions
WHERE user_id = auth.uid();

-- 4. Check what the view returns for you
SELECT *
FROM v_entitlements
WHERE user_id = auth.uid();

-- 5. Check all subscriptions (to see if data exists)
SELECT
  tier,
  tokens_quota,
  COUNT(*) as user_count
FROM subscriptions
GROUP BY tier, tokens_quota
ORDER BY tier;

-- 6. Check if the view definition is correct
SELECT
  pg_get_viewdef('public.v_entitlements', true) as view_definition;

-- 7. Raw data check - join profiles and subscriptions manually
SELECT
  p.id as user_id,
  p.dev_override,
  s.tier,
  s.tokens_quota,
  CASE WHEN s.user_id IS NULL THEN 'NO SUBSCRIPTION ROW' ELSE 'HAS SUBSCRIPTION' END as subscription_status
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.id = auth.uid();
