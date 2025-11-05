## Wondertone Studio Performance Audit

This working document tracks the full-spectrum analysis of the Studio experience. Each phase lists the diagnostic goals, concrete steps, and reminders on what to capture so we leave no stone unturned.

---

### Phase 1 – Baseline Metrics & Reproduction
- Launch the app (`npm run dev`) and run Chrome Lighthouse (mobile + desktop) on the Studio route. Record FCP, LCP, CLS, TBT, INP, and any audit warnings.
- Capture one DevTools Performance trace (30–60 s) while scrolling through Studio. Identify scripting/layout spikes and annotate notable frames.
- Document console warnings or deprecations that appear during typical usage (upload photo, switch styles, open modals).
- Output: metric table, screenshots, and a short summary of console noise.

---

### Phase 2 – Build & Bundle Analysis
- Run `npm run build`, `npm run build:analyze`, `npm run lint`, and `npm run deps:check`; note failures or warnings.
- Export the `dist` bundle breakdown: JS chunk sizes, CSS bundles, assets > 100 KB. Flag duplicated dependencies or heavy vendor packages.
- Identify opportunities for dynamic imports or tree-shaking gaps (e.g., large icon sets, animation libs).
- Output: bundle size table, list of heavy modules, recommended code-splitting candidates.

#### Commands & Outcomes
- `npm run build`  
  - Succeeds; style registry regeneration runs first.  
  - Vite warns that Browserslist data is **14 months old**—we should run `npx update-browserslist-db@latest`.  
  - Emits chunk-size warning: “Some chunks are larger than 500 kB” pointing to `heic2any`, vendor bundles, and core app chunks.
- `npm run build:analyze`  
  - Produces identical bundle list with source-map sizes; confirms the heavy chunks noted above.
- `npm run lint` **fails** (4 errors):  
  - `SocialProofSection.tsx` calls React hooks after an early return (conditional hooks).  
  - `InspirationBucket.tsx` has an unused `id` parameter.  
  - Lint must be fixed before we can rely on CI results.
- `npm run deps:check`  
  - Passes; no unused/unknown dependencies detected.

#### Bundle Snapshot (gzip unless noted)
| Chunk | Size | Notes |
| --- | --- | --- |
| `heic2any-C6FoSL36.js` | **1.35 MB** (341 KB gzip) | massive; only needed for HEIC conversions – prime dynamic-import candidate |
| `react-vendors-CtinYixr.js` | 157 KB | React, react-dom, scheduler; expected but large |
| `index-js4DhK0o.js` | 151 KB | main app logic; holds many shared components |
| `motion-vendors-CP4TptGL.js` | 123 KB | framer-motion + animation utils |
| `wondertoneAuthClient-C34lmmxO.js` | 85 KB | Supabase auth + helpers; currently part of initial load |
| `radix-vendors-BSe4sCtC.js` | 79 KB | Radix UI primitives (dialogs, popovers, sliders, etc.) |
| `StudioPage-BlE8XjAn.js` | 63 KB | Studio route shell; sizeable for a single page |
| `StudioExperience-CCB7Dndr.js` | 60 KB | Center-stage logic, rails, modals |
| `LaunchpadLayout-Ch-jX0f9.js` | 36 KB | Upload accordion + smart crop UI |
| `PricingPage-BN0F3e_P.js` | 19 KB | Pricing surface bundled into main build |
| `StyleAccordion-DBouVYsZ.js` | 26 KB | Tone accordion logic |
| CSS `index-CFaL65Xj.css` | 139 KB (20 KB gzip) | Tailwind + component styles; very large for a single CSS file |

Assets below 100 KB are still numerous; we should audit when they load (many tone-generated JS files).

