# Anonymous-to-Free Account Migration: Risk Analysis & Implementation Plan

**Prepared**: 2025-10-21
**Author**: Claude (Independent Analysis)
**Status**: DRAFT - Awaiting Review

---

## Executive Summary

**Objective**: Sunset anonymous users/tokens; require free account authentication before style generation. Preserve upload→crop→viewport preview pre-auth. Remove "anonymous" and "plus" tiers; retain Free (10 gens/mo), Creator (50), Pro (500).

**Current State**: 34 files with anonymous logic, 2 edge functions (anon-mint, generate-style-preview), 3 database tables (anonymous_tokens, anonymous_usage, preview_logs with anon FK), dual-path entitlement resolution, fingerprint tracking, soft/hard gate UX at 5th/10th generation.

**Migration Complexity**: MODERATE-HIGH. Anonymous path is deeply woven through store (1734 LOC across 5 slices), edge entitlements resolver (315 lines), preview idempotency (anonymous fallback), cache keys (anon_token dimension), and 4 UI modals.

**Key Risk**: Cache invalidation on tier change, entitlement drift during migration, idempotency key collision for migrated users, analytics schema breakage (anonymous→free event loss).

**Recommended Approach**: 3-phase rollout (prep → gating → cleanup) over 14 days with per-phase rollback gates and SLO monitoring.

---

## 1. SYSTEM AUDIT: Anonymous Dependency Map

### 1.1 Frontend Codepaths (24 files)

**Store Layer (5 slices, 1734 LOC total)**
- `entitlementSlice.ts` (542 LOC): Lines 245-280 mint anonymous token path, lines 295-338 reconcile anon entitlements, lines 434-490 anonymous quota checks
- `previewSlice.ts` (688 LOC): Line 337 passes `anonToken` to API, line 356 includes in idempotency key
- `sessionSlice.ts` (56 LOC): Line 43 loads `anonToken` from storage, preserves on session changes
- `types.ts` (48 LOC): Defines `EntitlementTier = 'anonymous' | 'free' | ...`
- `selectors.ts` (180 LOC): Exports tier-checking selectors used by 9+ components

**Utils & API (8 files)**
- `entitlementsApi.ts`: `mintAnonymousToken()` (lines 49-73), tier mapping includes 'anonymous' (line 126)
- `previewIdempotency.ts`: Line 33 uses `anonToken` as identity fallback in idempotency key generation
- `entitlementGate.ts`: Lines 107-134 have 4 anonymous-specific checks (fingerprint error, hard limit, soft limit, watermark)
- `stylePreviewApi.ts`: Line 60 sends `X-WT-Anon` header if `anonToken` present
- `anonTokenStorage.ts`: Persist/load anon token from localStorage (key: `wt_anon_token`)
- `deviceFingerprint.ts`: Collects browser fingerprint for anonymous tracking (108 LOC)
- `founderPreviewGeneration.ts`, `previewClient.ts`, `galleryApi.ts`: Pass anon token to edge functions

**UI Components (9 files)**
- `AccountPromptModal.tsx`: Shown at 5th generation for anonymous users (135 LOC)
- `TokenWarningBanner.tsx`: Displays soft/hard limits for anonymous (line 31 references tier)
- `ActionRow.tsx`: Checks `tier === 'anonymous'` for download/canvas gating
- `StickyOrderRail.tsx`, `QuotaExhaustedModal.tsx`, `TierRecommendation.tsx`, `CheckoutSummary.tsx`: Conditional rendering based on anonymous tier
- `StudioConfigurator.tsx`, `LaunchpadLayout.tsx`: Trigger account prompt modal

**Pages (2 files)**
- `GalleryPage.tsx`, `StudioPage.tsx`: Hydrate entitlements (includes anon path)

### 1.2 Edge Functions (2 functions, 491 LOC)

**`supabase/functions/anon-mint/index.ts` (176 LOC)**
- ENTIRE FUNCTION dedicated to anonymous token lifecycle
- Creates/updates `anonymous_tokens` table rows
- Calculates soft/hard limits (5/10) based on `preview_logs` usage
- Sets HTTP-only cookie `wt_anon_token`
- **Dependency**: Called by `entitlementSlice.ts` lines 246, 307

