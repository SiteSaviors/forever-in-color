# Pricing Page Toggle – Research & Implementation Plan

This document tracks the phased approach for introducing a Subscription ↔ Pay‑As‑You‑Go toggle on `/pricing`. Each phase will be updated with findings before moving on.

## Phase 0 – Inventory & References *(Completed)*
- **PricingPage structure**: renders hero, free-tier spotlight, premium tier grid, and `PricingBenefitsStrip` inside a gradient Section with FloatingOrbs + FounderNavigation. State tracked locally (`loadingTier`, `errorMessage`, `successMessage`) plus derived `currentTier` from `useEntitlementsState`.
- **Tier data contracts**: `FREE_TIER` and `PREMIUM_TIERS` share `{id, name, price, priceDetail, priceCents, tokensPerMonth, tokensLabel, features, gradient}`. Tier IDs limited to `'free' | 'creator' | 'plus' | 'pro'`.
- **CTA + auth flow**:
  - `handleSelectTier` routes `free` to `/create`; paid tiers clear toast state, then gate on auth. If no `sessionUser`, it stores the tier in `sessionStorage` (`wt_pending_checkout_tier`) and opens `useAuthModal('signup', { source: 'pricing' })`.
  - `startCheckout` calls `createCheckoutSession` with `tier`, `accessToken`, and success/cancel URLs; on success it `window.location.href = url`.
  - A `useEffect` listens for `checkout=success|cancelled` query params to show toasts and `hydrateEntitlements`.
  - Another `useEffect` auto-resumes any pending tier once the session+token exist.
- **TierCard component** (`src/components/ui/TierCard.tsx`):
  - Props: `id`, textual/meta fields, `tokensPerMonth`, optional `tokensLabel`, `features`, `gradient`, `isCurrent`, `isLoading`, `onSelect`, optional `variant` (`wide` for free tier) and `animationDelay`.
  - Styling: glassmorphism container with gradient glows mapped per tier ID, “Monthly Tokens” subpanel, features list, CTA button using `<Button>` component with disabled + shimmer states.
  - Hard-coded assumptions about `TierId` union and “Monthly Tokens” copy.
- **Checkout utilities** (`src/utils/checkoutApi.ts`):
  - `createCheckoutSession` accepts `tier` `'creator' | 'plus' | 'pro'` and POSTs to `/functions/v1/create-checkout-session` with Supabase anon key/auth header logic.
  - One-time order helpers already exist: `createOrderCheckoutSession({ items })` and `createOrderPaymentIntent` for canvas orders—potential candidates for pay-as-you-go packs.
- **Shared components**: `PricingBenefitsStrip` and `FloatingOrbs` purely visual; no business logic but must remain consistent when cards toggle.
- **Guardrails captured**: Authentication gating, entitlement hydration, and sessionStorage fallback must remain untouched for both Subscription and Pay-As-You-Go toggles. TierCard currently pairs pricing + token metadata tightly, so extending it will require careful prop additions or a sibling component.

## Phase 1 – User Journey Mapping *(Completed)*
- **Entry state**: Landing on `/pricing` defaults to “Subscription” mode to align with our current funnel. Hero headline/subcopy remain unchanged, but a new segmented toggle sits centered just below the subheadline (above card content). Toggle labels: `Subscription` and `Pay As You Go`.
- **Toggle behavior**:
  - Two-state pill with animated thumb + gradient background. Clicking switches local `pricingMode` and animates cards (fade/slide) to avoid layout jank.
  - Toggle is keyboard-accessible (tab focus, space/enter) and announces current selection via `aria-pressed`.
- **Subscription layout**:
  - Free tier wide card remains first, followed by three premium cards in responsive grid (1 column on mobile, 2 on small screens, 3 on desktop). Cards match current TierCard styling with “Monthly Tokens” panel and “Upgrade” CTA.
  - CTA copy unchanged; we continue to route `/create` for free, and to checkout for paid tiers.
- **Pay-As-You-Go layout**:
  - Hero copy append: “Need tokens without a membership? Flip to Pay As You Go.” to contextualize behavior.
  - When toggle is `Pay As You Go`, the free tier card hides. Instead, show a dedicated token-pack section (likely 3 cards) highlight “One-time purchase · No expiration”.
  - Cards include token quantity, price, optional bonus messaging, and CTA “Buy X Tokens”. Cards arranged in the same responsive grid to maintain parity.
