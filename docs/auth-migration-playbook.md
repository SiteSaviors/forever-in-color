# Wondertone Auth Migration Playbook

Anchor: Wondertone premium AI canvas experience — preserve Launchflow → Studio continuity, telemetry integrity, and Supabase preview performance while sunsetting anonymous generations.

This guide tracks the end-to-end implementation, phased rollout, validation, and rollback strategy for requiring authenticated accounts before style generation.

## Phase Overview

| Phase | Goal | Flag State | Key Outputs |
|-------|------|------------|-------------|
| 1 | Audit & flag scaffolding | `REQUIRE_AUTH_FOR_PREVIEW=false` | Dependency inventory, rollout tooling |
| 2 | Store refactor (dual-path) | `false` | Auth-first entitlement scaffolding behind flag |
| 3 | Auth gate UX | `false` | Mandatory modal implementation, pending-style orchestration |
| 4 | Preview pipeline convergence | `false` (tested `true` in staging) | JWT-only edge functions, cache key updates |
| 5 | Gradual rollout | ramp 10% → 50% → 100% | Metrics dashboard, real-time telemetry |
| 6 | Anonymous retirement | `true` | Code removal, schema cleanup, cache flush |
| 7 | Monitoring & analytics hardening | `true` | New events + alerts, success verification |
| 8 | Documentation & QA sign-off | `true` | Updated specs, runbooks, final test evidence |

Each phase should complete before advancing; regression tests and mandatory scripts (`npm run lint`, `build`, `build:analyze`, `deps:check`, `dead-code:check`) run at the end of phases 3, 4, 6, and 8.

---

## Phase 1 – Audit & Feature Flag Setup

**Objective**: Catalog anonymous dependencies, confirm telemetry touchpoints, and stage rollout controls without behavior changes.

- Inventory anonymous usage across:
  - Store slices (`src/store/founder/entitlementSlice.ts`, `previewSlice.ts`, `selectors.ts`, `useFounderStore.ts`)
  - Utilities (`src/utils/entitlementsApi.ts`, `previewIdempotency.ts`, `entitlementGate.ts`, `founderPreviewGeneration.ts`)
  - Launchflow / Studio UI (`src/sections/LaunchpadLayout.tsx`, `StudioConfigurator.tsx`, `TokenWarningBanner.tsx`, `ActionRow.tsx`)
  - Supabase functions (`supabase/functions/generate-style-preview/*`, `save-to-gallery`, `get-gallery`, `anon-mint`)
  - Database tables (`anonymous_tokens`, `anonymous_usage`, `preview_logs`, `preview_cache_entries`)
- Document telemetry surfaces relying on anonymous tiers (Launchflow, Step One events, analytics).
- Introduce new boolean flag:
  - Frontend: `import.meta.env.VITE_REQUIRE_AUTH_FOR_PREVIEW`
  - Edge functions: `REQUIRE_AUTH_FOR_PREVIEW`
- Add rollout percentage env (`VITE_AUTH_GATE_ROLLOUT`), default `0`.
- Produce regression risk register and confirm rollback plan (Feature flag OFF restores anonymous behavior).

**Validation**:
- `rg "tier === 'anonymous'"` report archived in PR.
- Smoke `npm run lint`.

**Rollback**: revert env defaults; no functional changes yet.

### Phase 1 Outputs

- **Store slices**
  - `src/store/founder/entitlementSlice.ts:1` — anonymous token mint, reconciliation, prompt counters, watermark rules.
  - `src/store/founder/previewSlice.ts:300` — passes `anonToken` and fingerprint into preview pipeline + idempotency.
  - `src/store/selectors.ts:1` — exposes `selectAnonToken` to Launchflow / Studio components.
  - `src/store/useFounderStore.ts:1` — composes slices; orientation, telemetry, and upload flows depend on shared anonymous state.
- **Utilities**
  - `src/utils/entitlementsApi.ts:1` — `mintAnonymousToken`, `requiresWatermark` resolver.
  - `src/utils/entitlementGate.ts:1` — gating logic for anonymous soft/hard limits and fingerprint fallbacks.
  - `src/utils/previewIdempotency.ts:1`, `src/utils/founderPreviewGeneration.ts:1` — idempotency keys, Supabase payloads include `anonToken`.
  - `src/store/utils/anonTokenStorage.ts:1`, `src/utils/deviceFingerprint.ts:1` — persistence and fingerprint hashing.
