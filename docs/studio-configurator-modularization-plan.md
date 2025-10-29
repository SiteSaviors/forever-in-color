## Studio Configurator Modularization — Implementation Playbook

> Objective: Reduce the default Studio bundle weight by extracting heavyweight domains from `src/sections/StudioConfigurator.tsx` into lazily loaded feature bundles, while keeping Launchflow → Studio choreography, telemetry, entitlements, and preview pipelines 100% intact.

---

### Phase 0 — Baseline Snapshot & Guardrails

**Goals**
- Capture current bundle composition and runtime expectations before any refactor.
- Re-state acceptance criteria and validation steps to avoid regressions.

**Actions**
1. Run `npm run build:analyze` and archive the generated `dist/stats.html` or CLI report. Record the size of chunks that include `src/sections/StudioConfigurator.tsx`, `CanvasPreviewPanel`, checkout modules, etc.  
   - _Output location:_ docs/perf/baseline/studio-configurator-<date>.md (to be created during implementation).
2. Review existing smoke instructions (upload → crop → preview → download → checkout). Attach to this plan so QA has a ready script.  
   - _Reference files:_ `docs/founder-store-phase1-execution-plan.md`, `docs/phase-b-store-architecture-opportunities.md`.
3. Confirm required automated checks:  
   - `npm run lint`  
   - `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`  
   - `npm run build`

**Acceptance**
- Build analysis report committed alongside code (✅ `docs/perf/baseline/studio-configurator-2025-10-28.md`).
- No plan stage proceeds without documented baseline.
- Manual smoke script captured from existing documentation for future QA reference.

---

### Phase 1 — Architecture Blueprint & Module Topology

**Goals**
- Define the future component hierarchy and data flow.
- Identify which responsibilities remain in the shell versus lazy modules.

**Artifacts Delivered (2025-10-28)**
- This plan extended with module responsibilities, dependency map, and interface sketches.
- Component topology (ASCII) captured below for quick reference.

```
StudioConfiguratorShell (src/sections/StudioConfigurator.tsx)
 ├─ OrientationBridgeProvider
 ├─ StudioShellContextProvider (toast + telemetry adapters)
 └─ Suspense fallback: <StudioSkeleton>
     └─ StudioExperience (lazy, src/sections/studio/experience/StudioExperience.tsx)
         ├─ StudioExperienceContextProvider
         ├─ StudioLeftRail (lazy child chunk boundary)
         │    ├─ StyleSidebar (existing lazy)
         │    └─ MobileStyleDrawer (lazy)
         ├─ StudioCenterStage
         │    ├─ CanvasPreviewPanel
         │    ├─ StageActionGrid (new wrapper around ActionGrid)
         │    └─ PreviewOverlays (status, CTA badges)
         ├─ StudioRightRail (lazy via dynamic import)
         │    ├─ InsightsRailLazy (feature-flagged)
         │    └─ StickyOrderRailLazy (checkout rail)
         └─ StudioOverlays
              ├─ LivingCanvasModal (lazy)
              ├─ DownloadUpgradeModal (lazy)
              ├─ CanvasCheckoutModalLazy (lazy)
              └─ CanvasUpsellToast (lazy)
```

**Design Decisions**
1. **Shell (`src/sections/StudioConfigurator.tsx`)**  
   - Retain `OrientationBridgeProvider`, global toast feedback (`useStudioFeedback`), Suspense fallback skeletons.  
   - Expose a context/provider for downstream modules (see Phase 2).
2. **Lazy bundle (`src/sections/studio/experience/StudioExperience.tsx`)**  
   - Houses the heavy UI; exports default lazy component.  
   - Uses context to access toast, upgrade modal, and canvas modal triggers.
3. **Column modules**  
   - `StudioLeftRail.tsx` (style sidebar + mobile drawer behaviors).  
   - `StudioCenterStage.tsx` (Canvas preview panel + action grid + overlays).  
   - `StudioRightRail.tsx` (Insights vs. legacy order rail, both lazy).
