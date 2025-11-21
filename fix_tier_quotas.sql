-- ========================================
-- FIX TIER QUOTAS TO MATCH PRICING PAGE
-- ========================================
-- Run this in Supabase Studio SQL Editor

-- Step 1: Update the trigger function with correct quotas
CREATE OR REPLACE FUNCTION public.set_subscription_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Set quota based on tier if not explicitly provided
  IF new.tokens_quota = 10 OR new.tokens_quota IS NULL THEN
    CASE new.tier
      WHEN 'creator' THEN
        new.tokens_quota := 50;
      WHEN 'plus' THEN
        new.tokens_quota := 150;  -- Fixed from 250
      WHEN 'pro' THEN
        new.tokens_quota := 400;   -- Fixed from 500
      WHEN 'free' THEN
        new.tokens_quota := 10;
      ELSE
        new.tokens_quota := 10;
    END CASE;
  END IF;

  RETURN new;
END;
$$;

-- Step 2: Fix existing Plus accounts (change 250 → 150)
UPDATE public.subscriptions
SET tokens_quota = 150
WHERE tier = 'plus' AND tokens_quota = 250;

-- Step 3: Fix existing Pro accounts (change 500 → 400)
-- But ONLY if dev_override is false (preserve dev accounts at 50,000)
UPDATE public.subscriptions s
SET tokens_quota = 400
FROM public.profiles p
WHERE s.user_id = p.id
  AND s.tier = 'pro'
  AND s.tokens_quota = 500
  AND p.dev_override = false;

-- Step 4: Show results
SELECT
  s.user_id,
  s.tier,
  s.tokens_quota,
  p.dev_override,
  CASE
    WHEN s.tier = 'free' THEN 'Should be 10'
    WHEN s.tier = 'creator' THEN 'Should be 50'
    WHEN s.tier = 'plus' THEN 'Should be 150'
    WHEN s.tier = 'pro' AND p.dev_override THEN 'Should be 50000 (dev)'
    WHEN s.tier = 'pro' THEN 'Should be 400'
  END as expected_quota
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
ORDER BY s.tier;
