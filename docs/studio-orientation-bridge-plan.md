# Studio Orientation Bridge Refactor Plan

## Goal
Restore the Studio “Change Orientation” CTA so it re-opens the crop modal while preserving the existing orientation pipeline (smart crops, preview regeneration, analytics). Achieve this by centralizing the orientation controller and decoupling it from the legacy right rail so both center-rail actions and future rail variants share the same logic.

## Research Findings
- The global `window.__openOrientationCropper` callback is registered only inside `StickyOrderRail`, which is not mounted when the Insights rail is active. As a result, the center CTA falls back to a no-op.
- Orientation handling (`ensureSmartCropForOrientation`, smart-crop caching, preview regeneration, toasts) resides entirely in `StickyOrderRail`. The same helpers power the canvas modal via the global callback.
- Unit tests (`tests/studio/actionGridOrientationBridge.spec.tsx`) already expect the CTA to call the global bridge; fixing the callback will satisfy existing coverage.
- All orientation state lives in `useFounderStore`; relocating the controller requires careful reuse of store setters (e.g., `setOrientationChanging`, `setOrientationPreviewPending`) to avoid regressions.
- Preview regeneration must only trigger when a cached preview for the target orientation is missing; otherwise we risk double-charging tokens for the same style/orientation (“`hasCachedPreview`” guard).
- Canvas size compatibility is enforced today—after an orientation change we ensure the selected canvas size exists for the new orientation. The refactor has to keep this validation or checkout may break.
- Smart-crop generation is deduplicated via `inFlightCropsRef` so rapid toggles don’t enqueue multiple requests. Whatever replaces `StickyOrderRail` needs the same dedupe to avoid races and wasted work.
- The orientation toast (`onOrientationToast`) and analytics hooks (`trackStudioV2OrientationCta`, `trackStudioV2CanvasModalOrientation`) are triggered outside the rail; the shared bridge must expose a single hookup point so we don’t double-fire events.
- CanvasCheckoutModal and other portals depend on the global bridge today; even if we add context hooks, we should keep the global entry point until every consumer migrates.

## Implementation Approach
Create a shared orientation bridge so the cropper logic lives alongside StudioConfigurator rather than the rail. Consumers (ActionGrid, canvas modal, any rail) will call a stable interface while the provider renders the cropper modal and owns the global callback.

## Phase Plan

### Phase 1 – Extract Orientation Controller (files: `src/components/studio/orientation/OrientationBridgeProvider.tsx`, `src/components/studio/orientation/useOrientationBridge.ts`)
- Lift orientation helpers (`ensureSmartCropForOrientation`, `handleCropperComplete`, etc.) from `StickyOrderRail` into a new provider component.
- Mirror all store interactions and side effects in the new module.
- Render `CropperModal` inside the provider so it remains available regardless of rail layout.
- Maintain analytics calls and toast hooks via provider props.

### Phase 2 – Register Global Bridge (files: new provider + `src/sections/StudioConfigurator.tsx`)
- Within the provider, register/unregister `window.__openOrientationCropper`.
- Inject the provider near the root of `StudioConfigurator` so it wraps both the center panel and rails.
- Surface a custom hook (`useOrientationBridge`) that exposes orientation state and a `requestOrientationChange` action.

### Phase 3 – Integrate Consumers (files: `src/components/studio/StickyOrderRail.tsx`, `src/components/studio/CanvasCheckoutModal.tsx`)
- Update `StickyOrderRail` to consume the provider hook instead of housing its own orientation handlers.
- Swap orientation buttons to call `requestOrientationChange` and rely on context state (`orientationChanging`, `cropperOpen`, etc.).
- Ensure the canvas modal still triggers orientation changes via `requestOrientationChange` (or the global bridge for now).

### Phase 4 – Wire Center CTA (files: `src/sections/studio/components/CanvasPreviewPanel.tsx`, `src/components/studio/ActionGrid.tsx`)
- Confirm `handleChangeOrientationFromCenter` now invokes the provider hook, optionally removing the global fallback if all consumers use the hook.
- Keep analytics throttling intact while avoiding duplicate calls thanks to shared state.

### Phase 5 – Regression Testing & Cleanup
- Run `npm run lint`, `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx`, and manual QA for orientation toggles (with/without cached smart crops, premium rails, Insights rail).
- Remove any leftover orientation code paths from `StickyOrderRail` that became dead after the extraction.
- Document the new provider usage in `docs/studio-v2-implementation-guide.md`.

### Phase 6 – Future Enhancements (optional)
- Expose orientation events through a typed context so analytics/toasts can subscribe without prop drilling.
- Consider moving `window.__openOrientationCropper` behind a feature flag or eliminating it if all consumers adopt the hook.
