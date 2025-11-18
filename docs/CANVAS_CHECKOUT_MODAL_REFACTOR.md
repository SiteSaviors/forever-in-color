# Canvas Checkout Modal – Research Plan

## Phase 0 – Modal Architecture Mapping *(Research)*
- **Visual section inventory (CanvasCheckoutModal.tsx)**
  - `Dialog.Root/Overlay/Content` (Radix shell) – currently inline; handles backdrop/ESC, pointer down outside, and hosts the close button logic.
  - **Preview column** – already a component: `CanvasCheckoutPreviewColumn` plus a small wrapper for the success badge overlay.
  - **Mobile preview drawer** – inline toggle button + animated drawer containing `CanvasInRoomPreview`; gestures handled locally.
  - **Canvas step body** – inline markup (hero title/description, `CanvasCheckoutStepIndicator`, `CanvasFrameSelector`, `CanvasSizeSelector`, `StaticTestimonial` / trust cards, CTA rail, `CanvasOrderSummary`, `CheckoutFooter`). Only subcomponents (selectors/order summary/footer) are standalone; headings/CTA scaffolding live inline.
  - **Contact/Shipping/Payment steps** – each wraps existing components (`ContactForm`, `ShippingForm`, `PaymentStep`) with titles/descriptions inline.
  - **Success step** – inline success timeline cards, share CTA, share feedback banner; no dedicated component yet.
  - **CTA rail** – includes primary/secondary buttons, timers, and enhancement messaging; currently inline within canvas step.

- **Step rendering flow**
  - Step state from `useCheckoutStore` drives boolean flags (`isCanvasStep`, `isContactStep`, etc.). Modal content conditionally renders each step block.
  - Flow order: canvas → contact → shipping → payment → success, controlled by callbacks (`handleContactNext`, `handleShippingNext`, etc.) and `setStep`.
  - Success flow adds confetti (lazy-loaded via `import('canvas-confetti')`), share CTA, and success timeline.

- **Desktop vs. mobile layout**
  - Desktop: two-column layout (preview column + scrollable content column) inside `Dialog.Content`.
  - Mobile (<lg): preview column collapses into the mobile drawer (`Your Canvas` button + animated drawer). Orientation preview pending overlay disables interactions.

- **Radix Dialog wiring**
  - `Dialog.Root open={canvasModalOpen}` – tied to `useCanvasModalStatus`.
  - `onOpenChange={handleOpenChange}` – closes modal by invoking `requestClose` with reason `'dismiss'` when overlay attempts to close.
  - `Dialog.Overlay` intercepts pointer down to route to `requestClose('backdrop')`.
  - `onEscapeKeyDown` and `onPointerDownOutside` also prevent default and route to `requestClose`.
  - Close button inside content calls `requestClose('cancel')`.

## Phase 1 – State, Store, and Effect Inventory *(Research)*
- **External store & selector hooks**
  - `useCanvasModalStatus()` → reads `canvasModalOpen`, `orientationPreviewPending`.
  - `useCanvasSelection()` → reads `selectedCanvasSize`, `selectedFrame`, `enhancements`.
  - `useCanvasConfigActions()` → mutates via `closeCanvasModal(reason)` and reads computed selectors: `computedTotal()`.
  - `useUploadState()` → reads `orientation`, `smartCrops`.
  - `useStyleCatalogState()` → reads `currentStyle` for preview column.
  - `useEntitlementsState()` → reads `userTier` for telemetry / pricing.
  - `useCheckoutStore()` (Zustand) with shallow selector → reads `step`, `shipping`, exposes actions `setStep`, `enterModalCheckout`, `leaveModalCheckout`.

- **Local state (`useState`)**
  - `exitPromptReason` | `CanvasModalCloseReason | null` → controls exit confirmation sheet.
  - `mobilePreviewExpanded` (`boolean`) → mobile drawer open/close.
  - `shareFeedback` (`string | null`) → ephemeral banner after sharing.
  - `triggerFrameShimmer` (`boolean`) → toggles frame selector highlight animation.
  - `hasAutoExpandedOnce` (`boolean`) → ensures drawer auto-open happens only once per session.
  - `timerSeed` (`number | null`) → used for countdown/CTA sparkles in footer.

