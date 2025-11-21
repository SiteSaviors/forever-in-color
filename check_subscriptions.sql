-- Quick subscription data check
-- Run this BEFORE applying the migration to see current state

-- Check all user subscriptions
SELECT
  user_id,
  tier,
  tokens_quota,
  created_at
FROM subscriptions
ORDER BY created_at DESC
LIMIT 10;

-- Check your specific account (replace with your user ID if needed)
SELECT
  p.id as user_id,
  p.dev_override,
  s.tier,
  s.tokens_quota
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.id = auth.uid();