- **Messaging hierarchy**:
  - Hero badge still shows current subscription tier (if any) even when viewing token packs.
  - Subheadline includes short mention of both options after copy pass: e.g., “Choose a membership or purchase tokens on-demand.”
  - Pay-as-you-go cards include a smaller subheading clarifying that tokens roll into the same wallet, reinforcing that these purchases complement subscriptions.
- **Desktop vs. mobile expectations**:
  - Toggle remains centered but collapses into a full-width pill on mobile (occupying ~90% width). Cards stack vertically with generous spacing and animated transitions degrade to fade-only on small screens to prevent layout shift.
  - Ensure touch targets (toggle, cards) meet 44px minimum. CTA buttons remain full-width on mobile.
  - Keep hero height consistent so flipping modes doesn’t push content unexpectedly on small screens.
- **Navigation cues**: When a user toggles to Pay As You Go, scroll position remains anchored, but we can add a subtle scroll prompt if needed on mobile to highlight the new cards appearing below the fold.
- **State persistence**: Consider storing last selected mode in `sessionStorage` so returning users see their preferred view (future phase).

## Phase 2 – Data Modeling & API Requirements *(Completed)*
- **Data model**:
  - Introduce `TokenPack` model distinct from subscription tiers to avoid overloading existing `Tier` union. Fields: `id`, `name` (e.g., “Explorer Pack”), `tokens` (numeric), `priceUsd` (display string + cents), `description` (bullet list), `badge` (e.g., “One-time purchase”), `gradient`, `ctaLabel` (default “Buy X Tokens”), `sku` (identifier for checkout).
  - `PricingPage` will maintain two arrays: `SUBSCRIPTION_TIERS` (existing) and `TOKEN_PACKS`. The toggle simply switches which array is rendered.
  - Optionally define `TokenPackBadgeType = 'one_time' | 'best_value'` to control styling/messaging.
- **Checkout flow**:
  - Reuse `createOrderCheckoutSession` with a single `OrderLineItem` representing the token pack: `{ name, description, amount, quantity: 1 }`, plus metadata `sku` so the edge function can map to Stripe price IDs. This avoids new Supabase endpoints; we only need to ensure the backend recognizes token-SKU purchases and credits tokens server-side post-success.
  - Continue to gate pay-as-you-go purchases behind authentication and session storage fallback identical to subscription tiers (store `pendingTokenPackId` when unauthenticated).
  - Success/cancel URLs can reuse `/pricing?checkout=success` semantics; we may append `type=token-pack` for analytics.
- **Telemetry**:
  - Mirror existing checkout events by emitting `trackPricingCheckoutStart({ mode: 'payg', sku, tokens })` before calling `createOrderCheckoutSession`.
  - After success, ensure entitlements/token balance hydration already covers one-time credits; if not, Phase 4 will need to call a specific refresh endpoint.
- **API coordination**:
  - Confirm Supabase `create-payment` handler accepts descriptive metadata; if not, extend to include `metadata: { purchaseType: 'token_pack', sku }`.
  - No new edge functions required immediately, but documentation should flag the need for backend mapping (SKU → token count) so the post-purchase webhook can deposit tokens.

## Phase 3 – Component & State Strategy *(Completed)*
- **Toggle state**:
  - Local state `const [pricingMode, setPricingMode] = useState<'subscription' | 'payg'>('subscription');`.
  - Optional `useEffect` syncing to `sessionStorage` (`wt_pricing_mode`) when the user toggles, so revisit retains preference. On mount, read stored value; fallback to subscription.
  - No URL param initially to avoid SEO permutations; can be added later if marketing requires direct linking.
- **Toggle component**:
  - Create `PricingModeToggle` component that accepts `{ mode, onChange }`. It renders a segmented pill with two buttons, animated thumb, and gradient background. Use CSS transitions for sliding effect; respect `prefers-reduced-motion`.
