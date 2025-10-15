# Studio Launchflow Harmonized Plan

**Author:** Codex  
**Date:** 2025‑10‑14  
**Goal:** Eliminate the “random demo image” surprise, remove vertical dead space, and blend Launchpad + Studio into a single continuous flow that respects both first‑time and returning users.

---

## 1. Experience Principles
- **Immediate Clarity:** Landing on `/create` should instantly communicate how to start (upload) and what you’ll get (Studio configurator). No scrolling required to “find” the product.
- **One Mental Model:** Upload → See your photo → Style & purchase. The UI should keep those steps spatially contiguous.
- **Low Cognitive Overhead:** Don’t overwhelm new users with every control until they’ve taken the first step, but let power users skip straight to styling.
- **Premium Storytelling:** Preserve the hero moment (“Start Your Masterpiece”) while making the workflow efficient.
- **Re-entry Friendly:** Returning subscribers shouldn’t re-live onboarding; the path to styling must be immediate.

---

## 2. Target Architecture Overview
```
Hero Section
├── Upload CTA (“Start the Magic”)
└── Secondary CTAs (Browse styles, learn more, etc.)

Launchflow Accordion (collapsed by default)
├── Expands inline beneath hero when upload CTA is tapped
├── Contains existing PhotoUploader flow (analysis + crop)
├── Auto-collapses after successful upload/crop
├── Remains reopenable via “Edit Photo” control

Studio Configurator (always visible below)
├── Empty-state canvas before upload
├── Left rail (styles) and right rail (actions) muted until photo ready
├── Activates in-place once upload completes

Floating Upload FAB (mobile only)
├── Provides persistent entry point regardless of scroll position
```

---

## 3. Page Layout & States

### 3.1 Default State – No Upload Yet
- Hero visible at top with primary CTA.
- Launchflow accordion collapsed (shows a slim “Upload your photo to begin” teaser).
- Studio preview below shows empty state: large dropzone, friendly copy, secondary upload button, link to try sample.
- Left/right rails rendered but dimmed/disabled with explanatory tooltips.
- On mobile, floating upload FAB anchored bottom-right.

### 3.2 Launchflow Expanded
- Triggered by hero CTA, studio empty-state CTA, or mobile FAB.
- Accordion expands inline under hero (covers what used to be the Launchpad section).
- Background dim (optional) to focus attention; ensure expansion pushes Studio down smoothly (no jump cuts).
- Contain the current PhotoUploader → AI analysis → Crop workflow.
- Provide escape hatch (e.g., “Cancel” / “Skip for now”) that closes accordion without progress loss.

### 3.3 Upload Complete
- On crop success:
  - Show success toast (“Photo ready! Explore styles below.”).
  - Auto-collapse accordion with 200 ms ease; focus scroll to the Studio preview to highlight the result.
  - Studio preview now shows the user’s image; rails become interactive.
  - Provide unobtrusive “Edit photo” link near the preview that reopens the accordion with previous state.

### 3.4 Returning / Prefilled Sessions
- If `croppedImage` exists at mount:
  - Accordion stays collapsed.
  - Studio loads immediately with user’s image.
  - Empty-state copy hidden.
- If user has partially completed upload:
  - Auto-expand accordion with stored state (analysis/crop in progress).

---

## 4. Component Responsibilities

### 4.1 Hero / ProductHeroSection
- No structural change; update upload CTA handler to open accordion (`setLaunchpadExpanded(true)`).
- Provide additional CTA (e.g., “See styles first”) that jumps to style carousel without interfering with flow.

### 4.2 LaunchflowAccordion (new wrapper)
- Houses existing `PhotoUploader` logic.
- Props:
  - `isOpen`, `onClose`, `onComplete`.
  - `initialStage` / persisted data for “Edit Photo”.
- Animations via `framer-motion` or CSS transitions; ensure reduced-motion fallback.
- On `onComplete`, call parent to update store and auto-collapse.

