# Wondertone Style-Selector Rail – Readiness Report

_Prepared:_ 2025-02-14  
_Agent:_ Codex (research phase – no code changes)

## 1. Scope & Method
- Reviewed Wondertone’s tone/style selector rail (desktop + mobile) and supporting store hooks, preview orchestration, edge prompt integrations, and design tokens.
- Mapped debt, performance, accessibility, analytics, feature-flag coverage, data persistence, testing/CI, and dependency posture ahead of scaling from 11 to ~36 styles.
- Inspected source (`src/sections/studio`, `src/store`, `src/config`, `src/utils`, Supabase edge handlers) plus existing implementation roadmaps (`ACCORDION-UI-REFINEMENTS.md`, `docs/style-accordion-elevation-plan.md`).
- No runtime profiling tools were run; performance observations derive from code analysis and known behavior of current FLIP/animation patterns.

## 2. Findings by Dimension

### 2.1 Debt & Consistency
- **Registry sprawl**: `STYLE_CATALOG` (`src/config/styleCatalog.ts`) stores 11 entries but misses prompt IDs, feature flags, hero metadata, and asset variants. Supabase prompt service hard-codes `styleName → styleId` (`supabase/functions/generate-style-preview/stylePromptService.ts`) and preview mocks tint styles procedurally (`src/utils/previewClient.ts`). These need to converge on a single generated registry schema.
- **Magic strings & duplicates**: Tones, tiers, and slug casing repeat across store slices, UI components, analytics, and Supabase. Favorites normalize IDs manually; tests rely on tone lookups instead of registry snapshots.
- **TODO debt**: Only two TODOs remain (`src/pages/GalleryPage.tsx` pre-fill, `src/utils/telemetry.ts` analytics pipeline), but both touch Step One analytics and saved preview flows that will be impacted by increasing style volume.
- **File structure**: Tone prefetch hook lives in `src/hooks/useToneSectionPrefetch.ts` but Accordion bypasses it with inline `new Image`. Mobile drawer mirrors desktop component imports but lacks shared helpers.

### 2.2 Performance Guardrails
- **Accordion FLIP**: `ToneSection` measures `scrollHeight` on expand and sets `setTimeout(350ms)` to reset height (`src/sections/studio/components/ToneSection.tsx`). Works today but reflows 6× larger panels will cost more layout thrash; no ResizeObserver to handle dynamic content. Pointer-events are disabled during animation which may block fast interactions.
- **Thumbnail prefetch**: `StyleAccordion` loads every thumbnail synchronously on first expansion via `new Image()` without throttling (`src/sections/studio/components/StyleAccordion.tsx`). Scaling to 6 styles × 6 drawers will create image waterfalls, especially on mobile. IntersectionObserver helper exists but is unused.
- **Preview cache pressure**: Zustand preview cache limit is 12 entries total (`STYLE_PREVIEW_CACHE_LIMIT` in `src/store/founder/previewSlice.ts`). With 24–36 styles, cache churn will explode and collapsed styles will retrigger Supabase fetches, increasing network and token spend.
- **Abort semantics**: React Query flag introduces `AbortController`, but legacy path leaves the controller global; rapid switching may leak aborted promises if we scale concurrency.
- **Assets**: `public/art-style-thumbnails` only ships JPGs (no WebP/AVIF, no LQIPs). `ToneStyleCard` uses `loading="lazy"` but no placeholder or dimension hints beyond inline width/height.
- **Bundle budget**: Current `dist/assets/index-CkLXFi6Q.js` is 566 KB (ceiling 567 KB). Adding 25 thumbnails or new motion helpers risks busting the budget without tree-shaking or code splitting.

### 2.3 Accessibility & UX Parity
- **Keyboard & focus**: Buttons include `focus-visible` styles but no explicit `type="button"`, risking unintended form submits. Locked cards rely on `aria-disabled="true"` yet still fire `onSelect`, delegating gating to store-level checks.
- **ARIA labelling**: Tone panels expose `role="region"` with labels, but style cards provide empty `alt=""` thumbnails. Locked cards lack `aria-describedby` to announce required tier (`src/sections/studio/components/ToneStyleCard.tsx`).
- **Reduced motion**: Accordion/tone card respect `prefersReducedMotion`, but tooltip shimmer, badge animation, and shimmer overlays remain animated. Mobile drawer uses spring transitions with fallback but no `aria-live` for remaining tokens.
- **Parity gaps**: Mobile drawer imports desktop Accordion wholesale; analytics events and upgrade prompts share behavior, but there’s no responsive fallback for hero layouts or favorites yet.

