# Save-to-Gallery Session Token Plan

> **Status — November 2025:** Implemented. Gallery and download flows now require authenticated Supabase sessions, and all anonymous headers described below are legacy references maintained for context.

## Objective
Eliminate the “Invalid authentication token” failure by guaranteeing every authenticated gallery interaction (save, list, delete, favorite, premium download) uses the real Supabase session token, while anonymous users remain gated. Preserve existing UI/UX, keep token debit logic limited to preview generation, and lay groundwork for durable future enhancements.

---

## Guiding Principles
1. **Single Source of Token Truth** – Expose the session JWT exactly once inside the store and consume that reference everywhere. No duplicated state, no stale aliases.
2. **Legacy Anonymous vs Authenticated Paths** – Prior iterations retained anon-token headers with graceful fallbacks. After the auth-only rollout, gallery endpoints accept Supabase JWTs exclusively while the UI gates anonymous visitors.
3. **Non-Intrusive Refactor** – Update only what is required; avoid cascading component changes or UI churn. Vendor APIs, telemetry events, and UX copy remain untouched.
4. **Future-Proofing** – Document the new contract, add guard rails (runtime warnings/tests) so regressions surface immediately, and keep the pattern discoverable for new modules.

---

## Implementation Plan

### 1. Store Architecture Review
- Inspect `SessionSlice` in `src/store/founder/sessionSlice.ts` to confirm `accessToken` is the authoritative session JWT.
- Audit `useFounderStore` consumers (Studio, Gallery, utils) for selectors that expect `sessionAccessToken`.
- Verify no other slices shadow the session token.

### 2. Token Exposure Strategy
- Add a derived getter on the session slice (e.g. `getSessionAccessToken()`), or provide a computed alias `sessionAccessToken` that references `accessToken` without duplicating state.
- Ensure the getter is read-only and always reflects the latest session update from `setSession`.
- Add inline documentation describing when to use access tokens vs anon tokens.

### 3. Consumer Alignment
- Update all callers (`StudioConfigurator`, `GalleryPage`, helper APIs such as `galleryApi.ts` and `premiumDownload.ts`) to import the new getter/selector.
- Ensure unauthenticated visitors are gated in the UI and never invoke gallery endpoints without a Supabase session.
- Preserve existing conditional logic (e.g. `if (!sessionUser) { prompt login }`) so the UI stays unchanged.

### 4. Edge Contract Validation
- Manually capture requests to `save-to-gallery` and `get-gallery` to confirm they now send `Authorization: Bearer <session JWT>` for authenticated users.
- Validate the Supabase Function accepts the token and returns 201/200 responses without “Invalid authentication token”.
- Ensure anonymous requests still fail with 401 and the frontend handles the error gracefully.

### 5. Telemetry & Token Accounting
- Verify galleries saves/downloads do **not** adjust token counters (`updateEntitlementsFromResponse` must remain untouched).
- Confirm existing toasts/analytics fire exactly as before (save success, already saved, error).
- Consider adding debug logging to detect future misuse (e.g., warn if an authenticated flow falls back to the anon key).

### 6. Testing Matrix
- **Authenticated Creator:** save to gallery, re-save (already exists), list gallery, delete, favorite, premium download.
- **Authenticated Free:** ensure gallery save works; premium download should continue gating if intended.
- **Anonymous:** UI shows locked state; attempting to save triggers login prompt and network request is not sent.
- **Magic-link login:** log in via email link and verify the token alias receives the new JWT post-`setSession`.
- Multi-browser smoke test (Chrome/Safari) and incognito to confirm no caching anomalies.

### 7. Documentation & Safeguards
- Update README/architecture notes describing the token getter and when to use it.
- Optionally add a small unit test (or runtime assertion) to confirm the session slice exposes the alias.
- Plan a short QA/monitoring window post-deploy to watch Supabase function logs for auth errors.

---

## Deliverables
1. Store changes exposing a single session-token accessor.
2. Updated authenticated gallery/premium download consumers.
3. Verification notes (DevTools headers, Supabase responses).
4. Documentation updates + this plan archived for future reference.


---

# Gallery Download & Lightbox Enhancements

## Phase 1 – Streamlined Download Control
- Remove the visual “X Downloads” badge from gallery cards (keep backend tracking intact).
- Introduce a primary purple “Download Image” button beneath the artwork using the Studio gradient styling.
- Wire the button to the existing download logic so premium/anon gating continues to behave exactly as before.

## Phase 2 – Action Row & Favorites Cleanup
- Reflow the quick-action strip (download / favorite / delete) to harmonize spacing and icon sizing with the new button.
- Ensure hover/focus states, tooltips, and accessibility labels remain consistent with design guidelines.
- Validate that anonymous users still see the CTA in a locked/disabled state with the correct prompt.

## Phase 3 – Lightbox Modal
- Add an “expand” icon overlay in the top-right corner of each thumbnail.
- Clicking the icon opens a lightbox showing the image at full resolution with close controls and basic metadata.
- Reuse signed URLs so premium users view the clean asset while free tiers still see the watermarked version.

## Phase 4 – Validation & QA
- Smoke test Creator, Free, and Anonymous accounts across desktop + mobile to confirm downloads and gating work as expected.
- Verify token balances remain untouched, analytics/toasts continue to fire, and navigation (back button, reorder canvas) behaves reliably.
- Document the updated gallery interactions for design/QA handoff.
