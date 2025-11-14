# Navigation & Membership Experience Strategy

## 1. Complete Strategy

### Objectives
- Give members clear, self-serve control over tokens, subscriptions, and orders directly from the studio nav.
- Reuse existing Stripe/Supabase infrastructure (checkout sessions, token purchases, webhooks) while paving the path to billing portal + token top-ups.
- Keep UI lightweight (drawers/popovers) so users stay in context while managing balances or orders.

### Pillars
1. **Token Balance Drawer**  
   - Gradient pill becomes an interactive trigger (drawer background matches existing blue/purple pill).  
   - Drawer summarizes tier, remaining tokens, renewal date, and quick actions:
     - `Top up tokens` placeholder button (lightbox flow later).  
     - `Manage membership` (opens confirmation modal → Stripe portal / support).  
     - Token history snippet (last 2 rows from `/studio/usage` data).  
   - Hook into telemetry (`trackTokenDrawerOpened`, `trackTokenTopUpAttempt`).

2. **Membership Management Modal**  
   - Accessible from both token drawer and avatar dropdown.  
   - Shows plan details, billing cycle, payment method, CTA buttons:
     - `Change plan` → `createCheckoutSession` seeded with current tier.  
     - `Update payment info` / `Cancel subscription` → Stripe Billing Portal (new Supabase function to create portal session).
   - Include support link for edge cases.

3. **Cart Icon → Orders & Canvas Deliveries**  
   - Popover listing in-progress canvas checkouts (status, ETA, CTA to resume).  
   - If no orders: highlight benefits (“Complete your canvas order →”).  
   - Future: fetch actual order data once Supabase tables are ready.

4. **Token Top-up UX**  
   - Use existing `purchase-tokens` edge function; define bundles (e.g., 25 / 60 / 150 tokens).  
   - Present as cards inside token drawer; show price, per-token cost, and “Best value” badge.  
   - After success webhook, refresh entitlements and surface toast.

5. **Usage / History Deep Link**  
   - Keep `/studio/usage` as the full analytics/CSV hub; token drawer links to it.  
   - Align naming (“Token history” vs “Usage”) across nav and drawer.

### Experience Flow
1. User clicks `+ Tokens` pill → Balance drawer slides from right.  
2. Drawer shows summary + actions; they pick `Top up tokens`.  
3. Token bundle modal launches Stripe one-time checkout, returns to studio.  
4. Webhook updates entitlements; drawer auto-refreshes.  
5. For subscription changes, user hits `Manage membership` → billing modal/portal.  
6. Cart icon handles canvas orders separately, reducing confusion.

## 2. Files & Touchpoints

| Area | File(s) / Modules | Notes |
| --- | --- | --- |
| Navigation shell | `src/components/navigation/FounderNavigation.tsx` | Convert token pill + cart button into interactive triggers; pass callbacks down. |
| Account dropdown | `src/components/navigation/AccountDropdown.tsx` | Add “Manage membership” entry + optional badge; route to modal. |
| Token drawer UI | **New** `src/components/navigation/TokenBalanceDrawer.tsx` (Radix `Dialog` or `Sheet`) | Consumes `useEntitlementsState`, `useSessionState`, `TokenHistoryTable` subset. |
| Token bundles | Config file (e.g., `src/config/tokenBundles.ts`) | Defines SKU name, token count, price. |
| Token purchase API | `supabase/functions/purchase-tokens/index.ts`, new client util `src/utils/tokenPurchase.ts` | Wrap fetch + auth headers. |
| Billing portal | **New** `supabase/functions/create-billing-portal/index.ts` + `src/utils/billingPortal.ts` | Creates Stripe customer portal session; reused by modal. |
| Membership modal | **New** `src/components/navigation/MembershipModal.tsx` | Shows plan, renewal, actions. |
| Usage hooks | `useEntitlementsState`, `useSessionState`, `TokenHistoryTable`, `/studio/usage` | Drawer pulls summary data; link to full page. |
| Cart popover | **New** `src/components/navigation/OrdersPopover.tsx` | Placeholder list + CTA; later integrate Supabase orders. |
| Telemetry | `src/utils/telemetry.ts` | Add events for drawer open, token top-up, membership manage. |

## 3. Considerations
- **Stripe Portal Access**: Need to ensure every subscription has a `customer` ID stored (`stripe-webhook` already upserts `customer_id`). Function must verify auth before creating portal link.
- **Token bundle SKUs**: Determine pricing, copy, and whether we store purchases server-side for history. Use metadata (`type: 'token_purchase'`) already in place.
- **Drawer UX**: Ensure focus trap + ESC handling don’t conflict with existing modals (Canvas checkout). Consider portal layering order (`z-index`).
- **Mobile**: Token pill hidden on XS screens today; add an overflow menu or reuse avatar dropdown entry.
- **State freshness**: After checkout/portal events, run `hydrateEntitlements` to sync tokens/tier. For history preview, either reuse existing React Query or add a light API route returning last 5 entries.
- **Telemetry & Analytics**: Must log when users attempt to cancel/upgrade to monitor friction.
- **Cart data**: Without order endpoints, initial implementation can show “No active orders” + CTA. Plan future integration with Supabase `orders` table or Stripe fulfillment events.
- **Security**: All fetches to Supabase functions require bearer token; handle 401 gracefully (prompt login).
- **Accessibility**: Buttons need `aria-expanded`, drawers/popovers must be keyboard navigable.

## 4. Phased Implementation
Micro-phased steps ensure each layer ships safely:

### Phase A – Token Drawer Scaffolding
1. Audit `FounderNavigation` to confirm token pill visibility + add click handler hooks.
2. Scaffold `TokenBalanceDrawer` shell (Radix Dialog/Sheet) with gradient background + focus management.
3. Surface tier, token count, renewal date, and `/studio/usage` deep link; add telemetry event.

### Phase B – Token Drawer Content Polish
4. Pull last 2 token history rows (reuse `TokenHistoryTable` data hook) and render mini list.
5. Add placeholder `Top up tokens` button (fires noop/toast) and doc TODO for future lightbox.
6. Insert `Manage membership` button that triggers new confirmation modal (Phase D).

### Phase C – Navigation Integration & Desktop QA
7. Ensure drawer trigger works only on desktop (hide on XS), add keyboard shortcuts, and run visual regression checks.
8. Update `AccountDropdown` to include “Manage membership” entry pointing to same modal.

### Phase D – Membership Confirmation Modal
9. Build `MembershipModal` with current plan info + confirm copy (“Are you sure you want to cancel or change plan?”).  
10. Add CTA buttons (`Cancel subscription`, `Update payment method`, `Keep plan`) wired to placeholders / future Stripe portal link.

### Phase E – Stripe Portal Plumbing
11. Create `supabase/functions/create-billing-portal/` to generate Stripe portal URLs.  
12. Add client util + integrate with membership modal actions; refresh entitlements post-return.

### Phase F – Cart / Orders Popover
13. Implement `OrdersPopover` for cart icon with placeholder message + CTA to resume canvas checkout.  
14. Plan future integration with Supabase orders API.

### Phase G – Token Top-up Lightbox (Future)
15. Define bundle config, build lightbox, and connect to `purchase-tokens` function.  
16. Add toast + entitlements refresh + telemetry.

### Phase H – Polish & Mobile Follow-up
- ✅ Added tooltips, desktop/mobile triggers, and loading skeletons for the token drawer + orders popover.  
- 📌 Next: revisit mobile token history view + telemetry audit when top-ups go live.

With this plan, we progressively unlock self-serve management while keeping the UI cohesive and ready for future enhancements (videos, live counters, full order tracking).
