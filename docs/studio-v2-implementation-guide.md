# Wondertone Studio v2 – Implementation Guide

**Owner:** Codex  
**Last Update:** 2024‑XX‑XX  
**Status:** Authoritative reference for the canvas lightbox + story migration workstream.

This document translates the Studio v2 vision into concrete tasks. Each section references the exact files, components, and stores that must be touched so any new engineer can jump in midstream and execute with confidence.

---

## Table of Contents
1. [Product Goals](#product-goals)  
2. [Experience North Star](#experience-north-star)  
3. [Pre-Upload Story Placeholder](#pre-upload-story-placeholder)  
4. [System Architecture Snapshot](#system-architecture-snapshot)  
5. [Implementation Roadmap](#implementation-roadmap)  
6. [Phase Details & Task Checklist](#phase-details--task-checklist)  
7. [Component & File References](#component--file-references)  
8. [State & Data Notes](#state--data-notes)  
9. [Analytics Requirements](#analytics-requirements)  
10. [Copy & Visual Specs](#copy--visual-specs)  
11. [Testing & Rollout Plan](#testing--rollout-plan)  
12. [Open Decisions](#open-decisions)  

---

## Product Goals

1. **Preview-first studio:** Generated art and in-room preview remain the focal point; everything else supports it.  
2. **Optional canvas purchasing:** “Create Canvas” opens a modal path; ordering wall art never feels mandatory.  
3. **Story & insights regrouped:** Right rail becomes the home for style narratives, confidence cues, and curated suggestions.  
4. **Minimal rework:** Reuse existing checkout stack (`CheckoutFormShell`, `PaymentStep`, Stripe integration) inside the new modal.  
5. **World-class polish:** Motion, copy, and micro-interactions should match Canva/Amazon-level trust.

---

## Experience North Star

### Desktop Columns
```
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Style Rail   │ Center Workspace            │ Insights Rail            │
│ (existing)   │ • Sticky preview card       │ • Story teaser (expand)  │
│              │ • Download / Create Canvas  │ • Confidence badges      │
│              │ • Canvas-in-room toggle     │ • Curated styles         │
│              │ • Optional supporting cards │ • Secondary canvas CTA   │
└──────────────┴────────────────────────────┴──────────────────────────┘
```

### Canvas Modal
- Full-screen overlay on desktop, full-screen sheet on mobile.  
- Left side: mini style preview + in-room thumbnail.  
- Right side: checkout steps (size → frame → enhancements → review/payment) using existing components.  

---

## Pre-Upload Story Placeholder

Before a user uploads a photo, the right rail should prime them for the story they will unlock. Implement **both** of the following elements:

1. **Style Teaser Card (Primary option)**  
   - Title: “Discover *{Style Name}*” or “The story behind *{Style Name}*”.  
   - Subtitle: Two-sentence teaser describing the vibe.  
   - Palette preview: reuse existing palette swatches if available; if the style lacks metadata, hide the swatches.  
   - CTA: “Upload a photo to reveal the full story.” (disabled state if no upload).  

2. **Fallback Placeholder (if metadata missing)**  
   - Dotted, rounded rectangle with copy: “Your style story will appear here once you upload a photo.”  
   - Optional icon (book or sparkle) to keep it friendly.  

Implementation notes:
- File: `src/components/studio/story-layer/StoryLayer.tsx` (new conditional render).  
- Data: When `croppedImage` is `null`, render teaser/placeholder; after upload, render full narrative.  
- Analytics: fire `story_teaser_view` when teaser appears, and `story_teaser_click` when user interacts.

---

## System Architecture Snapshot

```
src/
├─ components/
│  └─ studio/
│     ├─ CanvasCheckoutModal.tsx      # NEW modal wrapper
│     ├─ CanvasPreviewPanel.tsx       # UPDATED (CTA, orientation pills)
│     ├─ InsightsRail.tsx             # NEW right-column aggregator
│     └─ story-layer/
│        ├─ StoryLayer.tsx            # UPDATED for teaser + full content
│        └─ StoryLayerTeaser.tsx      # NEW presentational component
├─ sections/
│  └─ StudioConfigurator.tsx          # UPDATED layout & modal mount
├─ store/
│  ├─ useFounderStore.ts              # Add modal state or selectors
│  └─ useCanvasModalStore.ts          # NEW (if separate store desired)
└─ pages/
   └─ StudioPage.tsx                  # Handle payment success/cancel queries
```

---

## Implementation Roadmap

| Phase | Focus | Outcomes |
|-------|-------|----------|
| **Phase A** | Story migration + pre-upload placeholders | Center scroll reduced; right rail shows teaser/placeholder; curated styles relocated |
| **Phase B** | Canvas modal + CTA placement | Modal opens/closes with existing checkout flow; CTA lives under preview and inside story |
| **Phase C** | Clean-up & orientation polish | Legacy config removed from rail; orientation UX simplified; micro-interactions added |
| **Phase D** | QA, analytics validation, rollout | Feature flag ready; telemetry verified; rollout staged |

---

## Phase Details & Task Checklist

### Phase A – Story & Layout
| # | Task | File(s) | Notes |
|---|------|---------|-------|
| A1 | Create `StoryLayerTeaser` component | `src/components/studio/story-layer/StoryLayerTeaser.tsx` | Accepts `styleName`, `palette`, `onExpand`. Render teaser + fallback placeholder. |
| A2 | Update `StoryLayer.tsx` | same dir | If `croppedImage` absent → render teaser. On click show placeholder message. After upload → render existing sections inside scrollable container. |
| A3 | Build `InsightsRail.tsx` | `src/components/studio/InsightsRail.tsx` | Compose Story, curated styles, confidence badges, secondary CTA. Provide `className` hook for sticky layout. |
| A4 | Rewire `StudioConfigurator.tsx` | `src/sections/StudioConfigurator.tsx` | Replace `StickyOrderRail` import with `InsightsRail`. Ensure right rail wrapper remains sticky and adds `max-h` + `overflow-y-auto`. |
| A5 | Trim center column | `src/sections/studio/components/CanvasPreviewPanel.tsx` | Remove story render; adjust spacing (32px rhythm). Keep existing `CanvasInRoomPreview` toggle. |
| A6 | Move curated styles module | whichever component currently renders curated cards | Place inside `InsightsRail`; convert to 1-row horizontal scroller. |

### Phase B – Canvas Modal
| # | Task | File(s) | Notes |
|---|------|---------|-------|
| B1 | Add modal state | `useFounderStore.ts` or `useCanvasModalStore.ts` | `isCanvasModalOpen`, `openCanvasModal`, `closeCanvasModal`. Persist `lastConfig`. |
| B2 | Insert primary CTA | `CanvasPreviewPanel.tsx` | Button under preview actions; triggers `openCanvasModal`. Subcopy: “Turn this into wall art · Gallery-quality prints.” |
| B3 | Insert secondary CTA | `StoryLayer.tsx` (expanded view) | Button anchored at bottom of story content. |
| B4 | Create `CanvasCheckoutModal.tsx` | new file | Use `Dialog`/`AnimatePresence`. Layout: left preview panel, right checkout steps. Close button resets checkout state. |
| B5 | Embed existing checkout flow | `CanvasCheckoutModal.tsx` | Import `CheckoutFormShell`, `CheckoutSummary`. Provide `variant="modal"` prop if needed for styling. |
| B6 | Update checkout redirect logic | `PaymentStep.tsx`, `StudioPage.tsx` | Adjust `return_url` to `/studio?payment=success`. Display success/cancel notices via existing header component. |
| B7 | Trust & UX polish | modal file | Add badges (shipping, guarantee, rating), copy blocks, animated entry (300ms spring). |

### Phase C – Clean-up & Orientation
| # | Task | File(s) | Notes |
|---|------|---------|-------|
| C1 | Deprecate legacy config panel | `StickyOrderRail.tsx`, `CanvasConfig.tsx` | Remove size/frame/enhancement UI from rail; ensure no unused exports. |
| C2 | Orientation UX | `CanvasPreviewPanel.tsx` | Keep pills near preview; add “Fine-tune crop” button calling existing cropper modal. |
| C3 | Micro-interactions | `CanvasPreviewPanel.tsx`, `CanvasInRoomPreview.tsx` | Add glow/fade when orientation or canvas view changes. |
| C4 | Accessibility audit | modal + rail | Ensure focus trap, keyboard navigation, ARIA labels (close button, modal headings). |

### Phase D – QA & Rollout
| # | Task | File(s) | Notes |
|---|------|---------|-------|
| D1 | Manual regression | Studio flows | Test upload → preview → story expand; modal checkout (Stripe test cards); mobile behavior. |
| D2 | Telemetry validation | `analytics.ts` events | Ensure new events firing with correct payloads. |
| D3 | Feature flag | Central config (e.g., `src/config/featureFlags.ts`) | Gate modal + new rail behind `studioCanvasModal`. |
| D4 | Rollout checklist | Deploy pipeline | Stage → 5% → 25% → 50% → 100%. Monitor conversion and support tickets at each step. |

---

## Component & File References

- `src/sections/StudioConfigurator.tsx` – orchestrates layout.  
- `src/sections/studio/components/CanvasPreviewPanel.tsx` – preview card, actions, orientation.  
- `src/components/studio/story-layer/*` – story/insights modules.  
- `src/components/studio/CanvasCheckoutModal.tsx` (NEW) – modal shell.  
- `src/components/checkout/*` – existing checkout steps (reuse).  
- `src/store/useFounderStore.ts` – canvas config, modal state.  
- `src/store/useCheckoutStore.ts` – multi-step checkout state.  
- `src/utils/analytics.ts` – event definitions.  

---

## State & Data Notes

- Canvas configuration (size, frame, enhancements) already lives in founder store; modal must read/write the same values.  
- `useCheckoutStore` should reset on modal close to avoid stale payment intents.  
- Story modules expect `currentStyle`, `entitlements`, `orientation`; pass these via props from `InsightsRail`.  
- Pre-upload state detection uses `croppedImage` and `preview` status.  

---

## Analytics Requirements

Add the following events (ensure they conform to existing analytics schema):

| Event | Trigger | Properties |
|-------|---------|------------|
| `story_teaser_view` | Story teaser rendered | `styleId`, `source: 'pre-upload'|'post-upload'` |
| `story_teaser_click` | User opens story from teaser | `styleId` |
| `canvas_modal_open` | Modal opened | `styleId`, `orientation`, `canvasSize`, `frame`, `sourceCTA` |
| `canvas_modal_close` | Modal closed without completion | `step`, `reason: 'dismiss'|'cancel'` |
| `canvas_checkout_step_view` | Each checkout step visible | Reuse existing step events; add `context: 'modal'` |
| `canvas_checkout_success` | Payment succeeded | `amount`, `currency`, `styleId`, `enhancements` |
| `canvas_modal_error` | Stripe or network error inside modal | `step`, `errorCode` |
| `canvas_in_room_toggle` | Canvas preview ↔ in-room toggle | `orientation`, `view` |

---

## Copy & Visual Specs

- **Create Canvas CTA:** “Create Canvas”  
  - Subcopy: “Turn this into wall art · Gallery-quality prints”  
  - Icon: framed canvas.
- **Story teaser headline:** “Discover *{Style Name}*”  
  - Body: Two-sentence teaser; fallback copy: “Upload a photo to unlock the full narrative.”
- **Modal header:** “Configure Your Canvas”  
  - Subtitle: “Museum-grade materials · Ships in 5 days · 100% satisfaction guarantee.”
- **Trust badges:** Use icons for shipping truck, badge, star rating.  
- **Empty story fallback copy:** “Your style story will appear here once you upload a photo.”  
- **Download CTA:** keep existing text (“Download Image · Instant 4K JPEG”).  
- **Orientation button:** if using fine-tune control, label “Fine-tune crop” with scissors icon.

Spacing & motion:
- Maintain 32px vertical spacing in center column.  
- Story expansion uses 200 ms ease-in-out height transition.  
- Modal slides in over 300 ms with slight opacity fade.  
- Preview glow: 150 ms highlight around frame when orientation or canvas view changes.

---

## Testing & Rollout Plan

1. **Manual QA (desktop + mobile)**  
   - Upload flow, orientation switching, story teaser, story expansion.  
   - Canvas modal open/close, keyboard navigation, Stripe payment with test card.  
   - Success and cancel flows redirect back with header notice.  
   - Placeholder behavior (style selected pre-upload).  

2. **Staging analytics validation**  
   - Use dev console to confirm events logging with proper payloads.  
   - Verify no duplicate events during checkout steps.  

3. **Feature flag rollout**  
   - Stage environment with `studioCanvasModal=true`.  
   - Production: start at 5% of traffic, monitor conversion + support.  
   - If metrics stable, ramp to 25%, 50%, 100%.  
   - Keep rollback switch documented (flag off reverts to legacy rail).  

4. **Post-launch monitoring**  
   - At least one week of data comparing download, subscription, and canvas conversion vs. baseline.  
   - Collect qualitative feedback (support tickets, in-app survey if desired).  

---

## Open Decisions

1. **Teaser visuals** – final art direction (gradient vs. minimal).  
2. **Curated styles layout** – horizontal scroller vs. stacked cards (design input needed).  
3. **Mobile story placement** – accordion vs. secondary screen (final UX decision awaiting product sign-off).  
4. **Order summary outside modal** – keep a lightweight summary in insights rail or rely solely on modal review step?  
5. **Future payment plan** – once modal proves effective, do we embed Stripe inline (no redirect) in a v2.1 update?  

Document answers in this section as they are finalized.

---

**Ready to execute.** Share this guide with every engineer/design partner working on Studio v2. Update the checklist as tasks land to maintain an accurate source of truth. 🚀