### 2.4 Analytics & Observability
- **Step One telemetry**: `emitStepOneEvent` only logs to console (`src/utils/telemetry.ts`)—events never hit `sendAnalyticsEvent`. No correlation IDs tie impression→selection→preview.
- **Preview metrics**: `logPreviewStage` dispatches a browser event (`founder-preview-analytics`) but lacks persistence; no aggregation of cache hits/misses, abort reasons, or Supabase status codes.
- **Alerting**: Launchflow metrics hook into PostHog/Mixpanel via `sendAnalyticsEvent`, but the style rail lacks similar instrumentation. Error handling in preview slice sets message strings but never surfaces to analytics.
- **Logging noise**: Preview errors log to console; Supabase API errors bubble as thrown exceptions—no deduplication or alert context for 429s/token exhaustion.

### 2.5 Feature Flags & Rollback
- **Flags**: Only flag in scope is `ENABLE_PREVIEW_QUERY_EXPERIMENT` (`src/config/featureFlags.ts`). No per-style toggles, tone-level kills, or global “expanded rail” switch.
- **Rollback**: Without flags, disabling a broken style requires removing it from `STYLE_CATALOG` and redeploying frontend + Supabase prompt mappings. No gating in Supabase function either.

### 2.6 Data & Migrations
- **Persistent references**: Gallery (`src/utils/galleryApi.ts`), favorites slice, and mock usage history all store style IDs as strings. Adding/removing IDs requires migration for Supabase tables (`previews_status`, gallery items) to prevent orphan references.
- **Prompt cache**: Edge function caches prompts by numeric IDs with TTL; new styles require seeding `style_prompts` table and ensuring warmup config (`promptCache`) includes them.
- **Marketing copy**: Marketing/hero copy lives inside `STYLE_CATALOG`, but Supabase prompt service expects human-readable names (e.g., “Classic Oil Painting”). Duplicating styles for Trending will reintroduce collisions unless we dedupe by slug.

### 2.7 Design Tokens & Theming
- **Token coverage**: Tone gradients defined in `src/config/toneGradients.ts` (classic, trending, etc.). New teal (Abstract) already present, but cards and tooltips still hard-code colors (`bg-purple-500/20`, etc.). Need tokenized palette for badges, locks, CTA states.
- **Contrast**: Several overlays (e.g., trending “Hot” pill, tooltip copy) fall near WCAG AA thresholds against gradient backgrounds.

### 2.8 Testing & CI
- **Automated coverage**: Only vitest file is `tests/studio/tones.spec.ts`, covering gating logic. No tests for registry loader, accordion state, preview abort flows, or analytics emission.
- **CI gates**: Required scripts exist (`npm run lint`, `build`, `build:analyze`, `deps:check`), but no automated perf/a11y budgets or visual regression tests. Dead-code scripts are manual.

### 2.9 Dependencies & Security
- **Outdated packages**: `npm outdated` reveals 30+ lagging deps (Radix UI, Supabase 2.50 → 2.75, React Query 5.59 → 5.90, Stripe 2.x/3.x vs latest 5.x/8.x). Many majors (React 19, Vite 7) available. Need upgrade plan, especially for Supabase SDK security fixes.
- **Security posture**: No dependency audit history documented; secrets for preview endpoints rely on environment variables with minimal validation.
- **Bundle heft**: Radix + Framer Motion dominate bundle; adding more motion variants without code splitting will bloat.

## 3. Risk Register