**`supabase/functions/generate-style-preview/entitlements.ts` (315 LOC)**
- Lines 92-314: `resolveEntitlements()` has dual path (authenticated vs anonymous)
- Lines 180-313: Anonymous branch queries `anonymous_tokens`, `anonymous_usage` (fingerprint), `preview_logs`
- Lines 232-233: Calculates hard/soft remaining based on token usage
- Lines 239-277: Fingerprint tracking (generation count, first/last seen, IP)
- Returns `EntitlementContext` with `actor: 'anonymous'`, `tierLabel: 'anonymous'`, `anonToken`, `fingerprintHash`, soft/hard limits

**`supabase/functions/generate-style-preview/index.ts` (main handler)**
- Line 52: Feature flag `entitlementsFlag` controls resolver path
- Passes `X-WT-Anon` header (line 60 in stylePreviewApi.ts) to entitlements resolver
- Uses anon token in preview_logs insertion (foreign key `anon_token`)

### 1.3 Database Tables (3 tables + 1 view)

**`anonymous_tokens` (entitlements.sql lines 29-37)**
- Columns: `token (PK)`, `free_tokens_remaining`, `dismissed_prompt`, `ip_ua_hash`, `month_bucket`, timestamps
- **Usage**: Stores soft limit state (5 tokens), dismissal flag, monthly reset bucket
- **Rows**: Unknown count (not tracked)
- **Foreign Keys**: `preview_logs.anon_token` references this table (lines 73-80)

**`anonymous_usage` (create_anonymous_usage.sql)**
- Columns: `id (PK)`, `fingerprint_hash`, `month_bucket`, `generation_count`, `ip_address`, `first_seen`, `last_seen`
- **Usage**: Tracks browser fingerprint generations to enforce cross-token limits
- **Index**: Unique on `(fingerprint_hash, month_bucket)` (line 14)

**`preview_logs` (entitlements.sql lines 39-56)**
- Column: `anon_token text` (nullable) with FK to `anonymous_tokens.token` (lines 73-80)
- **Usage**: Logs every preview generation with user_id OR anon_token (mutually exclusive)
- **Indexes**: `preview_logs_anon_idx on (anon_token, created_at)` (line 59)
- **Concern**: FK constraint `ON DELETE SET NULL` means orphaned logs if tokens deleted

**`v_entitlements` view (entitlements.sql lines 241-272)**
- **Does NOT include anonymous users** (lines 250-251: left join profiles + subscriptions)
- Anonymous users have NO representation in this view
- **Impact**: Server-side entitlements only work for authenticated users

### 1.4 Cache & Idempotency

**Preview Cache (`preview_cache_entries` table)**
- Cache key includes style_id, image_digest, aspect_ratio, quality (line 19 in cache/cacheKey.ts)
- **Does NOT include actor identity** (anon vs auth) in key
- **Issue**: Anonymous user generates preview → creates cache → signs up → same cache served but may have wrong watermark flag
- **Watermark Column**: Line 10 in preview_cache_entries.sql stores `watermark boolean`

**Idempotency Keys (previewIdempotency.ts:25-46)**
```typescript
const identitySource = sessionUserId ?? anonToken ?? fingerprintHash ?? 'public';
```
- Fallback chain means anonymous user with token gets different key than same user after signup
- **Collision Risk**: LOW (SHA-256 hash), but key format changes on auth means duplicate generations possible

**Client Cache (`stylePreviewCache` in previewSlice.ts)**
- LRU cache keyed by `[styleId][orientation]` (line 126)
- Size limit: 50 entries (line 65, recently increased from 12)
- **Does NOT consider tier/watermark** in cache key
- **Invalidation**: Lines 413-427 clear cache when orientation changes, BUT NOT when tier changes

### 1.5 Analytics & Telemetry

**Event Schema (telemetry.ts, launchflowTelemetry.ts)**
- `emitStepOneEvent()` logs tier in every event (line 6 in LaunchpadLayout.tsx)
- `trackDownloadCTAClick(tier)` includes tier label (line 36 in ActionRow.tsx)
- **Storage**: Console-only (no PostHog/Mixpanel integration per telemetry.ts:12)
- **Migration Risk**: MEDIUM - Tier transition events (anonymous→free) not tracked; analytics will show drop in "anonymous" events without corresponding rise in "free"

**Preview Analytics (previewAnalytics.ts)**
- Logs stage timing (generating, polling, watermarking)
- **Does NOT log tier changes mid-session**

### 1.6 UI/UX Flows

**Pre-Auth Flow (LaunchpadLayout.tsx)**
- Upload → Crop → Viewport preview: NO authentication required ✅ (meets requirement)
- Smart crop generation: client-side only, no API calls