4. **Overlay manager**  
   - `StudioOverlays.tsx` controlling Living Canvas modal, Download upgrade modal, Canvas checkout modal, Canvas upsell toast.

**Responsibility Grid**

| Module | Primary Concerns | Store Inputs | Outgoing Events |
| --- | --- | --- | --- |
| `StudioConfiguratorShell` | Orientation bridge wiring, suspense skeleton, context bootstrap, toast plumbing | None (delegates to experience provider) | Toast invocations, orientation toast callback |
| `StudioExperience` | Compose rails, hydrate entitlements, preload lazy children, register context | `useStudioPreviewState`, `useStudioEntitlementState`, `useStudioActions` | Provides context methods: `openCanvasModal`, `downloadHdPreview`, `saveToGallery`, `showUpgrade`, `trackOrientationChange` |
| `StudioLeftRail` | Style selection, tone sidebar, mobile drawer toggles | `useStyleCatalogState`, `useStudioUiState` | `handleStyleSelect`, `setMobileDrawerOpen` |
| `StudioCenterStage` | Canvas preview rendering, action grid CTA logic, overlay badges | `useStudioPreviewState`, `useStudioEntitlementState`, context handlers | `onDownload`, `onSaveToGallery`, `onCreateCanvas`, `onChangeOrientation` |
| `StudioRightRail` | Insights vs. checkout rail, lazy load gating, CTA bridging | `useStudioPreviewState`, `useStudioEntitlementState`, context handlers | `onRequestCanvas`, `onToast`, `onUpgradePrompt` |
| `StudioOverlays` | Modal/Toast visibility, state reset, CTA bridging back to context | `useStudioUiState`, context handlers | `setLivingCanvasOpen`, `setDownloadUpgradeOpen`, `setUpsellToast` |

**Context Contract (Draft)**

```ts
type StudioExperienceContextValue = {
  showToast: ToastFn;
  showUpgradeModal: (source: UpgradeSource) => void;
  openCanvasModal: (source: 'center' | 'rail') => void;
  requestOrientationChange: (orientation: Orientation) => Promise<void>;
  downloadHdPreview: () => Promise<void>;
  savePreviewToGallery: () => Promise<void>;
  setMobileDrawerOpen: (open: boolean) => void;
  setUpsellToastVisible: (open: boolean) => void;
};
```

Context lives in `src/sections/studio/experience/context.ts` and is hydrated by `StudioExperience`. Shell-level provider (`StudioShellContext`) adapts `useStudioFeedback` + orientation toast callback for the lazy chunk.

**Chunking & Suspense Strategy**
- `StudioExperience` becomes the primary lazy chunk loaded after shell mount.
- `StudioRightRail` and `StudioOverlays` remain dynamically imported to keep checkout + insights isolated. `StudioLeftRail` can be loaded in the parent chunk (small footprint) while preserving existing lazy `StyleSidebar`.
- Skeleton fallback replicates current layout: left sidebar skeleton, center canvas placeholder, right rail card placeholders, ensuring no layout shift during chunk load.
- Preload hooks (`useEffect(() => import(...))`) will be added around user interactions (e.g., hovering the canvas CTA) to hide loading seams.

**Risks & Mitigation**
- _Context sprawl:_ design a typed `StudioExperienceContext` in `src/sections/studio/experience/context.ts` with narrow responsibilities (toast, modals, CTA handlers).
- _Telemetry gaps:_ enumerate all analytics transforms now (Launchflow reopen, StudioV2 CTA, download success) to migrate into dedicated hooks later.

**Telemetry Inventory (to be upheld through refactor)**
- Launchflow events: `trackLaunchflowOpened`, `trackLaunchflowEditReopen`, `trackLaunchflowEmptyStateInteraction`
- Studio CTAs: `trackStudioV2CanvasCtaClick`, `trackStudioV2OrientationCta`
- Preview success: `trackDownloadSuccess`, gallery save toasts
- Entitlement hydration logging (existing `hydrateEntitlements` side effects)
- Orientation bridge toast pipeline (`handleOrientationToast`)

