# Pending Style Lock – Phase 1 Recon

## Quick Reference
- `pendingStyleId` lives in the preview slice (`useFounderStore`), default `null`.
- Only one code path *sets* it: `startStylePreview(style)` ⇒ `set({ pendingStyleId: style.id, ... })`.
- Any time the store considers a preview “finished” (success, cached hit, error, abort, auth gate deferral, manual reset) it explicitly resets `pendingStyleId` to `null`.

## Entry / Exit Points

| Trigger | When it sets `pendingStyleId` | When it clears `pendingStyleId` | Side Effects |
| --- | --- | --- | --- |
| **Manual start** (`useHandleStyleSelect` → `startStylePreview`) | Immediately after entitlement/gate checks pass | - Cached preview hit<br>- Supabase success<br>- Supabase failure/exception<br>- Auth gate required (before modal shown) | Emits `emitStepOneEvent` `preview:start`; kicks telemetry stage logging; updates `stylePreviewStatus`; no entitlements change until completion |
| **Upload reset / new photo** (`setUploadedImage(null|dataUrl)`) | n/a (resets instead) | Resets to `null` along with preview cache & stage state | Ensures new upload never inherits a stale pending id |
| **Auto-generate** (`generatePreviews`) | *Never sets* (batch pipeline uses `previewStatus` only) | n/a | Means the UI currently stays active during batch regen |
| **Orientation change** (`setOrientation`) | n/a | Guard: if `pendingStyleId` exists, the setter returns early (orientation stays locked) | Prevents orientation flip mid-generation |
| **Gallery quickview hydrate** (`useGalleryQuickviewSelection`) | n/a | Explicit `store.setPendingStyle(null)` after seeding cache + `setPreviewState` | Emits `preview complete` telemetry afterwards |
| **Auth gate** (`registerAuthGateIntent` / `resumePendingAuthPreview`) | If auth required, the guard resets `pendingStyleId` *before* showing modal | On approved resume, `startStylePreview` runs again and sets it anew | Avoids user being stuck behind modal |
| **Manual reset** (`resetPreviews`) | n/a | `pendingStyleId` cleared with previews map & cache | Used by upload flow + manual reset button |
| **Error recovery** (catch block in `startStylePreview`) | n/a | Always sets `pendingStyleId: null` before surfacing error | Telemetry: `emitStepOneEvent status:error`, entitlements updates if error contains remaining tokens |

### Telemetry & Entitlements Touch Points
- `emitStepOneEvent` stages (`start`, `generating`, `polling`, `complete`, `error`) fire only while `pendingStyleId` equals the active style.
- Entitlement updates (`updateEntitlementsFromResponse`) only occur on successful Supabase return.
- `logPreviewStage` mirrors the telemetry sequence; success/failure logs depend on `pendingStyleId` still matching at the time of callback.

## UI Surfaces Observed

| Surface | Current Behavior w/ `pendingStyleId` | Notes |
| --- | --- | --- |
| `ToneStyleCard` (desktop rail) | Ignores `pendingStyleId`; card always clickable; readiness overlay only uses cached state | No disabled styling today |
| `ToneSection` accordion | Rendering pipeline doesn’t read `pendingStyleId`; cards stay active | Opportunity to inject disabled class via style entries |
| `MobileStyleDrawer` | Subscribes to `pendingStyleId` to auto-close drawer when generation starts | Still allows tapping new styles immediately after close |
| `CenterStage` CTA | Uses `pendingStyleId` for overlay messaging but not for button disable | Needs coordination with lock state once enforced |
| Launchpad upload | Resets `pendingStyleId` on new upload; no UI referencing it |

## Transition Summary

```
idle
 └─ startStylePreview(styleId) → pendingStyleId = styleId
     ├─ cached hit → pendingStyleId = null (no network)
     ├─ Supabase success → pendingStyleId = null, entitlements updated
     ├─ Supabase error  → pendingStyleId = null, stylePreviewStatus 'error'
     ├─ Auth gate required → pendingStyleId = null, modal opens
     └─ Upload/reset/generation reset → pendingStyleId = null
```

