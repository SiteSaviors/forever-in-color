# Wondertone Studio v2 – World-Class Implementation Plan

**Author:** Codex  
**Audience:** Wondertone engineering & product reviewers  
**Status:** Authoritative implementation roadmap (supersedes prior drafts)  
**Sources:** `docs/studio-v2-implementation-guide.md`, founder Q&A (2024-XX-XX), repository audit (2024-XX-XX)

---

## 0. Mandate & Guardrails
- Honor Wondertone’s premium AI canvas positioning. Every change must retain or improve performance, UX, and maintainability (`README.md:1`).
- Preserve Launchflow → Studio → preview pipeline (`src/sections/LaunchpadLayout.tsx`, `src/sections/StudioConfigurator.tsx`, `src/store/useFounderStore.ts:320-452`, `src/store/founder/previewSlice.ts:300-520`).
- Maintain telemetry routes (`emitStepOneEvent`, Launchflow trackers, studio feedback hooks) (`src/utils/telemetry.ts`, `src/utils/launchflowTelemetry.ts`, `src/utils/storyLayerAnalytics.ts`).
- Respect preview generation constraints: all style/orientation changes must flow through `previewSlice.startStylePreview` and Supabase helpers (`src/store/founder/previewSlice.ts:300-420`, `src/utils/founderPreviewGeneration.ts`, `src/utils/stylePreviewApi.ts`).
- Orientation changes **must** use `useFounderStore.setOrientation` and existing cropper pipeline to maintain cache integrity (`src/store/useFounderStore.ts:381-452`, `src/components/studio/StickyOrderRail.tsx:68-232`).
- Feature delivery follows founder VS Code workflow; all QA via `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` before completion (`FOUNDER_WORKFLOW.md`, `package.json:6`).

---

## 1. Experience Overview

### 1.1 Studio Layout (Desktop ≥ 1024px)
```
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Style Sidebar│ Center Preview Column      │ Insights Rail (new)      │
│ (existing)   │ – Sticky hero preview      │ – Wondertone Story stack │
│              │ – 2×2 ActionGrid           │ – Discover cards grid    │
│              │ – Canvas-in-room preview   │ – Palette strip          │
│              │                            │ – Curated style pair     │
│              │                            │ – Outline canvas CTA     │
│              │                            │ – Inline share badges    │
└──────────────┴────────────────────────────┴──────────────────────────┘
```
The center column emphasizes preview + subscriptions; canvas upsell remains secondary. The right rail acts as the “AI Art Curator” delivering high-conversion storytelling.

### 1.2 Mobile Layout (< 1024px)
- Style sidebar collapses into existing drawer.
- Insights rail becomes stacked accordions beneath the preview (`Story`, `Discover`, `Palette`, `Curated Styles`, `Create Canvas Print`, `Share`).
- Canvas modal is a full-screen sheet with sticky bottom CTA.

---

## 2. Feature Flag & Configuration Scaffold (Phase 0)

| Task | Details | Files |
|------|---------|-------|
| Introduce Studio v2 flags | `studioV2InsightsRail`, `studioV2CanvasModal`; `import.meta.env.VITE_STUDIO_V2_*` toggle | `src/config/featureFlags.ts` |
| Copy registry | Centralize Section 8 strings + Q&A copy in `src/config/studioV2Copy.ts` (new) for marketing edits | new file |
| Analytics scaffolding | Add Wondertone v2 events to `src/utils/telemetry.ts` (console stub) + typed helpers `src/utils/studioV2Analytics.ts` (new) | see Section 8 |
| Plan gating | `StudioConfigurator.tsx` mounts new components only when flag enabled; legacy path untouched until rollout | `src/sections/StudioConfigurator.tsx` |

Flag defaults → `false` (safe rollback). QA steps validate parity when disabled.

---

## 3. Center Column Enhancements

### 3.1 Preview Card (No layout change)
- Retain orientation badge, ready-to-print pill, mismatch warning (`src/sections/studio/components/CanvasPreviewPanel.tsx:180-256`).

### 3.2 ActionGrid (2×2)
Replace `ActionRow` with `ActionGrid` (new component) under preview.

