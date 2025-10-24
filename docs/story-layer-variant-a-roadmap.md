# Story Layer Variant A – Implementation Roadmap

**Objective**: Ship the feature-flagged Variant A Story Layer beneath the Studio canvas preview without regressing existing UX, while keeping code extensible for Variant B.

---

## Phase 0 · Foundations (prep before coding)
- [x] Confirm `VITE_STORY_LAYER_ENABLED` entry in `.env.local` (flag **missing** today; queue addition for Phase 1 so `import.meta.env` exposure is guaranteed).
- [x] Align on top 5 styles requiring bespoke narrative & palette copy.
- [x] Inventory design tokens (colors, spacing, typography) to reuse for the story card aesthetic.
- [x] Review `CanvasPreviewPanel.tsx`, `CanvasInRoomPreview.tsx`, and telemetry utilities so integration points are crystal clear.

Deliverables:
- Flag available via `import.meta.env`. *(Pending Phase 1 environment update.)*
- Draft narrative/palette copy spreadsheet (style id → copy + descriptors). *(See `docs/story-layer-variant-a-phase0-notes.md`.)*

---

## Phase 1 · Feature Flag & Integration Hooks
- [x] Add flag helper (exported `ENABLE_STORY_LAYER` via `src/config/featureFlags.ts`; `.env` now defines `VITE_STORY_LAYER_ENABLED=true`).
- [x] Lazy-import `StoryLayer` in `CanvasPreviewPanel.tsx`; render placeholder container after “Save to Gallery” block when enabled and `stylePreviewStatus === 'ready'` and `currentStyle.id !== 'original-image'`.
- [x] Pass initial props (`style`, `previewUrl`, `croppedImage`, `orientation`) to story layer stub. *(Entitlements + CTA handlers scheduled for Phase 3 when full component scaffolding lands.)*
- [x] Guard against missing preview URLs (story layer gated behind truthy `displayPreviewUrl`).

Checklist:
- [x] Feature flag verified on/off (flag removal hides Story Layer without affecting existing flow).
- [x] CanvasInRoomPreview placement unchanged.

**Outputs**
- `.env` updated with `VITE_STORY_LAYER_ENABLED=true`; new `ENABLE_STORY_LAYER` export in `src/config/featureFlags.ts`.
- `CanvasPreviewPanel` now lazy-loads `StoryLayer` stub with safe gating logic.
- Placeholder `StoryLayer` component created under `src/components/studio/story-layer/StoryLayer.tsx` ready for Variant A build-out.

---

## Phase 2 · Content Utilities & Data Mapping
- [x] Create `src/utils/storyLayer/copy.ts` exporting narrative, palette, complementary, and share caption helpers (bespoke data for top five styles + tone fallbacks).
- [x] Cover unit tests for each helper (ensuring fallbacks when content missing).
- [x] Document how to add new style copy (inline module guidance + roadmap note).

Checklist:
- [x] All top 5 styles have bespoke entries.
- [x] Tone defaults verified for remaining catalog.

**Outputs**
- `src/utils/storyLayer/copy.ts` with handcrafted content for `classic-oil-painting`, `watercolor-dreams`, `neon-splash`, `pastel-bliss`, `signature-aurora`; tone-based fallbacks cover all other styles.
- `tests/storyLayer/copy.spec.ts` ensures bespoke + fallback paths behave correctly.
- Project checks run post-change (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` – depcheck still reports existing unused/missing dependencies).

---

## Phase 3 · Component Scaffold & Layout
- [x] Create `src/components/studio/story-layer/index.ts` exporting default `StoryLayer` (React.lazy friendly).
- [x] Sub-component files:
  - `StoryGateway.tsx`
  - `StoryCard.tsx`
  - `PaletteStrip.tsx`
  - `ComplementarySuggestions.tsx`
  - `ShareCue.tsx`
  - `ConfidenceFooter.tsx`
- [x] Provide Tailwind-based styling aligned with Wondertone tokens; motion effects respect `prefers-reduced-motion`.
- [x] Verified responsive stack (palette row scrolls horizontally on mobile, cards expand full width).

Checklist:
- [x] StoryLayer renders full Variant A layout using copy utilities.
- [x] Existing preview spacing and CanvasInRoom placement unchanged.

**Outputs**
- Composed Story Layer with gateway, narrative card, palette strip, complementary styles (gated by entitlements), share cue, and trust footer.
- `CanvasPreviewPanel` now forwards entitlements + feedback callbacks; `StudioConfigurator` wires toast/upgrade handlers and scroll-to-canvas helper.
- Build and quality checks completed (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` – depcheck still reports pre-existing unused/missing packages).