- **Card rendering strategy**:
  - Keep existing `TierCard` for subscription tiers with minimal prop changes.
  - Introduce `TokenPackCard` component (or extend TierCard with optional props). Recommendation: new component for clarity since pay-as-you-go cards highlight “One-time purchase”, token count, and different CTA copy. Shared styling (rounded glass panel, features list) can reuse Tailwind tokens.
  - `TokenPackCard` props: `{ id, name, tokens, price, description: string[], badge?, gradient, ctaLabel, isLoading, onSelect }`.
- **Layout wrapper**:
  - Encapsulate card sections inside two conditional wrappers with `AnimatePresence` or CSS transitions (e.g., `transition-opacity`). This ensures only one set of cards is in the DOM at a time, preventing double tab stops.
- **CTA loading state**:
  - Reuse `loadingTier` state for subscriptions and introduce `loadingTokenPackId` for pay-as-you-go to provide button feedback.
- **Shared messaging**:
  - Add `PricingModeBadge` under toggle to describe current view (“Membership tiers billed monthly” vs. “One-time token packs with no expiration”).

## Phase 4 – Visual & Interaction Reference *(Completed)*
- **Visual translation**:
  - Toggle pill adopts Wondertone’s palette: deep-slate base (`bg-slate-900/50`, border `white/10`) with a moving gradient thumb (`from-purple-400 via-pink-400 to-cyan-300`). Labels use the studio typeface, uppercase micro text, and glow on hover.
  - Card decks share existing TierCard glass aesthetic: rounded 32px corners, subtle inner border, gradient glows. Token pack cards use lighter glass with neon badges (e.g., “One-time purchase”) consistent with Wondertone’s CTA chips.
  - Section background remains the current multi-radial gradient with FloatingOrbs so the toggle feels native.
- **Micro-interactions**:
  - Toggle knob glides with `transition-transform duration-300 ease-out`. When switching states, labels fade between 70% and 100% opacity.
  - Card transitions: `transition-opacity duration-400 ease-out` plus `translate-y-1.5` to mimic sliding out/in. Animate sequential appearance with slight delays to echo current TierCard staggering.
  - CTA hover states mirror existing buttons: slight lift (`-translate-y-1`) and glow shadow.
- **Accessibility**:
  - Toggle implemented as a two-option `role="tablist"` or as two buttons with `aria-pressed`; ensure focus outlines are visible (custom ring).
  - Provide descriptive `aria-live="polite"` messaging when switching modes (“Showing subscription plans” / “Showing pay-as-you-go token packs”) for screen readers.
  - Respect `prefers-reduced-motion`: disable translate animations, rely on opacity changes only.
  - Ensure cards that are unmounted are also removed from the tab order; use conditional rendering instead of display toggles.
- **Responsive behavior**:
  - Toggle spans 100% width on mobile with compact height; labels stack if needed.
  - Card grid collapses to a single column with generous spacing; when switching modes, maintain container height with `min-h` in CSS to avoid content jump.

## Phase 5 – Verification & Guardrails *(Completed)*
- **Automated tests**:
  - Jest/Vitest snapshot test for `PricingModeToggle` to ensure labels, aria attributes, and class toggles render correctly.
  - Unit test for helper that persists/retrieves `pricingMode` from `sessionStorage`.
  - Optional visual regression (Storybook Chromatic) covering both modes to catch layout drift.
- **Manual QA checklist**:
  1. Toggle interaction on desktop/mobile (mouse, touch, keyboard). Confirm `prefers-reduced-motion` respects reduced animation.
  2. Subscription flow: select each tier, ensure auth gating fires, checkout session starts, query params show success/cancel messages, entitlements refresh.
  3. Pay-as-you-go flow: select each token pack, verify same auth gating and session storage resume, confirm Stripe checkout uses correct SKU/price, and tokens appear in wallet post-success.
  4. Mixed scenarios: user toggles to payg, begins checkout unauthenticated, signs in, ensure resumed action respects selected mode.
  5. Responsive layout on key breakpoints (375px, 768px, 1024px).
- **Telemetry**:
  - Verify events fire with `mode` metadata (subscription/payg) and proper payloads (tier or SKU). Compare counts in Launchflow dashboards to ensure no drop.
- **Docs & comms**:
  - Update `README.md` or marketing docs referencing pricing tiers to mention the dual-mode UI.
  - Add a section to `CHECKOUT_CONVERSION_IMPLEMENTATION.md` or similar runbook detailing pay-as-you-go flow, SKUs, and analytics identifiers.
  - Note toggle behavior in `WONDERTONE-UX-STRATEGY.md` so future UX efforts respect the new interaction.
