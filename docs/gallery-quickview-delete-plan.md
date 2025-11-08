# Gallery Quickview Delete Mode – Implementation Plan

This document captures the implementation strategy for adding inline deletion controls to the Gallery Quickview strip without regressing Wondertone’s Launchflow → Studio orchestration, telemetry, or Supabase gallery contracts.

---

## Objectives
- Allow users to remove saved previews directly from the Gallery Quickview strip (`src/sections/studio/experience/GalleryQuickview.tsx:35-276`) while keeping the existing “My Gallery” page workflow intact.
- Match Wondertone’s premium UX bar: hover/touch affordances must feel intentional, respect reduced‑motion users, and never block the fast preview loop.
- Keep the Supabase gallery state canonical—deleting from Quickview should remove the entry everywhere (Quickview, Gallery page, future feeds) via the existing `deleteGalleryItem` edge function (`src/utils/galleryApi.ts:181-216`).
- Maintain analytics accuracy: continue logging preview loads/selections, and add visibility into delete intent/completion.

---

## Confirmed Product Decisions
- **Permanent removal:** Once a user deletes a thumbnail it is removed from their account immediately (Quickview + My Gallery) with no undo. Recovery would go through support; we will not purge Supabase storage in this phase.
- **Delete controls default off:** Every Studio visit starts with delete mode disabled; toggles are session-scoped only.
- **Desktop vs. mobile affordance:** Desktop relies on hover to reveal the delete icon (no wiggle). Mobile exposes a `Delete` pill beside `Refresh`; when active the cards wiggle subtly until the user taps `Done`.
- **Telemetry scope:** Log edit-mode enter/exit plus delete request/result events for performance tracking.
- **Auth fallback:** A 401 from Supabase automatically opens the auth modal and shows an explanatory toast so users can re-authenticate in context.
- **Preview reset semantics:** If the deleted thumbnail matches the currently loaded preview, immediately clear the preview. When the user has an uploaded photo we restore the raw crop view; otherwise we fall back to the pre-upload empty state.

---

## Phase R1 – State & Store Audit

### 1. Slice Consumers & Event Flow
- `useGalleryQuickview` (`src/store/hooks/studio/useGalleryQuickview.ts:50-189`) is the only runtime reader of `galleryItems`, `galleryStatus`, and `galleryRequiresWatermark`. It returns the tuple consumed by the UI (`items`, `loading`, `ready`, `error`, `requiresWatermark`, `refresh`, `invalidate`).
- `GalleryQuickview` (`src/sections/studio/experience/GalleryQuickview.tsx:35-276`) listens for the `gallery-quickview-refresh` window event (lines 82-91) and uses the hook values to render, highlight active previews, and display skeletons.
- `useGalleryQuickviewSelection` doesn’t access the slice directly but relies on the `requiresWatermark` flag passed through the hook to keep watermark telemetry correct when restoring a preview (`src/store/optional/galleryQuickviewSelectionEngine.ts:134-215`).
- `useGalleryHandlers` invalidates the slice + dispatches the refresh event whenever a user saves to the gallery (`src/hooks/studio/useGalleryHandlers.ts:94-103`). No other background listener mutates this slice.
- `GalleryPage` (`src/pages/GalleryPage.tsx`) performs standalone Supabase fetches, so Quickview deletions only need to remove the entry remotely + update the slice locally; the full page will naturally load fresh data on navigation.

### 2. Optimistic Update Requirements
- `GalleryQuickviewItem.position` (assigned in `mapGalleryItem`, `src/store/hooks/studio/useGalleryQuickview.ts:27-48`) feeds telemetry when users scroll/select items. Removal must reindex these positions to keep payloads dense and ordered.
- The slice (`src/store/founder/gallerySlice.ts:5-52`) currently exposes only bulk setters and `clearGallery`. We will add `removeGalleryItem(id)` that filters the array, rebuilds `position`, preserves `galleryStatus: 'ready'`, and bumps `lastFetchedAt` so staleness logic remains accurate.
- After a successful Supabase DELETE, we’ll call `removeGalleryItem`, then `invalidateGallery()` + `refresh()` to reconcile with the server and keep other tabs in sync. This mirrors the existing save flow’s invalidation pattern.
- `previewCacheStore` currently supports only `.clear()` (`src/store/previewCacheStore.ts:130-142`). We’ll add a targeted `deleteEntry(styleId)` helper so removing a thumbnail also evicts cached previews for that style, preventing stale hover previews.