These signals will move into dedicated handler hooks in Phase 5; Phase 1 records their existence so we do not overlook them during modularization.

---

### Phase 2 — Data Access Layer Consolidation

**Goal**
- Reduce the monolithic selector and align store access with future modules.

**Planned Hooks & Locations**
- `src/store/hooks/studio/useStudioUserState.ts` — session + auth accessors
- `src/store/hooks/studio/useStudioPreviewState.ts` — preview slice bindings + derived status helpers
- `src/store/hooks/studio/useStudioEntitlementState.ts` — entitlement tier/quota + convenience getters
- `src/store/hooks/studio/useStudioUiState.ts` — UI flags (launchpad, modals, drawers, toasts)
- `src/store/hooks/studio/useStudioActions.ts` — minimal action surface (`setLaunchpadExpanded`, `openCanvasModal`, `hydrateEntitlements`, `setLivingCanvasModalOpen`, etc.)

**State Mapping Plan**

| Founder Store Source | New Hook | Derived Helpers |
| --- | --- | --- |
| `sessionUser`, `getSessionAccessToken` | `useStudioUserState` | `isAuthenticated` boolean |
| `styles`, `currentStyle()`, `croppedImage`, `smartCrops`, `pendingStyleId`, `previews` | `useStudioPreviewState` | `currentStyle`, `hasCroppedImage`, `previewReady`, `previewHasData`, `orientationMismatch` |
| `entitlements`, `getDisplayableRemainingTokens`, `generationCount`, `firstPreviewCompleted` | `useStudioEntitlementState` | `displayRemainingTokens`, `isPremiumUser`, `requiresWatermark`, `shouldShowTokenToast` (delegated later) |
| `launchpadExpanded`, `livingCanvasModalOpen`, `orientationPreviewPending`, `orientation`, drawer/toast booleans | `useStudioUiState` | `welcomeDismissed`, `downloadDisabled`, `canvasLocked` (computed in consuming modules) |
| `setLaunchpadExpanded`, `openCanvasModal`, `hydrateEntitlements`, `setLivingCanvasModalOpen`, `setShowTokenToast`, `setShowQuotaModal` | `useStudioActions` | future-proof slot for CTA handlers |

**Actions**
1. Create `src/store/hooks/studio/` directory and implement the five scoped hooks above. Each hook uses `useFounderStore` with `shallow` comparator and only selects the minimum required fields.  
2. Move memoized selectors (`currentStyle`, `hasCroppedImage`, `previewReady`) into `useStudioPreviewState`, leveraging existing `createMemoizedSelector` helper to prevent redundant `.find()` calls.  
3. Update `src/store/hooks/useStudioConfiguratorStore.ts` to export a compatibility wrapper that composes the new hooks into the legacy shape (to avoid breaking current consumers during refactor). Mark as deprecated in a comment.  
4. Document the new hook API in the Appendix table (see update below). Ensure types are exported for upcoming phases.

**Execution Log (2025-10-28)**
- Added new scoped hooks under `src/store/hooks/studio/` (`useStudioUserState`, `useStudioPreviewState`, `useStudioEntitlementState`, `useStudioUiState`, `useStudioActions`) with shallow selectors and derived helpers.
- Replaced legacy selector implementation with a compatibility wrapper that merges the new hook outputs; additional helpers (e.g. `previewReady`, `hasCroppedImage`) are exposed for gradual migration.
- Introduced barrel export `src/store/hooks/studio/index.ts` to simplify downstream imports.
- Appendix mapping updated to reflect the new access layer.