- **Rollout checklist**:
  - Feature tested in staging with real Stripe test SKUs.
  - Monitor Supabase logs for `create-payment` metadata on token packs.
  - Announce change in release notes with guidance for support team (distinguish membership vs. token pack purchases).

---

# Implementation Plan

## Phase A – Toggle Foundations *(Completed / Polished)*
1. **Toggle component**: `PricingModeToggle` now includes reduced-motion awareness (disables thumb animation when `prefers-reduced-motion` applies) and Storybook coverage for regression testing.
2. **State wiring**: `PricingPage` reads an initial mode from `sessionStorage` (`wt_pricing_mode`) and persists user selections for subsequent visits within a session.
3. **Hero integration**: Toggle plus helper caption sits below the subheadline, communicating the benefits of each mode and adapting copy based on the current selection.

## Phase B – Subscription Section Refactor *(Completed / Polished)*
1. **Shared wrapper**: Introduced `PricingSection` and updated `SubscriptionSection` with an `isVisible` prop so all pricing sections share the same fade/transition primitives.
2. **Rendering logic**: `PricingPage` now renders `<SubscriptionSection isVisible={pricingMode === 'subscription'} />`, ensuring the DOM stays clean when the payg mode is active.
3. **Regression tests**: Added `tests/pricing/SubscriptionSection.spec.tsx` plus Storybook coverage to ensure the section unmounts when invisible and still renders all tiers when shown.

## Phase C – Pay-As-You-Go Section
**Status:** C.1–C.3 completed (C.4 in place).

1. **Data model**: Added `TokenPack` type and `TOKEN_PACKS` constant in `PricingPage` with ids (`pack-25/50/100`), SKUs, price strings, gradients, badges, and bullet copy mirroring the desired UX.
2. **Card component + rendering**: Added `TokenPackCard` plus `TokenPackSection` that reuses `PricingSection` and renders cards when `pricingMode === 'payg'`.
3. **CTA behavior**: `PricingPage` tracks `loadingTokenPackId`, stores pending pack IDs (sessionStorage), fires telemetry placeholders via `trackRuntimeMetric`, and uses a shared checkout URL helper + `createOrderCheckoutSession` metadata to kick off auth-gated purchases.
4. **Success handling**: Success/cancel effects read `type=token_pack` to display the correct toast copy (“Token purchase complete…”), still calling `hydrateEntitlements` after success.

## Phase D – Entitlement Integration
**Status:** D.1–D.4 completed (backend steps documented below).

1. **State updates**: `EntitlementState` now tracks `premiumTokens`, `freeMonthlyTokens`, and `hasPremiumAccess`; `hydrateEntitlements` and `updateEntitlementsFromResponse` map the new fields, and `useEntitlementsState` exposes them to consumers.
2. **Derived logic**: Style gating now respects `hasPremiumAccess` (updated `canGenerateStylePreview` and tone-section caches). Preview pipeline + CTA telemetry now use the flag, and gallery/checkout surfaces were wired to derive `requiresWatermark` from premium access (GalleryPage, quickview hooks, studio entitlement hook). Gallery selection specs were updated with fetch/data URI mocks (`npm run test -- useGalleryQuickviewSelection`).
3. **Token consumption** *(Done)*: Added `consumePreviewToken` + bucket math so preview flows deduct premium credits before free tokens (with tests) and fallback when backend responses lack the new fields.
4. **Backend coordination & QA**: Authored `docs/SUPABASE_TOKEN_PACK_RUNBOOK.md` with the Supabase view SQL, Stripe SKU mapping, webhook expectations, and QA matrix (free top-up, premium depletion, subscriber top-ups, gallery download checks). Pending backend work should follow that runbook; once deployed, rerun the QA scenarios enumerated there.

## Phase E – Telemetry & Persistence *(Completed)*
1. **Events**: `trackPricingToggle` fires whenever the user flips the pricing toggle; `trackTokenPackCheckoutStart` records pay-as-you-go CTA clicks with pack metadata.
2. **State persistence**: The toggle already stores the last mode in `sessionStorage` (`wt_pricing_mode`) and rehydrates on load while still defaulting to subscription when nothing is stored.

