# Wondertone Studio Hardening Plan

## 0. Context & Guardrails
- Preserve the four-step configurator contract (`useProductFlow`, `Product`, `ProductStepsManager`) and StepOne telemetry stack (StepOneExperience provider, SmartProgressIndicator, contextual help).
- `usePreviewGeneration` remains the single API entry to the Supabase edge function; orientation changes must continue to invalidate caches through `useProductFlow`.
- Style landing pages must keep parity; style recommendation hooks and social momentum widgets rely on StepOneExperience state.
- Existing bundle ceiling: `dist/assets/index-CJh0zBXk.js` ≈ 567 KB. Refactor must not regress performance.
- Mandatory checks post-change: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.

## 1. Current-State Observations
### 1.1 Global store (`src/store/useFounderStore.ts`)
- 1 532 lines, combining:
  - **Session & Entitlements**: Supabase session wiring, anonymous token minting, quota tracking, account prompts.
  - **Media Pipeline**: Upload state, cropping outputs, orientation state, smart crops.
  - **Preview Orchestration**: Cache management, polling, telemetry, token deductions, toast/modals.
  - **UI Flags & Telemetry**: Launchpad expansion, modals, celebration states, StepOne event emission.
- `startStylePreview` handles entitlements, cache lookup, fetch orchestration, analytics, and cache mutation in-line; concurrency relies on ad-hoc flags instead of request cancellation.

### 1.2 Studio configurator (`src/sections/StudioConfigurator.tsx`)
- 890 lines with 20+ store selectors and 10+ `useState` hooks.
- Responsible for:
  - Style list rendering, selection logic, and disabled states.
  - Preview canvas orchestration (overlay, orientation mismatch messaging).
  - Gallery save flow, premium download gating, toast handling.
  - Mobile drawer, Launchpad re-open, upsell banners, StepOne telemetry.
- Dense handler logic mixes UI orchestration with business rules (entitlement hydration, preview state mutation, Supabase download calls).

### 1.3 Preview pipeline
- `startFounderPreviewGeneration` → `generateAndWatermarkPreview` → `generateStylePreview`, relying on manual polling (`previewPolling.ts`) and store-driven state updates.
- No AbortController across async stack; repeated clicks create overlapping fetches guarded only by `pendingStyleId`.
- React Query dependency exists but unused; no centralized query client/provider.

## 2. Target Architecture
### 2.1 Store modularization
- Create `src/store/founder/` with composable slices:
  1. **sessionSlice** – session user, Supabase access token, hydration, sign-out controls.
  2. **entitlementSlice** – anonymous token persistence, entitlements state machine, prompts, token toasts.
  3. **mediaSlice** – upload lifecycle, crops, orientation state, smart crop cache, launchpad layout flags.
  4. **previewSlice** – preview records, cache, pending style state, toast visibility, React Query integration (mutation results).
  5. **uiSlice** – modal toggles, celebration cues, hovered/preselected style metadata.
- Shared helper types/constants extracted to `src/store/founder/types.ts` and `constants.ts`.
- Expose `createFounderStore` that composes slices while preserving the existing `useFounderStore` API to minimize breakage.
- Maintain selector re-exports in `src/store/selectors.ts` with backwards-compatible signatures.

### 2.2 React Query orchestration
- Introduce a `QueryClientProvider` at app root:
  ```tsx
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 0, retry: 1 } } });
  ```
- Build service layer `src/features/preview/previewQueries.ts`:
  - `useStartPreviewMutation` – wraps Supabase edge function call, accepts `AbortController`.
  - `usePreviewStatusQuery` – polling query for long-running requests, auto-cancel on success/error.
  - Normalizes payloads into `PreviewResult` DTOs consumed by preview slice.
- Encapsulate side-effects (telemetry, token decrement) within the slice via mutation lifecycle callbacks to keep UI components minimal.
- Reuse React Query cache keys keyed by `{photoId, styleId, orientation}` to dedupe concurrent requests and share results across components.

### 2.3 Studio configurator decomposition
- Split into domain components under `src/sections/studio/`:
  1. `StudioLayout` – top-level container handling Suspense boundary, notices, layout.
  2. `StyleSidebar` – style list, generation limits, upgrade CTA; subscribes to a memoized selector or hook.
  3. `CanvasPreviewPanel` – preview canvas, overlays, orientation messaging; consumes preview slice hook and React Query results.
  4. `PreviewActionBar` – gallery save, download, toast trigger logic (using dedicated hooks).
  5. `MobileStyleDrawer` remains separate but receives slim props & callbacks.
- Extract side-effect heavy handlers into hooks (`usePreviewActions`, `useGalleryActions`) to keep components declarative.
- Reuse StepOne telemetry utilities within hooks to ensure event contracts remain unchanged.

