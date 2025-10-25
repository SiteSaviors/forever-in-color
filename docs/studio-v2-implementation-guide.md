# Wondertone Studio v2 – Implementation Guide (Final Authority)

**Owner:** Codex  
**Audience:** Engineers executing the Studio v2 rebuild  
**Status:** Authoritative; follow verbatim. No deviations without product approval.

This document removes all guesswork. It captures exactly what the user expects after their prior implementation frustrations. Every section below is a requirement.

---

## 1. Product Goals

1. **Preview-first studio:** The center column must always showcase the generated art and its in-room view.  
2. **Optional canvas purchase:** Ordering a canvas happens only via an explicit modal CTA; canvas is clearly optional.  
3. **Story & insights relocate to right rail:** Educate users about each style before and after upload.  
4. **Zero surprises:** Every button, animation, and copy block in this guide must be implemented exactly.  
5. **Reuse proven logic:** Reuse existing cropper/orientation logic and checkout state; do not invent new flows.

---

## 2. Layout Overview (Desktop)

```
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Left Rail    │ Center Workspace            │ Right Insights Rail       │
│ (existing)   │ • Sticky preview card       │ • “Wondertone Story &     │
│              │ • 2×2 ActionGrid            │    Insights” teaser/full  │
│              │ • Canvas-in-room preview    │ • “Discover” cards        │
│              │ • ConfidenceFooter          │ • Palette strip           │
│              │ (Story removed from here)   │ • Curated styles (2 tiles)│
│              │                             │ • Outline secondary CTA   │
│              │                             │ • Share badges            │
└──────────────┴────────────────────────────┴──────────────────────────┘
```

- Left rail remains the existing style navigation (no changes besides prop updates).  
- Center column never renders Story content; it houses preview + ActionGrid + Canvas-in-room + ConfidenceFooter.  
- Right rail now owns all story/insight modules. It must scroll internally when content is taller than the viewport.

---

## 3. Right Rail Specification

### 3.1 Pre-upload (no photo uploaded)

- Wrapper: sticky container (`lg:sticky`) with internal scroll (`max-height: calc(100vh - 88px)` and `overflow-y:auto`).  
- Headline: **“Wondertone Story & Insights”** (static on first load).  
- Subtext: “Select a style to discover the magic behind the art.”  
- Body: semi-transparent, dotted, rounded rectangle that fills the rail.  
  - Inside text: “Your Wondertone Story & Insight will appear here once you upload a photo.”  
- Animation: subtle shimmer or three pulsing dots at bottom (low-cost CSS animation).  
- Behavior:
  - When the user highlights a style in the left rail (even pre-upload), update headline to “Wondertone Story & Insights — *{Style Name}*” and show a teaser card if metadata exists.
  - Teaser card structure:
    - Title: “The Story Behind *{Style Name}*”  
    - Two-sentence teaser (from `style.description` for now; easy to override later).  
    - Palette: six color chips (duplicate palette values if only three are available).  
    - Footer text: “Upload a photo to unlock the full narrative.”  
  - If the selected style lacks palette metadata, keep the dotted placeholder instead of chips.

### 3.2 Post-upload (photo uploaded & preview ready)

Render the following modules **in this order** (each separated by 24px):

1. **Story Header**  
   - Title: “Wondertone Story — *{Style Name}*”  
   - Short intro sentence (reusing teaser copy).

2. **Discover Cards**  
   - Four pill-like cards in a grid (2×2 or stacked on mobile):  
     - “Narrative”  
     - “Emotion”  
     - “Perfect For”  
     - “Signature Detail”  
   - Each card shows a heading and one-sentence blurb (placeholders acceptable; editable content file recommended).

3. **Palette Strip**  
   - Same component as today but ensure hex codes display.  
   - Hover/click triggers analytics event `story_teaser_palette_hover`.

