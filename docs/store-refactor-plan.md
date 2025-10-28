# Founder Store Decoupling Roadmap

This plan captures the work needed to remove the circular dependencies around `useFounderStore` while preparing the codebase for future store modularisation. Each phase should ship in sequence; do not skip ahead unless prior phases are complete and verified.

---

## Phase 0 — Baseline Inventory & Health Checks

**Goal:** Lock down the current behaviour and capture dependency health so regressions can be spotted quickly.

### Tasks
- [x] Run `npx madge --circular --extensions ts,tsx src/store` and archive results in `docs/store-refactor-plan.md` (see Appendix).
- [x] Document the current exports of:
  - `src/store/useFounderStore.ts`
  - `src/store/founder/*.ts`
- [x] Capture bundle verifier output via `npm run build && node scripts/verify-bundle-sizes.cjs`.
- [x] List the selectors/hooks that import `FounderStoreState` or other slice types from `useFounderStore.ts`.

### Files to Reference
- `src/store/useFounderStore.ts`
- `src/store/founder/*.ts`
- `src/store/hooks/useToneSections.ts`
- `src/store/selectors.ts`

### Risks / Notes
- No code changes in this phase.
- Ensure all follow-up phases reference these baseline snapshots.

### Findings

#### Circular dependency snapshot
```
$ npx madge --circular --extensions ts,tsx src/store
✖ Found 5 circular dependencies!
1) founder/authSlice.ts > founder/entitlementSlice.ts > useFounderStore.ts
2) founder/entitlementSlice.ts > useFounderStore.ts
3) useFounderStore.ts > founder/favoritesSlice.ts
4) useFounderStore.ts > founder/previewSlice.ts
5) useFounderStore.ts > founder/sessionSlice.ts
```

#### Current exports
- `src/store/useFounderStore.ts`
  - Re-exports: `StylePreviewStatus`, `EntitlementTier`, `EntitlementPriority`, `SessionUser`
  - Local exports: `StyleOption`, `Enhancement`, `StyleCarouselCard`, `CanvasSize`, `FrameColor`, `CanvasModalSource`, `CanvasModalCloseReason`, `FounderState`
  - Default export: `useFounderStore`
- `src/store/founder/sessionSlice.ts` — `SessionUser`, `SessionSlice`, `createSessionSlice`
- `src/store/founder/entitlementSlice.ts` — `EntitlementTier`, `EntitlementPriority`, `EntitlementState`, `EntitlementSlice`, `createEntitlementSlice`
- `src/store/founder/previewSlice.ts` — `StylePreviewStatus`, `PreviewState`, `StylePreviewCacheEntry`, `StartPreviewOptions`, `PreviewSlice`, `createPreviewSlice`
- `src/store/founder/favoritesSlice.ts` — `FavoritesSlice`, `createFavoritesSlice`
- `src/store/founder/mediaSlice.ts` — `MediaSlice`, `createMediaSlice`
- `src/store/founder/uiSlice.ts` — `UiSlice`, `createUiSlice`
- `src/store/founder/authSlice.ts` — `AuthSlice`, `createAuthSlice`
- `src/store/founder/types.ts` — Snapshot helper types built from `FounderStoreState`

#### Bundle verifier output
```
$ npm run build && node scripts/verify-bundle-sizes.cjs
...
[bundle-size] Bundle size violations detected:
  - index-D_aXcF0s.js: 171.01 KB (limit 170 KB)
```
> NOTE: index bundle currently exceeds the 170 KB gzip budget by ~1 KB. No action taken in Phase 0; documented for Phase 1 planning.

#### Consumers of `FounderStoreState`/slice types
- `src/store/selectors.ts` uses `FounderStoreState` for selector helpers.
- `src/store/founder/types.ts` derives multiple `Founder*Snapshot` aliases.
- Hooks importing `useFounderStore` state directly (e.g., `src/store/hooks/useToneSections.ts`) rely on slice state via selector arrays; no additional direct type imports noted beyond the two files above.

---

## Phase 1 — Extract Shared Types to Neutral Module

**Goal:** Break the bi-directional imports by moving shared types out of `useFounderStore.ts`.

### Strategy
- Create `src/store/founder/storeTypes.ts` (or update existing `types.ts`) to be the single source of truth for:
  - `StylePreviewStatus`
  - `EntitlementTier`, `EntitlementPriority`
  - `SessionUser`
  - `FounderBaseState`, `FounderState` snapshots
- Update all slice files (`authSlice.ts`, `entitlementSlice.ts`, `sessionSlice.ts`, `previewSlice.ts`, `favoritesSlice.ts`, `mediaSlice.ts`, `uiSlice.ts`) to import types from the new module instead of `../useFounderStore`.
- Remove type re-exports from `useFounderStore.ts`.