| Cell | Label | Style | Behavior | Analytics |
|------|-------|-------|----------|-----------|
| Top-left | “Download Image” | Purple gradient | Calls existing download handler; unchanged gating | `trackDownloadCTAClick` (existing) |
| Top-right | “Create Canvas Art” | Purple gradient (primary) | Disabled until `hasCroppedImage && previewStateStatus === 'ready'`; on first enable, 2s pulse (CSS `@keyframes pulse-fade`, `will-change: transform`); calls `openCanvasModal('center')` | `v2_canvas_cta_click` (`source:'center'`) |
| Bottom-left | “Change Orientation” | Black background, white outline; orientation icon | Calls new `handleRequestOrientation()` that proxies to window cropper callback (mirrors `StickyOrderRail`) | `v2_canvas_orientation_cta` (optional) |
| Bottom-right | “Save to Gallery” | Black/white outline | Reuse existing handler | existing telemetry |

Implementation:
- Create `src/components/studio/ActionGrid.tsx` with focus-visible styling and safe motion (prefers-reduced-motion respect).
- Update `CanvasPreviewPanel.tsx` to use `ActionGrid`. Remove `ActionRow` import.
- Provide orientation callback via prop from `StudioConfigurator.tsx`. The callback should call `useFounderStore.getState().setOrientationChanging(true)` and `window.__openOrientationCropper?.()`. (If callback already exists, re-export the function from `StickyOrderRail` to avoid duplication.)

### 3.3 Canvas-in-room Preview
- Maintain placement below ActionGrid (no toggle). Styling unchanged.

### 3.4 Remove ConfidenceFooter
- Delete import and render from `CanvasPreviewPanel.tsx`.
- Remove any callers expecting `onStoryCreateCanvas`.

---

## 4. Insights Rail (“AI Art Curator”)

Create `src/components/studio/InsightsRail/` feature folder:
- `InsightsRail.tsx` – orchestrates pre-/post-upload modules.
- `StoryTeaser.tsx` – pre-upload placeholder + shimmer.
- `StoryHeader.tsx`, `DiscoverGrid.tsx`, `PaletteModule.tsx`, `CuratedStyles.tsx`, `SecondaryCanvasCTA.tsx`, `ShareBadges.tsx`.
- `hooks/useStoryTeaser.ts`, `hooks/usePaletteChips.ts` (optional) to memoize data.

### 4.1 Container
- On desktop: sticky wrapper (`lg:sticky lg:top-[57px]`) with internal scroll (`max-h-[calc(100vh-88px)]`, `overflow-y-auto`, `Scrollbar` variant). Add top/bottom fade gradients to hint scroll.
- On mobile: stacked accordions (Radix `Collapsible` or custom) – default open `Story`, rest collapsed.

### 4.2 Pre-upload State (no `hasCroppedImage` or preview not ready)
- Headline: **Wondertone Story & Insights**.
- Subtext: “Select a style to discover the magic behind the art.”
- Body: dotted rectangle (use CSS background `linear-gradient` trick). Copy: “Your Wondertone Story & Insight will appear here once you upload a photo.”
- Animation: subtle shimmer across rectangle using GPU-friendly `background-position` animation (10s loop, low opacity).
- Style selection response: when `useFounderStore((s) => s.hoveredStyleId || s.selectedStyleId)` exists, show teaser card:
  - Title: “The Story Behind *{Style Name}*”.
  - Body: `style.description` (2 sentences max).
  - Palette chips: 6 circles; duplicate values if fewer than 6 (pull from `getPalette` or fallback). If palette missing, keep dotted placeholder.
  - Footer: “Upload a photo to unlock the full narrative.”
  - Fire `v2_story_teaser_view` once per style per session (`source:'pre-upload'`).

### 4.3 Post-upload Stack (preview ready)
Render modules STRICT order with 24px gaps:
1. **Story Header**  
   - Title: “Wondertone Story — *{Style Name}*”.  
   - Intro reuse teaser copy. Fire `v2_story_teaser_view` (`source:'post-upload'`).
2. **Discover Cards (2×2)**  
   - Cards: Narrative, Emotion, Perfect For, Signature Detail.  
   - Content from `getNarrative(style)` bullets.  
   - Each card subtle hover lift (`transform: translateY(-2px)`, no box-shadow thrash).  