- **Launchflow / Studio UI**
  - `src/sections/LaunchpadLayout.tsx:1`, `src/sections/StudioConfigurator.tsx:1` — trigger quota prompts and gating based on `tier === 'anonymous'`.
  - `src/components/studio/TokenWarningBanner.tsx:1`, `src/components/studio/ActionRow.tsx:1`, `src/components/studio/StickyOrderRail.tsx:1` — display anonymous copy, disable premium actions.
  - `src/components/checkout/CheckoutSummary.tsx:1` — shows watermark messaging for anonymous / free tiers.
- **Supabase functions**
  - `supabase/functions/generate-style-preview/entitlements.ts:1` — dual branch resolver; anonymous usage analysis.
  - `supabase/functions/generate-style-preview/index.ts:1` — (legacy) expected `X-WT-Anon` and inserted `anon_token` into `preview_logs`; Phase 6 cleanup removed this path in favor of JWT-only previews.
  - `supabase/functions/anon-mint/index.ts:1` — lifecycle for anonymous token issuance.
  - `supabase/functions/get-gallery/index.ts:1`, `supabase/functions/save-to-gallery/index.ts:1` — accept anonymous headers, gate responses.
- **Database surfaces**
  - `supabase/migrations/20251013120000_entitlements.sql:1` — tables `anonymous_tokens`, `preview_logs` foreign keys.
  - `supabase/migrations/20251016154500_create_anonymous_usage.sql:1` — fingerprint usage tracking.
  - `supabase/functions/generate-style-preview/cache/cacheMetadataService.ts:1` — current cache metadata lacks tier dimension.
- **Telemetry touchpoints**
  - `src/utils/launchflowTelemetry.ts:1` — defaults tier context to `'anonymous'`, included in Launchflow analytics.
  - `src/utils/telemetry.ts:1` — Step One events triggered before/after preview generation regardless of auth state.
  - Supabase request logging (`supabase/functions/generate-style-preview/logging.ts:1`) — extended to report flag snapshot for audit.
- **Feature flag scaffolding**
  - Frontend constants: `src/config/featureFlags.ts:1` exports `REQUIRE_AUTH_FOR_PREVIEW`, `AUTH_GATE_ROLLOUT_PERCENT`.
  - Edge function constant: `supabase/functions/generate-style-preview/index.ts:1` reads `REQUIRE_AUTH_FOR_PREVIEW` for forthcoming enforcement.
- **Regression / rollback notes**
  - `docs/anon-to-free-migration-plan.md:1` remains source of truth for risks R1–R12.
  - Rollback resets `VITE_REQUIRE_AUTH_FOR_PREVIEW=false`, `VITE_AUTH_GATE_ROLLOUT=0`, Supabase `REQUIRE_AUTH_FOR_PREVIEW=false`.
- **`rg "tier === 'anonymous'"` snapshot**
  ```
  src/store/founder/entitlementSlice.ts:const requiresWatermarkFromTier = (tier: EntitlementTier): boolean => tier === 'anonymous' || tier === 'free';
  src/store/founder/entitlementSlice.ts:      state.entitlements.tier === 'anonymous' &&
  src/store/founder/entitlementSlice.ts:    if (entitlements.tier === 'anonymous') {
  src/utils/entitlementGate.ts:  if (entitlements.tier === 'anonymous' && fingerprintStatus === 'error') {
  src/utils/entitlementGate.ts:    entitlements.tier === 'anonymous' &&
  src/utils/entitlementGate.ts:  if (entitlements.tier === 'anonymous') {
  src/utils/entitlementsApi.ts:  const requiresWatermark = tier === 'anonymous' || tier === 'free';
  src/components/checkout/CheckoutSummary.tsx:            {entitlements.tier === 'anonymous' || entitlements.tier === 'free'
  supabase/functions/generate-style-preview/entitlements.ts:  return tier === 'anonymous' || tier === 'free';
  ```

---

## Phase 2 – Store Baseline Refactor (Flagged Off)

**Objective**: Prepare Zustand store and helpers for authenticated-only entitlements while keeping anonymous path under flag.