**Anonymous Account Prompt (AccountPromptModal.tsx)**
- Triggered at 5th generation if not dismissed (lines 38-48)
- Shows completed preview thumbnails, benefits list
- CTA: "Create Free Account"
- **Hard Gate**: Appears at 10th generation (non-dismissible)

**Gallery Save (save-to-gallery/index.ts)**
- Lines 72-93: Requires either auth token OR anon_token
- Lines 95-120: Anonymous users CAN save to gallery (stored with NULL user_id)
- **Problem**: Gallery table (`user_gallery`) has `user_id uuid NOT NULL` (create_user_gallery.sql line 3) → anonymous saves will FAIL with constraint violation

---

## 2. RISK REGISTER

| # | Risk | Severity | Likelihood | Owner | Mitigation | Detection |
|---|------|----------|------------|-------|------------|-----------|
| **R1** | **Cache Watermark Mismatch** | 🔴 CRITICAL | HIGH | Backend | Clear preview_cache_entries on signup; add `tier` to cache key | Monitor watermark=true previews served to paid users via logs |
| **R2** | **Idempotency Key Collision** | 🟡 MEDIUM | MEDIUM | Backend | Migrate anon preview_logs to user_id on signup; keep idempotency key stable | Track duplicate preview_logs for same (image_hash, style, orientation) |
| **R3** | **Orphaned Gallery Entries** | 🔴 CRITICAL | HIGH | Backend | Migrate `user_gallery.user_id NOT NULL` to nullable OR backfill on signup | Query `user_gallery WHERE user_id IS NULL` count |
| **R4** | **Analytics Schema Breakage** | 🟡 MEDIUM | MEDIUM | Frontend | Add tier_transition events; map old anonymous events to free tier | Dashboard shows tier distribution; alert if anonymous>0 post-launch |
| **R5** | **SEO Ranking Drop** | 🟠 HIGH | LOW | Marketing | Keep landing page crawlable; ensure /create route accessible pre-auth | Monitor Google Search Console impressions/clicks |
| **R6** | **Accessibility Regression** | 🟠 HIGH | MEDIUM | Frontend | Ensure auth modal is keyboard-navigable, screen-reader friendly | Automated a11y tests (axe-core) on AuthModal |
| **R7** | **Cold Start Auth Latency** | 🟡 MEDIUM | HIGH | Backend | Prefetch Supabase session on app load; show skeleton during hydration | p95 time-to-first-generation >3s alert |
| **R8** | **Aborted Request Token Deduction** | 🔴 CRITICAL | MEDIUM | Backend | Only deduct token on `outcome='success'` in preview_logs; rollback on failure | Monitor `tokens_spent` vs `outcome` mismatch |
| **R9** | **Client-Side Gate Bypass** | 🔴 CRITICAL | LOW | Backend | Enforce entitlements in edge function; client checks are UX only | Alert on preview_logs with remaining_tokens<0 |
| **R10** | **Migration Data Loss** | 🔴 CRITICAL | LOW | DevOps | Backup anonymous_tokens, preview_logs before cleanup; keep for 90 days | Row count diff pre/post migration |
| **R11** | **Store State Drift** | 🟡 MEDIUM | HIGH | Frontend | Remove anonToken state atomically with tier checks; add runtime assertions | Sentry errors on `tier==='anonymous' && sessionUser!=null` |
| **R12** | **Edge Function Timeout** | 🟠 HIGH | MEDIUM | Backend | Async webhook mode for slow Replicate calls; 25s edge function limit | p95 edge function duration >20s alert |

---

## 3. MIGRATION & ROLLOUT PLAN

### Phase 1: Preparation (Days 1-5)

**Frontend Changes**
1. **Add Auth Gate Component** (`AuthGateModal.tsx`)
   - Triggered before first preview generation (not 5th)
   - Non-dismissible, blocks preview until signup/signin
   - Preserves uploaded image + crop in Zustand during auth flow
   - Show "Your photo is safe - sign in to continue" message

2. **Update Entitlement Types**
   - Remove `'anonymous'` and `'plus'` from `EntitlementTier` union
   - Update `TIER_ORDER` in entitlementGate.ts: `{ free: 0, creator: 1, pro: 2, dev: 3 }`
   - Remove `computeAnonymousRemaining()` function (entitlementGate.ts:37-64)

3. **Store Cleanup (entitlementSlice.ts)**
   - Remove lines 245-280 (`mintAnonymousToken` path in `hydrateEntitlements`)
   - Remove lines 295-338 (`reconcileEntitlements` function)
   - Remove `anonToken`, `fingerprintHash`, `fingerprintStatus` from state (lines 33-35, 172-174)
   - Remove `softLimit`, `softRemaining`, `hardLimit` from EntitlementState (lines 20-23)
   - Delete `src/store/utils/anonTokenStorage.ts` (53 LOC)
   - Delete `src/utils/deviceFingerprint.ts` (108 LOC)

