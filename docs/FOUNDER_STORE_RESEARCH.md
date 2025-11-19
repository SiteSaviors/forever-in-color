# Founder Store (useFounderStore.ts) – Research Plan

## Phase 0 – Responsibilities & Coupling Map *(✅ Complete)*
- **Global slice composition** (`src/store/useFounderStore.ts:1-40`): stitches together preview/auth/favorites/gallery/stock-library slices plus the heavyweight inline base state. Any refactor must preserve this top-level API so downstream hooks keep working.
- **Canvas configuration core** (`src/store/useFounderStore.ts:62-320`): owns selected style, canvas size/frame/enhancements, mock catalog data, and helpers like `createCanvasSelectionSnapshot`. These values directly drive `CanvasCheckoutModal`, `StudioConfigurator`, and Launchpad upload hints.
- **Upload + orientation pipeline** (mid-file setters such as `setUploadedImage`, `setOriginalImageSource`, `setOrientation`, `markCropReady`): orchestrates Supabase preview ingestion, smart crop caches, and telemetry for Launchflow Step One. Tight coupling with preview slice means extraction must retain setter ordering.
- **Canvas modal orchestration** (`openCanvasModal`, `closeCanvasModal`, modal telemetry via `trackStudioV2CanvasModalOpen/Close`, `trackCanvasPanelOpen`): linking Launchpad + Studio entry points, CTA tracking, and `CanvasCheckoutModal` open/close semantics. This block is the prime target for a dedicated `canvasModalSlice`.
- **Enhancement & token gating**: toggles for `enhancements`, gating helpers, relationship to entitlements (via `useFounderStore` selectors). Moving to `canvasConfigSlice` must respect `toggleEnhancement`, `setEnhancementEnabled`, and downstream computed totals.
- **Lazy style catalog integration** (`createLazySliceAccessor`, `styleCatalogEngineAccessor`, `ensureStyleLoaded`): ensures initial load stays light. Any refactor must leave the lazy loader intact or encapsulate it in a sub-slice to avoid regressing initial bundle size.

## Phase 1 – State & Selector Inventory *(✅ Complete)*

### Canvas Configuration State
| Field | Purpose | Default / Persistence | Primary Consumers & Notes |
| --- | --- | --- | --- |
| `styles` | Seed catalog used throughout Studio/Launchpad. | `initialStyles` (lazy-loaded, in-memory). | `StyleSidebar`, `ToneStyleCard`, `requestUpload`, `selectStyle`. Needs to stay lazy for bundle size. |
| `selectedStyleId` | Determines active preview + checkout context. | `null`. | `StudioConfigurator`, `CanvasCheckoutModal`, `previewSlice` selectors. Persisted per-style via `canvasSelections`. |
| `enhancements` | Array of upsells (floating frame, Living Canvas). | `mockEnhancements` (all `enabled: false`). | `CanvasCheckoutCanvasStep`, `CanvasCheckoutSidebar`, telemetry via `createCanvasSelectionSnapshot`. |
| `selectedCanvasSize` | Active canvas dimension selection. | `null`. | Size selectors in `CanvasCheckoutModal`, `StudioConfigurator`, `CheckoutFooter`. Setters call `persistCanvasSelection`. |
| `selectedFrame` | Active frame color. | `'none'`. | Same surfaces as canvas size; toggles CTA copy + hero render. |
| `canvasSelections` | Map of saved per-style selections. | `{}` (in-memory). | `selectStyle`/`loadCanvasSelectionForStyle`; ensures user context restored when switching styles. |
| `computedTotal()` | Derived helper totaling size + enhancements + style modifier. | Memoized by calling `getCanvasSizeOption`. | Used in checkout rail, CTA footers, telemetry. Candidate for future selector hook in `canvasConfigSlice`. |
| `createCanvasSelectionSnapshot` | Captures size/frame/enhancements/orientation for telemetry + persistence. | Pure function (in-file). | `persistCanvasSelection`, `trackStudioV2CanvasModalClose`. Needs to move alongside `canvasConfigSlice`. |

