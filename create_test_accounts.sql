-- ========================================
-- CREATE TEST ACCOUNTS FOR EACH TIER
-- ========================================
-- Run this in Supabase Studio SQL Editor

-- IMPORTANT: You need to create user accounts first via:
-- 1. Your app's signup flow, OR
-- 2. Supabase Auth dashboard (Authentication → Users → Add User)
--
-- Then come back and run this SQL, replacing the UUIDs below
-- with your actual test user IDs.

-- Step 1: Check existing users to get their IDs
SELECT
  au.id as user_id,
  au.email,
  p.dev_override,
  s.tier,
  s.tokens_quota
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN subscriptions s ON s.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 20;

-- Step 2: Create subscriptions for test accounts
-- Replace these UUIDs with actual user IDs from Step 1

-- Example: Create Plus subscription
-- INSERT INTO subscriptions (user_id, tier, tokens_quota, current_period_start, current_period_end)
-- VALUES (
--   'REPLACE-WITH-ACTUAL-UUID-HERE'::uuid,
--   'plus',
--   150,
--   DATE_TRUNC('month', NOW()),
--   DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET tier = 'plus', tokens_quota = 150;

-- Example: Create Pro subscription
-- INSERT INTO subscriptions (user_id, tier, tokens_quota, current_period_start, current_period_end)
-- VALUES (
--   'REPLACE-WITH-ANOTHER-UUID-HERE'::uuid,
--   'pro',
--   400,
--   DATE_TRUNC('month', NOW()),
--   DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET tier = 'pro', tokens_quota = 400;

-- Step 3: Verify test accounts were created
SELECT
  user_id,
  tier,
  tokens_quota,
  current_period_start,
  current_period_end
FROM subscriptions
ORDER BY tier;