- **Refs (`useRef`)**
  - `closingReasonRef` tracks modal close reason to prevent duplicate exits.
  - Section refs (`frameSectionRef`, `sizeSectionRef`) for scrollToSection helper.
  - `recommendationLoggedRef` (`Set<string>`) ensures telemetry for recommended sizes fires once per orientation/size combo.
  - Mobile drawer timers: `drawerPulseTimeoutRef`, `drawerPulseCleanupTimeoutRef`.
  - Session/telemetry refs: `modalSessionActiveRef`, `telemetryFiredRef`, `confettiTriggeredRef`, `orderCompletionTrackedRef`.
  - Mobile drag refs: `mobilePreviewDragStartRef`, `mobilePreviewDragHandledRef`.

- **Derived/computed values (`useMemo` / inline constants)**
  - `floatingFrame` / `floatingFrameEnabled` (filter enhancements).
  - `recommendation` via `getCanvasRecommendation(orientation, crop dimensions)`.
  - `sizeOptions`, `selectedSizeOption`, `total = computedTotal()`.
  - `previewAsset`, `previewRoomSrc`, `previewArtRect`.
  - Step booleans: `isCanvasStep`, `isContactStep`, `isShippingStep`, `isPaymentStep`, `isSuccessStep`.
  - `hasEnabledEnhancements`, `shippingCountry`, `modalReturnUrl`, `successTimeline` copy.

- **Effects (`useEffect`)**
  1. Enter/leave checkout session when modal open state changes (`modalSessionActiveRef`, `enterModalCheckout`, `leaveModalCheckout`, exit cleanup).
  2. Confetti + `trackOrderCompleted` guard when `step === 'success'`.
  3. Reset `shareFeedback` when leaving success step.
  4. `trackCheckoutStepView(step, userTier)` on step change.
  5. Recommendation telemetry loop when canvas step loads.
  6. `trackCheckoutRecommendationShown` effect tied to `step`, `sizeOptions`, `recommendation`.
  7. Window `beforeunload` cleanup – ensures checkout session leaves cleanly.
  8. Component unmount cleanup: `leaveModalCheckout`, drawer timers, drag handlers.

- **Key callbacks (for future hook extraction)**
  - Step navigation callbacks (`handleContactNext`, `handleShippingBack`, etc.) all call `setStep`.
  - `handlePrimaryCta` scrolls to top, fires `trackOrderStarted`, advances to contact step.
  - `requestClose` / `commitClose` manage exit prompt vs. immediate close.
  - Mobile drawer helpers (`handleAutoExpandDrawer`, `handleMobilePreviewDragMove`, `beginMobilePreviewDrag`, `endMobilePreviewDrag`, `clearDrawerPulseTimeouts`).
  - Share handler uses Web Share API / clipboard fallback.
  - `handleFrameShimmer` toggles highlight animation.

## Phase 2 – Interaction & Telemetry Matrix *(Research)*
- **Primary CTAs & step navigation**
  - `handlePrimaryCta()` (canvas → contact) triggers `trackOrderStarted`, scrolls modal content to top, and calls `setStep('contact')`. Guarded with `telemetryFiredRef` to avoid double-firing.
  - Step back/next callbacks (`handleContactNext`, `handleShippingBack`, `handleShippingNext`, `handlePaymentBack`, `handlePaymentSuccess`) are thin wrappers around `setStep(...)` but share instrumentation via the step-view effect.
  - Step indicator timers rely on `timerSeed` and `CanvasCheckoutStepIndicator`, which needs new hook wiring when extracted.

- **Exit logic**
  - `requestClose(reason)` toggles exit prompt if user is mid-flow; otherwise `commitClose` closes the modal.
  - `handleOpenChange(false)` handles backdrop clicks/esc and routes to `requestClose`.
  - exit prompt buttons log `trackCheckoutExit('stay' | 'leave', currentStep, reason)` before closing.