| Risk | Severity | Owner | Effort | Notes |
| --- | --- | --- | --- | --- |
| Registry divergence between frontend and Supabase prompt IDs | High | Frontend + Edge | 2–3 days | Need generated schema + migration to eliminate hard-coded maps. |
| Preview cache thrash and Supabase load when scaling to 36 styles | High | Platform | 1–2 days | Raise cache limit, add metrics, consider per-tone lazy loading. |
| Thumbnail waterfalls causing jank on mobile | Medium | Frontend UX | 1–1.5 days | Reuse IntersectionObserver hook + idle prefetch, add LQIPs/WebP. |
| Missing analytics pipeline for Step One events | Medium | Data/Frontend | 2 days | Wire `emitStepOneEvent` into `sendAnalyticsEvent` with correlation IDs. |
| Lack of feature flags for per-style rollback | High | Frontend Infra | 1 day | Introduce registry flag fields + build-time toggles + Supabase guard. |
| Accessibility regression risk (locked cards, focus management) | Medium | Frontend QA | 1 day | Add aria descriptors, keyboard tests, tooltip alternatives. |
| Dependency drift (Supabase SDK, Radix, Stripe) | Medium | Platform | 3–5 days | Schedule upgrade sprints, run security audit (`npm audit`). |
| Bundle size stretching current ceiling | Medium | Frontend Perf | 1–2 days | Measure after registry refactor, introduce code splitting/image optimization. |

## 4. Recommended Rollout Blueprint
1. **Infrastructure & Data Prep (Sprint 1)**  
   - Generate canonical style registry (schema includes id, slug, tone, tier, promptId, assets, marketing, feature flags).  
   - Migrate Supabase prompt service to registry-driven IDs; seed new styles via SQL migration.  
   - Add per-style `isEnabled` + tone-level kill switches; expose environment overrides.
2. **Performance & Telemetry Hardening (Sprint 1–2)**  
   - Replace accordion FLIP with ResizeObserver + CSS transitions; integrate `useToneSectionPrefetch`.  
   - Expand preview cache (e.g., 24 entries) and log cache hits/misses via `sendAnalyticsEvent`.  
   - Instrument Step One events, preview stages, and upgrade prompts with correlation IDs and funnel metrics.
3. **Pilot Expansion (Sprint 2)**  
   - Populate 4 styles per drawer (≈24 unique + trending reuse).  
   - Ship thumbnails in WebP/AVIF with placeholders; collect perf data, token spend, and analytics adoption.  
   - Run accessibility pass (aria labels, focus order, reduced-motion toggles).
4. **Full Expansion (Sprint 3)**  
   - Grow to 6 styles per drawer once metrics stable; enable Trending duplicates via registry flags.  
   - Update tests (`tones.spec.ts` + new integration coverage) and CI budgets.  
   - Capture visuals, run `npm run lint`, `build`, `build:analyze`, `deps:check`.

## 5. Acceptance Criteria Before Scaling
- ✅ Unified style registry powering frontend, Supabase, analytics, and marketing copy; hard-coded name/ID maps removed.  
- ✅ Preview cache + thumbnail pipeline handle ≥36 styles without >10% cache miss regression or layout thrash.  
- ✅ Step One analytics flow captured in PostHog/Mixpanel with correlation IDs; upgrade prompts tracked.  
- ✅ Per-style/tone flags & kill switches operational in staging.  
- ✅ Accessibility audit (keyboard, screen reader, reduced motion) passes for both desktop rail and mobile drawer.  
- ✅ Bundle size ≤567 KB (or new perf budget agreed) with WebP/AVIF thumbnails.  
- ✅ Tests cover registry loader, accordion interactions, preview abort flows, and analytics emission; CI gates enforced.

## 6. Suggested Next Steps
1. Draft registry schema & migration doc (include Supabase SQL + backfill instructions).  
2. Prototype prefetch refactor using `useToneSectionPrefetch` + idle callback queue.  
3. Implement analytics bridge from `emitStepOneEvent` to `sendAnalyticsEvent`.  
4. Introduce registry-driven feature flags and hook Supabase function into same config.  
5. Schedule dependency upgrade spike (Supabase SDK, Radix UI, Stripe) with regression testing.  
6. Add automated a11y/perf checks (Lighthouse or Playwright axe) to CI for the style rail.  
7. Prepare pilot rollout comms, telemetry dashboards, and fallback plan before adding new styles.

---

_This document will guide the implementation phase and serves as the baseline for stakeholder sign-off prior to expanding Wondertone’s style catalog._

