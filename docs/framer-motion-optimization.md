# Framer Motion Optimization Worklog

## Context & Guardrails
- Goal: raise Lighthouse performance (Desktop 55 → 90+) without altering Launchflow → Studio sequencing or Step One telemetry (`emitStepOneEvent`, previewSlice).
- Framer Motion vendor chunk (`dist/assets/motion-vendors-CP4TptGL.js`) currently measures **123.35 KB rendered / 41.00 KB gzip** (`npm run build:analyze`, 2024‑11‑05 16:12 PT). Reducing eager motion consumers keeps this chunk off the critical path for Launchflow visitors who never touch Studio.
- Any changes must keep preview orchestration flowing exclusively through `previewSlice.startStylePreview` / `startFounderPreviewGeneration`, tone gating via `useToneSections`, and orientation resets through `useFounderStore.setOrientation`.

### Phase 0 Snapshot — 2024-11-05
- Command: `npm run build:analyze` (rerun on branch `research/framer-motion-baseline`).
- Key chunk sizes: `motion-vendors-CP4TptGL.js` **123.35 KB rendered / 41.00 KB gzip**, `index-BhIjv6vP.css` **139.44 KB raw / 20.09 KB gzip**, `heic2any-C6FoSL36.js` **1,352.89 KB rendered / 341.27 KB gzip**.
- Artifact: `dist/stats.html` (committed build output not checked in; inspect locally for module-level breakdown).
- Lighthouse baseline (desktop, 2024-11-05 16:25 PT): Performance **54**, Accessibility **90**, Best Practices **96**, SEO **92**. (Captured with React DevTools disabled.) Use these scores to track improvements after each wave.
- Lighthouse baseline: run Chrome DevTools Lighthouse (desktop + mobile) with React DevTools disabled; capture render-blocking, animation, and unused-JS diagnostics before implementation. (Local CLI with `npm run preview` + `npx lighthouse http://localhost:4173 --only-categories=performance --chrome-flags="--headless"` works if headless Chrome is available.)

## Inventory of Current Framer Motion Usage

| Location | Feature | Dependency Pattern | Recommendation | Risk Notes |
| --- | --- | --- | --- | --- |
| `src/sections/ProductHeroSection.tsx` | Hero image cross-fades, style pill transitions | `LazyMotion`, `AnimatePresence`, `m.div` | Swap to CSS | Pure opacity fades; no layout physics. Keep inner `GeneratingCanvasAnimation` as-is. |
| `src/routes/MarketingRoutes.tsx` | Wraps marketing routes with `LazyMotion` | `LazyMotion` shell | Conditional | Remove once downstream marketing sections stop requiring motion. |
| `src/pages/StudioPage.tsx` | Provides `LazyMotion` wrapper for Studio shell | `LazyMotion` shell | Keep (for now) | Needed while Studio components still import motion. Revisit after migration. |
| `src/sections/studio/StyleInspirationSection.tsx` | Inspiration section wrapper | `LazyMotion` | Swap to CSS | Child buckets/cards only fade/scale. |
| `src/sections/studio/components/InspirationBucket.tsx` | Bucket entrance fade/translate | `m.div` with variants | Swap to CSS + IntersectionObserver | Straightforward opacity/translate animation; no shared layout state. |
| `src/sections/studio/components/InspirationCard.tsx` | Card cascade (scale/opacity) | `m.article` with variants | Swap to CSS | Replace with staggered CSS animation respecting `prefers-reduced-motion`. |
| `src/sections/studio/components/SpotlightCard.tsx` | Before/after toggle with layout transitions | `motion.article` (`layout` prop) | Keep | Uses FLIP layout to keep overlay smooth; tightly coupled to SpotlightRail. |
| `src/sections/studio/components/SpotlightRail.tsx` | Carousel slides, auto-play | `AnimatePresence`, `motion.div` variants | Keep | Directional transitions and telemetry rely on motion’s custom variants. |
| `src/components/studio/MobileStyleDrawer.tsx` | Mobile drawer enter/exit | `AnimatePresence`, `m.div` | Swap to CSS | Simple translate/opacity transitions; can be handled with CSS and requestAnimationFrame. |
| `src/components/studio/CanvasConfig.tsx` | Panel expand/collapse | `AnimatePresence`, `m.div` | Swap to CSS | Reflow covers height/opacity; CSS transitions sufficient. |
| `src/sections/studio/components/ToneStyleCard.tsx` | Parallax & readiness pulse | `motion`, `useReducedMotion` | Keep | Relies on spring physics + pointer updates; integral to tone gating feedback. |
| `src/sections/studio/components/ToneSection.tsx` | Accordion FLIP & stagger | `motion.section`, `AnimatePresence` | Keep | Uses variants/stagger to manage gating telemetry + async preload. |
| `src/sections/studio/components/StyleAccordion.tsx` | Coordinates tone sections | `AnimatePresence`, `motion` | Keep | Removing motion would require rebuilding accordion timing; high regression risk. |
| `src/sections/studio/experience/GalleryQuickview.tsx` | LayoutGroup for saved previews | `AnimatePresence`, `LayoutGroup` | Keep | Shared-layout transitions ensure smooth Supabase hydration and telemetry. |

