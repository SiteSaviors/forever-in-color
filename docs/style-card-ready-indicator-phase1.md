# Style Card Ready Indicator – Phase 1 Discovery

## Snapshot
- Researched the preview lifecycle (generation, caching, resets) across `src/store/founder/previewSlice.ts`, Launchpad upload flows, gallery hydration, and session handling.
- Confirmed that new uploads and manual resets call `resetPreviews()` which also clears the shared preview cache, but sign-out currently leaves preview state intact.
- Documented how orientation changes, auto-preview batches, and error handling reuse existing preview data, affecting when the “Ready” indicator must appear or persist.

## Preview Lifecycle Findings
- `startStylePreview` replaces the style’s preview entry with `status: 'loading'` while retaining existing `data`. Ready data returns with `status: 'ready'` and orientation metadata aligned to the request (`previewSlice.ts:168-371`).
- `generatePreviews` populates `previews[styleId]` with `status: 'ready'` but *does not* call `cacheStylePreview`, so the in-store `data` object is the single source of truth for auto-generated thumbnails (`previewSlice.ts:500-520`).
- Launchpad uploads (`PhotoUploader.processDataUrl/finalizeCrop`) call `resetPreviews()` to clear both the map and preview cache before seeding the “Original Image” entry (`PhotoUploader.tsx:104-245`).
- Gallery quickview rehydration writes to both `cacheStylePreview` and `setPreviewState` so cached previews stay coherent after reloads (`useGalleryQuickviewSelection.ts:168-200`).
- Sign-out invokes Supabase logout then `setSession(null, null)`; store now calls `resetPreviews()` whenever the active account changes to ensure a clean slate (`sessionSlice.ts:14-26`).
- Orientation changes flag `orientationPreviewPending` and reuse the existing preview entry until a fresh generation completes (`useFounderStore.ts:486-528`). The previous preview’s data remains available even while the status flips to `'loading'` or `'error'`.

## Key Invariants for the Ready Indicator
- Treat “ready” as **preview data availability**, not merely `status === 'ready'`, so the cue persists while a new orientation is generating or if a retry fails but cached imagery remains.
- Respect reset points: `resetPreviews()` (upload, manual reset, auto-force regen) and the new sign-out hook must remove the indicator immediately.
- Orientation changes should keep the indicator visible until replacement data arrives, matching product direction.
- Gallery rehydration and auto-preview batches must light up the card once data exists, without re-triggering Supabase generations.
- Never bypass `startStylePreview` / `generatePreviews`; telemetry (`emitStepOneEvent`) and entitlement updates rely on their existing sequencing.
- Visual layers must coexist with existing lock/selection overlays in `ToneStyleCard` and keep pointer events intact.

## Implementation Strategy Highlights
- Introduce a memoized selector (via `createMemoizedSelector`) that produces a stable map of `{ styleId, hasReadyPreview, lastUpdated, source }` derived from `state.previews` and `previewCacheStore`. This keeps `useToneSections` performant while observing preview updates.
- Extend `ToneSectionStyle`/`ToneStyleCard` to accept readiness metadata without expanding unrelated props. Memoize per-style data to avoid re-renders on unrelated preview changes.
- Hook sign-out to `resetPreviews()` (and by extension `clearPreviewCache()`) to ensure fresh sessions start without ready ribbons.
- Drive the UI cue from the presence of a `previewUrl` (either in `previews` or cache) while also exposing state like `isRegenerating` (`pendingStyleId === styleId`) so future UX iterations can nuance the presentation.
- Stage the animation container inside the existing thumbnail wrapper, using CSS variables for gradients/glow to stay GPU-friendly. Gate motion with `prefers-reduced-motion`.

## Expanded Phased Plan
1. **Discovery & Contract Validation** *(complete)* – current findings.
2. **State Derivation Layer** – implement/tests for the memoized readiness selector, ensuring resets and sign-out behave as expected.
3. **Session & Reset Integration** – wire sign-out to preview reset; audit any other lifecycle hooks that should clear readiness.
4. **UI Prop Plumbing** – thread readiness metadata through `useToneSections` → `ToneSection` → `ToneStyleCard` with Storybook/Dev verification.
5. **Visual & Motion Implementation** – add gradient border, ribbon, reduced-motion support, and ensure overlays stack correctly.
6. **Orientation & Gallery Edge QA** – manual + automated coverage for orientation changes, gallery replays, auto-preview regeneration, and error recovery.
7. **Performance & Regression Suite** – profile render cadence, run `npm run lint`, `build`, `build:analyze`, `deps:check`, and capture artifacts for review.