---

## Phase 4 · Behavior & Integrations
- [x] Implement share caption copy to clipboard with success/error toast (Clipboard API + textarea fallback).
- [x] `Download Story Card` button behavior:
  - Free tiers trigger upgrade modal.
  - Premium tiers see disabled button with tooltip “Story cards coming soon”.
- [x] Complementary card click flows:
  - Free fallback always available and switches styles directly.
  - Premium options gated with overlay + upgrade prompt.
- [x] Add “Discover the story ↓” indicator (auto-dismisses on intersection or timeout, respects reduced motion).
- [x] Memoize handlers and side effects to avoid unnecessary renders.

Checklist:
- [x] Clipboard copy works across browsers with fallback and user messaging.
- [x] Complementary actions respect existing gating (no duplicate preview triggers).

**Outputs**
- StoryLayer now handles copy-to-clipboard with fallback textarea, watermark-free upgrade prompts, premium gating, and CTA delegates.
- Canvas preview shows a contextual “Discover the story” hint that fades once the module scrolls into view.
- `CanvasPreviewPanel` manages hint visibility via IntersectionObserver; StoryLayer exposes a ref through `forwardRef` for observation.
- Build/quality checks run (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` – depcheck warnings unchanged).

---

## Phase 5 · Telemetry & Logging
- [x] Introduce `src/utils/storyLayerAnalytics.ts` with methods:
  - `trackStoryImpression`
  - `trackPaletteHover`
  - `trackComplementaryClick`
  - `trackShareClick`
  - `trackStoryCtaClick`
- [x] Wire `IntersectionObserver` in `StoryLayer` to log first impression when module enters viewport.
- [x] Emit telemetry on palette hover/tap, complementary CTA, share actions, footer CTAs.
- [x] Confirm event payload includes style_id, tone, user_tier, orientation, gated flag where relevant.

Checklist:
- [x] Events visible in analytics dev console.
- [x] No duplicate impressions on rapid scroll (observer disconnected properly).

**Outputs**
- `storyLayerAnalytics.ts` centralizes logging and feeds Step One telemetry for locked complementary cases.
- Story Layer now observes its own intersection, resets impression state on context changes, and emits analytics for palette, share, complementary, and CTA actions using a consistent context payload.
- Canvas preview hint logic remains intact while telemetry operates independently; build checks rerun (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` – depcheck warnings unchanged).

---

## Phase 6 · QA & Polish
- [x] Manual QA paths: free vs. premium, mobile vs. desktop, story layer disabled vs. enabled.
- [x] Run `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.
- [x] Verify bundle size change, look for tree-shaking across lazy boundary (StoryLayer chunk ~28 kB gzipped; lazy import keeps base bundle flat).
- [ ] Cross-browser smoke test (Chrome ✅, Safari/Firefox to run via BrowserStack before GA).
- [x] Update documentation (`docs/style-story-layer-variant-a-implementation-plan.md`) with final copy and maintenance notes.

Exit Criteria:
- Story Layer matches signed-off design (two-column narrative, curator tiles, polished CTAs).
- Telemetry live and logging.
- No regressions in studio flow (orientation change, session hydration, save to gallery).

**Polish Outputs**
- Story card mirrors design comps (image + narrative top row, curator chips full width).
- Share cue now includes download CTA + social icon row; confidence footer adopts glowing pill buttons.
- Clipboard fallback, social toasts, and telemetry hooks validated; build logs captured for bundle delta.

---

## Post-Launch Monitoring & Iteration
- [ ] Create dashboard for `storyLayer.*` events (engagement, share, CTA).
- [ ] Track impression rate, interaction rate, share clicks during first week.
- [ ] Gather qualitative feedback from support / user sessions.
- [ ] Backlog items for Variant B based on signals (interactive slider, live palette extraction, quote card generator).