### Modal & Telemetry State
| Field | Purpose | Default / Persistence | Primary Consumers & Notes |
| --- | --- | --- | --- |
| `canvasModalOpen` | Controls Radix dialog mounting. | `false`. | `StudioOverlays`, `CanvasCheckoutModal`. Candidate for `canvasModalSlice`. |
| `canvasModalSource` | Entry source (`'center' | 'rail'`). | `null`. | `openCanvasModal` (CTA analytics), `CanvasCheckoutModal` for copy variants. |
| `canvasModalOpenedAt` | Timestamp for duration analytics. | `null`. | `openCanvasModal`, `trackStudioV2CanvasModalClose`. Required to stay accurate before `closeCanvasModal`. |
| `lastCanvasModalSource` | Tracks last opener for UI heuristics. | `null`. | `LaunchpadLayout`, `StudioConfigurator` for CTA states. |
| `livingCanvasModalOpen` | Controls Living Canvas upsell modal. | `false`. | `LivingCanvasModal` gating; toggled when enhancement enabled/disabled. |
| `launchpadExpanded` / `launchpadSlimMode` | Whether the Launchpad rail is expanded or in slim mode. | `false` / `false`. | `LaunchpadLayout`, `PhotoUploader`, `SmartCropPreview`. Tied to Step One telemetry. |
| `uploadIntentAt` | Timestamp bump used to trigger upload dialogs. | `null`. | `PhotoUploader` listens to detect “request upload” intents. |

### Upload & Orientation State
| Field | Purpose | Default / Persistence | Primary Consumers & Notes |
| --- | --- | --- | --- |
| `uploadedImage`, `croppedImage`, `originalImage` | Data URLs tracking raw upload, crop output, and canonical original. | All `null` on init. | `LaunchpadLayout`, `CanvasCheckoutPreviewColumn`, preview slice hydration. Clearing setters also reset storage URLs/hashes. |
| `originalImage*` metadata (storage path, signed URL, hash, bytes, previewLogId) | Fields synced after Supabase persistence + preview log creation. | `null`. | `continueWithStockImage`, `previewSlice`, download exports. Must be kept in sync by `setOriginalImageSource`. |
| `originalImageDimensions` | Cached dimensions for cropping + preview scaling. | `null`. | `SmartCropPreview`, `CanvasInRoomPreview`. |
| `smartCrops` | Map of orientation → crop results. | `{}`. | `SmartCropPreview`, `PhotoUploader`, orientation resets (`clearSmartCrops`). |
| `orientation` | Current canvas orientation (`square`, `horizontal`, `vertical`). | `'square'`. | Canvas preview, tone recommendations, `getCanvasSizeOption`. Changing orientation may reset size selection. |
| `orientationTip` | UX hint for user on orientation. | `null`. | `LaunchpadLayout` helper text. |
| `orientationPreviewPending` | Flag to show spinner while previews re-render after orientation change. | `false`. | `CanvasCheckoutPreviewColumn`, `StudioPreview` skeletons. Set by `setOrientation`. |
| `orientationChanging` | Stores long-running orientation change state (e.g., heuristics). | `false`. | `LaunchpadLayout`, `PhotoUploader` to disable controls. |
| `markCropReady` / `cropReadyAt` | Timestamp when smart crop completes. | `null`. | `LaunchpadLayout` progress meter, Step One telemetry. |

### Derived Helpers & Selectors
- `selectCurrentStyle` (memoized selector near top of file) powers `currentStyle()` and should move alongside future selectors (e.g., `useCanvasConfig`). Ideal home: `/store/selectors/canvasConfig.ts`.
- `computedTotal`, `livingCanvasEnabled`, `shouldAutoGeneratePreviews`, and `currentStyle` are effectively selectors today; they should become exported hooks or memoized selectors in the future `canvasConfigSlice` to reduce component logic duplication.
- Orientation helpers (`setOrientation`, `restoreOriginalImagePreview`, `resetPreviewToEmptyState`) depend on preview slice setters; when extracting, we must keep them near upload/orientation state or wrap them with cross-slice helpers so ordering (reset previews → set orientation) stays intact.
- `persistCanvasSelection` / `loadCanvasSelectionForStyle` rely on `canvasSelections` plus `createCanvasSelectionSnapshot`; moving them into `canvasConfigSlice` keeps persistence localized and enables testing.

**Next:** Phase 2 will trace each action’s sequencing (telemetry, preview resets, Supabase writes) so that slice extraction doesn’t regress Launchflow → Studio continuity.

