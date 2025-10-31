# Wondertone Studio Performance Deep Dive

Source of truth for ongoing perf work. Each phase captures the commands run, findings, and the backlog of follow‑ups required to stay under Wondertone’s 567 KB bundle ceiling.

---

## Phase 1 — Bundle Analysis (2024-10-30)

### Build snapshot
- `npm run build:analyze` (visualizer treemap written to `dist/stats.html`, gzip stats captured below).
- Vite still emits `(!) Some chunks are larger than 500 kB after minification` — primary offenders are vendor bundles and `heic2any`.

### Oversized & high-priority chunks
| Chunk | Size | Notes |
| --- | --- | --- |
| `dist/assets/heic2any-rMEtf07L.js` | 1.35 MB (341 KB gzip) | Dynamically imported from `utils/imageUtils.ts`; still huge because the module ships web worker + wasm. Needs a lighter fallback or user-agent gate to avoid pulling it for non-HEIC uploads. |
| `motion-vendors-*.js` | 123 KB (41 KB gzip) | Framer Motion separated via manual chunking; acceptable but monitor repeated imports. |
| `react-vendors-*.js` | 150 KB (51 KB gzip) | Expected baseline for React + DOM; no action unless we explore Preact. |
| `supabaseClient-*.js` | 114 KB (31 KB gzip) | Supabase client + helpers; review tree-shaking and ensure we don’t accidentally bundle admin SDK pieces. |
| `index-*.js` | 150 KB (41 KB gzip) | App shell. Contains lucide icons, shared hooks, and some Studio UI refs. Opportunity to lazy load additional UI packages (lucide-react icons, Studio-only helpers). |

### Vendor bundle composition
- Manual chunks in `vite.config.ts` cover `react`, `react-router-dom`, `framer-motion`, `@radix-ui`, `zustand`, `react-query`. No dedicated split for `lucide-react`; all icons are bundled into the main `index` chunk.
- `supabaseClient` remains a single chunk. Consider deferring auth/storage helpers that aren’t needed on initial Studio load.

### Dynamic import coverage check
- Lazy routes and major Studio rails are already using `lazy(() => import(...))`.
- `heic2any` is the only third-party module brought in via `await import()` (good), but we should guard it behind MIME sniffing so non-HEIC flows never fetch the 1.35 MB chunk.
- No evidence of stray static imports for heavy packages such as Lodash or Moment (confirmed with `rg "lodash"` / `rg "moment"`).

### Code-splitting opportunities / red flags
- **Lucide icons in root chunk**: `dist/assets/index-*.js` embeds the entire `lucide-react` factory. Audit icon usage and consider building a curated barrel export (or pre-compiling to raw SVGs) to shrink the root chunk.
- **Canvas + preview extras**: `CanvasCheckoutModal` and `CanvasInRoomPreview` have their own chunks (10–11 KB gzip) — already lazy but worth ensuring we don’t eagerly re-import them elsewhere.
- **Supabase helpers**: validate that we only import the lite client. Look for optional features (storage, edge functions) that could convert to dynamic imports or worker endpoints.

### Duplicate dependency scan
- No duplicate vendor bundles detected; manual chunking prevents React/Router/Framer duplication across routes.
- Generated tone registries (`classicTone.generated.js`, etc.) are chunked per tone — good separation, but ensure we aren’t preloading unnecessary tones on Studio boot.

### Immediate backlog (Phase 1 outcomes)
1. Profile `heic2any` usage — add MIME gating and an inline notice to avoid fetching the wasm unless the user uploads HEIC/HEIF.
2. Map lucide icon usage and prototype a tree-shaken export layer (or inline SVGs) to pull the icon factory out of `index`.
3. Audit `supabaseClient` imports; confirm we aren’t bundling unused storage/auth helpers. *(2024-11-30 update: replaced with `wondertoneAuthClient-*.js` at ~84.7 KB minified / 22 KB gzip after removing Postgrest, storage, and realtime code. Baseline was 114 KB / 31 KB gzip.)*
4. Review Studio entrypoint for eager tone registry hydration; defer non-selected tones where possible.

Next phase: preload/runtime inspection (requestAnimationFrame scheduling, hydration cost, selector churn) once the bundle hotspots above are addressed or sized. 

---

## Phase 2 — Re-render Analysis (2024-10-30)

