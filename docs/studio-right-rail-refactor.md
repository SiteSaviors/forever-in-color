# Studio Right Rail Refactor Worklog

## Goals
- Replace the legacy right-rail canvas checkout panel with the modal-only flow.
- Keep the right rail focused on Wondertone insights + a single CTA that opens the modal.
- Preserve orientation controls and telemetry triggered from center-stage CTAs.

## Current Architecture Notes
- `StickyOrderRail` renders `CanvasConfig` inside `RightRail.tsx` when the modal flag is off.
- CTAs funnel through `useCanvasCtaHandlers` → `handleOpenCanvas`, which currently scrolls to the rail or opens the modal based on `ENABLE_STUDIO_V2_CANVAS_MODAL`.
- Orientation helpers live in `useOrientationBridge` and are surfaced both in the rail and center stage.

## Open Questions
1. How many telemetry events depend on the rail panel vs. the modal? (Audit `trackOrderStarted`, rail CTA clicks.)
2. Can we remove `CanvasConfig` without breaking checkout summary or state hydration? (Check `CheckoutSummary.tsx`, modal usage.)
3. What UI changes are needed in `InsightsRail` to host the CTA once the order panel is gone?

## Proposed Steps
1. Update `handleOpenCanvas` / CTA handlers to always open the modal and drop the scroll fallback.
2. Remove `StickyOrderRail` usage from `RightRail.tsx`; keep insights rail only.
3. Delete `CanvasConfig` and related stores if no longer referenced; migrate any shared logic to the modal if needed.
4. Simplify feature flags (`ENABLE_STUDIO_V2_CANVAS_MODAL` default to true or remove).
5. Adjust analytics/tests/docs to reflect modal-only checkout.
6. Run `npm run lint`, `npm run build`, `npm run build:analyze`; record bundle deltas.

## Validation Checklist
- [ ] Insights rail CTA opens modal with correct state.
- [ ] Orientation changes via center-stage buttons still work and update modal defaults.
- [ ] Checkout modal completes without relying on removed rail code.
- [ ] All telemetry (`trackStudioV2CanvasCtaClick`, `trackOrderStarted`) still fire.

## Research Notes — Rail vs. Modal Toggle
- `StudioExperience.tsx:33-36` manages `canvasConfigExpanded` via `useState(true)` and exposes `handleCanvasConfigToggle` (lines 78-83) to flip the flag and scroll the panel into view (`document.getElementById('canvas-options-panel')`).
- `handleOpenCanvas` (lines 61-76) checks `hasCroppedImage`; if false it scrolls to the rail. When `ENABLE_STUDIO_V2_CANVAS_MODAL` is true, it calls `openCanvasModal(source)`; otherwise it scrolls the rail (`scrollToCanvasOptions`). This hook is passed to both center-rail and right-rail CTAs.
- Center-stage CTAs use `useCanvasCtaHandlers` (imported line 84). The hook calls `handleOpenCanvas` and falls back to `handleCanvasConfigToggle` when orientation change fails. Rail CTA uses the same handler via props.

## StickyOrderRail / CanvasConfig Touch Points
- `src/sections/studio/experience/RightRail.tsx`: lazy loads `StickyOrderRail` and renders it beneath the insights stack (`Suspense`). Receives `canvasConfigExpanded` + `mobileRoomPreview` props.
- `src/components/studio/StickyOrderRail.tsx`: imports `CanvasConfig` and mounts it with all checkout handlers (`onSizeChange`, `onToggleFloatingFrame`, etc.). Also exposes orientation buttons at the top.
- `src/components/studio/CanvasConfig.tsx`: the collapsible panel itself, still using Framer Motion for height/opacity animation.
- Shared store usage: `useCanvasConfigState` / `useCanvasConfigActions` referenced in the rail, modal (`CanvasCheckoutModal.tsx`), living canvas modal, orientation bridge, checkout summary/payment step, navigation badge.
- CTAs / orientation helpers: center-stage (`CenterStage.tsx`) and right-rail both consume `handleCanvasConfigToggle` to keep callbacks consistent.
- Docs/tests with references: `docs/phase-2-deep-dive-100-percent.md`, `CANVAS_LIGHTBOX_IMPLEMENTATION_PLAN.md`, and other legacy plans note CanvasConfig but no automated tests target it directly.

## Orientation Dependencies
- Center-stage orientation controls live in `CanvasPreviewPanel`/`ActionGrid`. `CenterStage.tsx` passes `handleChangeOrientationFromCenter` (from `useCanvasCtaHandlers`) as the `onChangeOrientation` prop. This handler calls `requestOrientationChange` from `useOrientationBridge` and falls back to `handleCanvasConfigToggle` if needed.
- `useCanvasCtaHandlers` builds both center and rail orientation handlers; both forward to the same `requestOrientationChange` promise and dispatch telemetry (`trackStudioV2OrientationCta`). The only rail-specific hook is the button group rendered in `StickyOrderRail`.
- Orientation state is managed by `useOrientationBridge` (wrapping `OrientationBridgeProvider`). It syncs upload orientation, smart crops, canvas size defaults, and preview refresh. Both the center-stage CTA and the rail button group call the same `requestOrientationChange` API, so removing the rail UI does not break orientation because the center stage already exposes the control.
- The modal (`CanvasCheckoutModal.tsx`) also depends on orientation from the bridge; it displays current orientation and size options using the shared stores.