## Phase 2 — Keep vs. Swap Feasibility

### Swap-to-CSS Candidates
- **ProductHeroSection**  
  - *Current behaviour*: `AnimatePresence` cross-fades hero canvases (opacity only) on style change; style pills rely on the same LazyMotion scope.  
  - *CSS plan*: Wrap the hero canvas container in a CSS class using `transition: opacity 400ms ease`; on key change, swap classes (`.is-entering`/`.is-leaving`) managed by React state. No layout shifts; `GeneratingCanvasAnimation` remains untouched.  
  - *Reduced motion*: Gate transitions with `@media (prefers-reduced-motion: reduce)` to drop duration to 0.  
  - *Telemetry/UX*: No Step One hooks in this section. Need manual QA to ensure style pill selection still feels responsive.

- **StyleInspirationSection / InspirationBucket / InspirationCard**  
  - *Current behaviour*: `m` components handle initial opacity/translateY entrance and per-card cascade on scroll via `viewport` options.  
  - *CSS plan*: Introduce a shared `.inspiration-visible` class toggled by an IntersectionObserver hook (`useDeferredRender`). Define keyframes for opacity/translate stagger using CSS variables for bucket/card index (`--bucket-index`, `--card-index`).  
  - *Reduced motion*: Within the CSS, set animation duration to `0.01s` and remove translate when `prefers-reduced-motion` is true.  
  - *Telemetry/UX*: Section is decorative; no analytics hooks. Focus on preserving lazy-loaded images and GPU transforms.

- **MobileStyleDrawer**  
  - *Current behaviour*: `AnimatePresence` animates backdrop opacity + sheet translateY.  
  - *CSS plan*: Use CSS transitions on `transform` and `opacity` triggered by `isOpen` boolean class. Keep `requestAnimationFrame` throttled touch handling for swipe-to-close.  
  - *Reduced motion*: Switch to instant open/close when reduced-motion is true.  
  - *Telemetry/UX*: Drawer closes when previews start generating; ensure timing still matches `usePreviewState`.

- **CanvasConfig**  
  - *Current behaviour*: `AnimatePresence` manages panel height collapse/expand and slight fade for card groups.  
  - *CSS plan*: Use `max-height` + `opacity` transitions with `overflow: hidden`. Manage `transitionend` to reset to `auto` height for accessibility.  
  - *Reduced motion*: Skip height animation under reduced motion preference.  
  - *Telemetry/UX*: No telemetry. Need regression checklist for size/enhancement selection, focus management, and auto-scroll behaviour.

### Motion-Keep Justification
- **SpotlightRail / SpotlightCard**  
  - Relies on `AnimatePresence` with `custom` direction to keep carousel pages aligned with auto-play state. Cards use the `layout` prop so before/after slider and CTA button stay in sync. CSS replacement would lose smoothness and complicate telemetry (`trackSocialProofEvent`).  
  - Recommendation: keep framer-motion; investigate lazy-loading the whole rail once we trim surrounding usage.

- **ToneSection / ToneStyleCard / StyleAccordion**  
  - Accordion uses spring physics (`stiffness: 360`, `damping: 28`) and staggered child variants tied to gating telemetry. Cards rely on motion’s layout spring to express “ready” pulses and parallax pointer tracking. Rebuilding with CSS would risk orientation caching and readiness badges.  
  - Recommendation: stay on motion pending deeper redesign; performance impact mitigated once marketing swaps out.

- **GalleryQuickview**  
  - Uses `LayoutGroup` to smoothly animate saved preview reorder, layoutId linking to detail view, and `AnimatePresence` for incremental loading. CSS would break FLIP-like behaviour and degrade Supabase hydration UX.  
  - Recommendation: keep; consider splitting module into its own lazy chunk if additional savings needed.

- **StudioPage LazyMotion shell**  
  - Remains necessary while keep-rated sections exist. Once hero/inspiration/mobile drawer/canvas config drop motion dependencies, revisit to see if the shell can move inside Studio-only entry points.

Document each swap candidate’s CSS spec and validation checklist in the implementation PR to ensure maintainability.

## Phase 3 — Risk & Test Matrix