### Inline allocations in hot paths
- **Inline arrays/objects in JSX**:
  - `src/components/studio/InsightsRail/InsightsRail.tsx:102` and `src/sections/ProductHeroSection.tsx:169` construct array literals inside render. These are low-volume, but map calls inside the Studio rails can be memoized to avoid new references cascading into children.
  - Numerous inline style objects (`style={{ ... }}`) exist in frequently re-rendered components (`ToneStyleCard`, `ToneSection`, `MobileStyleDrawer`, `CanvasPreviewPanel`). Consider hoisting to `useMemo` or CSS classes, especially for lists rendered dozens of times per session.

- **Inline handlers in lists**:
  - `GalleryPage.tsx` (multiple `onClick={() => ...}` within gallery item maps) and `GalleryQuickview.tsx:225` create new closures per render. For large galleries this becomes costly; wrap handlers with `useCallback` or delegate via identifiers.
  - Studio config components (`CanvasConfig.tsx`, `CanvasCheckoutModal.tsx`) also rely on inline lambdas inside map loops. These are fewer items but still contribute to diff noise.

### Memoization & selector review
- `ToneStyleCard` and `CuratedStylesModule` render rich content but aren’t wrapped in `React.memo`. Because `useToneSections` emits new `styleEntry` objects each render, every card re-renders even when only unrelated preview state changes. Action: profile wrapping `ToneStyleCard` and `CuratedStylesModule` in `memo` with shallow prop comparison.
- `useStudioPreviewState` subscribes to a wide swath of store state (`styles`, `orientation`, `stylePreviewStatus`, etc.) and returns a new object every render. Even with `shallow`, consumers receive new references when any tracked field changes. Consider splitting the hook into narrower selectors for components that only need subsets (e.g., `styles` vs. preview status).
- Zustand selectors elsewhere mostly use `shallow`, but ensure each `useFounderStore` usage returns primitives/arrays memoized via `createMemoizedSelector` to limit churn.

### Effect dependency hygiene
- Spot checks revealed several `useEffect` and `useCallback` hooks lacking stable dependencies (e.g., inline functions passed as deps). During later phases we should lint with `eslint-plugin-react-hooks` autofix to catch omissions; no critical offenders surfaced yet.

### List rendering observations
- Style and tone lists (`StyleAccordion`, `ToneSection`, `ToneStyleCard`) use stable keys (`style.id`), so no immediate key issues. However, there’s no virtualization for gallery grids or tone lists. If we expect dozens of gallery items, introduce windowing (e.g., `react-virtualized` or custom intersection observers).
- `InsightsRail` modules conditionally render heavy components without Suspense. Evaluate lazy-loading submodules (e.g., `PaletteModule`, `CuratedStylesModule`) when telemetry confirms they’re below the fold.

### Follow-up backlog
1. Prototype `React.memo` around `ToneStyleCard` and `CuratedStylesModule` (ensure `styleEntry` props are stable or memoized).
2. Split `useStudioPreviewState` into focused selectors (`useStudioPreviewMeta`, `useStudioStyles`) to reduce cascading re-renders in CenterStage and rails.
3. Refactor gallery item handlers to use stable callbacks or event delegation; profile benefits before adding virtualization.
4. Audit inline styles and transition objects in motion components—move recurring configs to constants or CSS modules to cut prop churn.

Next phase: instrumentation + runtime profiling (flame charts, React Profiler, browser performance timelines) once memoization experiments land. 

---

## Phase 3 — Expensive Operations (2024-10-30)

### Heavy computations in render
- **Derived tone data**: `useToneSections` rebuilds tone sections (`STYLE_TONES_IN_ORDER.map`) on each relevant store change. Cache helpers reduce churn, but the work is still O(n) over the full style catalog—verify cache invalidation only fires when inputs mutate and explore memoizing the final `sections` array per tone.
- **Gallery pipelines**: `GalleryPage.tsx` composes `filter`/`map`/`sort` directly in render. Move these into `useMemo` keyed by active filters/sort controls so unrelated state doesn’t trigger full recomputation.
- **Checkout lists**: `CanvasCheckoutModal` maps `sizeOptions`, `frame` choices, and enhancements inline. Small today, but wrap in memoized child components or `useMemo` if the option sets grow.
- **Synchronous storage**: `StyleAccordion` hits `localStorage` during render to gate the trending tip. Guard with `typeof window !== 'undefined'` and shift writes into an effect to avoid blocking paint on slow storage.

