# Supabase / Stripe Coordination – Pay-As-You-Go Token Packs

This runbook captures the backend steps required for the pricing toggle + token packs refactor to work end-to-end.

## 1. Supabase Schema Updates

### `v_entitlements` view
Add the following fields (or equivalent subqueries) so the client can hydrate the new entitlement buckets without relying on legacy fallbacks:

```sql
ALTER VIEW v_entitlements AS
SELECT
  u.id AS user_id,
  e.tier,
  e.tokens_quota,
  e.remaining_tokens,
  e.premium_tokens,        -- NEW
  e.free_monthly_tokens,   -- NEW
  e.has_premium_access,    -- NEW (bool)
  e.period_end,
  e.dev_override
FROM entitlement_snapshot e
JOIN auth.users u ON u.id = e.user_id;
```

**Notes**
- `premium_tokens` should represent the combined balance of subscription allowance + purchased packs.
- `free_monthly_tokens` should be the 10-token free tier allowance (reset monthly).
- `has_premium_access` = `tier != 'free' OR premium_tokens > 0`.
- `requires_watermark` can be derived server-side as `NOT has_premium_access`.

Once deployed, the client fallback to the legacy column set can be removed.

## 2. Stripe SKU Mapping

Create three one-time Prices in Stripe (one Product per pack):

| SKU              | Stripe Price ID (example) | Tokens | Price (USD) |
|------------------|---------------------------|--------|-------------|
| `token_pack_25`  | `price_tp25_xxx`          | 25     | $4.99       |
| `token_pack_50`  | `price_tp50_xxx`          | 50     | $9.99       |
| `token_pack_100` | `price_tp100_xxx`         | 100    | $17.99      |

Persist the mapping (SKU → Stripe Price ID → token count) inside the Supabase `create-payment` handler or related config so webhooks can credit the correct number of tokens.

## 3. Edge Function / Webhook Updates

### `create-payment` (Supabase Edge)
- Accept `purchaseType: 'token_pack'` + `sku`.
- When `purchaseType` is `token_pack`, load the Stripe Price ID from the mapping above and create the checkout session as a one-time purchase.
- Attach metadata `{ sku, purchaseType: 'token_pack' }` to the Stripe session so the webhook can inspect it.

### Stripe webhook handler
- On `checkout.session.completed` or `payment_intent.succeeded`, if `metadata.purchaseType === 'token_pack'`, credit the user’s `premium_tokens` balance with the amount defined by the SKU.
- Ensure idempotency: store the Stripe event ID to prevent double credits if Stripe retries the webhook.
- If a user already has a subscription, simply add the purchased amount to their premium bucket (do not reset monthly allowance).

### Entitlement refresh
- After the webhook updates the DB, the next call to `hydrateEntitlements` should return the updated buckets via `v_entitlements`.

## 4. QA Matrix (run on staging)

1. **Free user → buys token pack**  
   - Expected: `hasPremiumAccess` flips to true, premium styles + watermark-free previews unlock.  
   - Generate previews until the purchased tokens hit zero → verify UI reverts to free mode (watermarks, locked styles).

2. **Subscriber top-up**  
   - Creator/Plus user buys a token pack → premium balance increases by pack amount.  
   - Generate previews: purchased tokens should be consumed before monthly allowance (verify remaining balance in `Settings → Usage` or via API logs).

3. **Subscription renewal with payg balance**  
   - Ensure the renewal adds monthly allowance on top of existing purchased tokens (no resets, no double increments).  
   - Run `hydrateEntitlements` and confirm both `premiumTokens` and `freeMonthlyTokens` reflect the expected totals.

4. **Gallery recall / downloads**  
   - With purchased tokens, rehydrate a gallery item and confirm the right rail + download buttons show watermark-free content.  
   - After tokens are exhausted, repeat to confirm watermarks reappear.

5. **Telemetry sanity**  
   - Toggle between subscription/payg, start token-pack checkout, and confirm console logs or analytics collectors include `mode`/`hasPremiumAccess`.

Document outcomes in release notes and remove the client-side fallback once Supabase ships the new columns. 