### Notable Gaps
- Guard only blocks *other* styles (`pendingStyleId !== style.id`). Re-clicking the same style bypasses the lock and launches concurrent jobs.
- UI does not consume `pendingStyleId` to disable interactions, so even legitimate locks are invisible to the user.
- Auto-preview batches never set `pendingStyleId`, so without additional gating the UI will still appear “unlocked.”

## Next Steps (toward Phase 2)
- Decide where to surface a `isLocked = pendingStyleId !== null` flag downstream (selector hook or derived readiness map).
- Enumerate all components that should render the disabled state and confirm accessibility semantics (aria-disabled, focus trapping).

---

# Phase 2 – UI Inventory & Snapshot

## Surfaces That Trigger Style Preview

| Surface | Component(s) | Interaction Path | Current Disabled State | Pointer Handling | Recommended Lock Presentation |
| --- | --- | --- | --- | --- | --- |
| **Desktop Style Rail** | `StyleAccordion` → `ToneSection` → `ToneStyleCard` | `ToneStyleCard` click → `useHandleStyleSelect` → `startStylePreview` | None – cards always active | No guard; pointer-events enabled | Add `isLocked` flag to card props; apply `aria-disabled`, suppress hover/press animations, show subtle “Finishing preview…” banner on active card |
| **Mobile Style Drawer** | `MobileStyleDrawer` → `StyleAccordion` stack | Same as desktop; drawer auto-closes when pending id set | None after close; drawer closes but styles remain tappable once reopened | No pointer suppression | Inject same `isLocked` logic; during lock keep drawer button states disabled and consider showing bottom sheet toast |
| **Story Layer (Right Rail)** | `StoryLayer` → `PaletteStrip` / `ComplementarySuggestions` | Complementary CTA can trigger `handleComplementarySelect` → `startStylePreview` | None; tiles look active | Direct call path needs lock check | Respect global lock: disable complementary cards, show tooltip “Wait for current preview” |
| **Center Stage CTA** | `CanvasPreviewPanel` actions (e.g., “Try another style”) | Buttons ultimately call `useHandleStyleSelect` or `startStylePreview` | Buttons stay enabled | No pointer guard | When locked, disable CTA buttons and show spinner overlay |
| **Orientation Bridge (auto regen)** | `OrientationBridgeProvider` | Force regenerate via `startStylePreview` | Programmatic; no UI to lock | Should honor lock before forcing | Guard at store level (skip when locked) and surface message in orientation UI |
| **Auth Modal Resume** | `resumePendingAuthPreview` | Calls `startStylePreview` post-login | Relies on store guard | No direct UI | Ensure guard handles in-flight state cleanly |
| **Potential stray** | Search for direct `startStylePreview` usage | `OrientationBridgeProvider` | n/a | n/a | Confirm no other direct invocations |

## Notes on Existing Styling Hooks
- `ToneStyleCard` already differentiates locked vs. selected vs. idle via class names—extend with `tone-style-card--disabled`.
- `ToneSection` and `StyleAccordion` can pass a derived `isLocked` to child cards to reduce re-computation.
- `MobileStyleDrawer` monitors `pendingStyleId` to auto-close; reuse that subscription for visual lock states.
- No Story rail components currently inspect `pendingStyleId`; new selector hook recommended (`usePreviewLockState`).

## Direct Calls to `startStylePreview`
- `useHandleStyleSelect` (primary path) – safe once store guard tightened.
- `OrientationBridgeProvider` (auto regenerate) – must check global lock first.
- `resumePendingAuthPreview` – triggered only after pending id cleared for auth; ensure we re-check when implementing guard.
- No other direct usages detected.

---

# Phase 3 – Store Strategy Design (Spec)

## Guard Placement
- **Primary guard** lives inside `startStylePreview`. It already centralizes all preview orchestration, so enforcing the lock here avoids duplicating checks across UI surfaces.
- No separate “queue manager” slice needed; we want a simple “no-op if anything is in flight” contract.
- Orientation bridge and auth resume continue to call `startStylePreview`; they automatically respect the guard.