### Potential DOM thrash
- `ToneStyleCard` uses `getBoundingClientRect` inside pointer-move parallax. Rects cache after first read, but the initial measurement per render can force layout; consider measuring in a layout effect or deriving pointer deltas from `event.currentTarget` dimensions.
- `GalleryQuickview` measures `firstChild.getBoundingClientRect().width` in `useEffect` whenever the quickview items change. Ensure measurement + state updates are debounced to avoid read/write/read loops.
- `GalleryPage`’s `useLayoutEffect` + `ResizeObserver` is required for the filter drawer. Double-check we don’t trigger redundant `setFiltersHeight` calls during rapid resize cascades.

### Image delivery notes
- Studio imagery (`StylePreviewModule`, `CuratedStylesModule`) already uses `loading="lazy"` and provides AVIF/WebP sources; keep validating this for any new insights modules.
- Marketing heroes still ship eager hero imagery—expected since they are above the fold. When revisiting marketing perf, confirm responsive `srcset`/`sizes` coverage.

### Follow-up backlog
1. Memoize gallery filter/sort pipelines and tone section derivations to prevent repeated O(n) work on every render.
2. Revisit `ToneStyleCard` parallax to eliminate runtime layout reads—or gate the effect behind reduced-motion and pointer type.
3. Audit DOM measurement sites for batching/debouncing to avoid layout thrash.
4. Continue enforcing modern image formats + lazy loading for all non-critical imagery.

Next phase: instrumentation + runtime profiling (React Profiler sessions, RAF/FPS tracking, and waterfall analysis) once these synchronous hotspots are addressed or scoped. 

---

## Phase 4 — Network & Data Fetching (2024-10-30)

### React Query usage
- React Query currently powers only the preview-generation experiment (`usePreviewGenerationService`). The mutation is intentionally simple—no `staleTime`/`cacheTime`—but there are no `useQuery` consumers yet, so we’re not risking duplicate fetches. As we expand React Query, enforce consistent `previewQueryKeys` and guard dependent queries with `enabled` flags.
- Preview mutation invalidates specific style/orientation keys; ensure downstream components actually subscribe via `useQuery` before enabling the experiment globally, otherwise we’re paying for cache churn without render benefits.

### Request sequencing / waterfalls
- Supabase client loads lazily via `supabaseClient.loader.ts`; `prefetchSupabaseClient()` exists but make sure it’s invoked during auth bootstrap so first-load entitlements aren’t blocked by dynamic import latency.
- Entitlements fetch, style hydration, and preview readiness currently run sequentially in the store. There may be room to parallelize entitlements + style registry lookups once we confirm Supabase throughput.
- Gallery Edge function returns nested preview logs; confirm we kick off the gallery fetch as soon as the Studio route mounts (or prefetch on navigation) to avoid a session-check → entitlements → gallery waterfall.

### Payload sizing
- Client-side Supabase selects already scope columns (`tier, tokens_quota, remaining_tokens ...`). Good coverage.
- Several Edge functions still perform `select('*')` (e.g., `convert-heic`, `generate-style-preview`). Audit those responses to ensure we aren’t returning full rows when only a subset is needed.
- Gallery responses can be large; ensure pagination limits from the Edge function stay enforced and cached responses (React Query once adopted) reuse existing data.

### Follow-up backlog
1. Wire `prefetchSupabaseClient()` into auth/session bootstrap so the client is ready before entitlements run.
2. Audit Edge functions using `select('*')` and trim to explicit column lists to shrink payloads.
3. Document Studio’s network sequence (entitlements, styles, gallery) and identify safe parallelization points.
4. When we broaden React Query usage, standardize query key naming and caching defaults (`staleTime`, `cacheTime`, `enabled`).

Next phase: instrumentation + profiling (React Profiler timelines, network waterfalls, runtime metrics) after these network improvements are planned. 

---

## Phase 5 — Animation & Interaction Performance (2024-10-30)

### Layout-sensitive transitions
- Tailwind’s `transition-all` appears across Studio controls (`CanvasConfig` buttons, Launchpad CTAs, numerous hover states). Most cases only animate opacity/transform, but `transition-all` risks catching layout properties. Where we rely on layout (e.g., `max-height` for Launchpad accordions), keep durations short and scoped; otherwise replace with explicit `transition-opacity`/`transition-transform`.
- `ToneStyleCard` parallax effect uses transforms (GPU-safe), but the hover ripple and ready overlays rely on scale/opacity transitions—already performant.

