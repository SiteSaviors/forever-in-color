# Auth & Entitlement Client Optimization Plan

> Anchor every change to Wondertone's premium AI canvas mandate: preserve Launchflow → Studio momentum, Step One telemetry, and tier-based gating while reducing bundle weight for long-term scalability.

## Objectives
- Replace the 114 KB `@supabase/supabase-js` bundle with a minimal auth + REST facade without changing UI or behavior.
- Maintain tier logic (Free, Creator, Plus, Pro, Dev) and associated benefits throughout Launchflow, Studio, and telemetry surfaces.
- Prepare AuthProvider for upcoming Google/Facebook and email/password support while keeping the fallback HEIC pipeline intact.

## Guardrails & Constraints
- **Configurator & preview flow:** `useFounderStore`, `previewSlice.startStylePreview`, and `emitStepOneEvent` must remain untouched as the single Supabase preview pipeline.
- **Tier benefits:** Uphold entitlement mapping and gating (token toasts, quota modals, premium badges). No change to `mapTier`, `priorityForTier`, or existing store slices.
- **Telemetry:** Step One and Launchflow analytics must continue firing with identical payloads.
- **Scripts:** Run `npm run dead-code:check`, `npm run lint`, `npm run build`, `npm run build:analyze`, and `npm run deps:check` before handing off work per founder workflow.
- **Branching:** Follow the VS Code-first workflow—create a feature branch, inspect diffs in-editor, only commit after local checks succeed.

## Pre-Flight Checklist
1. Capture current bundle stats (`npm run build:analyze`) and note `supabaseClient-*.js` size.
2. Confirm Supabase env vars exist in `.env.local` for dev testing.
3. Ensure HEIC edge flag is on in dev so fallback remains optional during validation.
4. Sync with ongoing auth feature plans (Google/Facebook/email-password) to avoid conflicting API changes.

## Phased Implementation

### Phase 0 – Discovery & Baseline
- Document current import graph (`supabaseClient.loader.ts`, `AuthProvider`, slices, modals).
- Inventory Supabase features in use (GoTrue auth, Postgrest `v_entitlements` query) and those unused (storage, functions, realtime).
- Record baseline metrics: chunk size, hydration timings, entitlements fetch logs.

8

### Phase 2 – Replace Entitlement Fetch
1. Refactor `fetchAuthenticatedEntitlements` to call Supabase REST (`/rest/v1/v_entitlements?select=...`) using `fetch` with anon key + bearer token.
2. Preserve existing telemetry (`devLog`, `devWarn`) and snapshot shape; add explicit error handling for HTTP failures.
3. Add regression tests covering tier mapping (`free`, `creator`, `plus`, `pro`, `dev_override`).

### Phase 3 – Consumer Updates & Cleanup
1. Ensure `AuthProvider`, `authSlice`, modals, HEIC fallback, and any helpers depend only on the new facade.
2. Remove `src/utils/supabaseClient.ts` and eliminate direct `@supabase/supabase-js` imports.
3. Update `package.json` to drop `@supabase/supabase-js`; add ESLint `no-restricted-imports` rule to block reintroduction.
4. Verify tree-shaking leaves only the minimal auth bundle via `npm run build:analyze`.

### Phase 4 – Validation & Regression Testing
- **Automated:** Run required npm scripts; ensure Vitest suites pass.
- **Manual:**
  - Launchflow upload → Studio gating, ensuring premium styles still lock/unlock correctly.
  - Magic link login, logout, session refresh (including `onAuthStateChange`).
  - Entitlement refresh (focus window) and quota toast/modals.
  - HEIC upload with edge success and forced fallback to ensure auth tokens reach edge functions.
- Record post-change bundle metrics and update `docs/performance-deep-dive.md` with the new `supabaseClient` size.

### Phase 5 – Future Enhancements (After Refactor Stabilizes)
- Integrate provider sign-in (Google, Facebook) through the new facade (GoTrue supports `signInWithOAuth`).
- Add optional email/password support with Magic Link fallback; ensure tier entitlements hydrate post-login.
- Consider extracting entitlement REST helpers into a dedicated module for reuse across any future surfaces.

## Rollback Strategy
- Keep the original `supabaseClient.ts` around in a temporary branch for quick restoration.
- If auth regressions appear in QA, revert to previous commit and re-run required scripts before resuming work.

## Documentation & Handoff
- Update `docs/performance-deep-dive.md` Phase 1 outcomes with new metrics and findings.
- Record any new testing utilities or scripts in `FOUNDER_WORKFLOW.md` appendix if applicable.
- Brief stakeholders on behavior parity and new extension points for upcoming auth providers.