3. **Palette Strip**  
   - Use existing `PaletteStrip`, but ensure `onSwatchHover` triggers `v2_story_palette_hover`.  
   - Display hex code beneath chip (small uppercase).  
4. **Curated Styles**  
   - Two cards side-by-side, `min-width: 200px`.  
   - Thumbnail (ratio 4:5), style name, one-line description from `getComplementaryStyles`.  
   - Locked state overlay from existing `ComplementarySuggestions`.  
   - Hover effect: slight scale (`transform: scale(1.02)`), glow border.  
   - Click allowed → `useHandleStyleSelect`, `v2_curated_style_click` (`allowed:true`, `position:1|2`).  
   - Click locked → upgrade modal & `v2_curated_style_click` (`allowed:false`).  
5. **Secondary CTA**  
   - Outline button: “Create Canvas Print” with sub-label “Orders ship in 5 days”.  
   - `sourceCTA = 'rail'`.  
   - Fire `v2_canvas_cta_click` (`source:'rail'`).  
6. **Share Module**  
   - Inline buttons: Twitter, Facebook, Pinterest, Copy Link.  
   - Use icon-only pill buttons with label, lighten on hover.  
   - Copy link uses `navigator.clipboard`. Fallback toast on failure.  
   - Shared text: `Just turned a favorite photo into art with {style_name}. @Wondertone #ArtFromMemory #TheAIArtCurator`.  
   - Fire `v2_story_share_click` (`platform:'twitter'|'facebook'|'pinterest'|'copy'`).

Fallback handling:
- If narrative missing → show placeholder paragraph “We’re crafting this story. Explore styles while we finalize the details.”
- Palette missing → maintain dotted card with text.
- Curated styles missing → hide section entirely but log warning (`console.debug`).

---

## 5. Canvas Checkout Modal (Embedded Flow)

### 5.1 State & Launching
- Extend `useFounderStore`:
  - `canvasModalOpen: boolean`
  - `openCanvasModal(source: 'center' | 'rail'): void`
  - `closeCanvasModal(reason: ModalCloseReason): void`
  - `lastCanvasModalSource: 'center' | 'rail' | null`
  - Per-style persisted selections (Map keyed by `styleId` storing size, frame, enhancements). Reset when style changes.
- Modal opens only when `hasCroppedImage === true`. Disabled CTAs show tooltip “Upload & crop photo first.”
- On open: fire `v2_canvas_modal_open` with `canvasSize`, `frame`, `enhancements`, `orientation`, `sourceCTA`.

### 5.2 Layout (Desktop)
```
┌───────────────────────────────────────────────────────────────┐
│ Backdrop: rgba(5,12,27,0.85) + blur                           │
│ ┌───────────────────────────────┬───────────────────────────┐ │
│ │ Left Column                   │ │ Right Column            │ │
│ │ • Canvas-in-room preview      │ │ • Header w/ style chip  │ │
│ │   (max-h 320px)               │ │ • Orientation pills      │ │
│ │ • Mini style badge            │ │ • Size selector grid     │ │
│ │ • Caption: “Preview updates…” │ │ • Frame selector         │ │
│ │                               │ │ • Enhancements toggles   │ │
│ │                               │ │ • Order summary          │ │
│ │                               │ │ • Trust strip            │ │
│ │                               │ │ • Reviews placeholder    │ │
│ └───────────────────────────────┴───────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```
- Use `Dialog` from Radix. Outer wrapper ensures max-width 1020px, border radius 32px, `box-shadow` subtle.
- Animate entry with scale + fade (duration 220ms, cubic-bezier(0.16,1,0.3,1)).

### 5.3 Content Specifications
1. **Header**
   - Mini badge: 48×48 style thumbnail (fallback: cropped image).  
   - Title: “Configure Your Canvas”.  
   - Subtext: “Museum-grade materials · Ships in 5 days · 100% satisfaction guarantee.”
2. **Orientation Section**
   - Pills: Portrait / Square / Landscape (labels from `ORIENTATION_PRESETS`).  
   - Current selection shown with check icon.  
   - Click triggers `window.__openOrientationCropper` with orientation; set `modalOrientationRequestedAt` for analytics.  
   - Fire `v2_canvas_modal_orientation`.