## Risks & Watchpoints
- Over-subscribing `useToneSections` to full preview state could cause churn; solve with memoized selectors and careful equality checks.
- Need to ensure telemetry remains untouched; any shortcut to bypass `startStylePreview` would miss analytics and entitlement updates.
- Visual layering must not interfere with lock overlays or pointer targets; the ribbon should be `pointer-events: none`.
- Animations must avoid expensive shadow repaints; leverage `translate`/`opacity` only.

## Phase 2 – State Derivation Layer (Complete)
- Added `computePreviewReadiness` selector to merge live preview entries with cache hits while tracking regeneration/ orientation mismatch semantics (`src/store/selectors/previewReadiness.ts`).
- Exposed `usePreviewReadiness` so downstream hooks can consume readiness metadata without subscribing to the entire store (`src/store/hooks/usePreviewReadiness.ts`).
- Ensured account transitions trigger `resetPreviews()` prior to rehydration, preventing ready-state leakage across users (`src/store/founder/sessionSlice.ts`).
- Test coverage:
  - `npm run test -- previewReadiness`
  - `npm run test -- sessionSlice`

## Phase 3 – Session & Reset Integration (Complete)
- Audited lifecycle hooks: uploads, manual regenerations, auto-preview, gallery hydration, and new sign-out guard all converge on `resetPreviews()`, keeping cache + store aligned.
- Verified no additional hooks require clearing beyond the new account-change reset; `setUploadedImage`/`processDataUrl` already call `resetPreviews()` upstream, and gallery restore must retain readiness.
- Documented behaviour to guide future phases and ensure readiness cues clear on upload, regenerate, or log out.

## Phase 4 – UI Prop Plumbing (Complete)
- Expanded `ToneSectionStyle` with preview readiness metadata sourced from the memoized selector while keeping the hook’s memoization intact (`src/store/hooks/useToneSections.ts`).
- Added lightweight data attributes on `ToneStyleCard` so dev snapshots can confirm readiness state before visual styling (`src/sections/studio/components/ToneStyleCard.tsx`).
- Validated readiness propagation and regenerating flags through `react-test-renderer` harnessed tests (`tests/store/useToneSections.spec.tsx`).
- Test coverage: `npm run test -- useToneSections`.

## Phase 5 – Visual & Motion Implementation (Complete)
- Introduced gradient frame and diagonal ribbon overlays that respond to readiness while respecting reduced-motion preferences (`src/sections/studio/components/ToneStyleCard.tsx`, `ToneStyleCard.css`).
- Ensured the animation only runs on first readiness activation and tears down cleanly on reset, preserving launchpad/orientation flows.
- Added ribbon state metadata (`data-state`) to reflect orientation regeneration and support future telemetry.
- Test coverage: `npm run test -- ToneStyleCard` and `npm run test -- useToneSections`.

## Phase 6 – Orientation & Gallery Edge QA (Complete)
- Added readiness tests for regeneration, error recovery, and orientation mismatches to guarantee the indicator persists correctly during refreshes (`tests/store/previewReadiness.spec.ts`, `tests/store/useToneSections.spec.tsx`).
- Reconfirmed gallery rehydration and cached previews stay highlighted via selector fallbacks.
- Test coverage: `npm run test -- previewReadiness`, `npm run test -- useToneSections`.

## Phase 7 – Performance & Regression Suite (Complete)
- Lint, build, analyze, and dependency sweeps all pass (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`).
- Production build keeps the main client bundle (`dist/assets/index-2gUY0rAW.js`) at ~150 kB gzip 40.8 kB, within the 567 kB ceiling; the legacy `heic2any` vendor chunk remains the only >500 kB artifact (expected, unchanged).
- Captured Vite bundle summary for reference; no new chunk warnings beyond the known image converter payload.

## Next Actions
- Hand off for stakeholder visual QA and plan follow-up optimizations (e.g., optional heic2any code-splitting) if bundle budgets tighten.
