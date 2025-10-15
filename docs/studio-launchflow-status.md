# Studio Launchflow: Status & Next Steps

**Updated:** 2025‑10‑14  
**Author:** Codex  

---

## 1. Context Snapshot
- We blew past Git’s staged changes to reset the tree—there are **no active code edits** in the workspace right now.
- The goal remains: replace the old “Launchpad section → Studio” sequence with a harmonized flow where upload happens inline, the Studio is visible immediately, and users never see a random demo preview.
- Claude’s last implementation attempt removed the Launchpad banner and introduced a hero-style carousel in the Studio empty state, but it missed several UX goals. Those commits have been backed out.

---

## 2. Current Experience (unchanged from main)
1. **Hero CTA** leads to a full Launchpad section below the fold.
2. **Studio** still appears with a random sample preview until a user uploads.
3. **Mobile** users must scroll past Launchpad to reach the Studio; upload and edit live on different sections.

Pain points remain exactly as originally reported.

---

## 3. Harmonized Flow Requirements (agreed plan)
### Desktop
- Hero CTA expands an inline Launchflow accordion directly beneath the hero.
- Accordion contains the upload + analysis setup; once the crop completes it collapses into a *slim strip* with thumbnail + “Edit photo”.
- Studio preview is always visible with an **empty-state dropzone** in the canvas region.
- After upload, show a success toast and smooth-scroll the Studio into view.
- Smart crop modal stays full-screen; body is scroll-locked (no focus trap) while accordion is open.

### Mobile
- Same accordion logic, but accessed via hero CTA **and** a floating FAB.
- Accordion should appear as a full-width drawer so the Studio beneath doesn’t get pushed off-screen.
- FAB switches to “Edit photo” once a crop exists.

### Telemetry
- `launchflow_open` (hero/empty state/FAB)
- `launchflow_complete`
- `edit_photo_reopen`
- `empty_state_interaction`

---

## 4. Implementation Roadmap
1. **State scaffolding**
   - Add `launchpadExpanded`, `launchpadSlimMode` to `useFounderStore`.
   - Implement `setLaunchpadExpanded`, `setLaunchpadSlimMode`.
2. **Accordion wrapper**
   - New `LaunchflowAccordion` component.
   - Scroll-lock body while open; respect reduced motion.
   - Support hero CTA + empty-state CTA + FAB triggers.
3. **PhotoUploader relocation**
   - Move uploader/analysis into accordion.
   - Keep `SmartCropPreview` + `CropperModal` full-screen.
   - On completion: toast, set `launchpadSlimMode`, collapse after delay, scroll to Studio.
4. **Studio empty state**
   - Build `StudioEmptyState` with manual style carousel + dropzone CTAs.
   - Dim rails until `croppedImage` exists.
5. **Slim collapsed bar**
   - Show thumbnail, orientation, “Edit photo” button when `launchpadSlimMode` is true.
6. **Mobile FAB**
   - Show “Upload photo” → “Edit photo” depending on state; hide when accordion open.
7. **Analytics wiring** & QA
   - Hook events.
   - Test accessibility, reduced motion, mobile drawer behavior.

---

## 5. Open Decisions (already settled)
- ✅ Slim collapsed bar instead of full disappearance.
- ✅ Empty-state carousel is **manual**, not auto-rotating.
- ✅ Success toast stays.
- ✅ Accordion scroll-lock (no hard focus trap).
- ✅ Drawer experience on mobile.

No remaining design questions; next agent can jump straight into implementation following the roadmap above.
