# Wondertone Studio 2025 Performance Enhancement Plan

## Purpose
- Uphold Wondertone’s premium AI canvas mandate while protecting Launchflow → Studio configurator sequencing and Step One telemetry.
- Deliver production-ready guidance for performance, scalability, and maintainability improvements without bypassing `previewSlice.startStylePreview` or `emitStepOneEvent`.
- Provide founders with a VS Code–first roadmap that can be executed via focused feature branches and validated with `npm run lint`, `npm run build`, `npm run build:analyze`, and `npm run deps:check`.

## Executive Priorities
1. **Secure preview and auth surfaces** so Supabase sessions, cached previews, and token entitlements remain uncompromised.
2. **Trim critical-path payloads** (Studio shell, preview pipeline, animation vendors) to hit or surpass the 567 KB JS ceiling.
3. **Streamline media ingestion** for Launchflow uploads while keeping orientation, smart crop, and Step One analytics intact.
4. **Strengthen observability and testing** to ensure Launchflow → Studio handoffs, Step One telemetry, and Supabase preview caching stay healthy.

## Key Findings & Proposed Enhancements

### 1. Security & Compliance
- **[10 — Critical] Finding:** Supabase session hashes and entitlement snapshots log raw payloads (`src/providers/AuthProvider.tsx`, `src/utils/entitlementsApi.ts`), exposing auth tokens and emails in production consoles.
  - **Solution:** Guard console logging behind `import.meta.env.DEV`, redact sensitive fields, and confirm `emitStepOneEvent` remains unaffected.
- **[10 — Critical] Finding:** Edge function CORS replies allow credentials with wildcard origins (`supabase/functions/generate-style-preview/corsUtils.ts`), breaking browser security guarantees.
  - **Solution:** Restrict CORS origins to trusted Wondertone domains while maintaining preview webhook and polling compatibility.
- **[6 — Medium] Finding:** Production builds ship source maps (`vite.config.ts`), leaking implementation details and analytics wiring.
  - **Solution:** Gate `build.sourcemap` behind `process.env.VERBOSE_SOURCEMAPS === 'true'` to keep debugging opt-in.

#c
- **[7 — High] Finding:** `framer-motion` ships a 122 kB vendor chunk across marketing and Studio.
  - **Solution:** Adopt `LazyMotion` + feature imports in tone accordions and Launchflow panels; maintain GPU-friendly transforms.
- **[7 — High] Finding:** Supabase client bundle (114 kB) loads immediately on Studio entry.
  - **Solution:** Defer Supabase client hydration until authentication is required, preserving entitlement hydration and `useFounderStore` guarantees.
- **[5 — Moderate] Finding:** Duplicate Google Fonts requests (`index.html`, `src/styles/tailwind.css`) add redundant requests and CSS.
  - **Solution:** Consolidate font loading (single Google Fonts entry or self-host), retaining landing pixel parity.
- **[4 — Moderate] Finding:** `public/lovable-uploads` (82 MB) bloats deploy artifacts and cache churn.
  - **Solution:** Stage heavy marketing assets on CDN or behind lazy fetch without impacting Launchflow sample previews.

### 3. Preview Pipeline & State Management
- **[6 — Medium] Finding:** `useFounderStore.ts` aggregates Launchflow, orientation, entitlement, and checkout logic (~400+ LOC), increasing coupling risk.
  - **Solution:** Split store slices while keeping `previewSlice.startStylePreview` as the single Supabase entry and routing orientation changes through `setOrientation`.
- **[5 — Moderate] Finding:** Preview polling lacks abort support, wasting Supabase requests during quick style switches.
  - **Solution:** Thread `AbortSignal` through `pollPreviewStatusUntilReady` and cancel on orientation/style changes to keep telemetry accurate.

### 4. Media & Orientation Flow
- **[5 — Moderate] Finding:** HEIC conversion latency impacts Launchflow success messaging and Step One cues.
  - **Solution:** Pair HEIC offload with optimistic smart crop caching, keeping Step One telemetry (`emitStepOneEvent`) intact.
- **[4 — Moderate] Finding:** Orientation bridge still exposes legacy global (`window.__openOrientationCropper`), complicating typed analytics hooks.
  - **Solution:** Move the global behind a feature flag and emit typed context events; validate with `tests/studio/actionGridOrientationBridge.spec.tsx`.

### 5. Analytics & Telemetry
- **[3 — Low] Finding:** `emitStepOneEvent` and Launchflow analytics fall back to console logging, risking signal loss.
  - **Solution:** Channel events through `sendAnalyticsEvent` with buffering and debounce Launchflow telemetry for carousel pacing.
- **[2 — Low] Finding:** No Lighthouse or a11y automation in CI to monitor LCP/CLS and WCAG compliance.
  - **Solution:** Add Lighthouse runs for `/` and `/create` plus `axe` scans, ensuring GPU-friendly transitions still respect `prefers-reduced-motion`.

### 6. Testing & Tooling
- **[3 — Low] Finding:** `npm run test` (Vitest) not enforced and coverage targets absent.
  - **Solution:** Add coverage thresholds for preview slice/orientation bridge and expose results in VS Code Test Explorer.
- **[2 — Low] Finding:** `depcheck` flagged unused Radix packages and utility libraries, expanding attack surface.
  - **Solution:** Confirm usage, prune unnecessary packages, or document intentional retention.
- **[2 — Low] Finding:** ESLint disables several dead-code rules globally, masking regressions.
  - **Solution:** Re-enable rules post `dead-code:check`, scoping exceptions narrowly.

## 2025 Execution Roadmap
1. **Security Hardening Sprint**
   - Sanitize Supabase logging, tighten CORS, disable production sourcemaps.
2. **Media & Preview Resilience**
   - Deploy HEIC worker/service; add abortable polling; expand orientation bridge context.
3. **Bundle Diet & Runtime Hygiene**
   - Implement `LazyMotion`, defer Supabase client, consolidate fonts, prune deps.
4. **Observability & Quality**
   - Integrate Lighthouse + axe in CI, add analytics buffering, enforce Vitest coverage, run `npm run lint && npm run build && npm run build:analyze && npm run deps:check`.

All changes must ship via focused branches in VS Code with in-editor diffs, preserving Launchflow telemetry, Supabase preview caching, and studio momentum cues.