4. **Preview API Updates**
   - Remove `anonToken` param from `generateStylePreview()` (stylePreviewApi.ts:52-66)
   - Remove `X-WT-Anon` header (line 60)
   - Remove `fingerprintHash` from `buildPreviewIdempotencyKey()` (previewIdempotency.ts:10, 31)
   - Change identity source to: `const identitySource = sessionUserId ?? 'unauthenticated';`

5. **UI Component Updates**
   - Delete `AccountPromptModal.tsx` (135 LOC) - replaced by mandatory AuthGateModal
   - Update `TokenWarningBanner.tsx`: Remove anonymous tier checks (lines 31-45)
   - Update `ActionRow.tsx`, `StickyOrderRail.tsx`: Remove `tier === 'anonymous'` conditionals
   - Remove account prompt triggers from `StudioConfigurator.tsx` (lines 89-97), `LaunchpadLayout.tsx`

**Backend Changes**
6. **Edge Function: generate-style-preview**
   - Update `entitlements.ts` resolveEntitlements():
     - Remove lines 180-313 (anonymous branch)
     - Throw `UNAUTHORIZED` error if no valid bearer token (line 117)
     - Remove `anonToken` param from function signature (line 95)
   - Update main handler (index.ts):
     - Remove `X-WT-Anon` header parsing
     - Return 401 if no auth token present
   - Add migration helper: `migrateAnonPreviewLogsToUser(userId, anonToken)` edge function

7. **Database Migration**
   ```sql
   -- Step 1: Make preview_logs.anon_token nullable (already is)
   -- Step 2: Add user_id to all anon preview_logs on signup via trigger
   CREATE OR REPLACE FUNCTION migrate_anon_previews_on_signup()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Migrate preview_logs from anon_token to user_id
     UPDATE preview_logs
     SET user_id = NEW.id, anon_token = NULL
     WHERE anon_token IN (
       SELECT DISTINCT token FROM anonymous_tokens WHERE ip_ua_hash = ...
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Step 3: Update user_gallery to allow migrating anonymous saves
   ALTER TABLE user_gallery ALTER COLUMN user_id DROP NOT NULL;

   -- Step 4: Add cleanup job (run post-migration)
   -- DELETE FROM anonymous_tokens WHERE created_at < NOW() - INTERVAL '90 days';
   ```

8. **Cache Invalidation**
   - Add `clearCacheOnTierChange(userId)` function in cacheMetadataService.ts
   - DELETE FROM preview_cache_entries WHERE cache_key LIKE '%watermark=true%' AND created_by_user_id = userId
   - Update cache key generation to include `tier` dimension: `${styleId}/${quality}/${aspectRatio}/${tier}/${imageDigest}.jpg`

**Testing**
9. **Create Test Matrix** (See Section 6)
10. **CI Checks**
    - Add TypeScript assertion: `type EnsureNoAnonymous = Exclude<EntitlementTier, 'anonymous'> extends never ? never : true;`
    - Lint rule: Fail on `tier === 'anonymous'` or `'anonymous'` string literal in src/
    - Bundle size check: Ensure anonTokenStorage.ts, deviceFingerprint.ts removed (expected -15KB)

**Rollback Gate**: Feature flag `WT_FLAG_REQUIRE_AUTH_FOR_PREVIEW` (default: false). Phase 1 ships behind flag OFF.

---

### Phase 2: Gating UX (Days 6-10)

**Gradual Rollout**
1. **Day 6-7**: Enable flag for 10% of traffic (Supabase edge function env var + client-side flag)
2. **Day 8-9**: Monitor metrics (see Section 4), increase to 50% if p95 TTFP <3s and success rate >98%
3. **Day 10**: 100% rollout if no P0 issues

**User Flow Changes**
- Landing page → /create route loads normally (upload/crop available)
- On "Generate Preview" click → Check `sessionUser`:
  - If null → Show AuthGateModal (non-dismissible)
  - If present → Proceed to preview generation
- AuthGateModal:
  - "Create Free Account" (default) or "Sign In" tab
  - Magic link flow (no password)
  - On success → Auto-trigger preview generation for pending style
  - On dismiss → Block (no fallback to anonymous)