## Phase 2 – Action & Side-Effect Mapping *(✅ Complete)*
- **`setCanvasSize` / `setFrame`** (`src/store/useFounderStore.ts:255-268`): immediately update state, then call `persistCanvasSelection()`. Persistence must always follow the state mutation so the snapshot captures the latest selection.
- **`toggleEnhancement` / `setEnhancementEnabled`** (`269-309`): mutate enhancement array, auto-close Living Canvas modal if turning it off, then persist. Needs to remain synchronous so CTA totals update instantly and telemetry snapshot stays in sync.
- **`persistCanvasSelection`** (`309-324`): grabs `selectedStyleId`, uses `createCanvasSelectionSnapshot`, writes into `canvasSelections`. Requires `selectedStyleId` guard to avoid storing empty entries. Order: compute snapshot → set new map.
- **`loadCanvasSelectionForStyle`** (`325-352`): loads saved selection (or defaults) and writes `selectedCanvasSize`, `selectedFrame`, and enhancement flags in one `set`. Also hydrates `canvasSelections` if missing entry; this must run before opening the canvas modal to ensure UI reflects persisted choices.
- **`selectStyle`** (`272-283`): persists previous style, closes canvas modal if open, sets new selection, then loads persisted canvas config. Order is crucial: close modal before switching styles to avoid stale telemetry; loading selections after setting style ensures size/frame update correctly.
- **`openCanvasModal`** (`352-386`): guard requires `croppedImage` + active style. Sequence: load/persist selection → bail if already open → capture snapshot → `trackCanvasPanelOpen` → `set({ canvasModalOpen: true, ... })` → `trackStudioV2CanvasModalOpen`. Telemetry must fire after `set` so timestamp is stored.
- **`closeCanvasModal`** (`386-404`): guard ensures modal open; capture snapshot before state reset; `set` closes modal and clears timestamps; telemetry fired afterward using precomputed snapshot and `openedAt`.
- **Upload/orientation setters**:
  - `setUploadedImage` (`455-480`): sets data URL, resets preview statuses (cross-slice dependency on preview slice state), re-expands launchpad, and clears original image metadata when removing. Must run before any preview generation triggers.
  - `setOriginalImage` / `setOriginalImageSource` / `setOriginalImageDimensions` (`485-520`): sequential updates ensure storage metadata stays coherent. Clearing original image also nulls preview log id to avoid stale references.
  - `setOrientation` (`509-548`): updates orientation + adjusts canvas size if incompatible, then checks preview state. If no selected style, clears `orientationPreviewPending`; if style is `'original-image'`, writes preview state immediately; otherwise sets pending flag and relies on preview slice to finish. Order requirements: orientation state must update before preview logic, and `orientationPreviewPending` must be set to `false` in early returns.
  - `markCropReady`, `setCroppedImage`, `setUploadedImage` coordinate Step One telemetry and preview resets. `markCropReady` timestamps before toggling slim/expanded flags.
- **Cross-slice dependencies**:
  - `openCanvasModal` uses `trackCanvasPanelOpen` (telemetry util) and `trackStudioV2CanvasModalOpen/Close` from analytics—these must stay synchronized with modal state.
  - Upload/orientation actions call preview slice setters (`setPreviewState`, `resetPreviews`, `generatePreviews` in other flows) and rely on auth slice via `get().entitlements` for telemetry payloads. Extraction must either keep these actions near the preview slice or expose them through shared helpers to preserve call order.
  - `requestUpload` interacts with Launchpad UI (outside store) by bumping `uploadIntentAt`; no external dependencies but timestamp ordering is key for animations.

## Phase 3 – Sub-slice Candidates & Boundaries *(✅ Complete)*