### 3. Preview Reset Path When Active Item Is Deleted
- **User has an uploaded photo (`state.uploadedImage` truthy):**  
  1. Switch to the raw-photo pseudo-style via `state.selectStyle('original-image')` (`src/store/useFounderStore.ts:262-275`).  
  2. Resurface the cropped photo the same way `useHandleStyleSelect` does for the original style (`src/sections/studio/hooks/useHandleStyleSelect.ts:32-71`):  
     `state.setPreviewState('original-image', { status: 'ready', data: { previewUrl: state.croppedImage ?? state.uploadedImage, watermarkApplied: false, startedAt, completedAt }, orientation: state.orientation })`.  
  3. Reset the preview pipeline bookkeeping: `state.setPreviewStatus('ready')`, `state.setStylePreviewState('idle')`, `state.setPendingStyle(null)`, `state.setOrientationPreviewPending(false)`.  
  The user keeps their crop, smart crops, and canvas selections, so they can immediately pick a new tone.
- **No uploaded photo (gallery-only session):**  
  1. Clear the now-invalid preview via `state.setPreviewState(activeStyleId, { status: 'idle' })`, `state.setPreviewStatus('idle')`, `state.setStylePreviewState('idle')`, `state.setPendingStyle(null)`.  
  2. Wipe derived photo context: `state.setOriginalImage(null)`, `state.setCroppedImage(null)`, `state.setOriginalImageDimensions(null)`, `state.setOriginalImageSource(null)`, `state.clearSmartCrops()`.  
  3. Expose a helper to clear the selected style (e.g., `state.clearSelectedStyle()` that resets `selectedStyleId` and canvas selections) so we can fall back to the pre-upload empty state without mutating the store manually.  
  4. Optionally call `state.requestUpload()` to surface the upload CTA again and keep telemetry consistent.
- In both cases we’ll evict cached preview entries for the deleted `styleId` and emit a lightweight telemetry breadcrumb (`emitStepOneEvent` with `type: 'preview_cleared'`) so downstream analytics capture the transition.

---

## Phase R2 – UX Interaction Matrix

### 1. DOM / ARIA structure per breakpoint

| Surface | Structure | Notes |
| --- | --- | --- |
| Shared baseline | `<section aria-label="Gallery Quickview">` with header + toolbar and scroll container `<div role="list">`. | Keep current semantics; add an `aria-live="polite"` status node near the toolbar to announce delete-mode toggles. |
| Desktop cards | Wrapper `motion.div`/`motion.li` (role `presentation`) housing two siblings: a primary `<button>` around thumbnail/title (`aria-label="Load preview for Watercolor Dreams"`) and an absolutely positioned `<button>` for delete (`aria-label="Delete Watercolor Dreams"`). | Splitting buttons avoids nested `<button>` tags while preserving Framer `layout` animations. Delete button stays focusable on desktop with hover-driven opacity. |
| Mobile cards (delete mode off) | Same markup, but delete button carries `aria-hidden="true"` + `tabIndex={-1}` and remains visually hidden via `opacity-0 pointer-events-none`. | Prevents assistive tech from landing on inactive controls. |
| Mobile cards (delete mode on) | Delete button becomes focusable, gains `.wiggle` class, and `aria-describedby` pointing to a “This cannot be undone” hint. | `prefers-reduced-motion` media query disables wiggle, falling back to a color pulse. |
| Toolbar | `<div role="toolbar" aria-label="Quickview actions">` containing, in tab order: `Refresh`, `Delete`/`Manage`, and `Done` (conditional). | On desktop, `Manage` toggles edit mode; on mobile, the `Delete` pill swaps to `Done` when active. |
| Status text | `<span className="sr-only" role="status">Delete mode on/off</span>` updated whenever `deleteMode` changes. | Gives VoiceOver/NVDA users immediate feedback without extra visuals. |

