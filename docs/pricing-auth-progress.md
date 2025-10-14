# Wondertone – Auth, Token, and Pricing Overhaul Status _(October 2025)_

This page documents everything completed so far on the membership/entitlement system and authentication experience, plus the remaining must‑have and nice‑to‑have tasks needed to deliver a world‑class Wondertone studio.

---

## ✅ What’s Been Delivered

### Entitlement Architecture
- **Database schema** (`supabase/migrations/20251015090000_entitlements.sql`): creates `profiles`, `subscriptions`, `anonymous_tokens`, `preview_logs`, `v_entitlements`, and RLS policies.
- **Edge enforcement** (`supabase/functions/generate-style-preview/entitlements.ts`): resolves anonymous vs authenticated actors, upserts profiles (`profiles.id` == `auth.users.id`), computes quotas, returns `{ tier, remainingTokens, requires_watermark, priority }`.
- **Front-end state** (`src/store/useFounderStore.ts`): hydrates entitlements, tracks session user/access token, handles anonymous token minting, gates preview generation, syncs token counts.

### Authentication Foundation
- **Supabase client + provider** (`src/utils/supabaseClient.ts`, `src/providers/AuthProvider.tsx`): initializes Supabase auth, bootstraps session, listens for state changes, renders the shared auth modal globally.
- **Magic-link modal** (`src/components/modals/AuthModal.tsx`): allows sign-in/sign-up via Supabase OTP with idle/loading/success/error states.
- **Account prompt** (`src/components/modals/AccountPromptModal.tsx`): launches real auth flow and dismisses prompt.
- **Navigation** (`src/components/navigation/FounderNavigation.tsx`): session-aware badge showing tier/tokens, sign-in/out controls, upgrade links.
- **Sign-out hygiene**: clears entitlements and mints new anonymous token.

### Pricing + Stripe Checkout
- **Pricing page** (`src/pages/PricingPage.tsx`): branded tier cards (Free, Creator, Plus, Pro), token info, feature highlights, success/error alerts.
- **Checkout function** (`supabase/functions/create-checkout-session/index.ts`): validates session, maps tier → price ID (`STRIPE_PRICE_MAP_JSON`), creates Stripe Checkout session.
- **Client helper** (`src/utils/checkoutApi.ts`): wraps edge request with current access token; pricing/account entry points trigger checkout.
- **Account nav integration**: upgrade CTA directs to pricing; account dropdown offers upgrade/plan actions.

---

## 🚧 Must-Have Next Steps

### Billing Lifecycle
- Make sure Stripe webhooks update `subscriptions`/`preview_logs` instantly and surface changes in `v_entitlements` without manual refresh.
- Standardize upgrade success/cancel messaging across Pricing page, account dropdown, and Studio tokens banner.

### Token Ledger & Transparency
- Build a “Token History” or “Usage” view showing each generation (style, timestamp, tokens spent).
- Include usage analytics (e.g., tokens consumed per day/week) to help users choose the right tier.

### Persistent Gallery & Profile Management
- Store generated previews (watermarked + clean) per user in Supabase storage.
- Create a “My Studio” gallery with Living Canvas assets, order status, and download controls.
- Profile settings: avatar, shipping defaults, email preferences, optional display name.

### Hard Gating UX
- When quotas hit soft/hard gates, present bespoke modals (soft = encourage upgrade; hard = block until upgrade/sign-out).
- Extend gating to other flows: Living Canvas downloads, high-res exports, etc.

### Error Handling & Telemetry
- Standardize API feedback (stripe errors, network issues) via toasts/modals.
- Instrument authentication/checkout/entitlement events for analytics dashboards and anomaly alerts.

---

## 🌟 Nice-to-Have Enhancements

- **Smart tier recommendations** (analyze usage trends to suggest best-fit plan).
- **Shared workspaces / team accounts** (token pools with roles, especially for Plus/Pro studios).
- **Rewards & referral programs** (bonus tokens for social shares or partner referrals).
- **In-app billing center** (card management, invoices, cancellation inside Wondertone).
- **Social logins & MFA** for Pro studios wanting tighter security.
- **Collaborative galleries** (shared mood boards or client proofing).

---

## Key Files / Modules

| Area | Files / Modules |
| --- | --- |
| State & Entitlements | `src/store/useFounderStore.ts`, `src/store/useAuthModal.ts` |
| Auth UX | `src/providers/AuthProvider.tsx`, `src/components/modals/AuthModal.tsx`, `src/components/modals/AccountPromptModal.tsx` |
| Navigation & Upgrade Entry Points | `src/components/navigation/FounderNavigation.tsx`, `src/pages/PricingPage.tsx` |
| Supabase Functions | `supabase/functions/generate-style-preview/entitlements.ts`, `supabase/functions/create-checkout-session/index.ts`, `supabase/functions/stripe-webhook/index.ts` |
| Checkout Helper | `src/utils/checkoutApi.ts` |

---

## Snapshot Summary
- ✅ Auth & session wiring, anonymous tokens, tier awareness, Stripe checkout triggers.
- ✅ Pricing experience (gradient background, tier cards) aligned with Wondertone brand.
- ✅ Server-side entitlements preventing token abuse + return structured responses for UI.
- 🔜 Robust billing lifecycle visuals, gallery/personalization, token ledger, cooperative workspaces.

This doc should give Claude—or any collaborator—a clear view of our progress and the roadmap for finishing the membership experience. Let’s keep the Wondertone magic shimmering ✨
