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
   - CTA: "Continue to Contact & Shipping".
   - Validation: Ensure a canvas size is selected. On success, `setStep('contact')`.
2. **Contact & Shipping**
   - Content: `ContactForm` + `ShippingForm` stacked.
   - Required fields: first name, last name, email, phone, addressLine1, city, region, postalCode, country (addressLine2 optional).
   - CTA: "Continue to Payment". Show total near CTA.
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
- Preview remains visible at top (can collapse height but should not disappear).
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