### 2. Manage/Delete state transitions

State machine: `S0` (default) → `S1` (delete mode).

1. **Enter `S1` (desktop)** – Click `Manage`. Actions: `deleteMode=true`, show delete icons (no wiggle), announce “Delete mode on”.
2. **Enter `S1` (mobile)** – Tap `Delete` pill or long-press a card (≥350 ms). Actions: `deleteMode=true`, apply `.wiggle`, swap toolbar button to `Done` and focus it, announce status.
3. **Exit `S1`** – Triggered by tapping `Done`, pressing `Escape`, selecting a thumbnail, completing/cancelling a delete, or long-pressing again. Actions: `deleteMode=false`, remove wiggle, hide icons on mobile, announce “Delete mode off”.
4. **Delete flow** – Clicking the red `X` stops propagation, sets `candidateItem`, opens the confirm modal. Confirming adds the card id to `deletingIds`, calls the API, then removes the card, evicts caches, and exits edit mode if the list is empty. Cancelling returns focus to the originating delete button.
5. **Reduced-motion guard** – `.wiggle` animation lives inside `@media (prefers-reduced-motion: reduce)` so motion-sensitive users only see opacity changes.

### 3. Keyboard / focus requirements

- Toolbar buttons follow natural tab order; when `Delete` swaps to `Done`, programmatically focus the new control so focus never disappears.
- Card buttons are ordered so the primary action receives focus first, followed by the delete icon (only when active). This yields predictable tab stops for keyboard users.
- `Escape` exits delete mode when focus is inside the toolbar or scroll container; Radix already handles `Escape` within the modal.
- Long-press remains an optional touch shortcut; keyboard users rely on the toolbar toggle, aided by `role="status"` announcements.
- After a deletion completes, focus moves to the next card’s primary button. If no cards remain, focus returns to the toolbar `Refresh` button to avoid dead ends.

---

## Current Architecture Snapshot

| Concern | Notes |
| --- | --- |
| Data source | `useGalleryQuickview` hydrates `galleryItems` from Supabase and stores them inside the zustand `GallerySlice` (`src/store/founder/gallerySlice.ts:5-52`), exposing `items`, `refresh`, `invalidate`. |
| Selection flow | `useGalleryQuickviewSelection` lazily loads the optional `galleryQuickviewSelectionEngine` (`src/store/optional/galleryQuickviewSelectionEngine.ts:1-160`). It handles telemetry (`emitStepOneEvent`), orientation resets, smart crop hydration, preview cache updates, and Stage One instrumentation. |
| UI | Quickview renders `motion.button` cards (Framer Motion) with `group` hover styles and a single `onClick` per card for selection. There’s no second button inside the card today. |
| Feedback | Toasts + modals route through `useStudioExperienceContext` / `useStudioFeedback` (`src/hooks/useStudioFeedback.tsx`). Quickview does not currently consume the context. |
| Global coordination | Saving to the gallery uses `useGalleryHandlers` to invalidate the slice and fires a `gallery-quickview-refresh` custom event; Quickview listens for that event to re-fetch (`GalleryQuickview.tsx:82-91`). |

Implications: deletion should reuse the same context + invalidation hooks to stay aligned with other gallery entry points.

---

## UX Strategy

### Desktop
1. **Edit toggle** – space next to the existing “Refresh” button will host a “Manage”/“Done” toggle. When `Manage` is active:
   - Cards show a red circular `X` icon in the top-right corner.
   - Primary click targets remain intact: clicking the thumbnail still loads the preview; clicking the `X` opens the confirm dialog.
2. **Hover affordance (default)** – even when delete mode is off, hovering a card fades in the `X` icon with a short (150 ms) delay to prevent accidental deletes. No wiggle animation on desktop.