### Framer Motion review
- `AnimatePresence` wrappers in `StyleAccordion`, `ToneSection`, `GalleryQuickview`, and `CanvasConfig` use stable keys and respect reduced-motion flags. Variants focus on transform/opacity; no `layout`-driven animations spotted.
- Ensure future motion additions avoid `transition={{width...}}` and, when animating layout size, opt into Framer’s `layout` prop to prevent automatic DOM reflows.

### Scroll + interaction handlers
- `FounderNavigation` listens to `scroll` without throttling (passive helps). Monitor during profiling—add throttle/debounce if we observe frame drops on long pages.
- `GalleryQuickview` tracks `scrollLeft` to manage fades and active indices. The math is lightweight, but consider debouncing position calculations if gallery width grows.
- Body-scroll locking in `MobileStyleDrawer` mutates `document.body` styles—works today, yet we should batch style reads/writes to prevent layout trashing when the drawer opens/closes rapidly.

### Follow-up backlog
1. Replace broad `transition-all` usage with targeted transform/opacity transitions to guarantee GPU-friendly animations.
2. Profile scroll handlers (`FounderNavigation`, `GalleryQuickview`) and introduce throttling if FPS drops under load.
3. Document Framer Motion conventions: stick to transform/opacity, prefer `layout` prop for size animations, and respect reduced-motion checks.

Next phase: instrumentation + profiling (React Profiler timelines, FPS/RAF sampling, network waterfalls) once these animation guardrails are queued. 

---

## Phase 6 — Memory Leaks & Resource Cleanup (2024-10-30)

### Event listener hygiene
- Core listeners (FounderNavigation scroll, StyleAccordion media query, MobileStyleDrawer resize/orientation/popstate, GalleryQuickview refresh) register cleanups in their effects. No dangling listeners identified.
- Supabase auth subscriptions (`AuthProvider`) clean up on unmount; custom `CustomEvent` listeners (gallery refresh) also unregister.

### Timers & animation frames
- Components using `setTimeout`/`setInterval` store refs and clear them in cleanup (`useGalleryHandlers`, `ActionGrid`, `CanvasInRoomPreview`, `ToneSection`). Store-level timeouts in `previewSlice` are short-lived and not leaked.
- `requestAnimationFrame` consumers (ToneStyleCard, StyleForgeOverlay, GalleryQuickview, GalleryPage) cancel frames in cleanup.

### Subscriptions & long-lived resources
- Supabase client loader caches the promise with graceful error handling; no lingering sockets/event sources detected.
- React Query is mutation-only today; Zustand subscriptions rely on React hook lifecycle for cleanup.

### Follow-up backlog
1. Codify cleanup best practices (timers, RAF, event listeners) in contributor docs to avoid regressions.
2. Periodically audit store-level timeouts and gallery refresh events to ensure they don't accumulate during rapid user flows.

Next phase: instrumentation + profiling (React Profiler timelines, FPS/RAF sampling, network waterfalls) once cleanup conventions are documented.

---

## Phase 7 — Critical Path Analysis (2024-10-30)

### Time to Interactive (TTI)
- `index.html` loads a single module script (`/src/main.tsx`) after the root div—no extra blocking scripts. Google Fonts are preconnected and use `display=swap`, minimizing FOIT. 
- Initial store setup eagerly loads the full style registry; keep an eye on startup time as tone catalog grows. Consider deferring non-essential tone metadata after hydration.
- Critical CSS ships via Vite bundle; no inline critical CSS pipeline yet. Evaluate extracting above-the-fold styles for the marketing hero if TTI becomes a bottleneck.

### Largest Contentful Paint (LCP)
- Likely candidate: hero canvas image rendered by `GeneratingCanvasAnimation` inside `ProductHeroSection`. Images are offered as direct `/art-style-hero-generations/...` assets but aren’t preloaded. Add `<link rel="preload" as="image">` for the default hero preview to tighten LCP.
- Hero overlay shows a spinner before the preview fades in; ensure the underlying image isn’t blocked by animation timers (we start showing within 300ms). Monitor in Lighthouse to confirm the overlay isn’t delaying LCP recognition.

### Cumulative Layout Shift (CLS)
- Hero canvas uses `aspectRatio: '16 / 9'` and fixed container heights, preventing shifts. Trust strip and style pills load imagery with defined dimensions and `object-cover`; no obvious shifting.
- Google Fonts use `display=swap`, mitigating FOIT/CLS. Continue specifying explicit image dimensions (width/height or aspect ratios) in marketing sections to keep CLS near zero.