4. **Curated Style Recommendations**  
   - Exactly two tiles per style, side-by-side (each ~200px wide).  
   - Clicking a tile must immediately swap the preview to that style (call existing style selection logic).  
   - Show thumbnail, name, and one-line description. Locked styles should appear disabled with existing gating behavior.

5. **Secondary Canvas CTA**  
   - Outline button (bordered, transparent background).  
   - Copy: “Create Canvas Print” (subtext: “Orders ship in 5 days”).  
   - Clicking opens the same canvas modal as the primary CTA with `sourceCTA = 'rail'`.

6. **Share Module**  
   - Inline badges (no modal).  
   - Buttons: Twitter, Facebook, Pinterest, Copy Link.  
   - Shared text: `Just turned a favorite photo into art with {style_name}. @Wondertone #ArtFromMemory #TheAIArtCurator`.  
   - Copy link copies image URL (or preview) to clipboard.

If metadata is missing for any section, fall back to simple explanatory copy; never leave empty whitespace.

---

## 4. Center Column Specification

- **Preview Card**: unchanged layout except orientation badge remains top-left.  
- **ActionGrid (2×2)**:
  - Top-left: **Download Image** (purple gradient, uses existing handler).  
  - Top-right: **Create Canvas** (purple gradient).  
    - Disabled until a photo is uploaded and cropped.  
    - When first enabled, animates with a gentle pulse/glow for 2 seconds.  
    - On click → open canvas modal via `openCanvasModal('center')`.  
  - Bottom-left: **Change Orientation** (black background, white outline).  
    - Calls the existing cropper logic via window callback (`__openOrientationCropper` as currently used).  
  - Bottom-right: **Save to Gallery** (black/white outline, reuses existing state).  

- **Canvas-in-room Preview**: remains stacked below ActionGrid with “See it in your space” header. No toggles needed.  
- **ConfidenceFooter**: remains underneath as is.

No Story components should remain in `CanvasPreviewPanel.tsx`.

---

## 5. Canvas Modal Specification

### 5.1 Trigger & State
- CTA buttons (ActionGrid + secondary right-rail) call `setCanvasCheckoutModalOpen(true, source)` where `source` is `'center'` or `'rail'`.  
- Modal should not open until a cropped image/preview exists (`hasCroppedImage === true`). The button remains disabled otherwise.  
- Selections (size, frame, enhancements) persist while the same style is active; reset when switching styles.