## Phase F – Styling & Motion Polish *(Completed)*
1. **Responsive tuning**: Token-pack cards now enforce consistent min-heights/flex layouts, grids include mobile padding, and toggle helper copy scales for 375/768/1024 breakpoints.
2. **Reduced motion**: Pricing sections and token-pack animations respect `motion-reduce`, disabling fades/transforms when the OS prefers reduced motion.
3. **Accessibility**: Added `aria-live` status messaging for the pricing toggle, ensured sections unmount cleanly, and preserved keyboard focus rings so toggling communicates changes to screen readers.

## Phase G – Verification & Docs
1. **Run required commands**: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.
2. **Manual QA**: Follow Phase 5 checklist for both modes and both checkout paths.
3. **Doc updates**: Note new toggle + token packs in follow-up documentation (pricing playbook, release notes).

---

# Pay-As-You-Go Entitlement Research Plan

## Phase E0 – Current Entitlement Inventory *(Completed)*
- **Store structure**:
  - `entitlementSlice` initializes `entitlements: { status, tier, quota, remainingTokens, requiresWatermark, priority, renewAt }` with helpers for generation counts, toast/quota modals.
  - `hydrateEntitlements` pulls from Supabase `v_entitlements` via `fetchAuthenticatedEntitlements()` which returns `{ tier, quota, remainingTokens, renewAt, requiresWatermark, priority }`. Remaining tokens currently represent a single aggregate balance (no distinction between free vs. premium credits).
  - `requiresWatermark` is derived purely from tier (`tier === 'free'`), meaning free users always get watermarks regardless of token balance.
  - Selectors exposed via `useEntitlementsState` include `entitlements`, `userTier`, `requiresWatermark`, `displayRemainingTokens`, `generationCount`, `generationLimit`.
- **Gating utilities**:
  - `canGenerateStylePreview` (`src/utils/entitlementGate.ts`) checks `entitlements.remainingTokens`, `requiresWatermark`, and style metadata to determine if a preview can run.
  - `useEntitlementsActions.evaluateStyleGate` wraps that helper for UI components.
- **Consumers / touchpoints** (non-exhaustive list from `rg`):
  - **Studio / UI**: `src/components/studio/ActionGrid.tsx`, `TokenWarningBanner.tsx`, `CanvasCheckoutModal.tsx`, `src/hooks/studio/useCanvasCtaHandlers.ts`, `StyleSidebar.tsx`, `GalleryPage.tsx`.
  - **Navigation / surfaces**: `FounderNavigation` badge, `UsagePage`, `PricingPage`.
  - **Telemetry**: `src/utils/telemetry.ts` and `src/utils/founderPreviewGeneration.ts` include entitlement properties in analytics payloads.
  - **Providers**: `AuthProvider.tsx` hydrates entitlements on session change.
- **Key findings**:
  - No explicit `premiumAccess` flag exists; premium vs. free is inferred strictly from `tier`.
  - Token count UI pulls from `getDisplayableRemainingTokens()`, so any new bucket structure must keep a simple number available.
  - Style gating + watermark logic need a new condition beyond tier to consider pay-as-you-go purchased balances.

## Phase E1 – Token Bucket Modeling *(Completed)*
- **API shape proposal**:
  - Extend entitlement snapshot with:
    - `freeMonthlyTokens`: number | null – remaining free-tier credits (watermarked, non-premium).
    - `premiumTokens`: number | null – credits usable for premium experiences (subscription allowance + purchased packs).
    - `totalTokens`: optional convenience number (sum of both) for dashboards.
  - For subscribers, `freeMonthlyTokens` can be `null` or `0` since they rely on premium tokens only.
- **Consumption order**:
  - If `premiumTokens > 0`, decrement premium bucket first; this keeps the premium unlock active as long as possible and mirrors top-ups for subscribers.
  - When `premiumTokens === 0` but `freeMonthlyTokens > 0`, allow generation but enforce watermark/premium restrictions. Consuming free credits should not affect the premium bucket.
  - Backend must report both balances after every transaction (generation, purchase, subscription renewal).