**AuthGateModal Component**
```tsx
// Triggered before first generation, not 5th
const shouldShowAuthGate = !sessionUser && pendingStyleId !== null;
```

**Metrics to Watch**
- Signup conversion rate from AuthGateModal (target: >40%)
- Auth modal abandonment (bounce rate on /create after modal shown)
- p95 time from "Generate Preview" click to preview_url delivered (target: <3s)
- Preview generation success rate (target: >98%)

**Rollback Criteria**
- Signup conversion <25% for 24h → Revert to Phase 1 (anonymous allowed)
- p95 TTFP >5s for 2h → Investigate Supabase auth latency, potentially revert
- Preview success rate <95% for 6h → Check edge function errors, revert if UNAUTHORIZED spike

---

### Phase 3: Cleanup (Days 11-14)

**Code Removal**
1. Delete unused files:
   - `supabase/functions/anon-mint/index.ts` (176 LOC)
   - `src/components/modals/AccountPromptModal.tsx` (135 LOC)
   - `src/utils/deviceFingerprint.ts` (108 LOC)
   - `src/store/utils/anonTokenStorage.ts` (53 LOC)
   - Total: 472 LOC removed

2. Remove feature flags (hardcode require-auth behavior)

3. Database Cleanup
   ```sql
   -- Archive anonymous data (keep for 90 days for debugging)
   CREATE TABLE anonymous_tokens_archive AS SELECT * FROM anonymous_tokens;
   CREATE TABLE anonymous_usage_archive AS SELECT * FROM anonymous_usage;

   -- Drop unused tables (after 90 days)
   -- DROP TABLE anonymous_tokens CASCADE;
   -- DROP TABLE anonymous_usage;

   -- Remove unused FK constraint and column (optional, after 90 days)
   -- ALTER TABLE preview_logs DROP CONSTRAINT preview_logs_anon_token_fkey;
   -- ALTER TABLE preview_logs DROP COLUMN anon_token;
   ```

4. Update Documentation
   - CLAUDE.md: Remove anonymous tier references (lines 134-138)
   - TECHNICAL-SPEC.md: Update tier table (line 194), remove soft/hard gate logic (lines 136-143)
   - README: Update "How to add a new style" checklist (remove anon token testing step)

**Acceptance Criteria (Ship Gate)**
- ✅ Zero `tier === 'anonymous'` references in src/ (lint check passes)
- ✅ All tests pass with `EntitlementTier = 'free' | 'creator' | 'pro' | 'dev'`
- ✅ Bundle size reduced by >10KB (anon code removed)
- ✅ Supabase `anonymous_tokens` table has zero new rows (minting stopped)
- ✅ p95 TTFP <3s for 7 consecutive days
- ✅ Preview success rate >98% for 7 consecutive days
- ✅ Zero watermark-on-paid-tier incidents (cache invalidation working)

---

## 4. BUDGETS & CHECKS

### 4.1 Proposed SLOs

| Metric | Target | Measurement | Alert Threshold |
|--------|--------|-------------|-----------------|
| **p95 Time to First Preview (TTFP)** | <3s | From "Generate" click to preview_url in state | >5s for 1h |
| **Preview Success Rate** | >98% | `outcome='success'` / total preview_logs | <95% for 6h |
| **Auth Modal Conversion** | >40% | Signups / AuthGateModal impressions | <25% for 24h |
| **Cache Hit Rate** | >60% | preview_cache_entries hits / total requests | <40% for 6h |
| **Edge Function p95 Duration** | <8s | Supabase logs: function_duration_ms | >20s for 1h |
| **Memory per Request** | <128MB | Edge function memory usage | >200MB sustained |
| **Token Deduction Accuracy** | 100% | `tokens_spent=1` when `outcome='success'` | Mismatch count >0 |
| **Watermark Correctness** | 100% | Free tier gets watermark=true, Creator+ gets false | Violation count >0 |

### 4.2 CI/CD Hooks

**Pre-Merge Checks** (.github/workflows/ci.yml)
```yaml
- name: Lint Anonymous References
  run: |
    if grep -r "tier === 'anonymous'" src/; then
      echo "ERROR: Anonymous tier references found"
      exit 1
    fi

- name: TypeScript Type Safety
  run: |
    # Ensure EntitlementTier excludes 'anonymous'
    npx tsc --noEmit

- name: Bundle Size Guard
  run: |
    npm run build
    SIZE=$(du -k dist/assets/index-*.js | cut -f1)
    if [ $SIZE -gt 170 ]; then
      echo "ERROR: Bundle exceeds 170KB (gzipped limit)"
      exit 1
    fi

- name: Test Coverage
  run: |
    npm run test
    # Require >80% coverage on entitlementSlice.ts
```