- Update `entitlementSlice`:
  - Add guarded auth-first state (tier defaults to `free`).
  - Maintain legacy anon fields when flag is OFF.
  - Persist pending style/image for post-auth replay.
- Adjust helpers with dual logic behind flag:
  - `previewIdempotency.ts` accepts `sessionUserId` primary, `anonToken` fallback (flag OFF).
  - `entitlementsApi.ts` scaffolds for authenticated fetch only (flag ON path) without removing `mintAnonymousToken` yet.
  - `entitlementGate.ts` prepares to ignore anonymous tier when flag ON.
- Ensure telemetry (`emitStepOneEvent`, `trackLaunchflow*`) uses new tier context safely.

**Validation**:
- Unit-like smoke: manually trigger store actions with flag toggled in Storybook or local harness.
- `npm run lint` to catch type errors.

**Rollback**: toggle flag to OFF; code still supports anonymous logic.

### Phase 2 Outputs

- `src/store/founder/entitlementSlice.ts:1` branches on `REQUIRE_AUTH_FOR_PREVIEW`, skipping anonymous token minting, fingerprint resolution, and quota prompts when auth gating is enabled while preserving legacy behavior when disabled.
- `src/store/founder/sessionSlice.ts:1` keeps anon token hydration confined to the legacy path so authenticated builds don’t touch localStorage.
- `src/store/founder/previewSlice.ts:1`, `src/utils/previewIdempotency.ts:1`, and `src/utils/stylePreviewApi.ts:1` derive preview identity strictly from Supabase sessions when the flag is on, falling back to anon/fingerprint identity otherwise.
- `src/utils/entitlementGate.ts:1` now toggles fingerprint/quota logic based on the flag, ensuring paid tiers continue to gate premium styles without anonymous assumptions.
- Added debug visibility to Supabase edge handler flag state (`supabase/functions/generate-style-preview/index.ts:52`) while retaining existing response contracts.
- `npm run lint`

---

## Phase 3 – Auth Gate UX

**Objective**: Implement the mandatory modal that blocks preview generation for unauthenticated users, matching provided UX.

- Create `AuthGateModal` reusing AccountPromptModal structure:
  - Copy from requirements (`AUTH_GATE_COPY` constants).
  - Interactions: open on style click, backdrop dismiss but reopens on interaction, Google OAuth single click, magic-link email only.
- Store adjustments:
  - Persist `pendingStyleId`, `pendingSourceImage`, `pendingOrientation` in `useFounderStore`.
  - On successful auth, automatically call `startStylePreview`.
- Maintain Launchflow telemetry; `emitStepOneEvent` still triggered when preview begins/resumes.
- Mobile responsiveness: test at 375px.

**Validation**:
- Manual flow: anonymous upload, click style ⇒ modal; Google/magic-link flows resume preview.
- `npm run lint && npm run build`.
- Check Step One logs for `preview start/complete`.

**Rollback**: disable flag; modal gating bypassed but UI remains accessible.

---

### Phase 3 Outputs

- `src/components/modals/AuthGateModal.tsx:1` introduces the shadcn-styled auth gate with required copy, Google OAuth, and email handoff while preserving fade-in animation and trust copy.
- `src/store/founder/previewSlice.ts:1` now short-circuits unauthenticated preview attempts via `shouldRequireAuthGate`, records the intent, and resumes automatically post-auth.
- `src/utils/authGate.ts:1` centralizes rollout bucketing and flag evaluation, enabling percentage-based gating ahead of the global cutover.
- `src/store/founder/sessionSlice.ts:1` replays any pending preview once a Supabase session completes, keeping Step One telemetry intact.
- `src/sections/LaunchpadLayout.tsx:1` mounts the new modal alongside the legacy anonymous prompt so existing flows stay untouched for non-gated users.
- `src/components/modals/AuthModal.tsx:1` remains the email magic-link surface; the gate routes to it when users choose the secondary CTA.
- `npm run lint`

---

## Phase 4 – Preview Pipeline Convergence

**Objective**: Unify preview generation on authenticated JWTs, prepare cache for tier-awareness, and validate end-to-end behind the flag.