| Component | Primary Risk | Guardrails to Check | Test / QA Plan |
| --- | --- | --- | --- |
| ProductHeroSection | Hero fade regression, style pills lag | Visual regression on hero; ensure `GeneratingCanvasAnimation` timing unchanged | Manual pass on landing page (desktop/mobile), Lighthouse screenshot diff, check `trackLaunchflowOpened` still fires on CTA |
| StyleInspirationSection / InspirationBucket / InspirationCard | Observer timing off, animations firing despite reduced motion, layout shift | Verify `prefers-reduced-motion` bypass; maintain lazy image loading; avoid scroll jank | Unit test for `useDeferredRender`; manual scroll QA; run Lighthouse to confirm no new CLS |
| MobileStyleDrawer | Drawer close timing desync with preview start, focus management break | Keep auto-close when preview status changes; ensure body scroll lock release; maintain history back behaviour | Manual UX flow (open, swipe, auto-close), Chrome DevTools accessibility check, telemetry observation (`emitStepOneEvent`) |
| CanvasConfig | Height animation causing jump, focus-first control regression | Maintain auto-scroll and focus timer, ensure transitions respect reduced motion | Jest/RTL test for focus timing; manual expand/collapse; verify checkout CTA remains accessible |
| SpotlightRail (keep) | None (no change) | Carousel telemetry (`trackSocialProofEvent`), autoplay pause | Smoke tests after surrounding refactors |
| ToneSection / ToneStyleCard / StyleAccordion (keep) | None | Step One gating telemetry, orientation cache | Regression suite unchanged |
| GalleryQuickview (keep) | None | Supabase hydration + telemetry (`trackGalleryQuickviewScroll`) | Regression suite unchanged |

## Phase 4 — Impact Forecast

| Candidate | Current Motion Dependency | Expected Bundle Change | Measurement Plan |
| --- | --- | --- | --- |
| ProductHeroSection | `ProductHeroSection` + LazyMotion wrapper | Remove marketing dependency on `AnimatePresence` → should drop a few KB from marketing chunk and reduce shared motion imports | Temporarily stub motion import, run `npm run build:analyze`, record chunk delta |
| Style Inspiration Stack | `StyleInspirationSection`, `InspirationBucket`, `InspirationCard` | Eliminating motion here should allow marketing bundle to avoid `LazyMotion` and shrink `motion-vendors` attachment for visitors who never enter Studio | Comment out motion usage, re-run analyze, capture `motion-vendors` rendered size change |
| MobileStyleDrawer | Mobile drawer chunk in Studio entry | Swap reduces Studio mobile chunk by ~3–4 KB and removes runtime motion dependency from drawer path | Local build before/after; compare `StudioExperience` chunk size |
| CanvasConfig | Studio configurator sub-chunk | CSS transitions will remove `AnimatePresence` import, trimming ~2–3 KB from configurator bundle | Build analyze diff; monitor `StudioConfigurator` chunk |
| Aggregate goal | `motion-vendors-CP4TptGL.js` (≈358 KB rendered / 122 KB gzip) | After migrating four components, expect ≥15–20 KB rendered reduction through tree shaking and route-level detachment | Re-run `npm run build:analyze`, log new motion-vendors size in this doc & performance source of truth |

Each estimation will be validated during implementation by checking `dist/assets` sizes and updating this forecast table with actual numbers.

## Prioritised Migration Targets
1. **Marketing Hero & Inspiration Sections** – Remove dependency on `LazyMotion`, convert simple fades/slides to CSS transitions with `prefers-reduced-motion` fallbacks. Validate momentum cues still match telemetry.
2. **MobileStyleDrawer & CanvasConfig** – Replace modal/drawer animations with CSS + GPU-friendly transforms to reduce vendor usage on Studio mobile flow.
3. **Re-run `npm run build:analyze`** after each wave to capture bundle size deltas and update this document.

## Wave 1 Micro Phases
1. **Phase 1A – Hero Transition Swap**
   - Replace `AnimatePresence` fade in `ProductHeroSection` with CSS transition classes.
   - Introduce reduced-motion guard (0 ms duration when `prefers-reduced-motion`).
   - QA: cycle through style pills, verify `GeneratingCanvasAnimation` still runs, confirm CTA telemetry (`trackLaunchflowOpened`).
2. **Phase 1B – Inspiration Intersection Helper**
   - Implement shared `useDeferredReveal` hook using `IntersectionObserver`.
   - Apply to `StyleInspirationSection` to toggle CSS-only reveal classes without motion imports.
3. **Phase 1C – Bucket/Card CSS Animations**
   - Convert `InspirationBucket` and `InspirationCard` stagger effects to CSS keyframes activated by the hook.
   - Validate reduced-motion behaviour and ensure lazy images still load smoothly.
4. **Phase 1D – Cleanup & Metrics**
   - Remove `LazyMotion` wrappers from marketing routes if no remaining motion imports.
   - Run `npm run lint`, `npm run build`, `npm run build:analyze`; log new `motion-vendors` size and marketing chunk deltas.
   - Manual QA checklist: hero responsiveness, inspiration scroll on desktop/mobile, `prefers-reduced-motion` toggle via OS settings.

## Validation Checklist
- `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run build:registry`, `npm run deps:check`.
- Manual QA: Launchflow upload → Studio preview gating, Spotlight carousel autoplay, tone accordion gating, gallery quickview reorder.
- Telemetry smoke: Confirm `emitStepOneEvent` ordering, `trackSocialProofEvent`, `trackGalleryQuickviewAnimationComplete`.

## Open Questions
- Can we isolate framer-motion to Studio-only bundles by relocating marketing interactions to pure CSS? (Requires ensuring marketing routes do not import motion-dependent components).
- Do we need a shared `useDeferredAnimation` hook to unify CSS-based reveals while respecting reduced-motion preferences?