**Post-Deploy Checks** (Supabase edge function logs)
```typescript
// Alert if new anonymous_tokens rows created
SELECT COUNT(*) FROM anonymous_tokens WHERE created_at > NOW() - INTERVAL '5 minutes';
// Expected: 0 (post Phase 2)

// Alert if preview_logs with anon_token AND created_at > migration_date
SELECT COUNT(*) FROM preview_logs
WHERE anon_token IS NOT NULL
  AND user_id IS NULL
  AND created_at > '2025-10-25';  // Day 11 migration
// Expected: 0
```

### 4.3 Metrics & Logging

**Add Structured Logging** (entitlements.ts)
```typescript
console.log(JSON.stringify({
  event: 'entitlement_resolved',
  tier: context.tierLabel,
  actor: context.actor,  // 'authenticated' only post-migration
  remaining: context.remainingBefore,
  watermark: context.requiresWatermark,
  timestamp: new Date().toISOString()
}));
```

**Add Telemetry Events** (telemetry.ts)
```typescript
emitStepOneEvent({
  type: 'tier_transition',
  from: 'anonymous',  // Won't exist post-migration
  to: 'free',
  trigger: 'signup',
  timestamp: Date.now()
});
```

**Cache Metrics** (preview_cache_entries)
- Add `created_by_user_id uuid` column to track cache owner
- Add `tier text` column to detect watermark mismatches
- Query: `SELECT tier, watermark, COUNT(*) FROM preview_cache_entries GROUP BY tier, watermark;`

---

## 5. TEST MATRIX

### 5.1 Functional Tests

| Scenario | User Type | Device | Expected Result | Acceptance |
|----------|-----------|--------|-----------------|------------|
| **Upload Photo** | Unauthenticated | Desktop | Upload succeeds, crop UI shows | ✅ No auth required |
| **Crop Photo** | Unauthenticated | Mobile | Crop succeeds, preview prompt shown | ✅ No auth required |
| **Generate 1st Preview** | Unauthenticated | Desktop | AuthGateModal blocks, "Sign Up" CTA | ✅ Generation gated |
| **Dismiss Auth Modal** | Unauthenticated | Mobile | Modal re-appears (non-dismissible) | ✅ Hard gate enforced |
| **Sign Up via Magic Link** | New User | Desktop | Email sent, redirect to /create, preview auto-triggers | ✅ Seamless flow |
| **Generate Preview** | Free (10 remaining) | Desktop | Preview succeeds, watermark applied, tokens=9 | ✅ Free tier works |
| **Exceed Free Quota** | Free (0 remaining) | Mobile | QuotaExhaustedModal, "Upgrade" CTA | ✅ Soft paywall |
| **Generate Preview** | Creator (50 remaining) | Desktop | Preview succeeds, NO watermark, tokens=49 | ✅ Paid tier works |
| **Download HD** | Creator | Mobile | Download succeeds, unwatermarked JPEG | ✅ Premium benefit |
| **Save to Gallery** | Free | Desktop | Gallery entry created with user_id | ✅ No orphaned saves |
| **Tier Upgrade** | Free → Creator | Desktop | Cache cleared, next preview unwatermarked | ✅ Cache invalidation |
| **Session Refresh** | Returning Free | Mobile | Entitlements loaded, remaining tokens persist | ✅ State hydration |
| **Orientation Change** | Creator | Desktop | Cache cleared, new preview generated for new aspect | ✅ Cache invalidation |
| **Offline Mode** | Free | Mobile | Upload/crop work, generation fails gracefully | ✅ Error handling |

### 5.2 Edge Cases

**Gallery Anonymized Saves (Pre-Migration)**
- Query: `SELECT COUNT(*) FROM user_gallery WHERE user_id IS NULL;`
- Expect: 0 (migration backfilled all rows OR constraint prevented saves)
- Test: Attempt gallery save without auth → Should return 401

**Idempotency Key Stability**
- Generate preview as anon → Sign up → Generate same (image, style, orientation)
- Expect: New preview generated (different identity source in key)
- Test: Verify 2 rows in preview_logs with different idempotency_key

**Fingerprint Hash Orphans**
- Query: `SELECT COUNT(*) FROM anonymous_usage WHERE last_seen < NOW() - INTERVAL '90 days';`
- Expect: Rows exist but unused (no cleanup needed immediately)