### 5.2 Modal Layout (Desktop)
```
┌───────────────────────────────────────────────────────────────┐
│ Backdrop: 60% black, slight blur                              │
│ ┌───────────────────────────────┬───────────────────────────┐ │
│ │ Left Column                  │ │ Right Column            │ │
│ │ • Canvas-in-room preview     │ │ • Header with style chip│ │
│ │   (max-h 320px)              │ │ • Orientation pills      │ │
│ │ • Mini style badge (thumb)   │ │ • Size selector (grid)   │ │
│ │ • Caption: “Preview updates…”│ │ • Frame selector         │ │
│ │                               │ │ • Enhancements toggle    │ │
│ │                               │ │ • Order summary          │ │
│ │                               │ │ • Trust block            │ │
│ └───────────────────────────────┴───────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### 5.3 Required Content
1. **Header (right column)**  
   - Mini badge: 48×48 style thumbnail (fallback to original image).  
   - Title: “Configure Your Canvas”  
   - Subtext: “Museum-grade materials · Ships in 5 days · 100% satisfaction guaranteed”.

2. **Orientation Section**  
   - Pills for Portrait / Square / Landscape.  
   - Clicking a pill triggers the existing cropper modal (same as ActionGrid).  
   - Display current orientation label (e.g., “Current: Portrait”).  
   - Do not auto-refresh preview on selection; rely on cropper completion logic.

3. **Size Selector**  
   - Grid of available sizes for the current orientation (reuse `CANVAS_SIZE_OPTIONS`).  
   - Each card shows label + price; selected card uses purple border and check icon.

4. **Frame Selector**  
   - Toggle for floating frame.  
   - When enabled, show sub-buttons for “Black” and “White.”  
   - Default to Black when enabling; revert to “none” when disabling.

5. **Enhancements**  
   - “Living Canvas AR” toggle (uses existing enhancement logic).  
   - Price copy “+ $59.99” (matches current values).

6. **Order Summary**  
   - List selected size, frame, enhancements.  
   - Total pulled from `computedTotal()` with live updates.

7. **Trust Block (beneath summary)**  
   - Row of three items:  
     - ⭐ “4.9 • 1,200+ collectors”  
     - 🚚 “Ships in 5 days”  
     - 🛡️ “100% satisfaction guarantee”

8. **Primary CTA**  
   - Button text: “Complete Your Order →”  
   - On click:  
     1. Reset checkout store.  
     2. Close modal with reason `'purchase_complete'`.  
     3. Navigate to `/checkout`. (We will embed checkout inline in a later iteration.)

9. **Close Controls**  
   - Top-right × button.  
   - Clicking backdrop or pressing ESC also closes modal.  
   - On close (without purchase), analytics capture reason (`dismiss`, `cancel`, `esc_key`, `backdrop`) + time spent + configured items.

### 5.4 Mobile Behavior
- Modal becomes full-screen with top header and sticky bottom CTA.  
- Left/right columns stack vertically.  
- Same content order as desktop.

---

## 6. Orientation & Cropper Rules

- Do not modify existing cropper modal logic.  
- `Change Orientation` on ActionGrid and orientation pills inside the canvas modal both call the same handler (`window.__openOrientationCropper`).  
- When cropper completes, existing orientation update flow remains intact (no auto-preview regeneration unless current logic already does so).  
- Keep orientation preview mismatch/watermark handling unchanged.

---

## 7. Curated Styles Interaction

- Cards must:
  - Display style thumbnail, name, one-sentence description.  
  - Show premium lock overlay if the style is gated.  
  - On click (allowed): call existing `useHandleStyleSelect` hook to switch previews.  
  - On click (locked): show upgrade modal via existing logic.
- Cards animate with slight scale/glow on hover/focus.  
- Each click fires `curated_style_click` with properties listed in analytics section.

---

## 8. Copy Reference (Exact Strings)

| Element | Copy |
|---------|------|
| Right rail pre-upload headline | “Wondertone Story & Insights” |
| Right rail pre-upload subtext | “Select a style to discover the magic behind the art.” |
| Placeholder text | “Your Wondertone Story & Insight will appear here once you upload a photo.” |
| Story teaser footer | “Upload a photo to unlock the full narrative.” |
| Secondary CTA | Button label: “Create Canvas Print” · Subtext inside button: “Orders ship in 5 days” |
| ActionGrid buttons | As described in Section 4 |
| Canvas modal header | “Configure Your Canvas” |
| Canvas modal subheader | “Museum-grade materials · Ships in 5 days · 100% satisfaction guarantee.” |
| Trust items | ⭐ “4.9 • 1,200+ collectors” · 🚚 “Ships in 5 days” · 🛡️ “100% satisfaction guarantee” |
| Share badges text | `Just turned a favorite photo into art with {style_name}. @Wondertone #ArtFromMemory #TheAIArtCurator` |

All strings must be configurable via constants to ease future updates.

---

## 9. Analytics Events (Required)

Implement the following events in `src/utils/analytics.ts` (or equivalent), ensuring they fire with the specified properties:

| Event | Trigger | Properties |
|-------|---------|------------|
| `story_teaser_view` | Teaser/placeholder rendered | `styleId`, `source: 'pre-upload'|'post-upload'` |
| `story_teaser_palette_hover` | Palette chip hovered/clicked | `styleId`, `swatchHex` |
| `story_teaser_expand` | User expands full story | `styleId` |
| `curated_style_click` | Curated tile clicked | `currentStyleId`, `clickedStyleId`, `position`, `allowed` |
| `canvas_primary_cta_click` | ActionGrid CTA clicked | `styleId`, `orientation` |
| `canvas_secondary_cta_click` | Right rail CTA clicked | `styleId`, `orientation` |
| `canvas_modal_open` | Modal opened | `styleId`, `orientation`, `canvasSize`, `frame`, `enhancements`, `sourceCTA` |
| `canvas_modal_close` | Modal closed without purchase | `reason`, `configuredItems`, `timeSpentMs` |
| `canvas_modal_orientation` | Orientation change request from modal | `styleId`, `orientation` |
| `canvas_checkout_step_view` | Checkout step viewed | Existing step event + `context: 'modal'`, `step` |
| `canvas_checkout_success` | Successful payment | `amount`, `currency`, `styleId`, `size`, `frame`, `enhancements` |
| `canvas_modal_error` | Error in modal | `step`, `errorCode`, `message` |
| `story_share_click` | Share badge clicked | `styleId`, `platform` |

Ensure events fire in staging before production rollout.

---

## 10. Mobile Adjustments

- Right rail content becomes an accordion list beneath the preview:  
  - “Wondertone Story & Insights” (collapsible)  
  - “Discover” (collapsible)  
  - “Palette” (collapsible)  
  - “Curated styles” (still two tiles side-by-side)  
  - “Order Canvas Print” (outline button)  
  - “Share” badges  
- Canvas modal = full-screen sheet with sticky bottom CTA.  
- Curated tiles become smaller rectangles; still side-by-side.

---

## 11. Implementation Phases & File Checklist

### Phase A – Story & Layout

| Task | Files |
|------|-------|
| Implement `StoryLayerTeaser` (pre-upload teaser + fallback) | `src/components/studio/story-layer/StoryLayerTeaser.tsx` |
| Update `StoryLayer.tsx` to toggle between teaser and full story stack | same directory |
| Create `InsightsRail.tsx` (new wrapper for right rail modules) | `src/components/studio/InsightsRail.tsx` |
| Update `StudioConfigurator.tsx` to mount `InsightsRail` and remove old canvas config | `src/sections/StudioConfigurator.tsx` |
| Ensure right rail scroll container and gradient fade hints | same |
| Relocate curated styles (two tiles) | `src/components/studio/story-layer/CuratedStyleCards.tsx` |
| Remove story render from center column | `src/sections/studio/components/CanvasPreviewPanel.tsx` |

### Phase B – Canvas Modal

| Task | Files |
|------|-------|
| Add modal state + CTA callbacks | `src/store/useFounderStore.ts` (or new store) + `CanvasPreviewPanel.tsx` |
| Add secondary CTA inside `StoryLayer.tsx` | same |
| Build `CanvasCheckoutModal.tsx` with layout described in Section 5 | new file |
| Reuse existing orientation & cropper logic in modal | `CanvasCheckoutModal.tsx`, `StudioConfigurator.tsx` |
| Ensure modal closes via X/backdrop/ESC with analytics | modal file |
| Primary CTA resets checkout and navigates to `/checkout` | modal file |
| Add trust block, order summary, animations | modal file |

### Phase C – Clean-up & Enhancements

| Task | Files |
|------|-------|
| Remove legacy canvas config components from rail | `StickyOrderRail.tsx`, `CanvasConfig.tsx` |
| Ensure ActionGrid uses new callbacks | `CanvasPreviewPanel.tsx`, `ActionGrid.tsx` |
| Add glow/pulse for Create Canvas availability | `ActionGrid.tsx` |
| Add gentle glow when orientation/canvas view updates | preview components |
| Implement share badges inline (no modal) | `StoryLayer.tsx` |

### Phase D – QA & Rollout

| Task | Notes |
|------|-------|
| Manual QA on desktop/mobile | Upload flow, story teaser, modal open/close, checkout redirect etc. |
| Verify analytics payloads | Console log events in staging. |
| Add feature flag | `studioCanvasModal` in `src/config/featureFlags.ts`. |
| Rollout gradually | Stage → 5% → 25% → 50% → 100% with monitoring. |