3. **Size Selector**
   - Grid (2 columns) of `CANVAS_SIZE_OPTIONS` filtered by orientation.  
   - Selected card uses purple border, check icon.  
   - Persist per style.  
   - Update total via `useFounderStore.computedTotal`.
4. **Frame Selector**
   - Toggle “Floating Frame” (switch).  
   - When enabled show radio buttons “Black”, “White” (defaults to Black).  
   - Reuse store actions `toggleEnhancement('floating-frame')` and `setFrame`.  
5. **Enhancements**
   - Toggle “Living Canvas AR” with copy “+ $59.99”.  
   - Info icon reuses existing modal (LivingCanvas).  
6. **Order Summary**
   - Summary list: size label, frame, enhancements (if any).  
   - Total: `computedTotal()` (currency formatting).  
   - Add reserved space (empty div) for future “Gift this canvas” CTA.
7. **Trust Block**
   - Inline items: ⭐ “4.9 • 1,200+ collectors”, 🚚 “Ships in 5 days”, 🛡️ “100% satisfaction guarantee”.  
   - Use emojis or inline SVG with accessible labels.
8. **Reviews Placeholder**
   - Reserve 100px tall area with text “Collector reviews and gallery coming soon.” (enables future drop-in).
9. **Primary CTA**
   - Button: “Complete Your Order →”.  
   - On click:  
     1. `useCheckoutStore.resetCheckout()`.  
     2. `closeCanvasModal('purchase_complete')`.  
     3. `navigate('/checkout')`.  
     4. Fire `v2_canvas_modal_close` (`reason:'purchase_complete'`).  

### 5.4 Mobile Layout
- Dialog takes full viewport.  
- Top header with close button + title.  
- Content scrollable; bottom sticky CTA replicates primary button.  
- Canvas preview collapses into a carousel (if needed) – initial version uses one image with 100% width.  

### 5.5 Close Handling
- Close via X, ESC, backdrop. Determine reason: `'dismiss'`, `'cancel'`, `'esc_key'`, `'backdrop'`.  
- Track time spent (store `openedAt` timestamp).  
- Persist selections in store keyed by `styleId`; on style change, load previous selection or defaults.  
- If closing without purchase, fire `v2_canvas_modal_close` with `configuredItems`.

---

## 6. State & Data Wiring

### 6.1 Founder Store Extensions (`src/store/useFounderStore.ts`)
- Add modal state & actions described in 5.1.
- Create helper `getCanvasSelectionForStyle(styleId)` to encapsulate persistence.
- When `selectStyle` runs, load selection for new style; if none, set defaults (`getDefaultSizeForOrientation`, frame `'none'`, enhancements false).
- Ensure orientation change reuses existing caches; no new pipelines.