- Frontend:
  - `startFounderPreviewGeneration` removes `anonToken` when flag ON.
  - `stylePreviewApi.ts` sends `Authorization` header only; drop `X-WT-Anon` under flag.
  - `previewSlice` ensures idempotency key based on `{styleId, orientation, imageDigest, sessionUserId}` when flag ON.
- Backend:
  - `generate-style-preview/entitlements.ts` – skip anonymous branch when flag ON; return 401 missing JWT.
  - Add `tier` + `user_id` columns to `preview_cache_entries`; update `CacheMetadataService` and `buildCacheKey`.
- Staging validation with flag ON end-to-end.

**Validation**:
- Run `npm run lint && npm run build && npm run build:analyze`.
- Staging manual regression (upload → preview, orientation change, cache hit).

**Rollback**: disable flag; anonymous branch still present and untouched.

---

### Phase 4 Outputs

- `supabase/functions/generate-style-preview/index.ts:366` now enforces real Supabase sessions when `REQUIRE_AUTH_FOR_PREVIEW` is enabled, disables anonymous fallback, and threads tier/user metadata into cache operations.
- Cache metadata + keying were upgraded (`supabase/functions/generate-style-preview/cache/cacheKey.ts:3`, `cache/cacheMetadataService.ts:1`) to include tier segmentation and ownership, backed by migration `supabase/migrations/20251101120000_add_preview_cache_auth_metadata.sql:1`.
- Webhook persistence mirrors the new metadata so asynchronous completions stay in sync with synchronous requests (`supabase/functions/generate-style-preview/index.ts:198`).
- Preview slice/session wiring continues to replay pending requests post-auth with no UI churn; anonymous branches remain dormant for rollback.
- Builds run post-change: `npm run lint`, `npm run build`, `npm run build:analyze` (build succeeded; CLI hit the sandbox timeout after completion).
- Deployment checklist: set Supabase env `REQUIRE_AUTH_FOR_PREVIEW=true`, align frontend flag, flush `preview_cache_entries` (cache key v4), and monitor for 401 spikes.

---

## Phase 5 – Gradual Production Rollout

**Objective**: Enable auth gating for cohorts while monitoring SLOs.

- Update env: set `VITE_AUTH_GATE_ROLLOUT=10` (Day 6), adjust to 50 then 100 as per cadence.
- Instrument telemetry:
  - `auth_modal_shown/completed/abandoned`
  - `preview_auth_failed`
  - `preview_completed/failed` with tier.
  - TTFP measurement using existing stage events.
- Monitoring:
  - Dashboard for auth modal conversion (>40%), preview success (>98%), JWT failures (<2%), TTFP p95 (<3s).
  - Alerts: Slack/PagerDuty for threshold breaches.

**Validation**:
- Real-time dashboards, Supabase logs, Sentry (if configured).
- Daily QA checklist of core flows per tier.

**Rollback**:
- Flip `VITE_AUTH_GATE_ROLLOUT=0` and redeploy.
- If edge functions enforce gating, set `REQUIRE_AUTH_FOR_PREVIEW=false`.

---

## Phase 6 – Anonymous Code & Schema Retirement

**Objective**: Remove unused anonymous paths once rollout reaches 100% and metrics are stable for ≥48h.

- Frontend removals:
  - Delete `anonToken` state, fingerprint utilities, AccountPromptModal, `loadAnonTokenFromStorage`, anonymous copy/flags.
  - Update entitlement types to `'free' | 'creator' | 'pro' | 'dev'`.
  - Simplify gating components (`TokenWarningBanner`, `ActionRow`, `StickyOrderRail`).
- Backend:
  - Delete `anon-mint` function.
  - Remove `X-WT-Anon` handling from `save-to-gallery`, `get-gallery`, `generate-style-preview`.
  - Drop `anon_token` columns/FKs after cache flush.
  - Flush `preview_cache_entries` and restart cache warmup.
- Database:
  - Archive tables to `_archive`.
  - Run `DELETE FROM anonymous_tokens`, drop table after retention window if approved.

**Validation**:
- `npm run lint && npm run build && npm run build:analyze && npm run deps:check`.
- `npm run dead-code:check`.
- `rg "anonymous"` should only match documentation/historical notes.

**Rollback**:
- Restore archived files/tables from git backups; requires redeploying previous build (documented in release notes).

### Phase 6 Outputs