### Mobile / Touch
1. **Toolbar action** – on small screens, the Quickview header displays a `Delete` pill next to `Refresh`. Tapping `Delete` toggles edit mode (icons become visible and cards wiggle slightly, respecting reduced-motion settings). Tapping `Done` exits the mode.
2. **Long-press shortcut** – optional enhancement: long-pressing a thumbnail toggles edit mode, but the explicit button remains for discoverability.
3. **Exit affordance** – tapping `Done`, closing the confirm modal, or selecting a thumbnail exits edit mode automatically.

### Confirmation UX
- Reuse the Radix-based `Modal` component (`src/components/ui/Modal.tsx:1-109`) for a compact confirmation dialog.
- Include the thumbnail + style name inside the modal so users know exactly what they are deleting.
- Copy proposal:  
  **Title:** “Delete _Liquid Chrome_?”  
  **Body:** “This removes the saved preview from your gallery. This cannot be undone.”  
  Buttons: `Yes, delete it` (destructive) / `No, keep it` (secondary).

### Accessibility & Feedback
- Keep card buttons keyboard-accessible by converting the card wrapper to a `motion.div` plus internal `<button>` elements (`aria-label` for select, `aria-label="Delete <style>"` for the icon).
- Announce delete success via the existing toast pipeline (“Removed from gallery”), mirroring the Gallery page behavior (`src/pages/GalleryPage.tsx:246-320`).
- When edit mode toggles, set `aria-live="polite"` text (“Delete mode on/off”) for screen readers.

---

## State & Data Flow

### Local UI State
- `deleteModeActive: boolean` – toggled via Manage/Delete button or long-press.
- `candidateItem: GalleryQuickviewItem | null` – the item currently being confirmed.
- `deletingIds: Set<string>` – track in-flight deletions to disable buttons/spinners per card.

### Store / API Integration
1. On confirm:
   - Fetch `sessionAccessToken` via `useStudioUserState` (already used in `useGalleryQuickview`).
   - Call `deleteGalleryItem(item.id, accessToken)` from `src/utils/galleryApi.ts`.
2. On success:
   - Optimistically remove the item from the zustand slice. Options:
     - Add `removeGalleryItem(id: string)` to `GallerySlice`.
     - Or call `setGalleryItems(current.filter(...))`. Preferred: add a dedicated action for clarity.
   - Dispatch `useFounderStore.getState().invalidateGallery()` and `window.dispatchEvent(new CustomEvent('gallery-quickview-refresh'))` to keep other tabs/components in sync.
   - If the deleted item matches the `currentStyleId` loaded in Studio, immediately clear the preview and fall back to the user’s uploaded photo (if present) or the pre-upload empty state.
3. On failure:
   - Re-enable the delete button, exit loading, open the auth modal automatically on 401 responses, and show an error toast.

### Telemetry
- Extend `src/utils/galleryQuickviewTelemetry.ts` with three events:  
  `trackGalleryQuickviewDeleteModeChanged({ active })`,  
  `trackGalleryQuickviewDeleteRequested({ artId, styleId, position })`, and  
  `trackGalleryQuickviewDeleteResult({ artId, success })`.
- Wire these events where delete mode is triggered/confirmed to maintain parity with existing load/scroll/click tracking.

---

## Implementation Phases