- **Telemetry events**
  - `useEffect(() => trackCheckoutStepView(step, userTier))` runs on every step change (canvas/contact/shipping/payment/success).
  - Recommendation impressions (canvas step) iterate size options and call `trackCheckoutRecommendationShown(option.id, orientation, isRecommended, isMostPopular)` once per orientation+size pair (`recommendationLoggedRef` guard).
  - Order completion effect (success step) fires `trackOrderCompleted(userTier, total, hasEnabledEnhancements, shippingCountry)` and lazy-loads confetti. `confettiTriggeredRef` and `orderCompletionTrackedRef` prevent double execution.

- **Mobile preview interactions**
  - Toolbar button toggles `mobilePreviewExpanded`; pointer/drag gestures (`beginMobilePreviewDrag`, `handleMobilePreviewDragMove`, `endMobilePreviewDrag`) ensure drawers respond to touch while ignoring mouse clicks.
  - Auto-expand flow (`handleAutoExpandDrawer`) runs once per session on mobile, pulsing the drawer via timeouts (`drawerPulseTimeoutRef`, `drawerPulseCleanupTimeoutRef`).
  - Orientation preview overlay guards (when `orientationPreviewPending` true) block interactions.

- **Share CTA**
  - `handleShareCanvas()` tries `navigator.share`, falls back to clipboard copy, and surfaces toast-style feedback via `shareFeedback` state.

- **Success step interactions**
  - `isSuccessStep` shows success timeline, share CTA, and triggers confetti/telemetry effect. Success timeline cards (email, production, shipping) are static copy but tied to step state.

- **Scroll helpers**
  - `scrollToSection` (frame/size sections) uses refs to smooth-scroll inside modal content.

- **Telemetry helpers summary**
  - `trackOrderStarted`, `trackOrderCompleted`, `trackCheckoutStepView`, `trackCheckoutRecommendationShown`, `trackCheckoutExit`.
  - Additional implicit signals: confetti import logs on failure, share CTA logs via console warnings (not telemetry but still needed).

## Phase 3 – Extraction Boundaries & Hook Candidates *(Research)*
- **Component seams**
  1. **`CanvasCheckoutShell`** – wraps Radix Dialog overlay/content, handles `onOpenChange`, backdrop clicks, ESC, exit prompt modal, confetti injection, and share CTA. Owns refs (`closingReasonRef`, `exitPromptReason`), exposes callbacks/props to child layout.
  2. **`CanvasCheckoutLayout`** – orchestrates two columns (preview vs. content), passes down step info, timer seed, CTA handlers. Could live in `components/studio/checkout`.
  3. **`CanvasCheckoutSteps`** – renders step titles, descriptions, and modular step bodies (canvas step, `ContactForm`, `ShippingForm`, `PaymentStep`, success view). Each step moves into its own component file to keep logic contained.
  4. **`CanvasCheckoutSidebar`** – houses frame selector, size selector, enhancements summary, CTA rail, trust/testimonial cards. Receives props derived from store selectors/hooks.
  5. **`CanvasCheckoutPreviewColumn` (existing)** + **`MobilePreviewDrawer`** – extract the mobile drawer button, expansion panel, drag gestures/licensing into a dedicated component to keep pointer handling isolated.
  6. **`CanvasCheckoutSuccessPanel`** – surfaces timeline, share CTA, success copy, and interacts with shareFeedback state.