## Guard Condition (Pseudo-code)

```ts
const { pendingStyleId, stylePreviewStatus } = get();

// Hard guard: single job at a time
if (pendingStyleId && pendingStyleId !== style.id) {
  return; // Another style is in flight
}

// Prevent re-triggering same style while in flight unless explicitly forced
if (pendingStyleId === style.id && !force) {
  return;
}

set({ pendingStyleId: style.id, ... });
```

Special cases:
- `force: true` (e.g., orientation regen) bypasses the “same style” block but still respects “no other style active.”
- `resetPreviews`, `setUploadedImage`, `startStylePreview` completion/error all ensure we revert to `null`.
- Auth gate path already resets `pendingStyleId` before showing the modal; keep that behavior so the user isn’t stuck.

## Cleanup Safeguards
- **Success:** existing success path sets `pendingStyleId: null`; keep as-is.
- **Cached hit:** early return already clears pending id; confirm the guard doesn’t block this fast path.
- **Errors / exceptions:** catch block resets id; ensure we cover aborts as well.
- **Unexpected failure:** add `finally { if (get().pendingStyleId === style.id) set({ pendingStyleId: null }) }` around the Supabase call to prevent leakage if an unforeseen exception happens before the catch.
- **Timeout safety:** consider introducing a watchdog (e.g., 90s) to clear `pendingStyleId` and surface an error toast if Supabase never resolves. (Optional but noted for implementation discussion.)

## API Exposure
- Add a derived selector hook `usePreviewLockState` that returns `{ isLocked: pendingStyleId != null, lockedStyleId: pendingStyleId }` for UI consumers.
- Existing `usePreviewReadiness` can include `isRegenerating` flag; we’ll extend it to mark disabled cards.

## Testing Plan

### Unit / Store
1. `startStylePreview` called twice with same style while pending → second call no-ops (verify Supabase mock not invoked).
2. `startStylePreview` called with different style while pending → no-op.
3. `force: true` regeneration allowed when pending id matches current style (orientation bridge scenario).
4. Success path resets `pendingStyleId`; preview status returns to idle.
5. Error path resets `pendingStyleId`; telemetry still fires `error`.
6. Auth gate path: ensure `pendingStyleId` cleared before modal; after resume the guard allows the request.
7. `resetPreviews`, `setUploadedImage(null)` clear `pendingStyleId`.

### Integration / UI
1. Desktop rail: clicking second card while another preview is running should not trigger new request; card stays disabled until completion.
2. Verify same-style spam doesn’t dispatch multiple Supabase calls (use mock counters).
3. Mobile drawer: after closing & reopening during a pending state, all tiles show disabled styling.
4. Story rail complementary CTA: when locked, clicking does nothing and messaging appears.
5. Orientation change during pending preview should remain blocked (existing guard).

### Telemetry Regression
1. Ensure `emitStepOneEvent` still fires `start`, `generating`, `polling`, `complete` exactly once per preview.
2. Confirm entitlements update only on completion.

## Implementation Notes
- When we enforce the guard, we should update any CTA copy (“Finishing Wondertone preview…”) to avoid UX confusion.
- UI components should treat `isLocked` as read-only; they won’t mutate state, only defer user actions.
- Logging: add a dev-level log (`console.info`) when a start request is ignored because of an active preview—helpful for debugging without polluting production logs.

# Next Steps
- Implement guard + cleanup in `startStylePreview` per spec.
- Introduce `usePreviewLockState` selector for UI consumption.
- Coordinate with UI teams to stage disabled styling (Phase 4). 

---

# Phase 4 – Lock State UX Spec

## Global Principles
- **Single preview in flight.** While `pendingStyleId !== null`, all style selection surfaces reflect a locked state.
- **Communicate, don’t surprise.** Visual affordances make it obvious why styles are unavailable (“Finishing preview…”). No silent failures.
- **Accessibility-first.** Disabled controls must expose `aria-disabled="true"` and remain focusable only if we provide context; otherwise, remove them from tab order.