**Cache Watermark Mismatch**
- Free user generates preview (watermark=true cached)
- User upgrades to Creator
- Request same preview
- Expect: Cache miss (tier changed), new generation with watermark=false

**Aborted Requests**
- Start preview generation → Close browser tab mid-flight
- Expect: preview_logs row with `outcome='pending'`, tokens NOT deducted
- Test: Verify `remaining_tokens` unchanged

---

## 6. ARTIFACTS

### 6.1 Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Zustand)                  │
├─────────────────────────────────────────────────────────────────┤
│  Upload → Crop (NO AUTH) → Preview Button                       │
│                    ↓                                             │
│         ┌──────────────────┐                                     │
│         │  sessionUser?    │                                     │
│         └────┬────────┬────┘                                     │
│              │        │                                          │
│         NO ──┘        └── YES                                    │
│         ↓                  ↓                                     │
│  ┌─────────────┐    ┌──────────────────┐                        │
│  │AuthGateModal│    │ generatePreview()│                        │
│  │(mandatory)  │    │ + accessToken    │                        │
│  └──────┬──────┘    └────────┬─────────┘                        │
│         │                    │                                  │
│    Magic Link              POST /generate-style-preview          │
│         │                    │                                  │
│         ↓                    ↓                                  │
│  ┌──────────────┐    ┌──────────────────┐                       │
│  │ Supabase Auth│    │ Bearer: JWT      │                       │
│  │ (setSession) │    │ X-Idempotency-Key│                       │
│  └──────┬───────┘    └────────┬─────────┘                       │
│         │                     │                                 │
│         └─────────────┬───────┘                                 │
│                       ↓                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │ EDGE FUNCTION                  │
        │ generate-style-preview         │
        ├────────────────────────────────┤
        │ 1. resolveEntitlements(JWT)    │
        │    ↓                           │
        │ ┌──────────────────────┐       │
        │ │ v_entitlements VIEW  │       │
        │ │ (user_id, tier, quota│       │
        │ │  remaining_tokens)   │       │
        │ └──────────────────────┘       │
        │    ↓                           │
        │ 2. Check quota > 0?            │
        │    NO → 402 QUOTA_EXCEEDED     │
        │    YES ↓                       │
        │ 3. Check cache (3-layer)       │
        │    ├─ Memory LRU (256 entries) │
        │    ├─ Metadata (preview_cache_ │
        │    │   entries table)          │
        │    └─ Storage (preview-cache   │
        │        bucket)                 │
        │    HIT → Return cached URL     │
        │    MISS ↓                      │
        │ 4. Call Replicate API          │
        │    (Flux Dev model)            │
        │    ↓                           │
        │ 5. Apply watermark if tier=    │
        │    'free' (ImageMagick)        │
        │    ↓                           │
        │ 6. Upload to storage           │
        │    ↓                           │
        │ 7. INSERT preview_logs         │
        │    (user_id, tokens_spent=1,   │
        │     outcome='success')         │
        │    ↓                           │
        │ 8. UPDATE subscriptions        │
        │    SET remaining_tokens -=1    │
        └────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │  RESPONSE                │
        │  { preview_url,          │
        │    remaining_tokens,     │
        │    requires_watermark }  │
        └──────────────────────────┘
