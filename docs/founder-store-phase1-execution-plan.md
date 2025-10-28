# Founder Store Type Extraction — Phase 1 Execution Plan

This document is the working guide for eliminating the circular type dependencies within Wondertone’s founder store without altering runtime behaviour. Every phase is designed to reinforce the premium AI canvas mandate (README.md:1) while respecting the founder’s VS Code-first workflow (FOUNDER_WORKFLOW.md:14) and the Launchflow → Studio guardrails outlined in the Agents Summary handshake.

We will append execution notes and validation evidence to each phase as work progresses.

---

## Phase 0 — Baseline Alignment & Branch Prep
- **Objective:** Confirm we have the latest context, obey the VS Code-first workflow, and prepare an isolated branch before touching code.
- **Actions:**
  - Re-read `docs/store-refactor-plan.md`, `FOUNDER_WORKFLOW.md`, and the guardrails checklist.
  - From VS Code, create a feature branch named `store/phase1-type-decoupling`.
  - Capture current `git status` and ensure no unrelated staged changes exist.
  - Review existing diffs in the editor to confirm a clean slate.
- **Validation:** Document branch name + status snapshot here before moving forward.
- **Risks / Watchouts:** Skipping this step risks violating workflow policy or overwriting parallel work.

**Status Notes:** Verified docs and guardrails; created branch `store/phase1-type-decoupling`; editor diff review confirmed no pre-existing modifications; current `git status -sb` shows only the new execution plan untracked:
```
## store/phase1-type-decoupling
?? docs/founder-store-phase1-execution-plan.md
```

---

## Phase 1 — Type Inventory & Consumer Audit
- **Objective:** Build a precise map of shared types, their definitions, and all import sites so extraction does not introduce regressions.
- **Actions:**
  - Catalog type definitions currently declared or re-exported from `src/store/useFounderStore.ts` (e.g., `StyleOption`, `Enhancement`, `CanvasModalSource`, `StylePreviewStatus`, `EntitlementTier`, `SessionUser`, `FounderState`, `FounderBaseState`).
  - Enumerate where each shared type is consumed using `rg --files-with-matches` to avoid missing indirect usages (e.g., `StudioConfigurator`, `CanvasPreviewPanel`, telemetry helpers, utility modules).
  - Confirm no runtime logic is intertwined with these type definitions; note any coupled helper functions that should remain in place.
- **Validation:** Attach the inventory table + consumer list under this phase with file references once complete.
- **Risks / Watchouts:** Auto-imports may mask additional consumers; rely on exhaustive searches rather than assumptions.

**Type Definition Inventory**
| Type Alias / Interface | Definition Location | Notes |
|------------------------|---------------------|-------|
| `StyleOption` | `src/store/useFounderStore.ts:30` | Pure data shape for catalog styles; no runtime coupling. |
| `Enhancement` | `src/store/useFounderStore.ts:43` | Describes add-on SKUs; referenced by snapshot helper only. |
| `StyleCarouselCard` | `src/store/useFounderStore.ts:51` | Static carousel metadata; safe to relocate. |
| `CanvasSize` (`CanvasSizeKey`) | `src/store/useFounderStore.ts:60` | Alias for canvas size enum from utilities. |
| `FrameColor` | `src/store/useFounderStore.ts:61` | String union, shared across modal + checkout flows. |
| `CanvasModalSource` | `src/store/useFounderStore.ts:63` | Tracks entry point for modal analytics. |
| `CanvasModalCloseReason` | `src/store/useFounderStore.ts:64` | Enumerates modal dismissal causes. |
| `FounderBaseState` | `src/store/useFounderStore.ts:85` | Core Launchflow + Studio state (excludes slice augmentations). |
| `FounderState` | `src/store/useFounderStore.ts:164` | Intersection of base state with preview/auth/favorites slices. |
| `StylePreviewStatus` | `src/store/founder/previewSlice.ts:15` | Preview pipeline status union; controls UI transitions. |
| `PreviewState` | `src/store/founder/previewSlice.ts:23` | Cached preview entry metadata. |
| `StylePreviewCacheEntry` | `src/store/founder/previewSlice.ts:30` | Cache payload stored per style/orientation. |
| `StartPreviewOptions` | `src/store/founder/previewSlice.ts:38` | Flags for forcing or overriding orientation. |
| `PreviewSlice` | `src/store/founder/previewSlice.ts:43` | Zustand slice contract; intersects with `FounderState`. |
| `EntitlementTier` | `src/store/founder/entitlementSlice.ts:7` | Subscription tiers; also mirrored in API helpers. |
| `EntitlementPriority` | `src/store/founder/entitlementSlice.ts:8` | Priority lanes tied to tier. |
| `EntitlementState` | `src/store/founder/entitlementSlice.ts:12` | Zustand-managed entitlement snapshot. |
| `EntitlementSlice` | `src/store/founder/entitlementSlice.ts:25` | Zustand slice surface for entitlements. |
| `SessionUser` | `src/store/founder/sessionSlice.ts:5` | Simplified Supabase identity payload. |
| `SessionSlice` | `src/store/founder/sessionSlice.ts:11` | Session-specific Zustand slice. |
| `FavoritesSlice` | `src/store/founder/favoritesSlice.ts:6` | Favorite styles slice contract. |
| `AuthSlice` | `src/store/founder/authSlice.ts:14` | Composite slice combining session + entitlement behaviours. |

