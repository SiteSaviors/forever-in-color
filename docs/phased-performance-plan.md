# Performance Optimization Phased Plan

## Phase 0 – Baseline & Guardrails
- Capture current behavior with React Profiler traces for key flows (crop modal orientation swap, sidebar hover/expand, tone scrolling).
- Note existing bundle timings by running `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.
- Reconfirm Wondertone guardrails: telemetry via `emitStepOneEvent`, preview orchestration through `previewSlice.startStylePreview`, and founder workflow tooling.

**Status Notes**
- 2024‑XX‑XX: `npm run lint`, `npm run build`, `npm run build:analyze` all pass (expected Vite chunk-size warning). `npm run deps:check` reports existing unused/missing dependency list (no changes yet). Guardrails restated and profiling targets captured for comparison.

## Phase 1 – Style Accordion Data Path
- Refactor `useToneSections` selector to use shallow equality and memoized derivation keyed only on styles, entitlements snapshot, selection, and favorites.
- Introduce cached gate evaluation per style id tied to the latest entitlement timestamp to prevent repeated computation.
- Defer per-tone gate evaluation until a section is opened, caching results while preserving existing gating and telemetry behavior.

**Status Notes**
- 2024‑XX‑XX: Rebuilt `useToneSections` with shallow selectors, entitlement-versioned gate cache, and lazy tone hydration API. Updated `StyleAccordion` to hydrate active/selected tones on demand. `npm run lint`, `npm run build`, `npm run build:analyze` pass (with expected chunk-size warning); `npm run deps:check` unchanged (reports pre-existing unused/missing list).

## Phase 2 – Style Accordion Interaction Path
- Apply targeted animation tuning: add `will-change` hints to active panels; if jitter remains, scope Framer layout animations to the active tone only.
- Stabilize thumbnail prefetch observers by caching `registerGroup` callbacks per tone id and avoiding redundant `IntersectionObserver` instances.
- Optimize parallax hover: cache bounding rects on pointer enter/move (reset on leave); escalate to a `requestAnimationFrame` CSS-variable update only if profiling still shows churn, honoring reduced-motion preferences.

**Status Notes**
- 2024‑XX‑XX: Added steady `will-change` hints to expanded tone sections, introduced id-stable prefetch observers, and refactored tone-card parallax with rect caching + RAF throttling while respecting reduced-motion settings. `npm run lint`, `npm run build`, `npm run build:analyze` pass (usual chunk-size warning); `npm run deps:check` still reports the pre-existing unused/missing entries.

## Phase 3 – Cropper Modal Responsiveness
- Preload smart-crop results when the modal opens and reuse cached regions on orientation switches, regenerating only on explicit user actions.
- Remove `key={activeOrientation}` from the cropper component; reset crop/zoom via refs so `react-easy-crop` stays mounted while respecting new aspect ratios.
- Validate manual crop defaults and telemetry events remain unchanged.

**Status Notes**
- 2024‑XX‑XX: Cropper modal now maintains a per-image smart-crop cache, prefetching orientations on open and reusing them on toggles without remounting the cropper. Orientation switches rely on state resets instead of component keys, preserving manual edits and telemetry. `npm run lint`, `npm run build`, `npm run build:analyze` pass (with the existing chunk-size warning); `npm run deps:check` unchanged.

## Phase 4 – Verification & Regression Guard
- Re-run React Profiler on the same flows captured in Phase 0 and document improvements.
- Execute the full check suite (`npm run lint`, `build`, `build:analyze`, `deps:check`) to ensure no regressions.
- Summarize measurements, note any follow-up considerations (e.g., virtualization deferment), and prep for code review within the founder workflow.

**Status Notes**
- 2024‑XX‑XX: Command suite executed (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`), all passing with the known depcheck warnings. Profiling recommendation: re-run the saved React Profiler sessions (accordion hover/expand, cropper orientation flip, sidebar scroll) to capture frame budgets post-optimization; compare render durations and commit counts against the Phase 0 baselines. Document the deltas alongside any observed UX notes before code review.