**Validation**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`

---

### Phase 3 — Shell Extraction & Lazy Boundary

**Goals**
- Split shell responsibilities from the heavy UI.
- Introduce `React.lazy` for the combined experience chunk.

**Implementation Steps**
1. Create `src/sections/studio/experience/StudioExperience.tsx` receiving the props currently passed to `StudioConfiguratorInner`. Internally, it will import the future column/overlay modules (Phase 4).  
2. Replace the inline JSX in `StudioConfigurator` with a Suspense boundary:  
   ```tsx
   const StudioExperience = lazy(() => import('@/sections/studio/experience/StudioExperience'));
   ```  
   Provide fallback skeleton approximating current UI.
3. Keep `OrientationBridgeProvider` and toast wiring in the shell; pass toast handlers down via a context provider.
4. Confirm `hydrateEntitlements` still fires on mount (likely move this to the new `StudioExperience` `useEffect`, but ensure shell defers to the lazy component to prevent double hydration).

**Files to Touch**
- `src/sections/StudioConfigurator.tsx`
- `src/sections/studio/experience/StudioExperience.tsx` (new)
- `src/sections/studio/experience/context.ts` (new provider)

**Risk Checks**
- Suspense fallback should not flicker when returning users hit the page; ensure fallback is minimal and matches existing layout height.
- Orientation bridge callback must remain functional—unit test or log instrumentation recommended.

**Execution Log (2025-10-28)**
- Extracted the heavy Studio experience into `src/sections/studio/experience/StudioExperience.tsx`, retaining all existing handler logic and lazy component imports.
- Added `src/sections/studio/experience/context.ts` to supply toast/upgrade/render helpers via context; shell now provides these through `StudioExperienceProvider`.
- Replaced the previous monolithic component in `src/sections/StudioConfigurator.tsx` with a lean shell that sets up the orientation bridge, context, and a Suspense fallback skeleton.
- Skeleton mirrors the three-column layout to avoid layout shift while the lazy bundle loads.
- Verified `hydrateEntitlements` remains inside the lazy component `useEffect`, preserving previous behaviour.

**Validation**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`

---

### Phase 4 — Column Modules & Context Wiring

**Goals**
- Break the UI into focused subcomponents aligned with lazy loading.
- Reduce prop drilling by reading store data within each column.

**Modules**
1. `src/sections/studio/experience/LeftRail.tsx`
   - Wraps `StyleSidebar` + mobile drawer toggles.
   - Reads style/entitlement info via new hooks.
2. `src/sections/studio/experience/CenterStage.tsx`
   - Encapsulates `CanvasPreviewPanel`, action grid callbacks (`handleSaveToGallery`, `handleDownloadHD`, `handleCreateCanvas`).
   - Uses context-provided handlers for gallery and downloads (Phase 5).
3. `src/sections/studio/experience/RightRail.tsx`
   - Determines whether to render `InsightsRailLazy` vs. legacy order rail.
   - Provides local Suspense fallback (`InsightsRailFallback`).
4. `src/sections/studio/experience/StudioOverlays.tsx`
   - Controls `LivingCanvasModal`, `DownloadUpgradeModal`, `MobileStyleDrawer`, `CanvasUpsellToast`, `CanvasCheckoutModalLazy`.

**Context responsibilities**
- Provide functions:  
  - `showToast`, `showUpgradeModal`,  
  - `openCanvasModal`, `closeCanvasModal`,  
  - `triggerOrientationChange`,  
  - `downloadHD`, `saveToGallery`,  
  - `setCanvasDrawerOpen`, `setUpsellToast`.
- Provide state slices required globally (e.g. `orientation`, `currentStyle`, `requiresWatermark`).

**Acceptance**
- Each module compiles with minimal props; store hooks ensure independence.
- Manual smoke ensures columns behave exactly as before (look & interactions unchanged).

**Progress — 4A Left Rail (2025-10-28)**
- Introduced `src/sections/studio/experience/LeftRail.tsx`, sourcing entitlements and preview data via the new studio hooks.
- Moved desktop sidebar rendering and mobile drawer trigger into the module; `StudioExperience` now simply renders `<LeftRail onOpenMobileDrawer={…} />`.
- No change to drawer state yet (still owned by `StudioExperience` for later overlay extraction).