### 6.2 Global Copy (`src/config/studioV2Copy.ts`)
```ts
export const STUDIO_V2_COPY = {
  insightsHeadline: 'Wondertone Story & Insights',
  insightsSubtext: 'Select a style to discover the magic behind the art.',
  insightsPlaceholder: 'Your Wondertone Story & Insight will appear here once you upload a photo.',
  storyHeader: (styleName: string) => `Wondertone Story — ${styleName}`,
  storyTeaserTitle: (styleName: string) => `The Story Behind ${styleName}`,
  storyTeaserFooter: 'Upload a photo to unlock the full narrative.',
  discoverLabels: ['Narrative', 'Emotion', 'Perfect For', 'Signature Detail'],
  secondaryCta: { label: 'Create Canvas Print', subtext: 'Orders ship in 5 days' },
  canvasModal: {
    title: 'Configure Your Canvas',
    subtitle: 'Museum-grade materials · Ships in 5 days · 100% satisfaction guarantee.',
    trust: [
      { icon: '⭐', copy: '4.9 • 1,200+ collectors' },
      { icon: '🚚', copy: 'Ships in 5 days' },
      { icon: '🛡️', copy: '100% satisfaction guarantee' },
    ],
    primaryCta: 'Complete Your Order →',
  },
  shareCaption: (styleName: string) =>
    `Just turned a favorite photo into art with ${styleName}. @Wondertone #ArtFromMemory #TheAIArtCurator`,
};
```

---

## 7. Animations & Visual Touches

| Element | Motion Spec | Notes |
|---------|-------------|-------|
| Insights placeholder | `background-position` shimmer (10s, linear, infinite) | Use `prefers-reduced-motion` guard |
| Create Canvas button | Pulse once when enabling (scale 1.0 → 1.04 → 1.0, 2s) | Apply only once per session (state flag) |
| Discover cards | Hover lift `translateY(-2px)` + background lighten | Transition 160ms |
| Curated cards | Hover scale 1.02 + glow border; focus-visible outline | Keep GPU transforms |
| Modal entry | Scale+fade (220ms) via Framer Motion or CSS transitions | Ensure reduced-motion fallback |
| Share badges | On hover, subtle tilt (`rotateX(3deg) rotateY(3deg)`) + color shift | Use `transform-style: preserve-3d` for depth |

All animations must be `will-change` scoped, removed when `prefers-reduced-motion`.

---

## 8. Analytics Specification

Implement helper `logStudioV2Event` (`src/utils/studioV2Analytics.ts`) that forwards to console (temporary) and is tree-shakeable.

| Event | Trigger | Payload |
|-------|---------|---------|
| `v2_story_teaser_view` | Insights placeholder or story header mounts per style | `{ styleId, source: 'pre-upload' | 'post-upload' }` |
| `v2_story_palette_hover` | Palette chip hover/click | `{ styleId, swatchHex }` |
| `v2_curated_style_click` | Curated card clicked | `{ currentStyleId, clickedStyleId, position: 1|2, allowed: boolean }` |
| `v2_canvas_cta_click` | Center or rail CTA pressed | `{ styleId, orientation, source: 'center' | 'rail' }` |
| `v2_canvas_modal_open` | Modal opens | `{ styleId, orientation, canvasSize, frame, enhancements: string[], sourceCTA }` |
| `v2_canvas_modal_close` | Modal closes | `{ styleId, reason: 'dismiss'|'cancel'|'esc_key'|'backdrop'|'purchase_complete', configuredItems, timeSpentMs }` |
| `v2_canvas_modal_orientation` | Orientation pill pressed inside modal | `{ styleId, orientation }` |
| `v2_story_share_click` | Share badge, copy link, or social | `{ styleId, platform: 'twitter'|'facebook'|'pinterest'|'copy' }` |
| `v2_canvas_orientation_cta` (optional) | Change Orientation button in ActionGrid | `{ styleId, orientation }` |

Use these within components (`InsightsRail`, `CuratedStyles`, `ActionGrid`, `CanvasCheckoutModal`).

---

## 9. Detailed Phase Plan

### Phase 0 – Flag & Infrastructure
1. Add feature flags + env wiring (`src/config/featureFlags.ts`).  
2. Create copy registry and analytics helper (Section 6 & 8).  
3. Update `StudioConfigurator.tsx` to read flag; mount legacy rail when disabled.  
4. QA: `npm run lint && npm run build` with flag off → UI unchanged.

### Phase 1 – Insights Rail Scaffolding
1. Create `InsightsRail.tsx` (cases: pre-upload, post-upload).  
2. Implement `StoryTeaser` with shimmer + live style teasers.  
3. Add desktop sticky container and mobile accordion base.  
4. Hook into `StudioConfigurator.tsx` (flag on).  
5. QA: Pre-upload style hover updates teaser; share no crash; Step One telemetry unaffected.

### Phase 2 – Story Stack Modules
1. Port narrative header + Discover grid using `getNarrative`.  
2. Wire `PaletteStrip` with new analytics.  
3. Ensure fallbacks render when metadata missing.  
4. Unit tests (if feasible) for `getPalette` duplication logic.  
5. QA: Generate preview, verify module order, palette hovers log events.

### Phase 3 – Curated Styles, CTA, Share
1. Build `CuratedStyles` two-card layout with gating states.  
2. Implement `SecondaryCanvasCTA` outline button.  
3. Add share badges with clipboard + fallback toast (reuse `useStudioFeedback`).  
4. Telemetry for curated clicks, CTA, share.  
5. QA: Click curated style (allowed & locked) verifies preview swap / upgrade prompt.

### Phase 4 – Center Column Alignment
1. Replace `ActionRow` with new `ActionGrid`.  
2. Remove `ConfidenceFooter` usage.  
3. Add orientation callback bridging to cropper logic; ensure no watermarks/regressions.  
4. Update `CanvasPreviewPanel` props & tests.  
5. QA: Upload photo, ensure Create Canvas pulses once, orientation button opens cropper.

### Phase 5 – Store & CTA Plumbing
1. Extend `useFounderStore` for modal state + selection persistence.  
2. Add selectors for `openCanvasModal`, `closeCanvasModal`, `getCanvasSelectionForStyle`.  
3. Update `StudioConfigurator` to pass `openCanvasModal`.  
4. QA: Switch styles, confirm selections reset/restore as expected.

### Phase 6 – Canvas Checkout Modal
1. Build `CanvasCheckoutModal.tsx` using Radix `Dialog`.  
2. Integrate existing size/frame/enhancement logic.  
3. Ensure orientation pills call cropper; handle asynchronous preview updates.  
4. Implement analytics on open/close/orientation.  
5. QA: Walk through full configuration, navigate to `/checkout`, verify store resets.

### Phase 7 – Mobile Accordions & Polish
1. Finalize mobile accordions for insights.  
2. Ensure curated tiles responsive (two narrow cards).  
3. Add reserved sections (gift/material).  
4. Run full QA checklist (desktop + mobile).  

### Phase 8 – Rollout
1. Turn flag on in staging, run command suite (`lint`, `build`, `build:analyze`, `deps:check`).  
2. Manual smoke: Launchflow upload → Studio preview → Canvas modal → Checkout.  
3. Collect telemetry logs, adjust thresholds.  
4. Prepare removal of legacy components (post-launch).

---

## 10. Risk Mitigation & Testing

| Risk | Mitigation | Tests |
|------|------------|-------|
| Orientation pipeline regression | Reuse `window.__openOrientationCropper` + existing store actions; no custom orientation state | Manual: change orientation from center grid & modal; confirm preview regeneration & Step One telemetry |
| Preview cache flush | Keep all calls through `startStylePreview`; do not bypass caches when switching styles | Manual: switch curated styles repeatedly; ensure cached previews load instantly |
| Telemetry noise | Wrap new events in helpers to avoid typos; throttle repeated `v2_story_teaser_view` | Add dev console assertions verifying payload shapes |
| Clipboard failures (share) | Provide fallback toast, degrade gracefully | Manual: emulate insecure context / blocked clipboard |
| Modal selection persistence | Store selections per style; unit-test helper functions | Jest (if available) for `getCanvasSelectionForStyle` |
| Performance | Use GPU-friendly transforms, limit re-renders via memoization (`React.memo`, derived selectors) | `npm run build:analyze`, React Profiler spot-check on preview + modal interactions |

---

## 11. Handoff & Documentation
- Update `docs/studio-v2-implementation-guide.md` status once features shipped; link this plan from top-level README.
- Document new analytics in `docs/telemetry.md` (if absent).
- Provide Loom/video for marketing to review insights rail once implemented.

---

## 12. Acceptance Criteria Checklist
- ✅ Insights rail delivers pre-/post-upload states per copy spec; shimmer & teaser responsive to style selection.  
- ✅ ActionGrid (2×2) implemented; Create Canvas pulses on unlock; orientation button reuses existing cropper.  
- ✅ Canvas modal fully embedded with orientation pills, size/frame/enhancements, trust block, reviews placeholder, and navigation to `/checkout`.  
- ✅ Share badges inline with provided caption; clipboard fallback handled.  
- ✅ Analytics events emitted with exact payloads and logged through helper.  
- ✅ Mobile accordions render all modules; curated cards responsive.  
- ✅ Legacy Canvas rail gated behind `studioV2InsightsRail`; flag off leaves Studio unchanged.  
- ✅ Mandatory command suite passes (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`).  
- ✅ Preview pipeline remains single path via `startStylePreview`; Step One telemetry unaffected.  

---

**Next Action**: Begin Phase 0 scaffolding behind flag, following the founder workflow. Once merged, proceed sequentially through phases with QA + analytics validation at each milestone. Wondertone’s “AI Art Curator” should now deliver the wow factor without sacrificing performance or reliability. Let’s build. 💫