| Slice | Responsibilities | Owned State / Actions | Shared Helpers to Move | Hook/Selector Strategy | Notes & Base-State Exceptions |
| --- | --- | --- | --- | --- | --- |
| `canvasConfigSlice` | Core canvas selections (style, size, frame, enhancements), persisted per style, totals. | `selectedStyleId`, `selectedCanvasSize`, `selectedFrame`, `enhancements`, `canvasSelections`, `computedTotal`, `createCanvasSelectionSnapshot`, `setCanvasSize`, `setFrame`, `toggleEnhancement`, `setEnhancementEnabled`, `persistCanvasSelection`, `loadCanvasSelectionForStyle`, `selectStyle`, `clearSelectedStyle`. | `createCanvasSelectionSnapshot`, `mockEnhancements`, `getDefaultSizeForOrientation`, selectors like `selectCurrentStyle`. | Introduce `useCanvasConfig()` hook returning memoized selectors: `currentStyle`, `canvasTotals`, `enhancements`, `canvasSelections`. Components migrate gradually (CanvasCheckout, StudioConfigurator) without touching other slices. | `styles` array must remain in base store (shared with other systems). `enhancements` could migrate into slice but initial data still defined centrally. |
| `canvasModalSlice` | Canvas checkout modal lifecycle + telemetry bridging Launchpad/Studio. | `canvasModalOpen`, `canvasModalSource`, `canvasModalOpenedAt`, `lastCanvasModalSource`, `openCanvasModal`, `closeCanvasModal`, `setLivingCanvasModalOpen` (or possibly separate). | Telemetry wrappers: `trackCanvasPanelOpen`, `trackStudioV2CanvasModalOpen/Close`. | Hook `useCanvasModal()` exposing open state, reasons, and CTA analytics. Allows Studio + Launchpad to consume without referencing giant store. | Depends on `currentStyle()` + `createCanvasSelectionSnapshot`; those must be accessible from `canvasConfigSlice` via selectors to avoid circular deps. |
| `uploadPipelineSlice` | Upload + orientation pipeline that interfaces with preview slice. | `uploadedImage`, `croppedImage`, `originalImage`, `originalImage*` metadata, `smartCrops`, `orientation`, `orientationTip`, `orientationPreviewPending`, `orientationChanging`, `cropReadyAt`, `uploadIntentAt`, `launchpadExpanded`, `launchpadSlimMode`, actions (`setUploadedImage`, `setCroppedImage`, `setOriginalImage*`, `setOrientation`, `markCropReady`, `setSmartCropForOrientation`, `clearSmartCrops`, `setOrientationChanging`, `setOrientationPreviewPending`, `requestUpload`). | Potential helpers: `restoreOriginalImagePreview`, `resetPreviewToEmptyState`; telemetry for Step One lives elsewhere but should reference this slice. | Hook `useUploadPipeline()` giving derived states (hasUpload, orientation status) plus mutators. Keep cross-slice methods (preview slice setters) injected via `runtime` to preserve ordering. | Needs to call preview slice setters (`setPreviewState`, `resetPreviews`). Ensure slice factory receives `set/get/api` so dependencies remain internal. |

**Base Store Fixtures (stay put for now)**
- `styles`, `styleCarouselData`, `mockEnhancements` seed data should remain in base to avoid duplication; slices consume them via initializers.
- `createPreviewSlice`, `createAuthSlice`, etc., continue composing in `useFounderStore`; new slices follow same pattern for incremental rollout.
- Telemetry helpers reside in `/utils` (already extracted for stock library); do the same for canvas analytics to keep slices lean.

**Incremental Adoption Plan**
1. Add slices + hooks without moving consumers (export both old selectors and new hooks).
2. Update Studio/Launchpad components to use `useCanvasConfig`, `useCanvasModal`, `useUploadPipeline`.
3. Once usage flips, remove legacy direct selectors from `useFounderStore`.

## Phase 4 – Telemetry & External Contract Audit *(✅ Complete)*

### Telemetry Emissions
- `trackCanvasPanelOpen` (`openCanvasModal`) – fired before opening modal; payload includes entitlement tier from `state.entitlements?.tier`. Requires entitlement slice to be initialized and accessible. After refactor, `canvasModalSlice` must still fetch tier from shared selectors.
- `trackStudioV2CanvasModalOpen` / `trackStudioV2CanvasModalClose` – payload includes styleId, source CTA, canvas size, frame, enhancements, orientation, time spent. Depends on `createCanvasSelectionSnapshot`. Extraction must guarantee snapshot runs **before** state resets so telemetry reflects actual selections.
- Launchflow Step One telemetry hooks (outside this file but triggered indirectly): `setUploadedImage`, `markCropReady`, `setOrientation` update progress indicators consumed by Step One analytics. Need to ensure these setters still fire in the same order so existing hooks continue emitting events.
- Preview telemetry via `previewSlice` (e.g., `emitStepOneEvent`, `trackOrderStarted`) relies on orientation/selection state. Any refactor must keep setter order to avoid double-emitting.