**Validation**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`

**Progress — 4B Center Stage (2025-10-28)**
- Rebuilt `src/sections/studio/experience/CenterStage.tsx` to own preview-state selection, gallery/download handlers, and analytics—including memoized preview lookup, Supabase download integration, and Launchflow scroll helpers.
- Refactored `src/sections/studio/experience/StudioExperience.tsx` to supply only high-level callbacks (`onOpenCanvas`, `onRequestDownloadUpgrade`, orientation bridge delegates) and keep mobile drawer/overlay state; redundant store selectors were replaced with the new studio hooks.
- Preserved ActionGrid behaviour by forwarding the per-style preview status (`preview?.status`) and orientation bridge throttle; ensured canvas CTA and orientation analytics still throttle and fire exactly once per intent.
- Center stage now triggers upgrade modal/toast toggles via shell callbacks, allowing overlays to remain centralized until Phase 4D.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`
- `npm run build`

**Progress — 4C Right Rail Split (2025-10-28)**
- Created `src/sections/studio/experience/RightRail.tsx`, moving feature-flag logic, Suspense fallbacks, and checkout rail rendering into a dedicated module that reads state through the studio hooks and experience context.
- Simplified `StudioExperience.tsx` to delegate rail rendering to the new component, eliminating redundant preview/entitlement prop plumbing while preserving the existing Insights vs. checkout pathways.
- Right rail now calls `InsightsRailLazy` and `StickyOrderRailLazy` internally using the same upgrade toasts and canvas CTA handlers exposed by the shell.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`
- `npm run build`

**Progress — 4D Overlays Module (2025-10-28)**
- Added `StudioOverlayProvider` and `useStudioOverlayContext` to centralize modal, toast, and drawer state so feature modules can toggle overlays without prop drilling.
- Introduced `src/sections/studio/experience/StudioOverlays.tsx`, which renders the lazy-loaded modals/toasts (`LivingCanvasModal`, `DownloadUpgradeModal`, `MobileStyleDrawer`, `CanvasUpsellToast`, `CanvasCheckoutModalLazy`) using the shared context plus store slices.
- Updated `CenterStage` and `LeftRail` to consume the overlay helpers directly, keeping download upgrade + upsell flows localized to the preview module while the shell simply supplies shared callbacks.
- `StudioExperience.tsx` now wraps the layout in `StudioOverlayProvider` and swaps inline JSX for `<StudioOverlays />`, trimming the component down to orchestration duties only.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`
- `npm run build`

---

### Phase 5 — Action Hook Decomposition & Telemetry Safeguards

**Goals**
- Encapsulate complex callbacks into reusable hooks with test coverage.

**Planned Hooks**
- `useDownloadHandlers` – handles watermarked/premium download, tracks telemetry, toggles modals.
- `useGalleryHandlers` – encapsulates save-to-gallery logic, toasts, analytics.
- `useCanvasCtaHandlers` – unifies center CTA tracking + orientation mismatch handling.
- `useWelcomeBannerHandlers` – handles returning-user banner state transitions, Launchflow reopen telemetry.

**Files**
- `src/hooks/studio/useDownloadHandlers.ts`
- `src/hooks/studio/useGalleryHandlers.ts`
- `src/hooks/studio/useCanvasCtaHandlers.ts`
- `src/hooks/studio/useWelcomeBannerHandlers.ts`

**Tests**
- Add focused unit tests (Vitest) for each handler (e.g. verifying `trackDownloadSuccess` is called with expected params, error paths toast correctly).  
  - _Test files:_ `tests/studio/useDownloadHandlers.spec.ts`, etc.