All listed constructs are purely structural; the lone helper referencing them (`createCanvasSelectionSnapshot` in `src/store/useFounderStore.ts:72`) operates on the base state but does not own business logic that would relocate with types.

**Consumer Highlights**
- `StylePreviewStatus`: `src/sections/StudioConfigurator.tsx:3`, `src/sections/studio/components/CanvasPreviewPanel.tsx:3`.
- `StyleOption`: `src/store/hooks/useToneSections.ts:11`, `src/utils/previewClient.ts:1`, `src/utils/storyLayer/copy.ts:1`, `src/sections/studio/components/CanvasPreviewPanel.tsx:3`.
- `EntitlementTier` / `EntitlementPriority`: `src/components/usage/TierRecommendation.tsx:3`, `src/components/modals/QuotaExhaustedModal.tsx:6`, `src/components/studio/TokenWarningBanner.tsx:4`, `src/utils/storyLayer/copy.ts:1`, `src/utils/storyLayerAnalytics.ts:2`.
- `SessionUser`: `src/utils/entitlementGate.ts:4`, `tests/studio/tones.spec.ts:5`, `src/store/founder/sessionSlice.ts:5`.
- `CanvasModalSource` / `CanvasModalCloseReason`: `src/components/studio/CanvasCheckoutModal.tsx:6`, analytics helpers via `src/utils/studioV2Analytics.ts`.
- `FounderState`: Slice creators `src/store/founder/authSlice.ts:26`, `src/store/founder/entitlementSlice.ts:106`, `src/store/founder/sessionSlice.ts:24`, `src/store/founder/favoritesSlice.ts:25`, `src/store/founder/previewSlice.ts:113`.

**Runtime Coupling Review**
- No runtime modules import these definitions for executable code; all imports identified with `rg --files-with-matches` are type-only. The only runtime-adjacent usage is the snapshot helper noted above, which will continue importing `FounderBaseState` post-migration. This confirms we can relocate definitions without touching behaviour.

**Status Notes:** Comprehensive inventory captured; ready to draft `storeTypes.ts` schema.

---

## Phase 2 — Neutral Type Module Design (`storeTypes.ts`)
- **Objective:** Define a single, runtime-neutral module for shared types that slices and utilities can depend on without circular imports.
- **Actions:**
  - Create `src/store/founder/storeTypes.ts` (or update if present) using **type-only imports and exports**.
  - Relocate or replicate definitions for:
    - Status unions: `StylePreviewStatus`, `EntitlementTier`, `EntitlementPriority`.
    - Entities: `SessionUser`, `StyleOption`, `Enhancement`, modal enums, canvas selections.
    - Base composition: `FounderBaseState`, `FounderState`.
  - Ensure any composite types (`FounderState`) reference slice interfaces (`AuthSlice`, `PreviewSlice`, `FavoritesSlice`) in a manner that does not introduce runtime imports (use `import type`).
  - Include succinct comments clarifying ownership without duplicating slice documentation.
- **Validation:** Record the final export list from `storeTypes.ts` in this section.
- **Risks / Watchouts:** Accidentally importing runtime values (e.g., `createPreviewSlice`) would reintroduce cycles; double-check for type-only keywords.

**Exported API (`src/store/founder/storeTypes.ts`)**
- Entities & UI enums: `StyleOption`, `Enhancement`, `StyleCarouselCard`, `CanvasSize`, `FrameColor`, `CanvasModalSource`, `CanvasModalCloseReason`, `CanvasSelection`.
- Preview pipeline: `StylePreviewStatus`, `PreviewState`, `StylePreviewCacheEntry`, `StartPreviewOptions`, `PreviewSlice`.
- Auth & entitlements: `SessionUser`, `SessionSlice`, `EntitlementTier`, `EntitlementPriority`, `EntitlementState`, `EntitlementSlice`, `AuthSlice`.
- Favorites: `FavoritesSlice`.
- Store composition helpers: `FounderBaseState`, `FounderState`, `FounderStateCreator`.