- **Hook boundaries**
  - `useCanvasCheckoutFlow()` – centralizes `step`, step navigation callbacks, exit prompt state, closing reason logic, modal session entry/exit (replaces scattered `useEffect` + `useRef` combos). Returns actions for CTA buttons and exit confirmation.
  - `useCanvasCheckoutTelemetry()` – wraps order started/completed tracking, `trackCheckoutStepView`, confetti gating, and exposes booleans (e.g., `shouldTriggerConfetti`). Handles `recommendationLoggedRef` as part of `useCanvasRecommendationTracker`.
  - `useCanvasRecommendationTracker()` – accepts `orientation`, size options, `step`, and logs `trackCheckoutRecommendationShown` once per size/orientation pair. Returns `recommendation` and recommended flags for UI badges.
  - `useMobilePreviewDrawer()` – manages `mobilePreviewExpanded`, drag start/move/end, auto-expand pulses, timer cleanup, and orientation preview blocking.
  - `useCanvasShareFeedback()` – wraps the share CTA logic (`navigator.share` / clipboard), returns `shareFeedback`, `handleShare`.
  - `useCanvasEnhancementSelectors()` – composes `floatingFrameEnabled`, `hasEnabledEnhancements`, `scrollToSection`, shimmer toggles for frame/size sections.

- **Utility/constant extraction**
  - Move success timeline copy, share copy, CTA labels, and currency formatter into `/utils/checkout` or `/components/checkout/constants`.
  - Provide a helper (`buildModalReturnUrl`) to keep URL logic outside the main component.

## Phase 4 – Risk & QA Planning *(Research)*
- **High-risk zones**
  - **Payment integration** – `PaymentStep` expects `onBack`, `onSuccess`, `clientSecret`, and checkout store state; any refactor must maintain props/event flow or risk payment failures.
  - **Exit confirmation logic** – `requestClose` vs. `commitClose` interactions with `closingReasonRef`, `exitPromptReason`, and `trackCheckoutExit` must be preserved, especially for mid-flow cancel/backdrop interactions.
  - **Telemetry sequencing** – ensure hooks still fire `trackOrderStarted` before transitioning to contact, `trackCheckoutStepView` on every step, `trackOrderCompleted` only once (confetti guard), and `trackCheckoutRecommendationShown` once per size/orientation.
  - **Mobile drawer gestures** – pointer events, drag thresholds, and auto-expand pulses can't regress or the mobile preview becomes unusable; requires touch + mouse QA with reduced-motion settings.
  - **Share CTA** – fallback to clipboard must remain functional; handle browsers without `navigator.share`.
  - **Orientation preview overlay** – `orientationPreviewPending` overlay must block interactions until ready; refactor can't remove this guard.

- **QA Matrix (manual)**
  - **Surfaces**: Desktop (>=1024px), Tablet (~768px), Mobile (<640px), each with normal and prefers-reduced-motion.
  - **Flow coverage**:
    1. Canvas step selection → contact → shipping → payment → success (happy path).
    2. Back navigation per step (shipping → contact, payment → shipping, etc.).
    3. Exit prompt: cancel on canvas (no prompt) vs. later steps (prompt appears), confirm stay/leave.
    4. Recommendation logging: change orientation/size and verify telemetry fires once.
    5. Mobile drawer gestures: tap toggle, drag open/close, auto-expand on first open, ensure orientation preview pending overlay blocks drawer when needed.
    6. Share CTA: verify native share (iOS/Android) and clipboard fallback (desktop browsers).
    7. Payment step error handling: simulate failure via PaymentStep mock (if available) to ensure telemetry + exit logic respond correctly.
    8. Success screen: confetti loads once, timeline displays, share feedback resets when leaving success.

- **Edge cases**: no enhancements vs. multiple enhancements, missing shipping address, consecutive modal openings (ensuring session state resets), orientation change mid-checkout.