**Telemetry Checklist**
- `trackDownloadSuccess`  
- `trackStudioV2CanvasCtaClick`  
- `trackStudioV2OrientationCta`  
- `trackLaunchflowOpened`, `trackLaunchflowEditReopen`, `trackLaunchflowEmptyStateInteraction`  
- `emitStepOneEvent` (already handled in preview slice; ensure no regression).

---

**Progress — 5A useDownloadHandlers (2025-10-28)**
- Created `src/hooks/studio/useDownloadHandlers.ts` to encapsulate premium/watermarked download logic, Supabase storage lookups, telemetry emission, and upsell/upgrade triggers via the overlay context.
- Center stage now consumes the hook (`src/sections/studio/experience/CenterStage.tsx:26`) and shed bespoke state/cleanup logic, improving readability and reuse for future modules.
- Added targeted tests (`tests/studio/useDownloadHandlers.spec.tsx`) covering warning state, watermarked downloads (upgrade modal + upsell toast), and premium clean downloads.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx tests/studio/useDownloadHandlers.spec.tsx`
- `npm run build`

**Progress — 5B useGalleryHandlers (2025-10-28)**
- Introduced `src/hooks/studio/useGalleryHandlers.ts` to manage gallery saves, including storage-path resolution, auth gating, success/error toasts, and the temporary “saved” badge state.
- `CenterStage` now pulls `savingToGallery` / `savedToGallery` from the hook, eliminating duplicated timers and ensuring future modules can reuse the same logic without re-implementing Supabase checks.
- Added coverage in `tests/studio/useGalleryHandlers.spec.tsx` for warning, auth prompt, success, and already-saved scenarios.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx tests/studio/useDownloadHandlers.spec.tsx tests/studio/useGalleryHandlers.spec.tsx`
- `npm run build`

**Progress — 5C useCanvasCtaHandlers (2025-10-28)**
- Added `src/hooks/studio/useCanvasCtaHandlers.ts` to manage canvas CTA analytics, throttling, and orientation bridge requests for both center-rail and right-rail surfaces.
- `CenterStage` now consumes the hook for its “Create Canvas” and orientation swap buttons, removing local throttle refs while preserving prior tracking behaviour.
- `StudioExperience` uses the same hook to power the right-rail orientation CTA, ensuring both entry points share throttling and fallback semantics.
- Introduced `tests/studio/useCanvasCtaHandlers.spec.tsx` covering canvas CTA throttling, orientation analytics, fallback handling, and cross-source throttling behaviour.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx tests/studio/useDownloadHandlers.spec.tsx tests/studio/useGalleryHandlers.spec.tsx tests/studio/useCanvasCtaHandlers.spec.tsx`
- `npm run build`

**Progress — 5D useWelcomeBannerHandlers (2025-10-28)**
- Extracted `src/hooks/studio/useWelcomeBannerHandlers.ts` to encapsulate returning-user detection, telemetry, and Launchflow reopening for the welcome banner.
- `StudioExperience.tsx` now consumes the hook, eliminating local state/effects while keeping the banner wiring in `StudioHeader`.
- Added `tests/studio/useWelcomeBannerHandlers.spec.tsx` verifying banner visibility, dismissal, telemetry, and automatic closing when Launchpad expands.

**Validation (2025-10-28)**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx tests/studio/useDownloadHandlers.spec.tsx tests/studio/useGalleryHandlers.spec.tsx tests/studio/useCanvasCtaHandlers.spec.tsx tests/studio/useWelcomeBannerHandlers.spec.tsx`
- `npm run build`

---

### Phase 6 — Enhanced Code-Splitting & On-Demand Loading

**Optional but Recommended Enhancements**
1. Lazy-load `CanvasInRoomPreview` within the right rail when it enters viewport or when the user opens the drawer.  
   - Use `IntersectionObserver` wrapper (existing `useIntersectionObserver` hook if available).
2. Split checkout into its own entry: wrap `StickyOrderRailLazy` and `CanvasCheckoutModalLazy` behind user intent (only load after CTA click).  
   - Consider preloading the bundle when the user hovers CTA or when preview becomes ready.
