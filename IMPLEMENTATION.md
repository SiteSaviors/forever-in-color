# Canvas Checkout Modal Wizard Implementation

## Overview
Transform the existing `CanvasCheckoutModal` into a multi-step checkout wizard so users choose canvas options, enter contact & shipping info, and complete payment without leaving the modal. `/checkout` remains as a fallback but is no longer the primary flow.

## UX Structure
- **Left Column (unchanged):** `CanvasInRoomPreview` + current style metadata. Always visible (desktop & mobile).
- **Right Column (wizard):** Scrollable rail with four stages:
  1. Canvas Setup (existing controls)
  2. Contact & Shipping (combined form)
  3. Payment (Stripe PaymentElement)
  4. Success (confirmation + confetti)
- **Step indicator:** Display "Step X of 3" at the top (Success is post-payment state).
- **Back links:** Steps 2-3 include "← Back to Canvas" links; Step 3 can also go back to Step 2.
- **Totals:** Show running total in Step 2 CTA area and Step 3 payment summary.

## State & Data Flow
- Continue using existing stores:
  - `useCanvasConfigState` for orientation/size/frame/enhancements & totals.
  - `useCheckoutStore` for contact/shipping/payment intent state. Drive wizard progression via `useCheckoutStore.step` (values: `'canvas' | 'contact' | 'payment' | 'success'`).
- Remove `resetCheckout()` call before starting checkout; instead, set the initial step to `'canvas'` when the modal opens and reset when it closes or after success.

## Step Details
1. **Canvas Setup**
   - Content: Existing controls.
   - CTA: **“Continue to Contact & Shipping”**.
   - Validation: Ensure a canvas size is selected. On success, `setStep('contact')`.
2. **Contact & Shipping**
   - Content: `ContactForm` + `ShippingForm` stacked.
   - Required fields: first name, last name, email, phone, addressLine1, city, region, postalCode, country (addressLine2 optional). No marketing opt-ins for MVP.
   - CTA: **“Continue to Payment”** with running total surfaced adjacent to the CTA/back button row.
   - Secondary link: "← Back to Canvas Setup".
   - Validation: block progression until required fields filled.
3. **Payment**
   - Content: `PaymentStep` (Stripe Elements) embedded in modal.
   - Load/create payment intent when this step mounts (reuse `createOrderPaymentIntent`).
   - CTA: `PaymentStep` handles submit; on success, `setStep('success')`.
   - Secondary: "← Back to Contact & Shipping".
4. **Success**
   - Content: Headline (e.g., "Your canvas is in production"), order summary, instructions (“We’ll email confirmation & tracking”), left preview overlay with confetti animation.
   - CTA: "Return to Studio" (closes modal). Optional secondary (e.g., "View Gallery"). No auto-close.

## Exit Handling
- Once the user reaches Step 2+, intercept close/backdrop events:
  - Show confirm dialog (copy example: “Leave checkout? Your progress will be lost.” Buttons: “Stay in checkout” / “Leave checkout”).
  - Only reset checkout state when user confirms leaving or after success CTA.

## Mobile Behavior
- Modal becomes full-screen on tablet/phone breakpoints (edge-to-edge overlay).
- Preview remains visible at top (collapsed header on mobile so form stays above the fold) and should be able to expand without leaving the wizard flow.
- Wizard content stacks beneath preview; retains step indicator.

## Stripe Integration
- Continue using `createOrderPaymentIntent` + `PaymentElement` (no currency/metadata changes).
- `PaymentStep` already handles 3DS, errors, etc.; embed it in Step 3 with minimal styling tweaks.

## Implementation Tasks
1. **CanvasCheckoutModal.tsx**
   - Introduce step logic (probably via `useCheckoutStore.step`).
   - Replace single CTA with conditional rendering per step.
   - Add step indicator & summary chip header.
   - Wire secondary navigation links (back to previous step).
   - Add exit confirmation logic (prompt when step != 'canvas').

2. **Step Components**
   - Reuse `ContactForm`, `ShippingForm`, `PaymentStep` by importing from `src/components/checkout`.
   - Create helper components (optional) like `CanvasCheckoutStepIndicator`, `CanvasCheckoutSuccess`, etc.

3. **Success State**
   - Implement success view with confirmation copy + CTA(s).
   - Trigger confetti animation (CSS or lightweight JS) when step === 'success'.
   - Optionally overlay a badge on the preview (left column) indicating success.

