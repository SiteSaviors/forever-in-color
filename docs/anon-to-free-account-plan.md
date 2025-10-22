# Anonymous Flow Sunset & Free Tier Consolidation Plan

> **Status — November 2025:** Migration complete. Supabase edge functions now require authenticated Wondertone accounts, and anonymous token minting has been fully decommissioned. The details below are preserved for historical context and describe the legacy architecture that preceded the auth-only backend.

## Why We’re Changing Course
- Anonymous sessions add complexity: separate anon tokens, watermarked cache entries, gating logic, and edge-function fallbacks.
- Upgrading mid-session (anon → Creator) causes mismatched preview state and broken controls.
- Unifying on authenticated accounts simplifies entitlements, testing, analytics, and future features.

Goal: Require users to create a free account before generating styles while preserving the “upload & crop” experience for anonymous visitors.

---

## Architecture Overview
### Legacy State (Pre-Migration)
- **Store slices** mint anon tokens (`mintAnonymousToken`), hydrate anon entitlements, and cache watermarked previews using anon keys.
- **Edge functions** treat anon and authenticated flows differently (`generate-style-preview`, `save-to-gallery`, `get-gallery`).
- **Studio UI** lets anonymous users generate watermarked previews, then relies on state flags to control downloads and saves.

### Target State (Live)
- Anonymous users can upload/crop and preview their original image but must create an account to generate styles.
- All entitlements come from real Supabase users (`free`, `creator`, `plus`, `pro`). No anon token minting.
- Edge functions expect a JWT for generation/gallery operations; watermarking is decided server-side based on tier.

---

## Migration Phases

### Phase 0 – Prep & Audit
- Inventory components reliant on anon state (session slice, entitlement slice, preview cache, download gating).
- Identify Supabase tables/functions referencing anon tokens.
- Document testing matrix: existing user tiers, magic-link login, gallery flows.

### Phase 1 – UX Gating
- Introduce a “Create Free Account” modal when an anonymous user clicks a style card.
- Update CTAs and copy to explain the free tier (10 generations/month).
- Ensure upload/crop still works anonymously, but preview generation is blocked.

### Phase 2 – Store Cleanup
- Remove `mintAnonymousToken`, anon token storage, and related selectors.
- Simplify `hydrateEntitlements` to always fetch authenticated entitlements and default new users to the `free` tier.
- Adjust preview cache to store only the latest preview for the authenticated user (no public vs. premium branching).

### Phase 3 – Edge Function Simplification
- Update `generate-style-preview`, `save-to-gallery`, `get-gallery`, etc., to require a Supabase session token.
- Remove anon-token fallback logic in the entitlements resolver; `free` tier replaces `anonymous`.
- Revisit preview caching buckets—frontend no longer needs to reference `preview-cache-public` explicitly.

### Phase 4 – Data Migration & QA
- Optionally purge obsolete anon token data / tables.
- Regression test across tiers: generation, downloads, gallery, purchases.
- Validate telemetry & analytics now map all events to authenticated users.

---

## Risks & Mitigations
- **User friction:** first-time visitors must sign up to generate. Mitigate by streamlining sign-up and highlighting free benefits.
- **Legacy data:** existing anonymous gallery entries may become orphaned. Decide whether to migrate or let them expire.
- **Coordination:** changes span frontend, edge functions, and Supabase schema; plan for a feature branch + staged rollout.

---

## Deliverables
1. Updated Studio gating to prompt account creation.
2. Simplified store slices with authenticated-only entitlements.
3. Edge functions that rely solely on JWT auth.
4. QA sign-off + runbook documenting the new flow and removal of anonymous support.