#### Observations & Issues
- **heic2any** dominates the bundle. It is only required when downloading HEIC images—should become a lazy import (e.g., within the download handler).
- **Radix + framer-motion** are shipped eagerly. Consider splitting motion-heavy surfaces (Spotlight rail, canvas strip) into async sections so idle users don’t pay the cost upfront.
- **Supabase auth client** (85 KB) loads even before the user opens auth flows. We can lazy-load the auth provider or exchange constructors.
- **Studio route chunks** (~120 KB combined) plus the 140 KB CSS file produce heavy initial payloads. Investigate pruning unused shadcn components, collapsing duplicated gradient/tailwind utilities, and code-splitting the rails.
- Tone registry chunks load per tone (8–13 KB each). They’re reasonable individually, but ensure we don’t import every tone on first paint—especially the experimental tone (currently missing from `registryLazy` switch, causing console warnings and likely extra network churn).
- Vite’s chunk-size warning indicates we should configure `manualChunks` or `dynamic import()` to keep initial JS under control.

#### Immediate Action Items
1. **Fix lint failures**  
   - Move hooks in `SocialProofSection` above the early return guard; remove the unused `id` argument in `InspirationBucket`.
2. **Lazy-load heavy libraries**  
   - Import `heic2any` dynamically inside the HEIC-conversion flow.  
   - Split `motion-vendors` usage so Spotlight and Canvas strips hydrate after idle (IntersectionObserver).  
   - Defer Supabase auth client until the user initiates auth.
3. **Review Radix usage**  
   - Audit which components need Radix primitives at initial render; consider extracting rarely used popovers/modals into separate chunks.
4. **Address CSS bloat**  
   - Run Tailwind content check for unused utilities; consider component-level styles or CSS code-splitting if `index.css` keeps growing.
5. **Update Browserslist data** to remove build warning.

These findings will steer the optimization plan for Phases 3–5 (profiling, network, animations). We should rerun `npm run build` after each major refactor to track progress.

---

### Phase 3 – Runtime Profiling
- Use the React Profiler to sample: initial render, uploading a photo, swapping styles, opening/closing modal dialogs, spotlight animation cycles.
- For each sample, list components with long render durations or excessive re-renders; check memoization and context usage.
- Compare with Chrome Performance flame charts to surface layout trashing or expensive JS hotspots.
- Output: profiler screenshots, suspicious component list, potential optimizations.

---

### Phase 4 – Motion & Render Smoothness
- Audit all animations (Framer Motion, CSS keyframes, canvas strip, spotlight wipe). Confirm they rely on GPU-friendly transforms.
- Verify `prefers-reduced-motion` is respected—disable loops, shimmer effects, auto-scroll when the user opts out.
- Note any animations running off-screen or triggering layout thrash; recommend throttling or intersection observers where needed.
- Output: animation inventory, risk assessment, and mitigation ideas.

---

### Phase 5 – Network & Assets
- In DevTools Network tab, capture page load and a full photo-upload flow. Chart request waterfalls and payload sizes.
- Flag oversized images, missing `loading="lazy"`, or assets lacking cache headers. Check fonts and third-party requests for compression.
- List redundant API calls or retry storms (Launchflow previews, Supabase interactions, telemetry).
- Output: annotated waterfall, asset checklist, and API optimization suggestions.

---

### Phase 6 – Layout & Responsiveness Grid
- Review Studio at key breakpoints (mobile, tablet, 1280, 1440, 1600, 1920, 2560 px). Record overflow issues, double scrollbars, or layout jumps.
- Evaluate sticky elements (left/right rails, modals) for Safari/Firefox parity.
- Document typographic scaling, spacing consistency, and whether rails dominate width at standard zoom levels.
- Output: per-breakpoint findings, screenshots, and layout tuning recommendations.

---

### Phase 7 – Code Health & Over-Engineering
- Inspect store slices, hooks, and utility modules for duplicated logic, unnecessary context, or heavy synchronous work.
- Identify placeholder/test helpers shipping to production; suggest moving to dev-only or removing.
- Note any over-engineered flows (e.g., deep component trees that could be simplified) that hurt maintainability/performance.
- Output: refactor opportunities grouped by impact and effort.

---

### Phase 8 – Observability & Error Handling
- Audit telemetry events for naming consistency and payload completeness. Highlight missing interactions (e.g., canvas CTA, preview retries).
- Review error boundaries to ensure meaningful fallbacks render and errors are logged once.
- Evaluate logging levels; remove verbose console debug statements for production builds.
- Output: observability gaps, error-handling polish, logging cleanup checklist.

---

_We’ll update each section with findings, metrics, and action items as the audit progresses._