### Files Affected
- `src/store/useFounderStore.ts`
- `src/store/founder/types.ts` (rename/merge as needed)
- All slice files under `src/store/founder/`
- Any component/util that imports types from `useFounderStore.ts`

### Validation
- `npx madge --circular --extensions ts,tsx src/store` must report zero cycles.
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts`
- `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx`

### Risks / Notes
- Watch for implicit type-only imports (VS Code auto-import may reintroduce `../useFounderStore`).
- Keep runtime code untouched; this phase is types only.

---

## Phase 2 — Slice Composition Refactor

**Goal:** Ensure `useFounderStore.ts` only composes slices and no longer leaks implementation details.

### Strategy
- Move slice-specific helpers (`createCanvasSelectionSnapshot`, etc.) into their respective slice files if shared only within that domain.
- Narrow the responsibilities of `FounderBaseState` so that future feature stores can reuse pieces without pulling the whole state.
- Update `useFounderStore.ts` to import slice creators and base state definitions from their feature modules.

### Files Affected
- `src/store/useFounderStore.ts`
- `src/store/founder/*.ts`
- `src/store/founder/types.ts`

### Validation
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts`
- Manual smoke test: Launchflow upload → Studio preview → Canvas modal open/close to ensure Canvas snapshot logic still works.

### Risks / Notes
- Ensure analytics calls (`trackStudioV2CanvasModalOpen/Close`) remain intact after helper relocation.
- Keep slice APIs stable; components should not need to change in this phase.

---

## Phase 3 — Feature Module Preparation (Preview & Auth)

**Goal:** Prepare the preview and auth slices for future extraction into dedicated modules.

### Strategy
- Encapsulate preview-specific utilities (`startStylePreview`, cache helpers) inside a `src/features/preview/` module. Export only the minimal API consumed by components and selectors.
- Mirror the structure for auth/entitlements if necessary (`src/features/auth/`).
- Update imports in components (`StudioConfigurator.tsx`, `LaunchpadLayout.tsx`) to consume the new feature modules.

### Files Affected
- `src/store/founder/previewSlice.ts`
- `src/utils/founderPreviewGeneration.ts`
- `src/utils/stylePreviewApi.ts`
- New directories under `src/features/preview/`
- `src/store/founder/authSlice.ts` and related utils (if split)

### Validation
- `npm run lint`
- `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx`
- Manual smoke test: Generate previews, switch styles rapidly, ensure cache + telemetry behave.

### Risks / Notes
- This phase introduces new files; keep module boundaries thin to avoid new cycles.
- Document public APIs in the feature modules to guide future engineers.

---

## Phase 4 — Route-Level Lazy Boundaries

**Goal:** Exploit the refactored modules to lazy-load preview/auth features outside of Studio.

### Strategy
- Update `src/pages/StudioPage.tsx` and `src/routes/MarketingRoutes.tsx` to ensure preview/auth code only loads on Studio routes.
- Validate that marketing routes no longer pull preview slices.
- Consider code-splitting the `preview` feature via dynamic `import()` inside Studio components.

### Files Affected
- `src/pages/StudioPage.tsx`
- `src/routes/MarketingRoutes.tsx`
- Components that trigger preview generation or auth state

### Validation
- Analyze bundle output (`npm run build && ls dist/assets`): ensure `preview` module is only inside Studio chunk, marketing chunk shrinks.
- `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx`
- Manual smoke test on `/` and `/studio` routes for auth/previews.

### Risks / Notes
- Monitor for hydration mismatches when loading feature modules lazily.
- Coordinate with analytics to verify events still fire after splitting.

---

### Appendix

#### Baseline Madge Output (Phase 0)
```
$ npx madge --circular --extensions ts,tsx src/store
✖ Found 5 circular dependencies!
1) founder/authSlice.ts > founder/entitlementSlice.ts > useFounderStore.ts
2) founder/entitlementSlice.ts > useFounderStore.ts
3) useFounderStore.ts > founder/favoritesSlice.ts
4) useFounderStore.ts > founder/previewSlice.ts
5) useFounderStore.ts > founder/sessionSlice.ts
```

#### Verification Checklist Summary
- `npx madge --circular --extensions ts,tsx src/store`
- `npm run lint`
- `npm run build && node scripts/verify-bundle-sizes.cjs`
- Targeted tests: `npm run test -- tests/store/canvasModal.spec.ts`, `npm run test -- tests/studio/actionGridOrientationBridge.spec.tsx`
- Manual flows: Launchflow upload → Studio preview → Canvas checkout
