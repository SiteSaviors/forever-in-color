# Social Proof Section – Phased Implementation Plan

**Project:** Wondertone Studio – “Proof of Wonder” Social Proof Band  
**Objective:** Ship a premium, conversion-optimized social proof experience that celebrates digital outcomes first while showcasing canvas prints as the aspirational add-on.  
**Guiding Principles:** Subscription-first storytelling, zero wasted performance budget, consistent Wondertone visual language, analytics-ready.

> Phase 0 (Artifact Prep) is already in progress – see `docs/social-proof-phase0-artifacts.md`. The phases below assume those deliverables are complete before any code lands.

---

## Phase 0 – Artifact Prep (✅ in progress)
- Finalize metrics, testimonials, UGC, and legal approvals.
- Produce optimized AVIF/WebP/JPG assets & alt text.
- Resolve open questions (CTA destinations, analytics params, canvas anchor).
- **Exit criteria:** Asset checklist from Phase 0 doc is 100 % checked off and stakeholders sign off.

---

## Phase 1 – Configuration & Skeleton
**Goal:** Build the data backbone and section shell without motion or interactivity. Keep the delta minimal so we can iterate in isolation.

1. **Data modules**
   - Create `src/config/socialProofContent.ts` with typed arrays for:
     - `HERO_STATS`, `PRESS_LOGOS`
     - `SPOTLIGHTS` (with before/after paths, quotes, metrics, plan type)
     - `MOSAIC_TILES`
   - Provide types for analytics IDs and CTA metadata.
   - Include compile-time sanity checks (counts, product mix) but guard them for dev mode to avoid prod crashes.

2. **Section shell (`SocialProofSection.tsx`)**
   - Render headline/subhead, stat pills, placeholder spotlight wrapper, mosaic grid, CTA capsule, footnote.
   - No animations, no carousels—just static layout with responsive breakpoints.
   - Ensure early return on empty config (graceful degradation).

3. **Styling foundation**
   - Shared background: `bg-slate-950/95` + new radial overlay tuned to match Style Inspiration but slightly brighter.
   - Constrain main container to `max-w-[1100px]` for the gallery feel.
   - Introduce utility classes for glass surfaces, badge pills, etc., in CSS modules if needed (or reuse existing utilities).

4. **QA checkpoints**
   - Visual check on desktop/tablet/mobile (no animations yet).
   - Bundle delta observation (`npm run build:analyze`) to set baseline.

**Exit criteria:** Static section renders with placeholder components; TypeScript passes; no visual regressions in surrounding sections.

---

## Phase 2 – Spotlight Rail (Hero Proof)
**Goal:** Bring the hero spotlight to life with conversions in mind.

1. **SpotlightCard component**
   - Before/after imagery with wipe interaction (hover on desktop, tap toggle on mobile).
   - Quote, metric, avatar/plan badge.
   - CTA chip (e.g., “Preview this style”) – stub only; real handler in Phase 4.

2. **SpotlightRail logic**
   - Auto-advance every 6 s with pause on hover/focus.
   - Support manual navigation via left/right buttons + optional dot indicators.
   - Reuse `useMediaQuery` for responsive card layout (1 card mobile, 3-up desktop).
   - Ensure reduced-motion fallback (fade transition).

3. **Performance**
   - Preload current + next spotlight assets; lazy-load others.
   - Keep framer-motion usage scoped—no additional `LazyMotion`.

4. **QA**
   - Verify auto-advance doesn’t trigger when tab inactive.
   - Confirm keyboard navigation (arrow keys when component focused).

**Exit criteria:** Spotlight rail feels premium, respects reduced motion, and doesn’t regress performance.

---

## Phase 3 – Proof Mosaic & Press Band
**Goal:** Build breadth proof without overwhelming visitors.

1. **Press strip**
   - Horizontal band of logos (CSS marquee or manual fade) with accessible labelling.
   - Optional toggle to pause animation on hover.