- Store slices now assume authenticated sessions only (`src/store/founder/entitlementSlice.ts`, `sessionSlice.ts`, `previewSlice.ts`), and all anonymous helpers (`anonTokenStorage`, `deviceFingerprint`, account prompt actions) were removed alongside dependent selectors/types.
- Launchpad/Studio rely exclusively on the auth gate: `AccountPromptModal` was deleted, Studio saves invoke the auth modal when unauthenticated, and UI badges (token banner, sticky rail, checkout summary) default to the authenticated tier set.
- Gallery APIs and UI moved to JWT-only interactions (`src/utils/galleryApi.ts`, `src/pages/GalleryPage.tsx`), removing `X-WT-Anon` headers and prompting sign-in before fetching data.
- Preview utilities (`founderPreviewGeneration`, `previewGeneration`, `previewIdempotency`, `stylePreviewApi`, `previewQueries`) now generate idempotency keys and requests from Supabase sessions alone.
- Updated regression tests (`tests/studio/tones.spec.ts`) reflect the reduced entitlement tier union.
- Validation suite executed: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`, `npm run dead-code:check` (unused Radix/Tailwind helpers remain intentionally for other flows).

---

## Phase 7 – Monitoring & Analytics Hardening

**Objective**: Ensure observability aligns with new auth-only model.

- Confirm new telemetry events flow to analytics pipeline.
- Add structured logging in edge functions (`entitlement_resolved` with tier, watermark).
- Tune dashboards:
  - Auth modal funnel (hourly).
  - Preview success by tier (5 min windows).
  - JWT failure heatmap.
  - TTFP histogram with cache-hit segmentation.
- Configure alerts (critical/warning/info thresholds).

**Validation**:
- Simulate failures (invalid token) to see alerts.
- Compare pre/post rollout metrics for stability.

**Rollback**: Observability-only changes; keep dashboards for historical context.

---

## Phase 8 – Documentation, QA & Ship Readiness

**Objective**: Finalize documentation, QA evidence, and release package.

- Update knowledge base:
  - `README.md` (auth prerequisite).
  - `TECHNICAL-SPEC.md`, `CLAUDE.md`, `FOUNDER_WORKFLOW.md` to remove anonymous references.
  - This playbook linked from migration docs.
- Compile QA matrix:
  - Upload/crop (anon), preview (free/creator/pro), downloads, gallery, orientation change, checkout.
  - Telemetry spot-check results.
- Run final scripts: `npm run lint && npm run build && npm run build:analyze && npm run deps:check`.
- Prepare release notes including rollback instructions, cache flush timestamp, SLO targets.

**Validation**:
- Team walkthrough, sign-off checklist completed.

**Rollback**:
- If severe regression post-launch, revert to Phase 4 build and set flags to allow anonymous temporarily while investigating.

---

## Appendices

### Rollback Quick Reference

1. Set `VITE_AUTH_GATE_ROLLOUT=0`, `REQUIRE_AUTH_FOR_PREVIEW=false`.
2. Redeploy frontend + edge functions.
3. Restore archived anonymous tables if removed (within retention window).
4. Invalidate preview cache if necessary (`TRUNCATE preview_cache_entries`).

### Mandatory Checks Per Phase

| Phase | Commands |
|-------|----------|
| 1 | `npm run lint` |
| 2 | `npm run lint` |
| 3 | `npm run lint && npm run build` |
| 4 | `npm run lint && npm run build && npm run build:analyze` |
| 6 | `npm run lint && npm run build && npm run build:analyze && npm run deps:check && npm run dead-code:check` |
| 8 | `npm run lint && npm run build && npm run build:analyze && npm run deps:check` |

### Telemetry Events Summary

- `auth_modal_shown`, `auth_modal_completed`, `auth_modal_abandoned`
- `preview_auth_failed` (`reason`)
- `preview_started`, `preview_completed`, `preview_failed` (`tier`, `has_cache_hit`)
- `launchflow_*` events continue auto-tagging with authenticated tiers
- `entitlement_resolved` logs (edge functions)

Maintain consistent use of `emitStepOneEvent` and Launchflow analytics to satisfy Step One telemetry guardrails.

---

**Next Actions**

- Review this playbook with product, design, and backend owners.
- Once signed off, branch per founder workflow and execute Phase 1 tasks.