| Phase | Goals | Key Files |
| --- | --- | --- |
| **Phase 0 – Scaffolding** | Introduce a `removeGalleryItem` action in `GallerySlice`, ensure `useGalleryQuickview` reuses the slice data, and add telemetry helpers. No UI yet. | `src/store/founder/gallerySlice.ts`, `src/utils/galleryQuickviewTelemetry.ts`, related tests. |
| **Phase 1 – UI Restructure** | Split each card into wrapper + two buttons, add the Manage/Delete toolbar controls, and introduce delete-mode state (desktop + mobile). No API calls yet; show placeholder confirm modal with static data. | `src/sections/studio/experience/GalleryQuickview.tsx`, CSS/animation snippet (likely `src/index.css` or local module). |
| **Phase 2 – API + Confirm Modal** | Connect confirm modal to real data, call `deleteGalleryItem`, manage loading state, and update the slice optimistically. Add toast feedback + edit-mode exit rules. | `GalleryQuickview.tsx`, `src/utils/galleryApi.ts`, `src/hooks/useStudioFeedback.tsx`. |
| **Phase 3 – Telemetry & Touch Polish** | Emit new telemetry events, add long-press shortcut (if desired), ensure wiggle animation respects `prefers-reduced-motion`, and verify custom events refresh other surfaces. | `GalleryQuickview.tsx`, `galleryQuickviewTelemetry.ts`. |
| **Phase 4 – QA & Regression Tests** | Add RTL/Vitest coverage to mock the slice + API, verifying: (a) button visibility toggles, (b) confirm modal flow, (c) optimistic removal and invalidation, (d) toast messaging. Consider Playwright smoke to ensure delete mode coexists with preview selection and Step One telemetry. | `tests/sections/GalleryQuickviewDeleteMode.spec.tsx` (new), existing store hook tests. |

---

## Phase R3 – API & Telemetry Contracts

### deleteGalleryItem contract
- **Endpoint:** `DELETE {SUPABASE_URL}/functions/v1/get-gallery?id={itemId}` (`src/utils/galleryApi.ts:181-216`, handler `supabase/functions/get-gallery/index.ts:420-462`).
- **Auth:** Requires bearer token; missing/invalid tokens return `401` with `{ error: 'Authentication required' }` or `{ error: 'Invalid authentication token' }`.
- **Responses:**  
  - `200` → `{ message: 'Gallery item deleted successfully' }` (wrapped as `{ success: true }`).  
  - `400` → `{ error: 'Missing gallery item ID' }`.  
  - `401` → auth errors above.  
  - `500` → `{ error: 'Failed to delete gallery item' }`.  
  - Network failure throws `TypeError`.
- **Rate limits:** Default Supabase function quota (≈60 req/min/IP). We’ll debounce UI actions to avoid rapid-fire calls.

### Telemetry schema additions
Extend `src/utils/galleryQuickviewTelemetry.ts` with:

| Event | Payload | When |
| --- | --- | --- |
| `gallery_quickview_delete_mode_changed` | `{ active: boolean, surface: 'desktop' \| 'mobile', timestamp }` | Every toggle of delete mode (enter/exit). |
| `gallery_quickview_delete_requested` | `{ artId, styleId, position, surface, hasUpload: boolean, timestamp }` | Immediately after the user confirms deletion, before the API call. |
| `gallery_quickview_delete_result` | `{ artId, styleId, success: boolean, errorCode?: 'auth' \| 'network' \| 'server' \| 'unknown', status?: number, durationMs: number, timestamp }` | After the API resolves or fails. |

These follow the existing `gallery_quickview_*` namespace so analytics dashboards can ingest them without schema changes; `sendAnalyticsEvent` already attaches timestamps.

### Error-handling branches + copy

| Scenario | Detection | UX response |
| --- | --- | --- |
| Auth expired | `response.status === 401` or error string contains “Authentication” | Toast: “Session expired. Please sign back in to manage your gallery.” → Trigger auth modal. |
| Network error | Fetch throws `TypeError` or `navigator.onLine === false` | Toast: “Delete failed. Check your connection and try again.” |
| Server error | `response.status >= 500` or error string “Failed to delete gallery item” | Toast: “Delete failed on our side. Please try again shortly.” (Log to console/Sentry.) |
| Missing ID (client bug) | Guard before calling API | Toast: “Something’s off—couldn’t find that gallery item.” (Log error, keep item.) |

All branches keep delete mode active unless the list becomes empty; we only exit automatically when no thumbnails remain.

---

## Phase R4 – Test Plan & Rollout Safeguards

### Automated coverage

1. **Store layer**
   - Extend `tests/store/gallerySlice.spec.ts` to cover `removeGalleryItem`, ensuring positions re-index and `lastFetchedAt` updates.
   - Add a `previewCacheStore` test for the new `deleteEntry(styleId)` helper so cache eviction works deterministically.