4. **State Management**
   - Remove `resetCheckout()` from `handlePrimaryCta` (Step 1).
   - Ensure `useCheckoutStore` initializes to `'canvas'` on modal open and resets on close.
   - Persist contact/shipping data across steps.

5. **Styling & Responsiveness**
   - Ensure right rail scrolls independently per step.
   - Add step indicator styling consistent with the design system.
   - Handle mobile full-screen mode (left preview at top, wizard below).

6. **Testing**
   - Verify desktop & mobile flows.
   - Run Stripe test payment to confirm PaymentElement works in-modal.
   - Confirm exit confirmation prompts appear appropriately.

## Post-MVP Enhancements (Future Sprints)
- Cart drawer functionality (real add-to-cart, multi-item checkout).
- SessionStorage persistence for contact/shipping data.
- Step analytics (track step drop-offs).
- Animated transitions between steps and richer preview interactions.

## Phase 1 – Deep Research & Risk Analysis

### Files & Surfaces Re-read
- `src/components/studio/CanvasCheckoutModal.tsx` – current modal layout, telemetry, closing semantics, CTA handler.
- `src/store/useCheckoutStore.ts` – checkout step enum, contact/shipping/payment intent setters, reset behavior.
- `src/components/checkout/{ContactForm,ShippingForm,PaymentStep,CheckoutFormShell,CheckoutProgress,ReviewCard}.tsx` – existing form UX, validation, and navigation expectations.
- `src/utils/checkoutApi.ts` + `supabase/functions/create-order-payment-intent/index.ts` – Stripe integration, env requirements, payload/contracts.
- `tests/studio/CanvasCheckoutModal.spec.tsx` – coverage that asserts telemetry + navigation today.
- `src/store/useFounderStore.ts` (modal open/close tracking) + `src/store/hooks/useCanvasConfigStore.ts` (state feeding the modal).

### Current Flow Snapshot
- Modal is Radix-based with custom overlay handlers that immediately close on backdrop, ESC, or the × button by calling `closeCanvasModal(reason)`; `closingReasonRef` keeps telemetry reason metadata.
- Left column: fixed style metadata + `CanvasInRoomPreview` (`lazy` + `Suspense` fallback). Right column scrolls (`max-h-[80vh] overflow-y-auto`) and currently houses a single long form culminating in a “Complete Your Order” CTA.
- Primary CTA triggers `trackOrderStarted(userTier, total, hasEnhancements)`, calls `useCheckoutStore.resetCheckout()`, then navigates to `/checkout` and closes the modal with reason `'purchase_complete'`.
- Orientation buttons are display-only and disabled (orientation changes remain inside Studio rails); canvas size, frame, and enhancement toggles mutate `useFounderStore`.
- Order summary + trust blocks already exist inside the modal; Payment, contact, shipping, and review live exclusively on `/checkout`, not in the modal.

### State & Dependency Map
- `CanvasCheckoutModal` depends on: `useCanvasConfigState` (open flag, selected options, enhancements, pending preview state), `useCanvasConfigActions` (mutators + price computation), `useStyleCatalogState` (style metadata), `useUploadState` (orientation), `useEntitlementsState` (tier telemetry), and `useCheckoutStore` (`resetCheckout` only today).
- `useCheckoutStore` currently models steps `'contact' | 'shipping' | 'payment' | 'review'` with setters that also clear any existing Stripe PaymentIntent when contact/shipping change. No awareness of a `'canvas'` or `'success'` step yet.
- `ContactForm` / `ShippingForm` maintain local `useState` copies initialized from the store; they call `setStep('shipping'|'payment')` internally on submit. When embedded inside the modal, the parent wizard will need to own navigation and simply pass `onNext/onBack` callbacks.
- `PaymentStep` loads Stripe publishable key from `VITE_STRIPE_PUBLISHABLE_KEY`, creates PaymentIntents through `createOrderPaymentIntent` (which requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and, server-side, `STRIPE_SECRET_KEY`). It expects contact + shipping to be populated and will set errors if not. `return_url` is hardcoded to `${origin}/checkout?payment=success`.
- Edge function (`create-order-payment-intent`) validates canvas size IDs, orientation, enhancement IDs, and shipping completeness before creating the Stripe PaymentIntent. Any omission in the modal will result in 400 errors, so step gating must ensure data completeness prior to Step 3.

