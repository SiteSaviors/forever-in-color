## Wondertone Checkout Modal — Performance & Reliability Audit

Context: branch `feat/canvas-modal-checkout`, repo `/Users/admin/Downloads/forever-in-color-main/forever-in-color`. Findings compiled from `npm run build:analyze` (Nov 11, 2024 02:54 PT) and code review of the modal wizard + supporting utilities.

---

### 1. Rendering & State Bottlenecks

| Severity | Area | Observation | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| **High** | Timer effect | `CanvasCheckoutModal` runs `setInterval` every second even when timer UI is hidden, re-rendering the entire modal (forms, Stripe Elements) continuously. | `src/components/studio/CanvasCheckoutModal.tsx:134-152` | Move the timer into the step indicator (or gate by `step === 'canvas'`), reset `modalOpenedAt` when the modal opens, and pause the interval on other steps. |
| **High** | Broad store subscriptions | Step indicator, ContactForm, ShippingForm, and PaymentStep subscribe to the entire checkout store without selectors, so every keystroke rerenders unrelated sections. | `CanvasCheckoutStepIndicator.tsx:20-31`, `ContactForm.tsx:14-21`, `ShippingForm.tsx:14-21`, `PaymentStep.tsx:19-34` | Use scoped selectors (e.g., `useCheckoutStore((s) => ({ step: s.step, setStep: s.setStep }), shallow)`) and wrap heavy children in `React.memo` to keep work localized. |
| **Critical** | Payment intent effect | The async fetch cannot be cancelled; if users close or switch steps mid-request, React logs “state update on unmounted component” and Stripe intents leak. | `PaymentStep.tsx:77-132` | Guard with `let active = true`/`AbortController`, bail in `finally` when inactive, and clear pending intents when leaving the payment step. |
| **Medium** | Recommendation telemetry spam | Recommendation impressions fire on every render where `step === 'canvas'` because dependency arrays include `recommendation`/`sizeOptions`. | `CanvasCheckoutModal.tsx:302-314` | Track shown IDs per modal session (ref/set) so each orientation/size logs once. |
| **Low** | DOM pulse timeout | A manual `setTimeout` applies `motion-safe:animate-[pulse...]` to `[data-mobile-drawer]` but never clears on unmount, so it modifies detached DOM nodes. | `CanvasCheckoutModal.tsx:734-742` | Store timeout IDs in a ref and clear them in the cleanup effect. |

---

### 2. Code-Splitting & Bundle Impact

| Asset / Chunk | Size | Notes |
| --- | --- | --- |
| `dist/assets/index-CPPFzXQF.js` | 81 KB raw | Main application shell after the latest modal work. |
| `dist/assets/CanvasCheckoutModal-Bumhcscy.js` | 38 KB raw | Modal bundle; candidates for further splitting (forms, testimonials, trust strips). |
| `dist/assets/PaymentStep-DaoHXwKT.js` | 25 KB raw | Already lazily loaded via `Suspense`, good separation. |
| `dist/assets/index-CAYmYlRd.css` | **149.7 KB raw / 21.2 KB gzip** | Up ~10 KB vs. the 139 KB baseline; the new shimmer/pulse utilities contribute. Consider deduping gradients/motion utilities or scoping them to the modal CSS module. |
| `dist/assets/motion-vendors-BGf-G7-S.js` | 120 KB raw | Framer-motion vendor chunk; avoid importing it from modal files to keep checkout lighter. |
| `dist/assets/heic2any-BnIVpVII.js` | 1.3 MB raw (async) | Still lazily split; ensure checkout paths never import `imageUtils` synchronously. |

Code-splitting opportunities:
1. **Lazy-load Contact/Shipping forms** via `React.lazy` so Step 1 only ships canvas controls; prefetch when users hover/tap the CTA.
2. **Defer testimonials/trust strips** behind suspense (or fetch) since they’re not critical to initial interaction.
3. **Extract Canvas deck preview** into its own chunk to keep wizard logic separate from the heavy `CanvasInRoomPreview`.

---

### 3. Potential Bugs & Logic Regressions

| Severity | Issue | Details | File / Line | Suggested Fix |
| --- | --- | --- | --- | --- |
| **Critical** | Modal progress not persisted | `enterModalCheckout()` resets the store every time the modal opens, even if the user chose “Stay in checkout”, breaking the promise that progress is saved. | `CanvasCheckoutModal.tsx:238-252` | Only reset when a user confirms exit or after success; keep state intact for dismissals. |
| **Medium** | Timer not reset on reopen | `modalOpenedAt` never changes, so reopening the modal instantly shows “Take your time—no rush”. | `CanvasCheckoutModal.tsx:134-152` | Reset the timestamp whenever `canvasModalOpen` becomes true. |
| **High** | CTA bypass path still active | `handlePrimaryCta` can still jump through contact/shipping/payment without validation. | `CanvasCheckoutModal.tsx:340-360` | Restrict the CTA handler to Step 1 and rely on form `onNext` callbacks elsewhere. |
| **High** | Stripe return URL | `stripe.confirmPayment` still targets `/checkout?payment=success`, so 3DS redirects leave the modal flow. | `PaymentStep.tsx:140-154` | Point return URL to a Studio handler that reopens the modal success step. |
| **Medium** | Recommendation assets missing | `/testimonials/*.jpg` files don’t exist, causing 404s and layout shifts. | `CanvasCheckoutModal.tsx:520-566`, `CanvasTestimonialGrid.tsx:30-48` | Provide real assets (with `width/height`, `loading="lazy"`, `decoding="async"`) or hide the grid until populated. |

---

### 4. Tooling & Telemetry Gaps

- `npm run build:analyze` surfaced an outdated Browserslist database (“14 months old”). Run `npx update-browserslist-db@latest` and capture the chunk snapshot in `PERFORMANCE-ANALYSIS.md`.
- Analytics: `trackCheckoutStepView`, `trackCheckoutExit`, and recommendation events exist, but there are no timings for recommendation selection or trust-strip visibility yet. If we want to prove the new UX lifts conversion, add:
  - `trackCheckoutRecommendationSelected({ sizeId, confidence, durationMs })`
  - `trackTrustSignalView({ context })`
  - `trackDrawerToggle({ expanded, viaDrag })`

---

### 5. Next Actions (Suggested Order)

1. **Stabilize renders:** move timer, tighten store selectors, memoize `CanvasSizeCard`.
2. **Guard async work:** abortable payment-intent effect + clean DOM timeout usage.
3. **Honor saved progress:** adjust modal lifecycle so `leaveModalCheckout()` only fires on confirmed exit/success.
4. **Asset hygiene:** ship real testimonials, add lazy-loading attributes, document image sizes.
5. **Split optional UI:** lazy-load contact/shipping/testimonial blocks; keep Step 1 lean.
6. **Log baseline:** update `PERFORMANCE-ANALYSIS.md` with today’s bundle sizes and Browserslist refresh details.

Let me know if you want any of these addressed immediately—I can prioritize whichever path has the highest conversion or reliability impact.