- **Rollover behavior**:
  - `freeMonthlyTokens` resets monthly (existing behavior). No rollover into premium.
  - `premiumTokens` persists until spent; subscription allocations add to this bucket on renewal. Purchased packs simply increment the same bucket.
  - Documented rule: subscription allowance deposits occur before pay-as-you-go purchases in the ledger so statements are deterministic.
- **Derived flags**:
  - `hasPremiumAccess = tier !== 'free' || (premiumTokens ?? 0) > 0`.
  - Displayed remaining tokens can continue to show `premiumTokens ?? freeMonthlyTokens ?? 0`, but UI copy should clarify whether they’re premium or free.

## Phase E2 – Access Derivation *(Completed)*
- **Derived fields**:
  - `hasPremiumAccess = tier !== 'free' || (premiumTokens ?? 0) > 0`.
  - `requiresWatermark = !hasPremiumAccess` (overrides the current `tier === 'free'` rule). `tier` still matters for other perks but watermark logic now checks `hasPremiumAccess`.
  - `canAccessPremiumStyles = hasPremiumAccess`.
- **Propagation map**:
  1. **Studio style gating** (`useEntitlementsActions.evaluateStyleGate`, `StyleSidebar`, `useToneSections`): use `hasPremiumAccess` to decide whether premium styles are clickable. If false, keep current upsell messaging.
  2. **Preview generation** (`useCanvasCtaHandlers`, `founderPreviewGeneration` helpers): pass `requiresWatermark` based on `hasPremiumAccess`. When false, previews render watermark-free.
  3. **Gallery & Downloads** (`GalleryPage`, `GalleryQuickview`): determine whether premium downloads/unwatermarked exports are allowed.
  4. **Checkout pipeline** (`CanvasCheckoutModal`, `CheckoutSummary`): ensure token deduction + entitlement displays reflect premium balance.
  5. **Telemetry**: include `hasPremiumAccess` (or mode) in `trackStepOne`, pricing events, etc., for analytics.
  6. **Navigation/Badges**: `FounderNavigation` badge can show “Premium unlocked via tokens” messaging when tier is free but `hasPremiumAccess` is true.
- **State exposure**:
  - Extend `useEntitlementsState` selectors to return `hasPremiumAccess` and `premiumTokens`.
  - Add helper `getPremiumTokenBalance()` to `entitlementSlice` for consistent consumption logic.

## Phase E3 – Client/Backend Contract Updates *(Completed)*
- **Backend requirements**:
  - `v_entitlements` view (or API) must expose `free_monthly_tokens`, `premium_tokens`, and `total_tokens`. `requires_watermark` becomes derived server-side from `tier` + `premium_tokens`.
  - Stripe webhook (subscription renewals + payg purchases) updates the ledger so `premium_tokens` reflects subscription allotments and token-pack credits. Token consumption endpoints decrement the correct bucket and persist remaining balances.
  - `create-payment` Supabase function must accept metadata `{ purchaseType: 'token_pack', sku }` and credit the corresponding number of `premium_tokens` upon payment success.
- **Client adjustments**:
  - `EntitlementState` type gains `freeMonthlyTokens` and `premiumTokens` fields; `remainingTokens` can map to `premiumTokens` for backward compatibility but UI should know when it’s free-only.
  - `hydrateEntitlements` maps new fields and computes `hasPremiumAccess`.
  - Selectors (`useEntitlementsState`) expose `premiumTokens`, `freeMonthlyTokens`, and the derived flag. Any component reading `requiresWatermark` now references the derived value.
  - Token consumption helpers (e.g., preview generation) accept updated payloads to decrement the correct bucket.
- **QA plan**:
  1. Free user purchases token pack → entitlements show `premiumTokens > 0`, `hasPremiumAccess` true, premium UI unlocked, watermark removed.
  2. Same user spends all premium tokens → once balance hits zero, UI reverts to free state while any leftover `freeMonthlyTokens` still enable watermarked generations.
  3. Subscriber purchases token pack → `premiumTokens` increases beyond monthly allowance; ensure consumption order reflects top-ups.
  4. Subscription renewal adds tokens while payg balance exists → verify totals add correctly and no duplicate events occur.
  5. Regression tests for `hydration` and `updateEntitlementsFromResponse` with new fields.

---

*This doc will be updated after each phase with findings, blockers, and decisions.* 