```

**Key Changes from Current**:
- ❌ Removed: `X-WT-Anon` header path
- ❌ Removed: `anonymous_tokens`, `anonymous_usage` table queries
- ❌ Removed: Fingerprint tracking logic
- ✅ Added: Mandatory JWT check (401 if missing)
- ✅ Added: AuthGateModal before first generation
- ✅ Simplified: Single entitlement path (authenticated only)

### 6.2 Risk Table (Consolidated)

See Section 2 above for full 12-risk register.

**Top 3 Mitigations to Implement First**:
1. R1 (Cache Watermark): Add `tier` to cache key + clear on signup
2. R3 (Orphaned Gallery): Backfill user_id in user_gallery before constraint change
3. R8 (Aborted Requests): Only deduct token when `outcome='success'`

### 6.3 "How to Add a New Style" Checklist (Post-Migration)

**Prerequisites**:
- [ ] User must be authenticated (no anonymous support)
- [ ] Supabase `style_prompts` table has row for new `style_id`

**Steps**:
1. Add style to `registry/styleRegistrySource.ts`:
   - `id`, `numericId`, `name`, `tone`, `tier` (free/premium)
   - `requiredTier` (if premium): 'creator' | 'pro'
   - Asset paths: `thumbnail`, `thumbnailWebp`, `thumbnailAvif`
2. Run `npm run thumbnails:generate` (creates WebP/AVIF from JPEG)
3. Run `npm run build:registry` (generates type-safe registry)
4. Run `npm run validate:registry` (checks numericId matches Supabase)
5. Test:
   - [ ] Free user: Can generate, gets watermark
   - [ ] Creator user: Can generate, NO watermark (if tier='free')
   - [ ] Creator user: Can generate premium style (if tier='premium' + requiredTier='creator')
   - [ ] Pro user: Can generate all styles unwatermarked
6. Run CI checks: `npm run lint && npm run test && npm run build`
7. Deploy: `git push` triggers CI → Vercel preview → Merge to main

**Removed Steps** (vs current process):
- ❌ No longer need to test with anonymous token
- ❌ No longer need to verify fingerprint tracking
- ❌ No longer need soft/hard limit testing at 5th/10th generation

---

## 7. TIMELINE & EFFORT ESTIMATE

| Phase | Duration | Engineering Days | Reviewer Days | Total |
|-------|----------|------------------|---------------|-------|
| **Phase 1: Prep** | 5 days | 4 days (1 FE + 2 BE + 1 Test) | 1 day | 5d |
| **Phase 2: Rollout** | 5 days | 2 days (monitoring + fixes) | 1 day | 3d |
| **Phase 3: Cleanup** | 4 days | 2 days (code removal + docs) | 0.5 day | 2.5d |
| **TOTAL** | **14 days** | **8 engineering days** | **2.5 review days** | **10.5d** |

**Assumptions**:
- 1 frontend engineer (React/Zustand)
- 1 backend engineer (Supabase/Deno edge functions)
- 1 QA/Test engineer (manual + automated tests)
- Phased rollout allows parallel work (dev continues during monitoring)

**Critical Path**: Phase 1 → Phase 2 (blocking), Phase 3 can start in parallel with Phase 2 at 100% rollout.

---

## 8. ROLLBACK STRATEGY

### Per-Phase Rollback

**Phase 1 Rollback** (Prep incomplete):
- ✅ Easy: Feature flag OFF, no code deployed to prod
- Effort: 0 minutes (flag flip)

**Phase 2 Rollback** (Gating UX issues):
- Trigger: Signup conversion <25% OR p95 TTFP >5s for 2h
- Action: Set `WT_FLAG_REQUIRE_AUTH_FOR_PREVIEW=false` in edge function env + client
- Effort: 5 minutes (env var update + cache clear)
- Data Impact: None (anonymous path still exists in code)

**Phase 3 Rollback** (Post-cleanup issues):
- Trigger: P0 bug discovered (watermark on paid tier, quota not enforced)
- Action: Restore anonymous_tokens table from archive, redeploy Phase 1 code
- Effort: 30 minutes (database restore + git revert + deploy)
- Data Impact: Preview_logs with NULL anon_token (migration already run)

### Time-to-Correctness Targets

| Incident | Detection | Diagnosis | Fix | Total MTTR |
|----------|-----------|-----------|-----|------------|
| Cache watermark mismatch | <5 min (alert) | <10 min (logs) | <15 min (cache flush) | **<30 min** |
| Auth modal conversion drop | <1h (metric) | <30 min (funnel analysis) | <5 min (flag flip) | **<2h** |
| Preview generation failure spike | <10 min (alert) | <15 min (edge logs) | <20 min (code hotfix) | **<45 min** |
| Tier upgrade cache invalidation | <15 min (support ticket) | <10 min (query cache) | <5 min (SQL delete) | **<30 min** |

---

## 9. RECOMMENDED DECISION

**GO/NO-GO**: ✅ **PROCEED with 3-phase rollout**

**Rationale**:
1. **Architecture Readiness**: 80% of anonymous code is isolated to entitlementSlice.ts + 2 edge functions; removal is surgical
2. **Risk Mitigation**: Top 3 risks (R1, R3, R8) have clear mitigations with <30min MTTR
3. **Business Value**: Simplifies codebase (−472 LOC), eliminates dual-path entitlement complexity, improves conversion tracking
4. **User Impact**: Minimal friction (magic link auth is <1min), pre-auth upload/crop preserved
5. **Rollback Safety**: Phase 2 flag allows instant revert with zero data loss

**Condition**: Complete Phase 1 prep (especially R1 cache invalidation + R3 gallery backfill) BEFORE enabling Phase 2 rollout.

**Timeline**: Start Phase 1 on Day 1, target Phase 3 completion by Day 14 (end of sprint).
