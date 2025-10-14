# Entitlements Architecture (Design Notes)

## Actors
- **Authenticated users** – identified via Supabase JWT. Profiles table stores dev overrides and Stripe customer IDs.
- **Anonymous sessions** – minted via `/api/anon/mint`, persisted in `anonymous_tokens` with month bucket + prompt preference.

## Data Model
- `profiles` – `user_id` PK, `stripe_customer_id`, `dev_override`, timestamps.
- `subscriptions` – aligns 1:1 with user, tracks tier, period window, and monthly `tokens_quota`.
- `anonymous_tokens` – stores anon token, `free_tokens_remaining` (soft gate countdown), dismissed prompt flag, month bucket, hashed IP/User-Agent metadata.
- `preview_logs` – idempotent ledger keyed by `idempotency_key`; persists preview URL, watermark flag, priority, outcome, tokens spent.
- `v_entitlements` – exposes derived tier, quota, remaining tokens, renewal window, and `dev_override`.

## Flow Summary
1. Client hydrates entitlements:
   - Authed: fetch `v_entitlements` (RLS restricts to self).
   - Anon: call `/api/anon/mint` → sets cookie + returns token state.
2. Preview generation request sends:
   - `Authorization: Bearer <jwt>` **or** `X-WT-Anon: wt_anon_*`
   - `X-Idempotency-Key`
3. Edge function resolves actor:
   - Dev override or `WT_DEV_BYPASS_EMAILS` → unlimited, no watermark, `priority='pro'`.
   - Subscriptions ≥ Creator → tokens_quota from tier, no watermark, priority by tier.
   - Free / anonymous → enforce monthly hard caps (10), soft prompt at 5.
4. On each attempt:
   - Check existing `preview_logs` by idempotency key.
   - Validate remaining tokens; if depleted → `ENTITLEMENT_EXCEEDED`.
   - Reserve log row (`outcome='pending'`), run generation/polling, persist final result (`tokens_spent=1` on success).
5. Responses include `{ previewUrl, requires_watermark, remainingTokens, tier, priority }`.
6. Telemetry + Stripe webhook update ledger; mint endpoint resets month bucket + prompt dismissal.
