# Wondertone Studio – Analysis & Action Plan

## Current State Summary
- **Configurator flow**: `useFounderStore.ts:360-449` plus `previewSlice.ts:319-420` keep the four-step sequence intact, reset previews on orientation change, and reuse cached renders without bypassing gating.
- **Telemetry wiring**: Launchflow and Step One helpers (`LaunchpadLayout.tsx`, `previewSlice.ts`, `emitStepOneEvent`) coordinate progress/momentum events directly through the founder store state.
- **Preview pipeline**: `previewGeneration.ts` and `stylePreviewApi.ts` remain the single path to the Supabase edge function, enforcing schemas from `shared/validation/previewSchemas.ts`.
- **Auth & entitlements**: `AuthProvider.tsx` hydrates Supabase session state, triggers token toasts/modals, and calls `reconcileEntitlements` to keep gating logic in sync with the edge responses.
- **Bundle profile**: Entry chunk `dist/assets/index-CLAKVT2p.js` is ~144 KB; source maps show `zod` (~149 KB) and entitlement/preview slices as top contributors. Lazy route splits already exist for Studio vs. Marketing.

## Key Findings

### Studio Flow & Telemetry
- Launchflow → Studio handoff uses `requestUpload`, `setOrientation`, and cache-aware preview resets; breaking this coupling would sever the Step One telemetry emitted via `emitStepOneEvent`.
- `previewSlice` still centralizes idempotency hashing (`buildPreviewIdempotencyKey`), stage telemetry, and cache updates. Any new preview entry must reuse this slice to keep Supabase caches coherent.

### Preview Pipeline & Edge Contract
- Runtime validation sits in `previewSchemas.ts`; the Supabase helpers in `stylePreviewApi.ts` (`generateStylePreview`, `fetchPreviewStatus`) import those parsers to normalize camel/snake casing. Responses supply entitlements (tokens, tiers, softRemaining) that downstream UI expects.
- Edge functions (Supabase) rely on consistent idempotency keys and fingerprint hashes; resetting `currentImageHash` outside the store would break cache hits.

### Testing Coverage Gaps
- Only regression coverage is `tests/studio/tones.spec.ts`, which exercises `canGenerateStylePreview`. No integration tests validate upload → crop → preview gating, orientation resets, or Supabase-backed preview success/failure.
- No mocks currently exist for `previewSlice`/`founderPreviewGeneration`, increasing risk when refactoring idempotency or caching.

### Bundle & Performance
- `zod` is bundled into the entry chunk via `stylePreviewApi.ts` imports despite preview logic loading later. Moving schema parsing behind a dynamic import would defer ~140 KB.
- Auth/Quota modals (`AuthModal.tsx`, `QuotaExhaustedModal.tsx`) import lucide-react and framer-motion immediately because `AuthProvider` renders them unconditionally; they load even when hidden.
- Supabase client chunk (`supabaseClient-FTH4Qe_p.js`, ~111 KB) is lazy loaded but becomes resident once `AuthProvider` mounts; further splitting around rarely-used flows could reduce initial Studio payload.

## Recommended Actions

1. **Style registry readiness (before adding new styles)**
   - Review `docs/style-registry.md` and update `registry/styleRegistrySource.ts` with the new styles, tiers, and tone metadata.
   - Run `npm run build:registry` to regenerate `src/config/styles/styleRegistry.generated.ts`, then verify `styleCatalog.ts` and `useFounderStore.ts` load the expanded catalog without hard-coded caps.
   - Re-run bundle checks (`npm run build`, `npm run build:analyze`) to confirm the larger registry keeps entry chunks under the 567 KB ceiling.

2. **Studio integration tests (highest priority after registry)**
   - Build Vitest + Testing Library suites under `tests/studio/` that mount Launchflow + Studio providers.
   - Mock Supabase calls via the schema helpers (`parsePreviewRequest`, `normalizePreviewResponse`) to keep contract enforcement intact.
   - Cover orientation reset, cache reuse, gating fallback (`quota_exceeded`, `style_locked`), and idempotency hash reuse to guard the Step One telemetry mandate.

3. **Deferred preview schema loading**
   - Convert `stylePreviewApi.ts` to import `previewSchemas` dynamically (`await import('../../shared/validation/previewSchemas')`).
   - Cache the imported module to avoid repeated loads; ensure TypeScript types remain explicit.
   - Validate that rejection paths still bubble `remainingTokens` and `code` for entitlement UX.

4. **Lazy modal payloads**
   - Wrap `AuthModal`, `QuotaExhaustedModal`, and `TokenDecrementToast` in `lazy()` boundaries inside `AuthProvider`, showing skeleton fallbacks that preserve current semantics.
   - Defer lucide/framer-motion imports to those lazy chunks; confirm modals still mount in response to store state changes.

5. **Preview pipeline hardening**
   - Add targeted unit tests for `buildPreviewIdempotencyKey`, `previewSlice` stage transitions, and `computeImageDigest` fallback logging to make refactors safer.
   - Document orientation reset expectations within `previewSlice` to reduce accidental regressions.

6. **Developer workflow reinforcement**
ay   - Automate the required script chain (`lint`, `build`, `build:analyze`, `deps:check`) via a reusable npm script alias to encourage local verification.
   - Keep dead-code sweeps (`npm run dead-code:check`) in the workflow before removals, per guardrails.

## Long-Term Opportunities
- Evaluate splitting the generated style registry into smaller lazy chunks keyed by tone group to shrink initial state and reduce `useFounderStore` hydration cost.
- Instrument preview latency metrics (guardrail Claim 6) once integration tests exist, feeding Supabase timings back into the Step One telemetry dashboards.
- Explore moving entitlement gating logic into a shared package if multiple frontends emerge, keeping Supabase contract changes centralized.

## Validation & Guardrails
- Preserve the four-step configurator gating and Step One telemetry emitted via `emitStepOneEvent` (`useFounderStore.ts`, `previewSlice.ts`) when implementing any of the actions above.
- Ensure the founder preview pipeline (`previewSlice.startStylePreview` → `startFounderPreviewGeneration`/`executeStartPreview`) remains the single Supabase entrypoint; no alternate fetchers should bypass `stylePreviewApi.ts`.
- Respect edge function contracts (`supabase/functions/generate-style-preview/index.ts`) and retry budgets (`resolvePreviewTimingConfig`, `executeWithRetry`) when adjusting polling.
- Run and document the mandatory scripts before handoff:
  - `npm run lint`
  - `npm run build`
  - `npm run build:analyze`
  - `npm run deps:check`
  - `npm run dead-code:check` (before any deletions)

## Risks & Mitigations
- **Schema lazy loading mistakes** could skip validation. Mitigate by wrapping the dynamic import in a typed helper and adding tests that assert invalid payloads still throw.
- **Modal lazy loading regressions** might delay toast/modal rendering on first open. Use suspense boundaries with minimal skeletons and write tests for token toast visibility.
- **Integration test flakiness** may arise from async preview polling mocks; base tests on deterministic mock timers and reuse idempotency helpers to avoid race conditions.
- **Bundle regressions** must stay under the 567 KB ceiling (`dist/assets/index-CJh0zBXk.js` baseline). After each change, review `dist/stats.html` or `npm run build:analyze` output.

This plan keeps the Wondertone AI canvas mandate front-and-center—guarding configurator flow, Step One telemetry, and preview caching—while charting pragmatic steps toward better test coverage and slimmer bundles.