## Data Coupling Notes
- `CanvasConfig` and `CanvasCheckoutModal` both read from `useCanvasConfigState` / `useCanvasConfigActions`; removing the rail leaves the modal untouched because it uses the same store for canvas size, frame, and enhancement state.
- Other components tied to that store:
  * `LivingCanvasModal` – toggles the enhancement via store actions; remains valid without the rail.
  * `CanvasInRoomPreview`, `FounderNavigation`, checkout `Summary`/`PaymentStep`, and orientation bridge all use the shared store; no dependency on rail markup.
  * `StickyOrderRail` is the only place where `trackOrderStarted` fires; when removing the rail we’ll need to emit this telemetry from the modal (e.g., when the modal’s primary CTA fires).
- Search for rail-specific helpers: only `StickyOrderRail` registers orientation buttons and checkout CTA; its removal means all telemetry must move to the modal (ensure `trackStudioV2CanvasCtaClick` still fires via `useCanvasCtaHandlers`).

## Clarifications from Product
- Modal checkout is the sole path; remove scroll-to-rail fallback and enforce modal open on every CTA.
- Insights rail remains visually identical: style insights + single "Create Canvas" CTA only; no orientation/buttons/order panel.
- Orientation controls live exclusively in the center stage; remove duplicates from the rail.
- `trackOrderStarted` must fire from both modal primary CTA and the center-stage CTA; rail-based telemetry is no longer relevant.
- `CanvasConfig`/`StickyOrderRail` are no longer needed once the rail checkout UI is removed—safe to delete legacy code.
- Feature flags (`ENABLE_STUDIO_V2_CANVAS_MODAL`, `ENABLE_STUDIO_V2`) can be removed if they serve no purpose after the rail cleanup.
- Create Canvas CTA is only exposed once a photo is uploaded, so no need for fallback messaging when modal opens.
- QA: standard lint/build/analyze; no visual adjustments to the insights rail.

## File-by-File Deep Dive
- `src/sections/studio/experience/StudioExperience.tsx:56-88` — `handleOpenCanvas` still scrolls to `canvas-options-panel` when the modal flag is false, and `handleCanvasConfigToggle` backs the orientation fallback inside `useCanvasCtaHandlers`. Both need new logic once the rail panel is gone.
- `src/sections/studio/experience/RightRail.tsx:61-110` — Flag-gated branch renders either `InsightsRail` or the legacy `StickyOrderRail`. The legacy path owns `canvasConfigExpanded`, lazy loads the mobile room preview, and is the only consumer of `CanvasConfig`.
- `src/components/studio/StickyOrderRail.tsx:24-143` — Hosts orientation buttons, enhancement toggles, and calls `trackOrderStarted` before pushing `/checkout`. Deleting it requires migrating telemetry and checkout navigation into the modal flow.
- `src/components/studio/CanvasConfig.tsx:122-214` — Collapsible configurator powered by `AnimatePresence`. Removing it means all size/frame/enhancement UI must live in `CanvasCheckoutModal`.
- `src/components/studio/CanvasCheckoutModal.tsx:24-200` — Modal mirrors the configurator state but is wrapped in `ENABLE_STUDIO_V2_CANVAS_MODAL` and lacks the `trackOrderStarted` call inside `handlePrimaryCta`; needs to become the sole checkout entry.
- `src/sections/studio/experience/StudioOverlays.tsx:62-65` — Suspends the modal behind the same flag; canvas upsell toast continues to call `onRequestCanvas('rail')`, so modal-open logic must remain compatible with both “center” and “rail” sources.
- `src/hooks/studio/useCanvasCtaHandlers.ts:36-80` — Center CTA telemetry fires before delegating to `onOpenCanvas`; orientation handlers reuse `handleCanvasConfigToggle` as the fallback. Removing the panel requires an alternate fallback that keeps Step One telemetry intact.
- `src/store/useFounderStore.ts:298-377` — `openCanvasModal`/`closeCanvasModal` load canvas selections and emit `trackStudioV2CanvasModalOpen/Close`. These analytics hooks must stay intact after flag removal.
- `src/components/studio/InsightsRail/SecondaryCanvasCta.tsx:26-58` — Rails CTA records `trackStudioV2CanvasCtaClick` and forwards `onRequestCanvas('rail')`; post-rail removal, it should continue opening the modal without UI changes.
- `src/components/studio/CanvasUpsellToast.tsx:51-58` — Toast CTA also invokes `onRequestCanvas('rail')`; verifies every CTA surface depends on the shared modal entry point.