### External Contracts
- **Supabase preview pipeline**: upload setters call preview slice actions (`setPreviewState`, `resetPreviews`, `generatePreviews`). Sequencing: update local state → reset preview state → trigger generation. After moving to `uploadPipelineSlice`, maintain the same order to avoid stale caches.
- **Style catalog lazy loader**: `ensureStyleLoaded` uses `styleCatalogEngineAccessor.load()` to dynamically import optional module. Any slice extraction must pass the runtime (`set/get`) so the lazy module can register functions exactly once.
- **Entitlement checks**: `trackCanvasPanelOpen` uses `state.entitlements.tier`. `CanvasCheckoutModal` also reads `useEntitlementsState`. Splitting slices must leave entitlement data accessible (likely still via base store). Avoid creating cyclic dependencies between new slices and entitlement selectors.
- **Supabase persistence**: while most of the heavy logic lives in `continueWithStockImage`, upload setters here maintain metadata (`originalImageStoragePath`, `originalImagePreviewLogId`). New slices must keep public setter signatures to avoid breaking preview logging flows.

### Verification Checklist Post-Refactor
1. **Telemetry parity**: capture analytics payloads before/after (using dev logging) for `trackCanvasPanelOpen`, `trackStudioV2CanvasModalOpen/Close`. Confirm timeSpentMs, canvas snapshot, and CTA source remain identical.
2. **Preview cache consistency**: after refactor, run through orientation changes and ensure `orientationPreviewPending` toggles match prior behavior; previews should reset only once per orientation change.
3. **Launchflow progression**: uploading an image should still trigger Launchpad expansion, slim mode toggles, and Step One telemetry (compare Launchpad progress UI/logs).
4. **Lazy loader sanity**: ensure `ensureStyleLoaded` still switches to runtime-loaded functions only once and future calls reuse the module (no duplicate imports).
5. **Entitlement gating**: verifying that modal opens still log correct tiers and that `livingCanvasModalOpen` gating works with entitlement-based feature flags.

## Phase 5 – Risk & QA Planning *(✅ Complete)*

### High-Risk Flows
1. **Launchflow ➜ Studio progression**: Upload pipeline setters (`setUploadedImage`, `markCropReady`, `setOrientation`) interact with Step One telemetry and preview generation. Any ordering regression would stall onboarding or emit duplicate events.
2. **Canvas modal gating**: `openCanvasModal` depends on `croppedImage` + `currentStyle`. Misplaced guards could allow empty modals or block legit openings, harming checkout conversion.
3. **Orientation cache resets**: `setOrientation`, `resetPreviewToEmptyState`, and `clearSmartCrops` maintain preview coherence. Forgotten resets create stale previews or infinite spinners.
4. **Per-style persistence**: `canvasSelections` ensures continuity while switching styles; race conditions in `selectStyle` ↔ `persistCanvasSelection` would drop user choices.
5. **Lazy loaders & Supabase metadata**: `ensureStyleLoaded` and `setOriginalImageSource` must remain idempotent; double invocation could break caching or preview logs.

### QA Matrix
| Path | Verification | Tools |
| --- | --- | --- |
| Launchpad upload → crop → Studio preview | Launchpad expands, slim mode toggles correctly, Step One telemetry still fires, preview hydration matches orientation. | Manual run-through + telemetry logging. |
| Canvas modal open/close from multiple CTAs | Ensure gating, selection hydration, and analytics payloads match legacy branch for `center` + `rail` sources. | Dev logging of modal telemetry payloads. |
| Enhancement + size toggles across styles | Changing options updates totals instantly, persists, and restores after switching styles. | Compare `canvasSelections` snapshots pre/post refactor. |
| Orientation change stress test | Toggle orientations repeatedly; verify `orientationPreviewPending` spinner and preview updates stay in sync, smart crops cleared when resetting. | Simulate via Studio UI; watch preview logs. |
| Restore/reset preview helpers | `restoreOriginalImagePreview` and `resetPreviewToEmptyState` leave store in expected baseline state without extra preview generation. | Unit tests around the new slice functions. |

### Rollout & Instrumentation
- Ship new slices behind a short-lived env flag (`ENABLE_CANVAS_STORE_REWRITE`) mirroring the checkout modal approach, enabling instant rollback.
- Add DEV-only `console.info` statements inside new slice actions (guarded by `import.meta.env.DEV`) to trace ordering during QA.
- Create lightweight unit tests for `persistCanvasSelection`, `openCanvasModal`, and `setOrientation` in their new slice files to catch regressions early.
- Monitor analytics dashboards (modal open count, Step One completion rate) before/after flipping the flag; any regression reverts via flag without redeploy.