## Visual Treatments by Surface

| Surface | Styling | Interaction Rules | Microcopy |
| --- | --- | --- | --- |
| **Desktop Style Cards** (`ToneStyleCard`) | - Apply `tone-style-card--locked` class: desaturate thumbnail (opacity 0.45), reduce glow, overlay subtle blur.<br>- For the active card, show a bottom ribbon (“Generating preview…”) with spinner.<br>- Non-active cards show dimmed glass overlay. | - `pointer-events: none` while locked.<br>- Remove hover/press animations.<br>- Keyboard focus skips disabled cards (use `tabIndex={-1}` when locked). | Active card ribbon: `Generating preview…`<br>Tooltip (if hovered while locked via reduced motion): `Finish current preview to explore more styles.` |
| **Mobile Drawer Tiles** (`ToneStyleCard` inside `MobileStyleDrawer`) | Same as desktop but adjust ribbon to pill anchored to bottom. | - Disable touch interactions (`pointerEvents="none"`).<br>- Close drawer automatically remains; when reopened mid-lock, tiles show disabled state. | Optional toast: `Hold tight – finishing your Wondertone preview.` |
| **Story Rail Complementary Styles** (`ComplementarySuggestions`) | Reduce saturation, add lock icon badge on top-left. | On click/keyboard, prevent navigation; show tooltip near icon. | Tooltip: `Finish current preview to try complementary styles.` |
| **Center Stage CTAs** (`CanvasPreviewPanel` buttons) | Primary CTA button becomes inline loader (spinner + “Generating…”). Secondary actions greyed out. | Set `disabled` attr and `aria-live="polite"` on status message. | Status banner above canvas: `Wondertone is rendering your preview…` |
| **Orientation Controls** (`OrientationBridge`) | Keep current “orientation pending” spinner but append copy when locked. | Do not trigger forced regeneration if global lock active. Show inline note under controls. | Copy: `Preview is already in progress. Orientation updates will resume afterward.` |

## Interaction & Accessibility
- **ARIA:**  
  - Disabled style cards: `aria-disabled="true"`, remove from tab order unless we offer a focusable status element.  
  - Active ribbon banner includes `role="status"` inside the card so screen readers hear “Generating preview…” automatically.  
  - Center-stage status uses `aria-live="polite"` to announce completion (“Preview ready – pick another style”).
- **Keyboard:**  
  - When lock engages, focus shifts to the status banner on the active card (or center stage) so keyboard users understand why controls vanished.  
  - If user attempts to tab back into the rail, skipped elements need no announcement; optional: place a hidden SR-only message before the list (“Styles locked until current preview finishes”).
- **Pointer events:**  
  - Strictly disable pointer events via CSS (`pointer-events: none`) to avoid race conditions.  
  - For complementary suggestions, keep element focusable but intercept `onClick` to show tooltip; alternative is to remove focus entirely and rely on ribbon messaging.

## Microcopy Summary
- **Active card ribbon:** `Generating preview…`
- **Completed transition (unlock):** `Preview ready – explore styles again.`
- **Tooltip for locked cards:** `Finish current preview to explore more styles.`
- **Toast (optional, mobile):** `Hold tight – finishing your Wondertone preview.`
- **Center stage status:** `Wondertone is rendering your preview…`
- **Orientation note:** `Preview is already in progress. Orientation updates will resume afterward.`

## Assets / Motion
- Reuse existing ready overlay styling; swap content for spinner + text when locked.
- Spinner: small framer-motion pulse (already used in Studio).
- Transition: fade/scale in 180ms to match current ready overlay animations.

## Implementation Pointers
- Extend `usePreviewReadiness` (or new `usePreviewLockState`) to supply `isLocked` + `isActiveLocked`.
- Tone card receives two new props: `isLocked` and `isLockedActive`.  
  - `isLocked` → apply disabled classes.  
  - `isLockedActive` → show ribbon + status.