### Regression & Risk Checklist
- **Step enum mismatch:** Introducing `'canvas'` + `'success'` (and possibly merging contact+shipping) requires updating `CheckoutStep`, default state, and dependent components/tests (`CheckoutProgress`, `CheckoutFormShell`, etc.) or scoping the new steps to modal-only context to avoid breaking `/checkout`.
- **Form autonomy:** `ContactForm` and `ShippingForm` currently mutate `setStep` internally. Leaving that behavior untouched would fight the modal’s own step controller and could desync exit confirmations or analytics. They must become “dumb” forms that rely on `onNext/onBack`.
- **State resets:** Existing CTA calls `resetCheckout()` before redirecting. Removing the redirect means we can no longer nuke the store on CTA click; instead we need deterministic reset moments (modal close, abandon, or success) so PaymentStep keeps the contact/shipping data it needs.
- **Modal closure telemetry:** `closeCanvasModal(reason)` feeds `trackStudioV2CanvasModalClose`. Adding confirm dialogs or blocking close paths must still ensure `closeCanvasModal` receives the right reason exactly once; double-closing will skew analytics.
- **Stripe envs:** Missing `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, or backend `STRIPE_SECRET_KEY` already produce descriptive errors in `PaymentStep`. The modal wizard should surface the same states (e.g., red alert when key absent) rather than hiding them behind a redirect.
- **Mobile layout:** Current layout stacks left column above the right column on small screens, pushing key CTAs below the fold. The wizard must introduce a collapsed preview header so form steps stay visible, and preserve at least 48 px hit targets.
- **Pending preview overlay:** `orientationPreviewPending` shows a blocking overlay with “Adapting preview…”. Step transitions must not remove/obscure this overlay or we risk showing stale art during orientation changes.
- **Living Canvas modal:** `handleLivingCanvasToggle` opens another modal via `setLivingCanvasModalOpen(true)` when enabling the enhancement. The checkout wizard cannot break that entry point or double-open overlays.
- **/checkout page parity:** Existing page flow (`CheckoutFormShell`, `CheckoutProgress`, `ReviewCard`) still depends on the legacy steps. Any store changes must either be backward-compatible or gated (e.g., `inModalCheckout` flag) so the page experience keeps functioning as fallback.
- **Tests:** `tests/studio/CanvasCheckoutModal.spec.tsx` currently asserts that clicking the CTA triggers `trackOrderStarted`, resets checkout, and navigates to `/checkout`. Updating the modal will require rewriting this suite (and potentially adding new cases for step gating, exit confirmation, etc.) to avoid false negatives.
- **Navigation freeze history:** Previous bugs involved the nav locking up after closing Auth modals; we must ensure the canvas modal doesn’t introduce similar focus traps when new dialogs (exit confirm) appear on top.

### Additional Considerations
- **Telemetry coverage:** `trackOrderStarted` fires when CTA is clicked; in the wizard it should fire when users progress past Step 1 (first time they commit to checkout) to preserve analytics continuity.
- **Before-unload safety:** Long forms + inline payment increase the chance of accidental refresh. Adding a beforeunload guard (only while step ≥ contact & < success) will reduce abandonment due to accidental reloads.
- **Confetti / success overlays:** Any animation should be lightweight (CSS or `canvas-confetti` loaded lazily) to avoid ballooning the modal chunk beyond the current ~11 KB gzip target.
- **Feature flagging:** Maintaining a `VITE_MODAL_CHECKOUT_ENABLED` switch (or similar) is recommended so we can fall back to `/checkout` instantly if regressions surface.

## Requirements Recap (Q&A Commitments)
- **Steps & Labels:** 1) Canvas Setup, 2) Contact & Shipping, 3) Payment, 4) Success (read-only confirmation). Success waits for user action; no auto-close.
- **CTA Copy:** Step 1 “Continue to Contact & Shipping”; Step 2 “Continue to Payment” with running total on the right; Step 3 handled by PaymentStep (`Pay $X`); success CTA TBD but must return to Studio. Each step includes a clear back affordance (icon or clickable stepper) for easy reversal.
- **Forms:** Mandatory fields—first name, last name, email, phone, address line 1, city, state/region, postal/ZIP, country; address line 2 optional. No marketing opt-ins for MVP.
- **Exit Confirmation:** From Step 2 onward, closing/backdrop/ESC must trigger “Are you sure you want to exit checkout?” modal (copy TBD) before losing data.
- **Left Column:** Canvas preview + style info stay visible on every step (desktop full height, mobile collapsed header). On success we overlay a celebratory moment (confetti + badge) and inform users about confirmation/tracking emails.
- **Stripe Integration:** Continue using `create-order-payment-intent` + `PaymentElement` with existing currency/metadata behavior; single canvas per order.
- **Telemetry:** `trackOrderStarted` remains sufficient (no extra per-step analytics for now) but must fire when users commit to checkout inside the wizard.
- **Scope Out-of-Phase:** Cart/multi-item support, marketing opt-ins, additional analytics, and advanced mobile previews sit outside this phase.

## Phased Execution Plan (Micro-Phases)
1. **Phase 2A – Step Scaffold & State Upgrades (Micro-splits)**
   - **2A.1 Store Contracts:** Update `useCheckoutStore` to add `'canvas' | 'contact' | 'shipping' | 'payment' | 'success'`, introduce `inModalCheckout`, and expose helpers like `enterModalCheckout()` (sets flag + step) and `leaveModalCheckout()` (resets state+flag when modal closes).
   - **2A.2 Step Indicator Skeleton:** Add a reusable step indicator component + step constants. Render it inside `CanvasCheckoutModal` but keep the rest of the UI untouched so we can verify the state machine without swapping content yet.
   - **2A.3 Step Controller & Telemetry:** Wire CTA progression so clicking “Complete Your Order” now advances to `'contact'`, triggers `trackOrderStarted` once, and temporarily keeps existing content while the state machine is proven.
   - **2A.4 Exit Confirmation Plumbing:** Implement confirmation dialog state, intercept close/backdrop/ESC from Step 2 onward, but defer copy polish and UI integration until later phases.

2. **Phase 2B – Forms Integration & Mobile Layout (Micro-splits)**
   - **2B.1 Form Refactors:** Update `ContactForm` and `ShippingForm` to stop mutating `setStep` directly; rely on `onNext/onBack` props and ensure local state syncs with store when navigating backward.
   - **2B.2 Step Embedding:** Replace the existing modal right-rail content with Canvas Setup (Step 1), Contact (Step 2), and Shipping (Step 3) sections, wiring CTA/back buttons per requirements and gating progression on validation results.
   - **2B.3 Mobile Preview Header:** Introduce collapsed/expandable preview header for mobile breakpoints so the wizard remains visible above the fold while the full preview persists on desktop.

3. **Phase 2C – Payment & Success Experience (Micro-splits)**
   - **2C.1 Payment Embedding:** Mount `PaymentStep` inside the modal with Suspense/loading fallback, handle PaymentIntent lifecycle, and ensure back navigation returns to shipping without losing data.
   - **2C.2 Success State:** Build the celebration view (confetti animation, confirmation copy, CTA) and keep preview visible with an “Ordered” badge/overlay.
   - **2C.3 Final Polish:** Finish exit prompts (copy, beforeunload guard), ensure modal resets only on confirmed exit or success, and consider light analytics hooks if needed.

## Checkout Step Compatibility Map

| Surface | Current Steps | New Modal Steps | Compatibility Strategy |
| --- | --- | --- | --- |
| `useCheckoutStore.step` type (src/store/useCheckoutStore.ts) | `'contact' \| 'shipping' \| 'payment' \| 'review'` | `'canvas' \| 'contact' \| 'shipping' \| 'payment' \| 'success'` | Extend enum but keep legacy values so `/checkout` page continues to compile; add helpers to constrain modal vs page flows. |
| `CheckoutProgress` (src/components/checkout/CheckoutProgress.tsx) | Expects the 4 legacy steps | Modal needs a new indicator; page can keep existing component. Either gate the import (modal uses new indicator) or update `CheckoutProgress` to gracefully handle `'canvas'/'success'` by ignoring them. |
| `CheckoutFormShell` (src/components/checkout/CheckoutFormShell.tsx) | Renders forms for current `step` and transitions `review` after payment | Keep page behavior unchanged by ensuring `useCheckoutStore.step` defaults to `'contact'` when not in modal mode. Modal will control steps internally and may skip rendering `ReviewCard`. |
| Tests (`tests/studio/CanvasCheckoutModal.spec.tsx`) | Mocks `useCheckoutStore` with `{ resetCheckout }` only; asserts CTA → reset + navigate | Needs new expectations: CTA should set modal checkout mode + advance step; navigation to `/checkout` only occurs when fallback flow is active. Update mocks to include new selectors/helpers. |
| Future analytics hooks | `trackOrderStarted` fired when CTA clicked | Should now fire the first time we transition from `'canvas'` to `'contact'` to keep telemetry parity. Ensure page checkout still fires via CTA if we keep it available. |