2. **Mosaic grid**
   - 8 tiles (4 columns desktop, 2 columns mobile) with consistent spacing.
   - On hover/tap: reveal overlay with quote and badge (digital/canvas/hybrid).
   - Lazy-load thumbnails; use IntersectionObserver to animate fade-in.

3. **Micro-motion**
   - Subtle parallax on scroll (CSS transform) to add depth.
   - Ensure fallbacks on reduced motion (static tiles).

4. **A11y & responsiveness**
   - Tiles should be buttons or links with ARIA labels.
   - Provide focus ring styling; maintain contrast ratios.

**Exit criteria:** Press strip + mosaic render cleanly, motion is subtle but distinct, and the grid remains performant on mobile.

---

## Phase 4 – Funnel Wiring & Analytics
**Goal:** Hook the section into real conversion flows and instrumentation.

1. **CTA actions**
   - Primary CTA → navigate to `/create` or trigger upload/auth modal (confirm with product).
   - Spotlight CTA chips → preselect style (if ready) or open “Try this style” modal stub.
   - Canvas footnote + mosaic links → anchor to canvas quality section or external gallery.

2. **Analytics events**
   - Fire `social_proof_cta_click`, `social_proof_spotlight_interaction` (auto/manual), `social_proof_mosaic_open`, `social_proof_canvas_link_click`.
   - Ensure events include payload (spotlight ID, product type, etc.).

3. **Error boundaries & safeguards**
   - Wrap section in localized error boundary so failures don’t break Studio page.
   - Implement fallback UI for offline mode (e.g., static message).

4. **Copy polish**
   - Replace placeholder copy with final approved quotes and metrics.
   - Double-check legal disclaimers if metrics require footnotes.

**Exit criteria:** All CTAs trigger correct flows, analytics verified in dev tools, placeholder code/comments removed.

---

## Phase 5 – Performance, A11y & QA Hardening
**Goal:** Ship-level polish before merge.

1. **Performance validation**
   - Rerun `npm run build:analyze`; confirm gzipped delta <10 KB.
   - Lighthouse pass (Performance ≥85, Accessibility ≥95).
   - Verify lazy-loading behaves correctly (simulate slow network).

2. **Accessibility sweep**
   - Keyboard-only navigation through spotlights and mosaic.
   - Screen reader labels for stats, testimonials, CTA chips.
   - Test reduced-motion scenario (system preference).

3. **Cross-browser**
   - Chrome, Safari, Firefox (latest two versions), iOS Safari, Android Chrome.
   - Ensure `matchMedia.addEventListener` fallback works (polyfill or compatibility guard).

4. **Regression checks**
   - Confirm Instant Breadth and Style Inspiration remain unaffected.
   - Validate global nav and footer still behave.

**Exit criteria:** QA sign-off checklist complete, no major regressions, analytics events firing, content approved.

---

## Phase 6 – Launch & Post-Launch Follow-up
**Goal:** Ensure smooth rollout and plan future iterations.

1. **Deploy in feature flag (optional)** for staged rollout.
2. **Monitor metrics** – CTA click-through, creator plan conversions, heatmap engagement.
3. **Feedback loop** – Collect qualitative feedback from support/sales.
4. **Backlog next enhancements** – e.g., real-time stats, dynamic testimonials from CMS, video testimonials.

**Exit criteria:** Post-launch review completed, follow-up tasks created, metrics baseline captured.

---

## Implementation Guardrails (Applies to All Phases)
- No nested `LazyMotion`. Use existing page-level wrapper.
- Keep new helpers generic (`useMediaQuery`, potential `useAutoAdvance`) for reuse.
- Favor CSS transforms/opacity for motion; avoid layout-thrashing animations.
- Use content-driven configs to minimize code churn for marketing updates.
- Document analytics payloads in `/docs/analytics-event-spec.md` (to create Phase 4).
- Maintain strict TypeScript types with explicit interfaces for testimonial assets.
- Ensure every asset path resolves to optimized formats—lint for missing AVIF/WebP.

---

**Next Step:** Complete Phase 0 checklist. Once signed off, execute Phase 1 following this plan. Each phase should land in its own PR with clear testing notes to keep the rollout controlled and reviewable.