## Micro-Phased Execution Plan (Minimal-Risk)

### Phase 0 – Baseline Lock & Guardrails
- Branch from `main` (VS Code workflow) and rerun `npm run build:analyze`; log current Studio chunk sizes + Lighthouse perf in this doc before touching code.
- Capture a screen recording / console log of the current orientation flow (center CTA → cropper) and note current `trackOrderStarted` firing point.
- Add temporary dev-only breadcrumbs (console.info) around `handleOpenCanvas`, `openCanvasModal`, and `trackOrderStarted` to compare sequencing after refactor (remove once validated).

### Phase 1 – Modal Path Hardening (No Removals Yet)
- **1A – Flag Consolidation:** Force-enable the modal path by inlining `ENABLE_STUDIO_V2_CANVAS_MODAL` to `true`, but keep the existing branches + rail intact. Confirm all CTAs (center, insights rail, toast) still open the modal.
- **1B – CTA Single Entry:** Refactor `handleOpenCanvas` to drop the scroll fallback yet retain the guard for missing uploads. Ensure `useCanvasCtaHandlers` fallbacks target a no-op placeholder instead of the rail toggle (while keeping the toggle function alive for now).
- QA checkpoint: orientation change, modal open/close, checkout CTA still returns to `/checkout`. Remove temporary breadcrumbs if sequencing matches.

### Phase 2 – Telemetry & CTA Parity
- **2A – Telemetry Migration:** Move `trackOrderStarted` into `CanvasCheckoutModal` primary CTA and add equivalent logging for the center-stage CTA (if missing). Create/update unit tests (Vitest) covering telemetry invocations.
- _Status:_ `trackOrderStarted` now fires from the modal primary CTA and the center-stage entry button via `useCanvasCtaHandlers`; regression coverage added (`tests/studio/CanvasCheckoutModal.spec.tsx`, `tests/studio/useCanvasCtaHandlers.spec.tsx`).
- **2B – CTA Guard Audit:** Ensure `trackStudioV2CanvasCtaClick`/`trackCanvasPanelOpen` still emit appropriately from center CTA and insights rail. Add integration-style test (React Testing Library) to spy on these calls when the modal opens.
- _Status:_ `trackCanvasPanelOpen` now emits from the shared `openCanvasModal` path with entitlement tier, center CTA telemetry validated in `tests/studio/actionGridOrientationBridge.spec.tsx`, insights CTA covered via `tests/studio/SecondaryCanvasCta.spec.tsx`, and store-level guard verified in `tests/store/openCanvasModalTelemetry.spec.ts`; subset `vitest` run documented below (Radix act warnings only).
- **2B – CTA Guard Audit:** Ensure `trackStudioV2CanvasCtaClick`/`trackCanvasPanelOpen` still emit appropriately from center CTA and insights rail. Add integration-style test (React Testing Library) to spy on these calls when the modal opens.
- QA checkpoint: run `npm run test` subset (new specs) + manual smoke on both CTAs.

### Phase 3 – Legacy Rail Deactivation (Code Still Present)
- **3A – Deactivate Scroll & Toggle:** Remove `handleCanvasConfigToggle` usage from center CTA fallbacks and guard any remaining references behind a null implementation. Keep `StickyOrderRail` import but unused to avoid bundle shifts during this step.
- **3B – Insights Rail Verification:** Confirm visually (screenshots) that insights rail is untouched; ensure props passed to `InsightsRail` are unchanged.
- Metrics checkpoint: rerun `npm run build:analyze` to ensure no unexpected chunk growth.

### Phase 4 – Component Extraction & Cleanup
- **4A – Remove `StickyOrderRail` References:** Delete the lazy import from `RightRail.tsx`, prune props (`canvasConfigExpanded`, toggle handlers), and remove fallback components tied to the order rail. Replace with a single insights-rail render.
- **4B – Delete `CanvasConfig.tsx` + `StickyOrderRail.tsx`:** After verifying zero references with `rg`, remove files, update barrel exports, and tidy related docs/tests. Ensure `CanvasCheckoutModal` retains all functionality previously hosted in the rail.
- **4C – Flag Purge:** Delete `ENABLE_STUDIO_V2_CANVAS_MODAL` / `ENABLE_STUDIO_V2` from `featureFlags.ts`, remove associated env vars from `.env.example`, and adjust any docs referencing phased rollout.
- QA checkpoint: full `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.

### Phase 5 – Final Verification & Documentation
- Run targeted manual regression: upload → orientation change → open modal → complete CTA; plus insights rail CTA, toast CTA, reduced-motion viewport, mobile viewport drawer interactions.
- Capture updated bundle metrics + Lighthouse deltas and record in both this doc and `docs/performance-source-of-truth.md`.
- Remove any temporary breadcrumbs, ensure tests/docs align, and prepare implementation notes for code review (including telemetry parity validation results).