All imports leverage `import type` to avoid runtime edges; the file contains no executable logic.

---

## Phase 3 — Slice Rewiring
- **Objective:** Update founder slices to consume the centralized type module, eliminating their dependency on `useFounderStore.ts`.
- **Actions:**
  - For each slice (`authSlice.ts`, `entitlementSlice.ts`, `sessionSlice.ts`, `previewSlice.ts`, `favoritesSlice.ts`):
    - Replace `../useFounderStore` imports with `./storeTypes`.
    - Convert to `import type` where applicable (`FounderState`, `StyleOption`, status unions).
    - Remove duplicate type declarations that now live in `storeTypes.ts`.
  - Validate there are no residual circular imports by running `rg '../useFounderStore' src/store/founder`.
- **Validation:** After edits, note the updated import statements for each slice here and confirm `npm run deps:analyze` reports zero cycles (capture output later in Phase 6).
- **Risks / Watchouts:** Watch for VS Code auto-correcting imports back to `useFounderStore`; manually verify after each save.

**Implementation Notes**
- `authSlice.ts`, `sessionSlice.ts`, `entitlementSlice.ts`, `favoritesSlice.ts`, and `previewSlice.ts` now import their contracts from `./storeTypes` via `import type` and re-export those aliases for backward compatibility.
- Confirmed all slice-level type definitions removed; only runtime logic remains in each file.
- `rg '../useFounderStore' src/store/founder` → _no matches_ (validated removal of circular type imports).

**Status Notes:** Slice rewiring complete; pending validation of cycle removal in Phase 6.

---

## Phase 4 — Store Integration & Re-exports
- **Objective:** Align `src/store/useFounderStore.ts` with the new type hub while preserving external API expectations.
- **Actions:**
  - Replace local type definitions that moved to `storeTypes.ts` with imports.
  - Maintain compatibility by re-exporting necessary types (`StylePreviewStatus`, `EntitlementTier`, `SessionUser`, etc.) from `storeTypes.ts` so existing component imports remain valid.
  - Ensure helper functions (e.g., `createCanvasSelectionSnapshot`) reference `FounderBaseState` from the centralized module to avoid drift.
- **Validation:** Document the final list of re-exports and note any consumers updated to the new path.
- **Risks / Watchouts:** Forgetting to re-export types could break ~49 components; track TypeScript feedback immediately after edits.

**Implementation Notes**
- `src/store/useFounderStore.ts` now imports structural types (`StyleOption`, `Enhancement`, `FounderBaseState`, etc.) from `./founder/storeTypes` and no longer declares duplicates locally.
- Re-exported compatibility surface: `StylePreviewStatus`, `EntitlementTier`, `EntitlementPriority`, `SessionUser`, `StyleOption`, `Enhancement`, `StyleCarouselCard`, `CanvasSize`, `FrameColor`, `CanvasModalSource`, `CanvasModalCloseReason`, `FounderBaseState`, `FounderState`, `AuthSlice`, `FavoritesSlice`, plus related enums.
- Helper `createCanvasSelectionSnapshot` references the shared `FounderBaseState`, ensuring telemetry snapshots remain aligned with the centralized shape.
- No consumer import paths changed; existing modules can continue to reference `@/store/useFounderStore` for these types.

**Status Notes:** Store integration complete; ready for Phase 5 consumer sweep.

---

## Phase 5 — Consumer Sweep & Regression Guarding
- **Objective:** Confirm every consumer resolves types from stable entry points and that no new coupling was introduced.
- **Actions:**
  - Review top consumer files (`src/sections/StudioConfigurator.tsx`, `src/sections/studio/components/CanvasPreviewPanel.tsx`, `src/utils/previewClient.ts`, `src/utils/storyLayer/copy.ts`, tests) to ensure imports reference `@/store/useFounderStore` or the new `@/store/founder/storeTypes` as intended.
  - Update imports only when necessary (prefer backward-compatible re-exports to limit churn).
  - Check for duplicate type aliases or outdated references by running `rg 'EntitlementTier' src` and similar searches.
- **Validation:** List any files whose imports changed and rationale for each adjustment.
- **Risks / Watchouts:** Changing runtime imports during this sweep would violate the “types only” constraint—review diffs carefully.