---

## 12. Future Hooks & Placeholders

- Leave room in modal summary for future “Gift this canvas” button and “Material preview” card strip.  
- Structure story/teaser copy so marketing can edit via config file (JSON/YAML).  
- Embed subtle messaging about subscription tiers in modal footer when appropriate (e.g., “Create unlimited styles with Creator plan”). Do not add yet, but keep layout flexible.

---

## 13. Non-negotiables Checklist

- [ ] Right rail teaser updates immediately when styles change (pre-upload).  
- [ ] Dotted placeholder shows when metadata missing.  
- [ ] Post-upload order strictly follows Section 3 (Story → Discover → Palette → Curated → CTA → Share).  
- [ ] Curated tiles swap preview instantly when allowed.  
- [ ] Create Canvas button disabled until photo uploaded + crop complete; pulses when first enabled.  
- [ ] Modal contains every section listed in Section 5; orientation uses current cropper logic.  
- [ ] Modal primary CTA navigates to `/checkout` after resetting checkout store.  
- [ ] All analytics events in Section 9 fire with correct payloads.  
- [ ] Mobile accordions implemented for right rail.  
- [ ] Feature flag gating the new experience present.  

Do not deviate from this guide. If something is unclear, ask before implementing. This document supersedes prior plans.

---

## 14. Execution Roadmap – Studio v2 Phases

To ensure surgical delivery, implementation proceeds in eight tightly scoped phases. Each phase maps to the requirements in Sections 3–13, includes explicit dependencies, and records completion status. Update the status column as work progresses.

| Phase | Scope (per Sections 3–13) | Key Dependencies | Testing & Analytics | Status |
|-------|---------------------------|------------------|---------------------|--------|
| 1. Flag & Config Scaffolding | Add `studioCanvasModal` / `insightsRail` feature flags (Section 13); centralize copy strings from Section 8; scaffold analytics helpers from Section 9. | `src/config/featureFlags.ts`, `src/utils/analytics.ts`, new `src/config/studioV2Copy.ts`. | `npm run lint`; verify Studio unchanged with flags off. | ☐ |
| 2. Insights Rail Shell & Teaser | Build sticky `InsightsRail` wrapper (Section 3.1); implement shimmer teaser that responds to style selection pre-upload; mount behind flag while keeping legacy rail. | Founder store style metadata, existing teaser copy, `StudioConfigurator.tsx`. | Manual: select styles pre-upload, ensure headline updates; confirm Step One telemetry unaffected. | ☐ |
| 3. Post-Upload Story Stack | Move narrative, Discover cards, and palette strip into `InsightsRail` (Section 3.2 items 1–3); reuse `PaletteStrip` analytics with new `story_teaser_palette_hover`. | Story data utilities (`utils/storyLayer/copy.ts`), entitlements, `StoryLayer` assets. | Generate preview; validate module order, fallback copy, analytics events logging. | ☐ |
| 4. Curated Styles & Secondary CTA | Implement two-tile curated grid + gating (Section 3.2 item 4); add outline CTA with subtext (item 5); introduce inline share badges (item 6). | `useHandleStyleSelect`, entitlement gate messaging, clipboard helpers. | Confirm `curated_style_click`, `canvas_secondary_cta_click`, `story_share_click` fire; locked styles surface upgrade modal. | ☐ |
| 5. Center Column Realignment & ActionGrid | Reconfigure `CanvasPreviewPanel` to remove story content (Sections 2 & 4); rebuild ActionGrid into 2×2 layout with pulse animation and cropper hook; maintain canvas-in-room + ConfidenceFooter placement per Section 4. | Orientation handler (`__openOrientationCropper`), launchpad telemetry, download/save flows. | Manual orientation change, download, gallery save; ensure preview pipeline (`startStylePreview`) untouched. | ☐ |
| 6. Store & CTA Plumbing | Extend `useFounderStore` with modal state and CTA tracking; wire ActionGrid + rail CTA to new actions; log primary/secondary CTA analytics (Section 9). | Founder store slices, telemetry utilities, persisted selection state. | Toggle CTA availability; confirm Step One telemetry still fires, analytics payloads captured. | ☐ |
| 7. CanvasCheckoutModal Build-out | Construct modal per Section 5 (desktop & mobile layouts); reuse orientation pills, size grid, frame/enhancement toggles, order summary, trust block, and checkout reset. Emit modal analytics per Section 9. | `CanvasInRoomPreview`, `CANVAS_SIZE_OPTIONS`, `useCheckoutStore`, cropper modal, navigation. | Walk through orientation swaps, size/frame changes, Living Canvas toggle, checkout redirect; validate analytics sequences. | ☐ |
| 8. Legacy Rail Sunset & Mobile Accordions | Remove `StickyOrderRail` usage when flag enabled; introduce mobile accordions for right rail (Section 10); ensure ConfidenceFooter + share modules align; final QA & rollout plan (Section 13). | Feature flag gating, responsive layouts, launchpad links. | `npm run lint && npm run build && npm run build:analyze && npm run deps:check`; full Launchflow → Studio → Checkout smoke; confirm token spend/refund untouched. | ☐ |