## Phase 5 – Implementation Sequencing *(Research)*
- **Micro-phase rollout plan**
  1. **P0 – Hook scaffold (no DOM changes)**
     - Land `useCanvasCheckoutFlow`, `useCanvasCheckoutTelemetry`, `useMobilePreviewDrawer`, `useCanvasShareFeedback`, `useCanvasEnhancementSelectors` but still render existing JSX. Validate via unit tests and a dev flag.
  2. **P1 – Shell wrapper**
     - Introduce `CanvasCheckoutShell` (Radix Dialog + exit prompt + share banner + confetti). This shell now replaces the legacy Radix markup entirely after P9.
  3. **P2 – Canvas step extraction**
     - Extract the canvas step (hero, selectors, CTA rail) into `CanvasCheckoutCanvasStep`. Gate with flag; compare new vs old markup in story/dev.
  4. **P3 – Contact step extraction**
     - Wrap `ContactForm` plus its headings/cta copy into `CanvasCheckoutContactStep`. Wire telemetry/back navigation via hooks.
  5. **P4 – Shipping step extraction**
     - Same approach for shipping step (form, copy, CTA). Keep validation/scroll behavior intact.
  6. **P5 – Payment step extraction**
     - Encapsulate payment wrapper (titles, PaymentStep component, success/back handlers). Coordinate closely with payments team to smoke-test.
  7. **P6 – Success step extraction**
     - Move success timeline, share CTA, confetti triggers into `CanvasCheckoutSuccessStep` using `useCanvasShareFeedback`.
  8. **P7 – Sidebar module**
     - Extract frame/size/enhancements summary + CTA buttons into `CanvasCheckoutSidebar` using `useCanvasEnhancementSelectors` & `scrollToSection` helper.
  9. **P8 – Mobile drawer module**
     - Build `CanvasCheckoutMobileDrawer` (toggle button, drawer panel, drag gestures) wired to `useMobilePreviewDrawer`.
 10. **P9 – Flag flip & cleanup**
      - Enable the refactor in production, monitor telemetry/QA per Phase 4, then remove the legacy branch + `ENABLE_CANVAS_CHECKOUT_REWRITE` flag now that the shell is canonical.

- **Observability checkpoints**
  - After each micro-phase, compare `trackOrderStarted`, `trackOrderCompleted`, `trackCheckoutExit`, and recommendation impression counts to baseline.
  - Emit temporary dev events (e.g., `checkout_refactor_phase: 'P3_contact_step'`) to confirm the new components render in the intended order.
  - Monitor Sentry/logs for modal close errors, share failures, and PaymentStep props mismatch.
- **Contingency**: keep a kill-switch flag to revert to the monolith instantly if telemetry or error rates spike.

## Execution Status (updated 2025-11-18)
- ✅ **P1 – Shell wrapper**: `CanvasCheckoutShell` now owns the Radix dialog, overlay, exit prompt, and share/confetti guards.
- ✅ **P2 – Canvas step extraction**: `CanvasCheckoutCanvasStep` renders the hero, selectors, CTA rail, and summary footer with the original hooks/timers.
- ✅ **P3 – Contact step extraction**: `CanvasCheckoutContactStep` wraps the headings plus `ContactForm`, wiring back/next actions to the store.
- ✅ **P4 – Shipping step extraction**: `CanvasCheckoutShippingStep` mirrors the legacy content and telemetry hooks, delegating to `ShippingForm`.
- ✅ **P5 – Payment step extraction**: `CanvasCheckoutPaymentStep` now encapsulates the Step 4 wrapper, preserves the Suspense fallback, and lazy-loads `PaymentStep` with identical copy and trust/testimonial slots.
- ✅ **P6 – Success step extraction**: `CanvasCheckoutSuccessStep` renders the success timeline, share CTA, and summary rail for both legacy and refactor branches while reusing the existing share feedback state.
- ✅ **P7 – Sidebar module**: `CanvasCheckoutSidebar` now houses the frame/size selectors, CTA rail, and testimonial trust cards, allowing `CanvasCheckoutCanvasStep` to stay lean while sharing the enhancement hooks.
- ✅ **P8 – Mobile drawer module**: `CanvasCheckoutMobileDrawer` + `useMobilePreviewDrawer` centralize the toggle button, animated drawer, pulse timers, and touch gestures so both flag/legacy paths share identical behavior.
- ✅ **P9 – Flag flip & cleanup**: Feature flag removed; the shell/content path is the only code path and the old Radix markup has been deleted.