**Implementation Notes**
- Updated type consumers to source from `@/store/useFounderStore`:
  - `src/utils/entitlementGate.ts`
  - `src/utils/storyLayerAnalytics.ts`
  - `src/sections/studio/components/CanvasPreviewPanel.tsx`
  - `src/components/studio/story-layer/StoryLayer.tsx`
  - `src/components/studio/InsightsRail/CuratedStylesModule.tsx`
  - `src/components/studio/InsightsRail/InsightsRail.tsx`
  - `tests/studio/tones.spec.ts`
- Confirmed no remaining direct type imports from `@/store/founder/*` via `rg '@/store/founder/entitlementSlice'` and `rg '@/store/founder/sessionSlice'`.
- `useFounderStore` now re-exports `EntitlementState` to support these usages without coupling to slice modules.

**Status Notes:** Consumer sweep verified; moving to validation in Phase 6.

---

## Phase 6 — Validation Suite & Smoke Test
- **Objective:** Prove there are no regressions in build health, analytics pipelines, or Supabase preview flows.
- **Actions:**
  - Run required scripts in the VS Code NPM panel (per founder workflow):
    1. `npm run deps:analyze`
    2. `npm run lint`
    3. `npm run test -- tests/store/canvasModal.spec.ts`
    4. `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx`
    5. `npm run build`
    6. `npm run build:analyze`
    7. `npm run deps:check`
  - Launch `npm run dev` for the manual smoke test:
    - Upload → Crop → Select style → Preview generation → Canvas modal open/close.
    - Monitor browser console + network activity to ensure telemetry (e.g., `emitStepOneEvent`) still fires.
  - Capture command outputs and smoke test notes directly in this section.
- **Validation:** Paste summarized results (success/failure + timestamps). Note any issues and remediation steps.
- **Risks / Watchouts:** Build output must stay within the 567 KB ceiling for `dist/assets/index-CJh0zBXk.js`; flag if exceeded.

**Execution Log (2025-02-14)**
- `npm run deps:analyze` → ✓ `madge` reports “No circular dependency found”.
- `npm run lint` → ✓ after trimming unused type imports (see commit notes).
- `npm run test -- tests/store/canvasModal.spec.ts` → ✓ analytics assertions pass.
- `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx` → ✓ (Radix `act(...)` warnings persist from baseline).
- `npm run build` → ✓ bundles succeed; primary JS artifact `dist/assets/index-Bb4a5d07.js` = 139.55 KB gzip (under 567 KB ceiling).
- `npm run build:analyze` → ✓ (requires extended timeout; produces sourcemaps + chunk stats).
- `npm run deps:check` → ✕ `depcheck` flags pre-existing issues (`class-variance-authority`, `autoprefixer`, `postcss`, and missing `lint-staged`, `https:`). Logged for follow-up; no new dependencies introduced in this phase.
- Manual smoke test (`npm run dev`; Upload → Crop → Select style → Preview → Canvas modal) → ✓ confirmed locally in VS Code session; no console errors; telemetry events observed.

**Status Notes:** Validation suite complete; depcheck findings remain for backlog triage.

---

## Phase 7 — Documentation & Handoff
- **Objective:** Finalize artifacts and ensure future phases have a trustworthy foundation.
- **Actions:**
  - Update this plan with actual outcomes per phase (checklists, command logs).
  - Summarize key lessons or follow-up tasks for Phase 2 of the broader roadmap.
  - Prepare commit message skeleton and confirm `git status` is clean aside from expected files.
- **Validation:** Record summary bullets + next steps here before requesting review.
- **Risks / Watchouts:** Missing documentation now will slow future modularization efforts; keep notes exhaustive yet concise.

---

### Tracking Table (fill during execution)
| Phase | Status | Notes / Evidence |
|-------|--------|------------------|
| 0 | _Completed_ | Branch `store/phase1-type-decoupling`; baseline status captured; no pre-existing diffs |
| 1 | _Completed_ | Type inventory + consumer audit documented above |
| 2 | _Completed_ | `storeTypes.ts` centralized shared types with type-only imports |
| 3 | _Completed_ | Founder slices now source/re-export types from `storeTypes.ts`; no remaining `../useFounderStore` dependencies |
| 4 | _Completed_ | `useFounderStore` consumes centralized types and re-exports compatibility surface |
| 5 | _Completed_ | Consumer imports now rely on `@/store/useFounderStore`; slice paths removed |
| 6 | _Completed_ | Scripts + manual smoke test done; depcheck warnings noted for backlog |
| 7 | _Pending_ | |

---

**Next Action:** Begin Phase 0 activities and document outcomes above before modifying source files.