3. Investigate deferring `InsightsRailLazy` load until the user hovers/focuses that rail to avoid early network.

**Files**
- `src/components/studio/CanvasInRoomPreview.tsx` (wrap with lazy boundary or dynamic import inside a hook).
- `src/components/studio/StickyOrderRail.tsx`, `src/components/studio/CanvasCheckoutModal.tsx` – adjust to expect dynamic context triggers.

**Acceptance**
- No UX regressions; ensure fallback placeholders are meaningful.
- Build analysis reflects reduced main chunk size with new async chunks.

---

### Phase 7 — Validation, Benchmarking, & Documentation

**Automated Checks**
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx [new handler tests]`
- `npm run build`
- `npm run build:analyze` (compare against Phase 0 baseline).

**Manual QA**
- Full Studio smoke test:  
  1. Upload photo  
  2. Crop / orientation change  
  3. Select style → preview generates  
  4. Download watermarked preview (free user)  
  5. Save to gallery (authenticated path)  
  6. Open canvas modal and proceed to checkout  
  7. Toggle insights rail (if feature flag enabled)  
  8. Mobile view: open style drawer, ensure preview/sticky order fallback responses.

**Documentation**
- Update this plan with actual execution notes per phase (status table).  
- Append new bundle metrics, highlighting delta vs baseline.  
- Summarize residual risks or follow-up tasks (e.g. additional lazy boundaries, new tests).

---

### Risk Register

| Risk | Mitigation | Owner (future) |
| --- | --- | --- |
| Telemetry events not firing post-refactor | Centralize handlers in tested hooks (Phase 5); manual QA verifying analytics logs | Implementation engineer |
| Entitlements hydration timing | Keep hydration `useEffect` in lazy component; write integration test if feasible | Implementation engineer |
| Suspense fallback flashes on returning users | Preload key chunks based on heuristics (e.g., `useEffect` + `import()` warm-up) | Implementation engineer |
| Modal state desync after context migration | Encapsulate overlay state in dedicated provider; unit test open/close flows | Implementation engineer |

---

### Appendix — State → Hook Mapping (Planned)

- **User/Auth** (`sessionUser`, `sessionAccessToken`, `signOut`) → `useSessionState`, `useSessionActions`
- **Preview** (`styles`, `currentStyle`, `croppedImage`, `orientation`, preview status fields) → `useStudioPreviewState` (derived helpers: `hasCroppedImage`, `previewReady`, `previewHasData`, `orientationMismatch`, `preview`)
- **Entitlements** (`entitlements`, `displayRemainingTokens`, `canGenerateMore`) → `useStudioEntitlementState`
- **UI Flags** (`launchpadExpanded`, modals, drawers, toasts) → `useStudioUiState`
- **Actions** (`hydrateEntitlements`, `openCanvasModal`, `setLaunchpadExpanded`) → `useStudioActions`

This mapping will be updated as implementation progresses.

---

### Status Log (fill during execution)

| Phase | Status | Notes / Evidence |
| --- | --- | --- |
| 0 | _Completed_ | `npm run build:analyze` snapshot logged in docs/perf/baseline/studio-configurator-2025-10-28.md; smoke & checklists captured |
| 1 | _Completed_ | Architecture blueprint (module map, context contract, chunk strategy) documented in this plan |
| 2 | _Completed_ | Scoped studio hook layer landed; legacy selector delegates to new accessors; lint/tests clean |
| 3 | _Completed_ | Studio shell now lazy-loads `StudioExperience`; context provider + skeleton fallback in place; lint/tests clean |
| 4 | _Pending_ | |
| 5 | _Pending_ | |
| 6 | _Pending_ | |
| 7 | _Pending_ | |

---

> _Keep this file updated each session. No code changes should begin until Phases 0–2 are fully documented and approved._ 
