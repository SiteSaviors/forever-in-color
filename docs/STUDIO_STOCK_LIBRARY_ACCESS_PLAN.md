# Studio Stock Library Access Buttons – Implementation Plan

## Objective
Add pre-style-generation CTA buttons (`Upload New Photo`, `Browse Our Library`) beneath the Studio canvas preview so users can always reopen Launchflow or the Stock Library before generating any style. Buttons must match Wondertone's premium aesthetic and disappear automatically once a style preview exists.

## Guardrails & Notes
- Preserve Launchflow → Studio telemetry and state (`useFounderStore`, preview slice, entitlement gating).
- Buttons should only render when no style preview has been generated yet (cropped image exists but preview state is not `ready`).
- Actions reuse existing callbacks from `CanvasPreviewPanel`: `onOpenLaunchflow` and `onBrowseStyles`.
- Layout must mirror the gradient CTA grid styling (full-width on desktop, stacked on mobile).

## Micro-Phased Approach

### Phase 1 – Deep Research & State Mapping *(Status: ✅ Complete)*
- `CanvasPreviewPanel` already receives all preview + orientation signals (`previewStateStatus`, `previewHasData`, `currentStyle`, `hasCroppedImage`) and renders `ActionGrid` only when `previewStateStatus === 'ready'` and `currentStyle` exists. We’ll piggyback on the inverse of that condition for the new buttons.
- `CenterStage` wires `onOpenLaunchflow` and `onBrowseStyles` to telemetry-aware handlers (`handleOpenLaunchflowFromEmptyState`, `handleBrowseStylesFromEmptyState`) so invoking them from the new CTA preserves analytics + gating.
- Final trigger: `showPreStyleCtas = Boolean(croppedImage && !previewLocked && (previewStateStatus !== 'ready' || !previewHasData || !currentStyle || currentStyle.id === 'original-image'))`. This ensures the buttons stay visible until the first non-original preview finishes and avoids flicker while a preview is still generating (`previewLocked` guards mid-request states).

### Phase 2 – UI Skeleton & Trigger Logic *(Status: ✅ Complete)*
- Added `showPreStyleCtas` flag in `CanvasPreviewPanel` guarding `croppedImage` + preview readiness; renders only when no style preview is available and the preview isn’t locked.
- Inserted a new CTA block in the same container as `ActionGrid` with two buttons wired to `onOpenLaunchflow` and `onBrowseStyles`, including ARIA labels and responsive flex behavior.
- Buttons inherit the `max-w-[720px]` wrapper + spacing so layout parity is maintained, preventing jump when the ActionGrid swaps in.

### Phase 3 – Premium Styling & Iconography *(Status: ✅ Complete)*
- Imported Lucide `UploadCloud` and `Images` icons, added gradient/glass styling with hover/focus treatments matching existing CTAs while preserving rounded geometry.
- Buttons inherit the responsive flex container (stack on mobile, align horizontally on desktop) with large hit targets and subtle shadow transitions for a premium feel.
- Focus rings and contrast align with Wondertone accessibility standards: primary button uses purple glow ring, secondary uses white ring; both maintain 4.5:1 contrast against the background.

### Phase 4 – QA, Regression Sweep, & Documentation *(Status: ✅ Complete)*
- Verified UX manually:
  - Fresh upload / stock selection shows the new CTA pair; they disappear after triggering any style preview and reappear if the user uploads/picks a new source before generating again.
  - ActionGrid takes over once previews finish, with no layout shift.
- Regression checks: `npm run lint` (existing repo warnings only). Build/analyze/deps unchanged from earlier runs.

## Reporting
After completing each phase, update its status above (Pending → In Progress → Complete) with concise notes so reviewers can track progress at a glance.

### CTA Refinement Addendum *(Status: ✅ Complete)*
- Adopted slimmer pill styling across both pre-style and post-style CTAs by restyling `ActionGrid` and introducing a shared secondary action row.
- Secondary actions (Change Orientation / Save to Art Gallery) now appear as soon as a photo is uploaded, hiding only while previews are locked. Save-to-gallery handles both preview renders and base uploads by persisting the original image when no preview exists.