### Follow-up backlog
1. Preload the default hero preview image (and possibly hero font files) to reduce LCP.
2. Profile initial store hydration to confirm style registry loading doesn’t inflate TTI; consider deferring secondary tone metadata.
3. Maintain explicit size attributes on any new hero or trust imagery to preserve CLS gains.

Next phase: runtime instrumentation (React Profiler timelines, FPS/RAF sampling, network waterfalls) leveraging the findings from all prior phases. 

---

## Phase 8 — File/Pattern Deep Checks (2024-10-30)

### High-traffic files
- **`useFounderStore.ts`**: Selectors leverage `createMemoizedSelector`, but the root hook returns the entire state object (`styles`, `enhancements`, etc.). Audit consumers to replace broad subscriptions with focused hooks, especially where only a subset is needed (mirrors Phase 2 backlog).
- **`StudioConfigurator.tsx`**: Context provider (`StudioExperienceProvider`) passes an inline value object. Wrap in `useMemo` so children don’t re-render on every render.
- **`ToneStyleCard.tsx`**: Parallax effect still uses `requestAnimationFrame`; memoize `styleEntry` in parent or wrap the card with `React.memo` to avoid re-running pointer logic unnecessarily.
- **`previewSlice.ts`**: Async flow relies on sequential `await` calls per preview; no redundant fetches spotted, but ensure we reuse cached previews before hitting Supabase (already handled via `getCachedStylePreview`).

### Pattern scan
- Inline style usage appears primarily for pointer-control or dynamic width/height. Where possible, migrate static styles to CSS classes to improve memoization.
- Numerous `console.*` statements remain for analytics/dev logging (`telemetry`, `registryLazy`). Decide which to keep for development vs. wrap behind feature flags for production builds.
- No chained `.filter().map()` anti-patterns in render (only the generated registry file). No `eslint-disable` hints for hook dependencies.

### Follow-up backlog
1. Memoize `StudioExperienceProvider` value and audit other context providers for the same pattern.
2. Identify key store consumers and refactor to narrower selectors to reduce re-render pressure (ties into Phase 2).
3. Catalog production `console.*` usage; demote noisy logs or guard behind dev flags.

Next phase: instrumentation + profiling with React Profiler and browser devtools now that code hotspots are cataloged. 

---

## Phase 9 — Runtime Profiling Recommendations (2024-10-30)

### React DevTools Profiler targets
- **StudioConfigurator subtree** (ToneSection, ToneStyleCard, CanvasPreviewPanel, InsightsRail) to confirm memoization and selector tweaks eliminate redundant renders.
- **Gallery experiences** (GalleryQuickview + GalleryPage) while scrolling and switching items to monitor handler-induced commits.
- **Launchpad + ProductHeroSection** interactions to ensure hero animations and cross-scroll CTAs don’t trigger global re-renders.

### Network tab focus
- Capture the initial `/create` load showing Supabase auth → entitlements → style registry → preview preload to identify any sequential bottlenecks.
- Record preview generation requests (start → polling → Supabase response) to validate caching and latency.
- Inspect gallery save + quickview refresh requests for payload size and caching reuse.

### Memory profiler snapshots
- Take heap snapshots before/after extended Studio sessions (multiple preview generations, gallery saves) to confirm timers/cache entries release.
- Run allocation timelines during gallery scrolling to watch ToneStyleCard parallax + quickview item reuse.

### Lighthouse audits
- Run Lighthouse (mobile & desktop) for `/`, `/create`, and `/pricing`, focusing on earlier metrics: LCP (hero preload), TTI (registry hydration), CLS (image sizing), and accessibility coverage for new interactive controls.

Next steps: execute these profiling passes and feed findings back into the backlog for targeted fixes. 

---

## Phase 10 — Additional Safeguard Checks (2024-10-30)

### Automated linting for perf traps
- Enable `react/jsx-no-bind`, `react-hooks/exhaustive-deps`, and `unicorn/no-array-reduce` (or equivalents) in the ESLint config to surface inline handlers, missing dependency arrays, and reduce-based allocations before they land. Capture any new lint findings in CI.

### Bundle diff monitoring
- Add bundle size auditing to CI using tools such as `source-map-explorer` or `bundle-buddy`. Snapshot `dist/stats.html` output and fail builds when key chunks exceed agreed thresholds (567 KB baseline for `index`).

### Accessibility & real-network tooling
- Extend perf runs with Axe accessibility scans plus WebPageTest (or SpeedCurve) scripts for `/`, `/create`, `/pricing` to capture LCP/TTFB under realistic latency. Compare with Lighthouse reports to catch gaps.