2. **Hooks**
   - `tests/store/useGalleryQuickview.spec.tsx`: simulate delete success and verify `removeGalleryItem` + `invalidateGallery` + `refresh` fire exactly once.
   - `tests/store/useGalleryQuickviewSelection.spec.tsx`: assert that deleting the active item triggers the preview reset helper (falls back to `original-image` or clears state).
3. **Component (RTL/Vitest)**
   - Mount `GalleryQuickview` with mocked store/telemetry and test flows:
     * Enter/exit delete mode (desktop + mobile viewport).
     * Hover-only delete icon visibility.
     * Confirm modal copy + focus return.
     * Delete success (optimistic removal, toast copy, telemetry calls).
     * Delete failure (auth, network, server) with toasts + mode persistence.
   - Snapshot test for reduced-motion mode (no wiggle class applied).
4. **E2E / Playwright (optional but recommended)**
   - Scenario: Upload photo → save preview → open Quickview → delete saved card → ensure preview resets correctly and telemetry events appear in the mocked analytics bus.
   - Mobile viewport run to validate the Delete/Done toolbar toggle and long-press gesture (if implemented).

### Manual QA checklist

| Scenario | Steps |
| --- | --- |
| Desktop happy path | Enter delete mode via Manage, delete a card, verify preview fallback + toast + telemetry logs (check browser console for `wondertone-analytics`). |
| Mobile happy path | Use touch emulator, tap Delete pill, observe wiggle, delete card, ensure Done button closes mode. |
| Delete while network offline | Toggle browser offline before confirming deletion, expect error toast + delete mode remains active. |
| Auth expiry | Manually clear Supabase session or mock 401; confirm auth modal opens and deletion aborts gracefully. |
| Reduced-motion users | Enable OS-level reduced motion → confirm wiggle animation is disabled and icons rely on opacity only. |
| Empty-state exit | Delete until no cards remain; ensure delete mode exits automatically and focus returns to toolbar. |

### Rollout & safeguards

- **Feature flag:** gate the new UI behind `ENABLE_QUICKVIEW_DELETE_MODE` (env-driven) so we can ship dark and toggle on after QA. Default `false` in prod until verified.
- **Kill switch:** if telemetry shows elevated delete failures or QA finds regressions, flipping the flag off reverts Quickview to current behaviour without redeploy.
- **Docs & internal comms:** add a short entry in `docs/performance-source-of-truth.md` noting the new delete flow so support knows how to advise users.
- **Metrics watch:** monitor `gallery_quickview_delete_result` failure rate and Supabase function latency for 24h post-launch.

With this safety net we can implement confidently, knowing regression risk is contained.

---

## Phase 8 – QA & Rollout Readiness

### Automated suite
- `npm run test -- tests/store/gallerySlice.spec.ts tests/store/previewCacheStore.spec.ts tests/store/previewResetHelpers.spec.ts tests/sections/GalleryQuickview.spec.tsx`
  - **Coverage**: gallery slice mutations (set/reset/remove), preview cache eviction helper, preview reset helpers (fallback to `original-image` and pre-upload idle state), and the fully-flagged Quickview UI (toolbar toggles, confirmation modal, delete success/failure, auth prompts, offline guard, and mobile wiggle state).
- `npm run lint` (passes with the existing warnings unrelated to this feature: `generate-preview-validators.ts`, `InsightsRail.tsx`, `useDeferredRender.ts`, `useDeferredReveal.ts`).
- `npm run build` (regenerates style registry, Vite build success with the standard HEIC/motion chunk warnings captured above).

### Manual spot checks (flag enabled locally)
1. Desktop Chrome: toggle delete mode, delete a card while online, verify toast + telemetry (via analytics console) and ensure preview resets to uploaded photo.
2. Desktop Chrome (pre-upload state): delete a card without a backing upload → confirm the center stage resets to “upload photo” CTA.
3. Mobile Safari (simulated via responsive tools): long-press enter delete mode, confirm wiggle animation + Delete/Done swap, delete a card and cancel, ensure modal closes cleanly.
4. Offline simulation (`Network > Offline`): attempt deletion, confirm toast (“You appear to be offline…”) and `gallery_quickview_delete_result` event with `errorCode: 'network'`.
5. Auth expiry: clear local storage access token, attempt deletion, verify auth modal opens before any network call.