---

## 15. Research Reference Notes

Use these findings to maintain fidelity with existing systems while executing the phases above.

- **Center Column Flow:** `CanvasPreviewPanel.tsx:177-332` currently renders preview card, `ActionRow`, canvas-in-room preview, and (flagged) story content. Pre-upload state relies on `StudioEmptyState`, so removing story modules here will not affect the upload CTA logic.
- **Right Rail Today:** `StickyOrderRail.tsx:20-312` combines orientation pills, `CanvasConfig`, enhancements, and checkout navigation. Orientation changes depend on `useFounderStore.setOrientation` and cropper callbacks; anything replacing this rail must reuse those handlers.
- **Orientation Pipeline:** `useFounderStore.setOrientation` (`useFounderStore.ts:381-452`) controls cache invalidation and preview regeneration. Cropper completion in `StickyOrderRail.handleCropperComplete` respects cached previews and re-triggers `startStylePreview` only when needed—mirror this behavior inside the modal orientation pills.
- **Preview Generation Contract:** `previewSlice.startStylePreview` (`previewSlice.ts:296-518`) is the single Supabase pipeline entry. It emits Step One telemetry, manages idempotency, and caches previews per orientation. Do not bypass this function when swapping styles or orientations.
- **Telemetry & Launchflow:** Upload and crop events originate in Launchflow (`PhotoUploader.tsx:81-188`, `LaunchpadLayout.tsx:360-520`) with `emitStepOneEvent`. Preserve these hooks when adjusting CTA flows so Step One analytics remain intact.
- **Style Selection Logic:** `useHandleStyleSelect` maintains gating, telemetry, and preview triggering. Curated tiles and right-rail interactions must invoke it to honor entitlement rules and Supabase caching.
- **Story Data Sources:** `StoryLayer.tsx` + `utils/storyLayer/copy.ts` supply narrative, discover/insight copy, palettes, and complementary styles. Centralizing these assets in Phase 3 ensures marketing can adjust content without code rewrites.
- **Checkout State Sharing:** `useCheckoutStore` keeps contact/shipping/payment progress. The new modal should reset this store before navigating to `/checkout`, matching current `StickyOrderRail` behavior.
- **Shared Supabase State:** Entitlements, Auth provider, and preview cache slices (Sections 0 & Guardrails) rely on `AuthProvider` and founder store slices. Avoid duplicating state; extend existing slices where necessary.
- **Feature Flag Expectations:** All Studio v2 UI must be gated until rollout. Flags live in `src/config/featureFlags.ts`; ensure defaults keep production on the legacy experience until QA completes.

Keep this section updated if additional research impacts future phases.