### E2E profiling scripts
- Integrate Playwright or Cypress flows that exercise Studio critical paths (preview generation, gallery save, checkout). Capture performance traces/Chrome DevTools logs automatically and flag regressions in the perf CI pipeline.

Next phase: finalize the performance roadmap (Phase 11) summarizing key backlog items and owner hand-offs.

---

## Phase 11 — Consolidated Backlog & Profiling Plan (2024-10-30)

| Severity | Category | Issue | Impact | Fix / Next Action |
| --- | --- | --- | --- | --- |
| High | Bundle | `heic2any` fetched for every upload | Adds 1.35 MB payload, delays Studio TTI | Gate dynamic import in `utils/imageUtils.ts` behind HEIC MIME/extension check |
| High | Bundle | Entire `lucide-react` factory in `index` chunk | Inflates initial JS (~150 KB gzip) | Replace with curated icon exports or inline SVGs; update imports |
| Medium | Bundle | Full style registry hydrated on boot | Longer parse/execute during Studio init | Ship minimal metadata initially; lazy-load detailed tone data |
| Medium | Bundle | Supabase client chunk still 114 KB | Longer TTI, especially on first auth fetch | Audit imports; split optional helpers (storage, edge) into dynamic chunks |
| High | Re-render | `useToneSections` + `ToneStyleCard` recreate large trees per state change | FPS drops when browsing styles | Memoize tone sections; wrap `ToneStyleCard` (and related list items) in `React.memo` |
| Medium | Re-render | Inline handlers/filter/sort in `GalleryPage`, `GalleryQuickview` | Extra renders on every interaction | Wrap handlers in `useCallback`; hoist filter/sort logic into `useMemo` keyed on filters |
| Medium | Re-render | Context values (e.g., `StudioExperienceProvider`) re-created inline | Triggers unnecessary rerenders down tree | Wrap provider value in `useMemo` (and audit other providers) |
| Medium | Re-render | Inline style objects across hot components | Breaks memo/`React.memo` optimization | Convert recurring styles to CSS classes or memoized objects |
| Medium | Network | No preload for hero canvas image | LCP slips when hero loads | Add `<link rel="preload" as="image">` for default hero preview; consider font preload |
| Medium | Network | Supabase client not prefetched | First entitlements fetch waits on dynamic import | Call `prefetchSupabaseClient()` during auth/bootstrap |
| Medium | Network | Edge functions use `select('*')` in places | Larger payloads over the wire | Narrow selects in Supabase edge functions (preview, gallery, convert-heic) |
| Medium | Animation | `FounderNavigation` scroll handler unthrottled | Potential main-thread jank on long scrolls | Throttle/RAF-wrap handler before calling `setIsAtTop` |
| Low | Animation | `transition-all` on common controls | Risks animating layout props | Replace with targeted transform/opacity transitions |
| Medium | Memory | Store-level timeouts/events not centrally documented | Harder to spot regressions | Document cleanup patterns; audit during stress tests |
| Medium | Other | Numerous `console.*` logs in production | Noisy logs hide real issues | Guard logs behind `import.meta.env.DEV` or central logger |
| Medium | Tooling | Lint rules for perf traps absent | Inline handlers & missing deps slip through | Enable `react/jsx-no-bind`, `react-hooks/exhaustive-deps`, `unicorn/no-array-reduce` in ESLint |
| Medium | Tooling | Bundle diff monitoring absent | Increases risk of unnoticed regressions | Add `source-map-explorer`/`bundle-buddy` checks in CI |
| Medium | Tooling | Accessibility & real-network gaps beyond Lighthouse | Possible undiscovered UX issues | Run Axe and WebPageTest in CI across `/`, `/create`, `/pricing` |
| Medium | Tooling | No automated perf profiling flows | Manual profiling only | Add Playwright/Cypress scripts that capture performance traces for critical paths |

### Profiling execution checklist
- Use React DevTools Profiler on StudioConfigurator subtree, Gallery flows, and hero interactions once memoization fixes land.
- Capture DevTools Network traces for initial `/create` load, preview generation, and gallery save flows.
- Take Chrome heap snapshots before/after long Studio sessions and during gallery scroll to confirm memory cleanup.
- Run Lighthouse (mobile & desktop), Axe, and WebPageTest for `/`, `/create`, `/pricing`; record regressions in CI.

With Phase 11 complete, this document now serves as the overarching backlog and instrumentation plan for Wondertone’s performance mandate.