### Telemetry verification
- Confirmed new events land in analytics stream by enabling the flag on staging and deleting a sample card:
  - `gallery_quickview_delete_mode_changed` fires with `{ active: true/false, surface }`.
  - `gallery_quickview_delete_requested` includes `{ hasUpload, surface }`.
  - `gallery_quickview_delete_result` records `{ success, errorCode?, durationMs, status }`.
- Dashboard update: add a lightweight chart monitoring delete success rate + error codes, plus a Looker/Amplitude alert when failure rate exceeds 5% over 15 minutes.

### Flag management
- Feature guard: `ENABLE_QUICKVIEW_DELETE_MODE` (default `false`). To enable:
  1. Set `VITE_ENABLE_QUICKVIEW_DELETE_MODE=true` in the target environment.
  2. Redeploy to regenerate the Vite bundle (flag is compile-time).
  3. Watch telemetry + Supabase logs for the first 24h; if failures spike, flip the flag off and redeploy (no code revert required).
- Rollback: set the env var back to `false` and redeploy; Quickview instantly returns to the legacy single-button UI without touching user data.

### Outstanding risks
- Playwright/e2e coverage is still pending; execute the planned smoke once CI capacity allows (focus on long-press entry + auth retry).
- Supabase delete handler still performs a soft delete; storage cleanup will be tackled in the follow-up infra workstream.

With these checks complete, Phase 8 is considered ✅ and the feature is ready for a staged rollout.

---

## Edge Cases & Guardrails
- **Pending preview load:** Prevent deletion while a card is in the “pending” state (already disabled today) to avoid double-loading states.
- **Reduced motion:** Disable wiggle animation via `@media (prefers-reduced-motion: reduce)` to stay compliant with accessibility guardrails.
- **Auth expiry:** If `deleteGalleryItem` returns 401, surface a toast prompting the user to re-authenticate and optionally trigger the auth modal.
- **Rate limiting:** Debounce delete requests (one at a time) or allow multiple but ensure `deletingIds` tracks each id so we don’t spam Supabase.
- **Offline / network errors:** Provide clear error toasts and keep the card visible; do not remove until the API confirms success.

---

## Testing & Validation Checklist
1. **Unit / Hook Tests**
   - `GallerySlice` – new `removeGalleryItem` action.
   - `GalleryQuickview` – rendering snapshot for edit mode, confirm modal workflow, long-press toggle logic.
2. **Integration**
   - Selecting a card, entering delete mode, cancelling, and ensuring selection telemetry still fires.
   - Deleting a card currently highlighted as active; preview panel remains stable.
   - Mobile viewport: toolbar shows `Delete`/`Done`, tapping toggles icons.
3. **Telemetry**
   - Verify `gallery_quickview_delete_requested` and `_result` events fire with correct payloads.
4. **Manual QA**
   - Desktop + mobile Safari/Chrome.
   - Reduced-motion OS setting ON.
   - Slow network simulation to confirm loading states and spinner overlays.
5. **Regression**
   - `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.
   - Confirm bundle deltas (Framer Motion already in use; wiggle animation should be pure CSS to avoid extra imports).

---

## Open Questions
1. Should delete mode persist across sessions/page reloads, or always default to off? (Recommendation: reset to off for safety.)
2. Do we need an “Undo” toast? This would require temporary retention of the deleted item and a restore API; currently not available.
3. Should deleting also clear any cached downloads for that preview (e.g., Supabase storage cleanup)? Today’s edge function handles soft deletes only; confirm with backend if additional cleanup is desired.

Once these answers are in, we can proceed with Phase 0 implementation while keeping Launchflow → Studio sequencing and telemetry intact.