### 4.3 StudioConfigurator adjustments
- Render even when `croppedImage` is null; show empty state overlay.
- Empty state includes call-to-action that reopens accordion.
- Ensure left/right rails respect `croppedImage` presence for enabling.
- When accordion collapses, trigger `scrollIntoView` for preview (respect reduced motion).

### 4.4 Floating Upload FAB (mobile)
- Component pinned bottom-right with safe-area insets.
- Hidden when accordion open or upload complete (optional).
- On tap: `setLaunchpadExpanded(true)` (same accordion pattern as desktop).

---

## 5. State & Interaction Flow

1. **Landing**
   - `launchpadExpanded = false`
   - `croppedImage = null`
   - Studio shows empty state.

2. **User taps Hero CTA**
   - `launchpadExpanded = true`
   - Accordion animates open.

3. **Upload & Crop**
   - Existing store mutations (setUploadedImage, setCroppedImage, etc.) run inside accordion.
   - On crop complete: `croppedImage` set; `launchpadExpanded` toggled to `false`.

4. **Studio Activation**
   - Empty state replaced with preview card.
   - Rails re-enable.
   - Optional toast/animation to draw attention.

5. **Edit Photo**
   - Studio “Edit photo” control sets `launchpadExpanded = true` and passes current image into uploader for adjustment.

6. **Mobile FAB**
   - Always available until upload complete; toggles same state.

---

## 6. UX Details & Accessibility
- **Keyboard / Screen Reader**: Accordion uses `aria-expanded`, `aria-controls`; focus trapped inside while open; return focus to triggering CTA when closed.
- **Empty State Copy**: “Upload your photo to see it transformed here. You can always preview styles first.” Include `role="button"` dropzone for accessibility.
- **Reduced Motion**: If user prefers reduced motion, skip animate height; show/hide instantly with fade.
- **Progress Indicators**: Keep existing analysis/crop progress overlays within accordion.
- **Edit Path**: Provide subtle inline link (“Change photo”) near preview; doesn’t disrupt marketing copy.

---

## 7. Implementation Phases

### Phase 1 – Layout Scaffolding
- Introduce `LaunchflowAccordion` shell with dummy content.
- Ensure accordion expand/collapse pushes Studio correctly on desktop & mobile.
- Render Studio empty state (non-interactive) beneath hero.

### Phase 2 – Move PhotoUploader Into Accordion
- Relocate current Launchpad logic inside accordion.
- Wire state so upload/crop results still hit `useFounderStore`.
- Implement auto-collapse on completion, plus success toast.
- Add “Edit photo” control that reopens accordion.

### Phase 3 – Refinements
- Empty-state polish (design, copy, responsive).
- Floating upload FAB for mobile.
- Analytics events (`launchflow_open`, `launchflow_complete`, `edit_photo_reopen`).
- Reduced-motion handling, focus management, and a11y review.
- Performance tuning (preload necessary modules when accordion opens).

---

## 8. Testing Plan
- **Functional:** Upload → crop → Studio; re-open edit; decline crop; refresh with existing photo.
- **Responsive:** Desktop large screens, iPad, Android & iOS mobile (portrait/landscape).
- **A11y:** Keyboard navigation, VoiceOver/TalkBack, prefers reduced motion.
- **Regression:** Ensure Studio still loads immediately for users with stored photos; no random demo images.
- **Analytics:** Validate new events fire, monitor adoption (how many users expand accordion vs. upload via empty state).

---

## 9. Success Metrics
- % of sessions with accordion expansion (baseline should be near 100% for new users).
- Drop-off between upload and canvas preview (should decrease).
- Time-to-first-style selection (should decrease).
- Canvas order & download conversions (should hold or improve due to clearer flow).

---

## 10. Rollback Strategy
- Accordion can be feature-flagged (`WT_FLAG_LAUNCHFLOW_HARMONIZED`).
- If issues arise, keep existing Launchpad section rendered below hero and disable accordion behavior.
- All state management changes should be backward compatible so no user data is lost.

---

This plan merges the emotional energy of the current hero with a streamlined, intuitive workflow. Users land, immediately see the Studio they’ll use, and traverse upload → preview in one continuous movement—no confusing demo images, no unnecessary scrolling.***