- Center stage subscribes to `isLocked` to switch CTA copy + disable downloads.
- Story rail and complementary modules check `isLocked` and render lock icon overlay + tooltip.

## QA Checklist
- Verify lock state toggles within ~100ms of triggering preview start.
- Confirm disabled elements do not respond to tap, click, or keyboard activation.
- Screen reader pass (NVDA/VoiceOver) announces status changes.
- Responsive check: mobile drawer + small viewport rails show consistent messaging.
- Ensure lock clears correctly on success, error, auth resume, reset.

---

# Phase 5 – Integration Plan & Validation Matrix

## Implementation Checklist
1. **Store Guard**
   - Update `startStylePreview` to bail out whenever `pendingStyleId` is non-null (unless `force` with same style).
   - Wrap Supabase call in `try/finally` to guarantee cleanup.
   - Log when a start request is ignored due to active lock (dev-only).
2. **Selector Layer**
   - Add `usePreviewLockState` exposing `{ isLocked, lockedStyleId }`.
   - Extend readiness selector so cards know when they’re the active locked style.
3. **Desktop Rail**
   - Thread lock props through `ToneSection` → `ToneStyleCard`.
   - Apply disabled classes, pointer suppression, and status ribbon.
4. **Mobile Drawer**
   - Consume lock hook; disable cards and show optional toast when reopening during lock.
5. **Story Rail Complementary**
   - Block `handleComplementarySelect` when locked; show lock badge + tooltip.
6. **Center Stage Controls**
   - Disable style-switch CTAs, show status banner, announce via `aria-live`.
7. **Orientation Bridge**
   - Skip forced preview regeneration when global lock active; surface inline note.
8. **Telemetry Sanity**
   - Re-check Step One events and preview stage logging after guard change.

## Validation Matrix

### Manual Flows
| Scenario | Steps | Expected |
| --- | --- | --- |
| Successful preview | Upload → pick style | Rail locks, status ribbon (“Generating preview…”); unlock on completion |
| Supabase error | Simulate API failure | Lock clears, error surfaced, cards re-enable |
| Same-style spam | Rapid click same tile | Only first request issued, subsequent clicks ignored |
| Cross-style spam | Trigger other cards during lock | No new requests; cards remain disabled |
| Orientation swap | Attempt change mid-lock | Orientation controls show “Preview in progress” note; no regeneration |
| Auto-generate batch | Trigger auto previews | Guard remains idle; ensure messaging still consistent |
| Gallery hydrate | Load gallery item while lock active | Lock clears via gallery reset; new preview respects guard |
| Auth pause/resume | Trigger auth gate, login, resume | Guard allows resume; lock re-engages during resumed preview |
| Upload reset | Upload new photo mid-lock | `pendingStyleId` cleared; rail unlocked |

### Automated Tests
- Store unit tests (see Phase 3 checklist) covering guard, force regen, error cleanup, auth resume, reset.
- Component tests verifying locked card styling and status ribbon.
- Integration test (vitest/MSW) ensuring duplicate clicks don’t spawn multiple fetches.

### Regression Checks
- Step One telemetry sequence matches baseline (start → generating → polling → complete/error).
- Entitlement updates only fire on successful completion.
- No stale `pendingStyleId` after aborted or timed-out requests.

### Sandbox / Performance
- Use throttled network / delayed Supabase mock to observe long-running lock (UI remains responsive).
- Test on mobile Safari/Chrome for touch interactions during lock.
- Monitor console for guard logs to confirm duplicates are being skipped.

## QA Script Summary
1. Execute manual scenarios above, capturing results (screen recordings optional).
2. Run automated suite: `npm run test -- startPreviewLock` (new store tests), `npm run test -- ToneStyleCard`.
3. Validate telemetry counters in dev tools or monitoring dashboards.
4. Perform smoke regression: upload → generate → change orientation → gallery save → regenerate.
5. Share findings + artifacts before merging implementation. 
