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