## 3. Migration Phases
| Phase | Objectives | Key Tasks | Verification |
| --- | --- | --- | --- |
| **0. Baseline & Scaffolding** | Preserve behavior while preparing structure | Snapshot current selectors/usages; add unit typings; introduce `src/store/founder/` directory with shared types (no behavior change). **Status: ✅ Completed** | `npm run lint`, smoke upload → preview flow |
| **1. React Query Infrastructure** | Enable provider without refactoring store yet | Add `QueryClientProvider` in `src/main.tsx`; create preview query utilities returning typed results; write thin wrapper hook `usePreviewGenerationService` consumed by the existing store but gated behind feature flag. **Status: ✅ Completed (flag toggled via VITE_ENABLE_PREVIEW_QUERY)** | Build, verify preview works when flag off/on |
| **2. Preview Slice Extraction** | Migrate preview logic from monolith | Move cache, pending state, and `startStylePreview` into a dedicated slice using React Query mutation; wire AbortController; update `useFounderStore` to delegate to slice; ensure StepOne events & telem continue. **Status: ✅ Completed** | Run required scripts, manual tests for concurrent preview clicks/orientation change |
| **3. Session & Entitlements Slices** | Isolate auth/entitlement concerns | Extract session + entitlements logic into slices, refactor consumers (`AuthProvider`, `entitlementsApi`) to use new helpers; ensure anonymous token storage continues until security hardening project replaces it. | Lint/build, verify login/logout, quota depletion, anonymous mint |
| **4. Media & UI Slices** | Finalize store modularization | Relocate upload/orientation + UI flags into slices; expose typed selectors; remove legacy helpers from root store. **Status: ✅ Completed** | Manual tests: upload, recrop, orientation change, prompts |
| **5. Studio Component Decomposition** | Reduce component complexity | Incrementally extract `StyleSidebar` and `CanvasPreviewPanel`; replace direct store calls with memoized selectors/hooks; ensure existing props (e.g., `checkoutNotice`) continue to function. | Visual QA desktop/mobile, orientation/responsive checks |
| **6. Cleanup & Documentation** | Remove legacy paths, solidify patterns | Delete unused functions, update docs, ensure `selectors.ts` references new slices; document store architecture in README/CLAUDE. | `npm run lint && npm run build && npm run build:analyze && npm run deps:check` |

## 4. React Query Integration Details
- **Cancellation**: Each preview mutation instantiates an `AbortController`; `useEffect` cleanup or new mutations trigger `abort()` to prevent stale dispatches.
- **Cache Invalidation**: On upload/orientation changes, preview slice issues `queryClient.invalidateQueries(['preview', imageHash])` to ensure stale previews regenerate.
- **Reducer Interaction**: Mutation success updates store cache via action `previewSlice.onPreviewSuccess`, keeping Zustand the single source of truth for UI state while React Query manages network lifecycles.
- **Error Handling**: Mutation `onError` surfaces entitlement errors, triggers toast/modal hooks, and logs via telemetry util to preserve analytics.

## 5. Risks & Mitigations
- **Telemetry Drift**: Centralize StepOne event emission inside preview slice; write regression checklist to compare events before/after.
- **Selector Breakage**: Maintain existing selector signatures; add unit (or runtime) assertions ensuring required keys exist after slice split.
- **Concurrent Store Refactors**: Work behind feature flags (e.g., `ENABLE_PREVIEW_QUERY`) enabling gradual rollout.
- **Bundle Regression**: Monitor `npm run build:analyze` after each phase; ensure new modules tree-shake (prefer named exports, avoid large static data duplication).

## 6. Testing & QA
- Automated: run mandatory scripts after each phase; add focused tests (if feasible) for preview hook once infrastructure exists.
- Manual scenarios:
  1. Anonymous user uploads photo → generates multiple styles quickly (verify throttling, cancellation, token decrement).
  2. Orientation change mid-generation resets preview and recomputes orientation tip.
  3. Premium user downloads HD version (ensures entitlements, React Query state sync).
  4. Mobile drawer interactions and Launchpad re-open flows.
- Phase 2 results: verified multi-click preview generation (cancellation preserves latest run), orientation flips restore pending flag/telemetry, and quota exhaustion still triggers `showQuotaModal`; StepOne preview events continue logging (`start`, staged updates, `complete`/`error`).

## 7. Rollout & Communication
- Keep commits phase-scoped for easier review.
- Update `CLAUDE.md` or new `docs/state-architecture.md` with slice diagrams.
- Coordinate with stakeholders before enabling React Query-backed preview globally.

## 8. Definition of Done
- `useFounderStore` reduced to thin composer; each domain slice under 250 lines with clear responsibilities.
- `StudioConfigurator` < 300 lines, delegating UI/logic to subcomponents/hooks.
- Preview generation managed by React Query with AbortController-based cancellation and no race-condition regressions.
- Mandatory checks pass; StepOne telemetry events verified; preview, entitlements, and checkout flows smoke-tested on desktop & mobile.
