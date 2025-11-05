# Wondertone Performance Source of Truth

## Phase Index
- Phase 1.1 — Bundle Autopsy *(current session)*
- Phase 0 — Research & Guardrails *(in progress)*

---

## Phase 0 — Research & Guardrails (Worklog)

- **Zod dependency surface**: The only direct `zod` import lives in `shared/validation/previewSchemas.ts`, which exports the schemas consumed by `src/utils/stylePreviewApi.ts`, `src/utils/previewGeneration.ts`, `src/utils/founderPreviewGeneration.ts`, `src/utils/previewClient.ts`, `src/store/founder/previewSlice.ts`, and the Supabase edge validator (`supabase/functions/generate-style-preview/requestValidator.ts`). All preview orchestration flows ultimately depend on this module, so any replacement must keep its API contract intact.
- **Bundle baseline (2024-11-05)**: Fresh `npm run build:analyze` shows `index-js4DhK0o.js` at **150.93 KB rendered / 41.05 KB gzip**, `index-CFaL65Xj.css` at **139.69 KB raw / 20.24 KB gzip**, `motion-vendors-CP4TptGL.js` at **123.35 KB rendered**, and `heic2any-C6FoSL36.js` at **1,352.89 KB rendered**—matching the earlier autopsy and giving us a clean “before” snapshot for upcoming changes.
- **Step One sequencing instrumentation**: Added dev-only debug hooks in `startFounderPreviewGeneration` to log each stage (`generating`, `polling`, `watermarking`) with timestamps, and expanded `emitStepOneEvent` logging to include a timestamp payload. These provide an ordering trace during local testing without touching production analytics.
- **Existing coverage review**: Current unit tests cover store-level behaviours (`tests/store/previewLock.spec.ts`, `previewReadiness.spec.ts`, `useGalleryQuickview*.spec.tsx`) and ensure `startFounderPreviewGeneration` is invoked, but there is no end-to-end Launchflow → Studio flow test exercising the full Step One telemetry sequence. We’ll need to add at least one integration test (Playwright/Vitest + React Testing Library) before making invasive validation changes.

---

## Phase 1 — Schema Strategy & Precompile POC (Worklog)

- **Schema classification**
  - *Runtime critical*: `previewRequestSchema`, `previewCompleteSchema`, `previewProcessingSchema`, and `previewStatusSchema`—all feed Supabase requests/responses and the client-side preview orchestrators. These must keep runtime validation.
  - *Type-only*: The exported TypeScript aliases (`PreviewRequest`, `PreviewResponse`, `PreviewStatusResponse`, `PreviewCropConfig`) are used purely for inference and can continue to reference the generated validators once we swap them in.
- **Generation prototype**
  - Added `npm run build:preview-validators` (backed by `scripts/generate-preview-validators.ts`) which converts the “hot” schemas into JSON Schema artifacts under `shared/validation/generated/`. The script relies on `zod-to-json-schema` to keep naming consistent (`preview-request.schema.json`, etc.).
- **Parity harness**
  - Introduced `tests/validation/previewSchema.generated.spec.ts`, which compiles the generated schemas with Ajv and verifies they accept/reject the same payloads as the original `zod` definitions. Vitest run succeeds, confirming the JSON Schema output is a drop-in match for the scenarios we care about.
- **Migration rules**
  - Generated artifacts live in `shared/validation/generated/` (one file per schema). Downstream validators should import from a dedicated adapter (to be added in the next phase) rather than reading `zod` directly.
  - Build flow: `npm run build:preview-validators` runs before `npm run build` to keep generated files in sync; the script logs the absolute paths for CI verification.
  - Tests: any new runtime validator must add parity coverage similar to the new Ajv test to prevent regressions.

---

## Phase 1.1 — Bundle Autopsy

### Key Observations
- Core bundle still ships **13 heavy chunks (>50 KB)** led by `heic2any` (1.33 MB rendered / 332 KB gzip) and `motion-vendors` (358 KB rendered / 122 KB gzip).  
- `index-js4DhK0o.js` (295 KB rendered) is dominated by `zod` (144 KB rendered) plus preview orchestration (`previewSlice`, `useFounderStore`, entitlement modals).  
- Auth bootstrap eagerly pulls `wondertoneAuthClient` (224 KB rendered) on first paint via `prefetchSupabaseClient()` in `src/providers/AuthProvider.tsx:25`.  
- Radix stack (193 KB rendered) bundles two copies of `react-remove-scroll` (v2.6.0 + v2.7.1), inflating the dialog/dropdown baseline.  
- Framer Motion stays centralized in `motion-vendors`, but wide usage across Studio hero, Tone rail, Spotlight carousel, and inspiration flows keeps the chunk hot-loaded.  
- Global CSS (`index-CFaL65Xj.css`) weighs 136 KB raw / 19.7 KB gzip, driven by Tailwind utility output, multiple gradient/token layers, and page-specific overrides that ship everywhere.

### Bundle Inventory (>50 KB)
| Chunk | Rendered KB | Gzip KB | Brotli KB |
| -- | --: | --: | --: |
| `assets/heic2any-C6FoSL36.js` | 1329.81 | 331.78 | 257.98 |
| `assets/motion-vendors-CP4TptGL.js` | 358.27 | 122.08 | 102.97 |
| `assets/index-js4DhK0o.js` | 295.33 | 65.78 | 55.93 |
| `assets/wondertoneAuthClient-C34lmmxO.js` | 224.28 | 46.80 | 39.10 |
| `assets/react-vendors-CtinYixr.js` | 201.66 | 61.53 | 53.47 |
| `assets/radix-vendors-BSe4sCtC.js` | 193.37 | 54.75 | 47.24 |
| `assets/CheckoutPage-C5ln4-OV.js` | 142.14 | 40.55 | 33.80 |
| `assets/StudioPage-BlE8XjAn.js` | 108.63 | 33.88 | 29.21 |
| `assets/StudioExperience-CCB7Dndr.js` | 99.65 | 30.03 | 25.82 |
| `assets/CropperModal-BxxvqQkT.js` | 65.41 | 17.20 | 14.56 |
| `assets/LaunchpadLayout-Ch-jX0f9.js` | 61.86 | 15.91 | 13.84 |
| `assets/StyleAccordion-DBouVYsZ.js` | 55.37 | 14.84 | 13.04 |
| `assets/router-vendors-BwrSywu9.js` | 55.32 | 16.30 | 14.04 |
| `assets/index-CFaL65Xj.css` *(global stylesheet)* | 136.00 | 19.74† | — |

† gzip size computed via `gzip -c dist/assets/index-CFaL65Xj.css | wc -c`.

### Deep Dive Highlights

#### heic2any conversion bundle — `assets/heic2any-C6FoSL36.js`
- **What’s inside:** Entire `heic2any` distribution (1.33 MB rendered, 332 KB gzip). No other modules share the chunk.  
- **Load path:** Dynamically imported inside `readFileAsDataURL` (`src/utils/imageUtils.ts:76`) after MIME/extension checks. Launchpad `PhotoUploader` (`src/components/launchpad/PhotoUploader.tsx:92`) funnels all uploads here.  
- **Risk:** Still a 300 KB gzip fetch whenever a HEIC/HEIF file hits the fallback path. Upcoming QR/video features will increase concurrent preview demand, so we must avoid blocking the main thread with this worker payload.  
- **Opportunities:** 
  - Strengthen MIME gating so non-Apple devices never request the chunk (current guard looks only at `file.type` or extension).  
  - Evaluate moving conversion to the Supabase edge (`convert-heic` function) and reserving the client bundle strictly for offline fallback.  
  - Investigate lighter wasm alternatives or incremental decoding to cut transfer size.

#### Framer Motion stack — `assets/motion-vendors-CP4TptGL.js`
- **Major modules:** `create-projection-node` (66 KB rendered), drag controls, animation state managers, and projection math.  
- **Usage footprint:** 
  - Studio hero & trust strip animations (`src/sections/ProductHeroSection.tsx:11`, `src/components/hero/GeneratingCanvasAnimation.tsx:4`).  
  - Tone accordion and Spotlight carousel (`src/sections/studio/components/StyleAccordion.tsx:2`, `src/sections/studio/components/SpotlightRail.tsx:9`).  
  - Gallery quickview & Studio canvas interactions (`src/sections/studio/experience/GalleryQuickview.tsx:2`).  
- **Observations:** `LazyMotion` is present in multiple entry points but shared routes still import motion-first components, so the vendor chunk attaches to initial Studio loads.  
- **Next actions:** 
  - Audit which sections truly need interactive motion on first paint; consider `lazy(() => import(...))` wrappers for Spotlight rail and gallery quickview so visitors who stay in Launchpad avoid the cost.  
  - Explore swapping simple reveal/opacity transitions for CSS-based animations in hero + breadcrumbs to reduce reliance on projection features.

#### Supabase auth client — `assets/wondertoneAuthClient-C34lmmxO.js`
- **Composition:** `GoTrueClient`, WebAuthn helpers, admin API, and support utilities from `@supabase/auth-js` (120 KB rendered for the client alone).  
- **Load driver:** `prefetchSupabaseClient()` fires in `AuthProvider` on mount (`src/providers/AuthProvider.tsx:25`), guaranteeing the chunk downloads before user intent is known.  
- **Implication:** Even anonymous marketing visitors pay a 47 KB gzip tax plus follow-on requests to Supabase.  
- **Recommendations:** 
  - Gate prefetch behind routes that need authenticated state (Studio, Launchpad post-upload) or user intent (click “Sign in”).  
  - Split WebAuthn helpers into a secondary dynamic import; they account for ~31 KB rendered and serve a niche flow.  
  - Consider a thin session ping (REST) in place of eager client bootstrap for landing pages.

#### Radix primitives — `assets/radix-vendors-BSe4sCtC.js`
- **Top offenders:** Dropdown/menu primitive bundle (32 KB rendered) duplicates popper, dismissable layer, focus scope, and `react-remove-scroll`. Dialog adds another 12 KB.  
- **Duplicate dependency:** `npm ls react-remove-scroll` shows v2.6.0 under `@radix-ui/react-dialog` and v2.7.1 under `@radix-ui/react-menu`. Both ship in this chunk, costing ~14 KB rendered.  
- **Usage:** 
  - Dialogs: Auth gate (`src/components/modals/AuthModal.tsx:5`), quota modals.  
  - Dropdowns: Account menu (`src/components/header/AccountDropdown.tsx:5`).  
- **Next actions:** 
  - Add an npm `overrides` entry to pin a single `react-remove-scroll` version.  
  - Evaluate swapping dropdown menu to a lighter headless alternative or delaying its load until the user opens the account menu.  
  - Audit Radix component usage for submodule imports to keep tree shaking tight.

#### Core app bundle — `assets/index-js4DhK0o.js`
- **Largest pieces:** `zod/lib/index.mjs` (143.85 KB rendered) and Wondertone preview orchestration: `previewSlice` (20.56 KB rendered), `useFounderStore` (18.51 KB), entitlement + auth modals.  
- **Why it matters:** This chunk lands before any route-specific splitting, so slimming `zod` and relocating heavy schema logic will directly reduce First Contentful Paint on both Launchpad and Studio.  
- **Ideas:** 
  - Replace full `zod` import with precompiled schema helpers (e.g., `zod` `util` pick or `superstruct`).  
  - Consider moving style registry bootstrap (`src/config/styles/registryCore.generated.ts:1`) into a background loader and hydrating minimal metadata upfront.  
  - Ensure preview telemetry helpers remain intact so Launchflow → Studio analytics continue to fire through `emitStepOneEvent` (`src/utils/telemetry.ts:42`).

#### Checkout + router vendors
- `assets/CheckoutPage-C5ln4-OV.js` pulls `date-fns` formatters (~45 KB combined) and Stripe bindings (20 KB rendered). Evaluate trimming locales/formatters and lazy-loading Stripe scripts until a user interacts with checkout.  
- `assets/router-vendors-BwrSywu9.js` (55 KB rendered) bundles the entire React Router stack. Any marketing-only deployments that don’t rely on Router features could defer this chunk.

#### Launchpad, Studio, and cropper slices
- Launchpad upload flow (`assets/LaunchpadLayout-Ch-jX0f9.js`) is dominated by `PhotoUploader` (18 KB rendered) and `LaunchpadLayout` orchestration (22 KB). Code-splitting PhotoUploader behind the “Upload” CTA could keep telemetry intact while deferring Smart Crop.  
- Cropper modal (`assets/CropperModal-BxxvqQkT.js`) inherits `react-easy-crop` (38 KB rendered) and `normalize-wheel`. Keeping the cropper behind a modal-level dynamic import is already helping; further relief would require a lighter cropper lib.  
- Studio accordion (`assets/StyleAccordion-DBouVYsZ.js`) leans on `ToneStyleCard` (18 KB rendered) and `useToneSections` (6.8 KB). These are prime candidates for suspense boundaries so Launchpad-only journeys avoid paying the cost.

#### Global stylesheet — `assets/index-CFaL65Xj.css`
- **Size:** 136 KB raw / 19.7 KB gzip. Tailwind base styles, font imports, and gradient tokens are emitted globally.  
- **Drivers:** 
  - Google Fonts import bundles six families up front (Agbalumo, Fraunces, Inter, League Spartan, Playfair Display, Poppins).  
  - Utility classes for Studio hero, Launchpad overlays, and marketing flows all ship in the same file.  
  - Custom glow/gradient helpers repeat across sections.  
- **Next actions:** 
  - Gate non-core font families behind `font-display: swap` + optional preconnect or route-level loading.  
  - Investigate Tailwind `safelist` usage to prune unused utilities and consider component-level CSS modules for animation-heavy sections.  
  - Keep GPU-friendly filters per guardrail while validating no duplicated declarations creep into multiple sections.

### Outstanding Questions / Follow-Ups
- Confirm whether HEIC conversion requests trigger `heic2any` for non-Apple uploads in production telemetry.  
- Quantify how often account dropdown/dialog components mount to size the benefit of Radix code splitting.  
- Validate if `zod` schemas can be precompiled without breaking preview validation within `previewSlice.startStylePreview` (`src/store/founder/previewSlice.ts:320`).

---

*End of Phase 1.1. Future phases will append findings here to maintain a single performance source of truth.*

---

## Phase 1.2 — Dependency Deep-Dive

### Script Outputs
- `npm run deps:analyze` (madge) completed with **0 circular dependencies** across 222 scanned files; 164 warnings stem from Vite alias resolution and dynamic imports but no hard cycles were detected.
- `npm run dead-code:check` surfaced:
  - `class-variance-authority` as an **unused dependency** (no references under `src/`).
  - 8 unresolved lazy imports targeting `src/config/styles/tones/*.generated.js` and 13 “unimported files” for the matching `.generated.ts` sources plus legacy studio hooks. These modules feed the tone registry switch in `src/config/styles/registryLazy.ts` and are intentionally loaded via dynamic `import()`, so they are safe but should be added to the unimported ignore list to keep the report clean.

### Dependency Audits

#### framer-motion
- Current bundle hit: `assets/motion-vendors-CP4TptGL.js` at 358 KB rendered / 122 KB gzip.
- Feature usage stretches beyond simple fades:
  - `ProductHeroSection` drives animated hero swaps with `LazyMotion`, `AnimatePresence`, and motion components (`src/sections/ProductHeroSection.tsx:11`).
  - Spotlight carousel relies on directional variants, `AnimatePresence`, and keyboard-controlled transitions to sync telemetry events (`src/sections/studio/components/SpotlightRail.tsx:9`).
  - Gallery quickview mixes `LayoutGroup`, reduced-motion hooks, and presence management for scroll highlights (`src/sections/studio/experience/GalleryQuickview.tsx:2`).
- CSS-only replacements could cover one-off opacity fades, but layout projection, shared element transitions, and drag physics would need bespoke logic. Candidate optimizations: isolate hero/carousel modules behind `React.lazy` so Launchpad-first sessions defer the vendor chunk, and replace simple opacity transitions with CSS where telemetry does not depend on motion callbacks.

#### react-easy-crop
- Bundled via `assets/CropperModal-BxxvqQkT.js`, contributing ~38 KB rendered to the chunk.
- Used exclusively in `CropperModal` for zoom, orientation switching, and crop callbacks tied to smart-crop caching (`src/components/launchpad/cropper/CropperModal.tsx:2`).
- Alternatives such as `react-image-crop` or a bespoke canvas cropper would need to preserve:
  - programmatic orientation presets synchronized with `useFounderStore.setOrientation`;
  - telemetry-triggering smart crop prefetch;
  - pixel-perfect crop metadata for Step One progress.
- Recommendation: keep `react-easy-crop` for stability while evaluating whether a lighter fork can meet orientation + async crop requirements without regressing telemetry.

#### lucide-react
- Tree shaking appears effective: bundle analysis shows per-icon modules (`lucide-react/dist/esm/icons/lock.js`, etc.) under 0.4 KB each rather than the entire icon set.
- Import pattern uses named ESM imports (e.g., `import { Sparkles } from 'lucide-react'`) across hero and studio components (`src/components/hero/MomentumTicker.tsx:2`, `src/sections/studio/components/ToneSection.tsx:3`), so no urgent action required. Maintain vigilance when adding icons to avoid `* as icons` patterns that would defeat tree shaking.

#### date-fns
- Only referenced in checkout review formatting (`src/components/checkout/ReviewCard.tsx:3`), pulling `format` and associated locale helpers into `assets/CheckoutPage-C5ln4-OV.js` (~45 KB rendered combined).
- Potential reduction: swap to `Intl.DateTimeFormat` with cached formatters for order summaries, eliminating the dependency while keeping localized output. Verify parity for existing locales before removal to avoid checkout regressions.

### Duplicate or Redundant Dependencies
- **react-remove-scroll** ships twice (v2.6.0 via `@radix-ui/react-dialog`, v2.7.1 via `@radix-ui/react-menu`), adding ~14 KB rendered to `assets/radix-vendors-BSe4sCtC.js`. Introduce an npm `overrides` entry to lock both Radix packages to the newer version and re-run bundle analysis.
- No other duplicate-heavy packages surfaced in the webpack visualizer or `npm ls` samples (`framer-motion` 11.18.2, `lucide-react` 0.462.0, `date-fns` 4.1.0, `react-easy-crop` 5.4.2) but keep scanning during future vendoring updates.

### Follow-Ups
- Add tone registry generated files to the `unimported` ignore list or update the script to resolve `.generated.js` aliases so dead-code reports remain actionable.
- Confirm whether `class-variance-authority` can be removed entirely or if dormant shadcn components still require it.
- Scope a `React.lazy` plan for heavy framer-motion consumers while validating Launchflow → Studio telemetry remains wired through `emitStepOneEvent`.
- Draft an overrides PR to dedupe `react-remove-scroll` after verifying Radix changelog compatibility.

---

## Phase 2 — Runtime Replacement & Lazy Loading (Worklog)

- **Runtime parser swap**: Introduced `shared/validation/previewSchemaDefinitions.ts` to keep the `zod` definitions/type exports, and rewrote `shared/validation/previewSchemas.ts` as a lean runtime adaptor. The new implementation applies defaults and coercions manually, eliminating `zod` from the production bundle while preserving passthrough behaviour for unknown fields.
- **Artifact generation**: `npm run build:preview-validators` now emits JSON schema snapshots only (under `shared/validation/generated/`). These artifacts back parity tests without shipping any validator runtime code.
- **Test coverage**: Added `tests/validation/previewRuntime.spec.ts` to compare the manual parsers against the original `zod` definitions for valid/invalid payloads. Tests cover request parsing, response normalization, and status parsing. `npm run test -- tests/validation/previewRuntime.spec.ts` passes.
- **Bundle impact**: A fresh production build reports the core chunk `dist/assets/index-Cm4IViD0.js` at **92.88 KB rendered / 27.07 KB gzip**, down from the Phase 0 baseline of 150.93 KB rendered / 41.05 KB gzip.

---

## Phase 1.3 — Code Splitting Opportunities

### Current Route Split Baseline
- `src/main.tsx:6-29` already gates marketing and studio experiences behind separate Suspense boundaries, so `/pricing`, `/studio/gallery`, and `/checkout` load on demand rather than inflating the Studio entry bundle.
- Within Studio, top-level heavy hitters (`LaunchpadLayout`, `StudioConfigurator`, `StudioExperience`, `StickyOrderRail`, `CanvasInRoomPreview`, `LivingCanvasModal`) are lazily imported via `src/pages/StudioPage.tsx:18-43`, `src/sections/StudioConfigurator.tsx:9-21`, and `src/sections/studio/experience/RightRail.tsx:11-57`. This keeps the Launchflow accordion and configurator out of the first paint for non-Studio visitors.
- The remaining Studio shell chunk (`assets/StudioPage-BlE8XjAn.js`, 108.6 KB rendered) is dominated by below-the-fold engagement sections (InstantBreadthStrip, SocialProofSection, CanvasQualityStrip) plus Spotlight motion helpers, indicating room for intersection-driven deferral.

### Targeted Lazy-Load Candidates
- **Auth surfaces (~20 KB rendered in core bundle):** `AuthModal`, `QuotaExhaustedModal`, and `TokenDecrementToast` are imported eagerly in `AuthProvider` (`src/providers/AuthProvider.tsx:1-160`), anchoring them in `assets/index-js4DhK0o.js`. Wrap each in `React.lazy` with `Suspense` fallbacks so modals hydrate only when `useAuthModal` or entitlement slices request them. Keep Step One telemetry untouched by leaving upload events inside `PhotoUploader`, and ensure `prefetchSupabaseClient()` still runs before first auth interaction.
- **Launchflow auth gate:** `AuthGateModal` contributes 5.8 KB rendered to the Launchpad chunk because `src/sections/LaunchpadLayout.tsx:3` imports it directly. Switching to a lazy boundary triggered by `authGateOpen` keeps `emitAuthGateEvent` instrumentation (`src/components/modals/AuthGateModal.tsx:36-93`) while deferring Supabase OAuth helpers until gating is required.
- **Studio gallery surfaces:** `GalleryQuickview` (10.7 KB rendered inside `assets/StudioExperience-CCB7Dndr.js`) mounts even when users have no saved items (`src/sections/studio/experience/GalleryQuickview.tsx:35-199`). Load it via `React.lazy` or an intersection-aware wrapper tied to the right rail footer so returning users still see cached items, but first-time launches aren’t penalized. Preserve telemetry from `trackGalleryQuickviewScroll` and `trackGalleryQuickviewAnimationComplete`.
- **Pricing funnel:** `PricingPage` already lives in its own bundle (`assets/PricingPage-BN0F3e_P.js`, 10.6 KB). Prefetch it only when pricing CTAs intersect (`src/sections/studio/CanvasQualityStrip.tsx:175-232`) so navigation feels instant without front-loading tiers for every visitor.
- **Studio social proof and inspiration:** InstantBreadthStrip (16.4 KB), SocialProofSection plus SpotlightRail (12.7 KB combined), and CanvasQualityStrip (10 KB) all reside in the Studio shell. Introduce a reusable `deferSection` helper (lazy + `IntersectionObserver`) to hydrate these modules when the user scrolls beyond the configurator, keeping Spotlight telemetry and auth prompts intact (`src/sections/studio/SocialProofSection.tsx:42-129`).
- **Marketing parity:** Landing page counterparts (`src/sections/StyleShowcase.tsx`, `src/sections/LivingCanvasStory.tsx`, `src/sections/StepsJourney.tsx`) can reuse the same helper to maintain momentum cues while shaving initial paint costs for new visitors.

### Intersection-Observer Playbook
- Create `useDeferredRender` under `src/hooks/useDeferredRender.ts` that exposes `isReady` once a supplied ref crosses a threshold, with cleanup mirroring the existing observer logic in `CanvasQualityStrip` (`src/sections/studio/CanvasQualityStrip.tsx:92-118`).
- Pair the hook with `React.lazy`/`Suspense` wrappers so chunks prefetch on intersection via `requestIdleCallback` (with a `setTimeout` fallback) before mounting on the next frame, preserving GPU-friendly transitions and Launchflow telemetry.
- Respect reduced-motion preferences by bypassing deferred animations when `usePrefersReducedMotion` is true, matching Wordertone’s accessibility guardrails.

### Next Actions
- Prototype lazy wrappers for `AuthModal`, `QuotaExhaustedModal`, and `TokenDecrementToast`, validating Supabase session hydration and entitlement toasts during Step One.
- Wrap `AuthGateModal` in a Suspense boundary inside `LaunchpadLayout`, ensuring `emitAuthGateEvent` continues firing on dismiss/convert flows.
- Apply the deferred-section helper to InstantBreadthStrip, StyleInspirationSection, SocialProofSection, and CanvasQualityStrip, logging an impression metric when each bundle loads.
- Reuse the helper on marketing sections and trigger a controlled prefetch for `PricingPage` when the canvas CTA comes into view.
- After implementation, rerun `npm run build:analyze` to confirm `assets/StudioPage-BlE8XjAn.js` drops from 108 KB rendered and that Launchflow → Studio telemetry (`emitStepOneEvent`) remains intact.

---

## Phase 1.4 — CSS Optimization

### Tailwind Output & Purge Snapshot
- `npm run build:analyze` reports `dist/assets/index-CFaL65Xj.css` at **139.7 KB raw / 20.2 KB gzip**, driven by Tailwind preflight, six imported Google font families, and numerous custom gradient/animation helpers defined in `src/styles/tailwind.css`.
- Route-specific CSS chunks (e.g., `StudioPage-CAfbM0wc.css`, `GalleryPage-Ir-3AaA0.css`) are already small (<2 KB), so the global Tailwind entry is the key optimization target.
- Tailwind JIT prunes unused utilities, but selectors declared manually in `tailwind.css` or `src/index.css` ship regardless—dead helpers become pure bloat.

### Unused / Redundant Custom Selectors
Manual review surfaced several bespoke classes without call sites in `src/`:
- `dropzone-base`, `dropzone-active`, `preview-skeleton`
- `confetti-container`, `confetti-piece`
- `tier-glow-creator`, `tier-glow-plus`, `tier-glow-pro`
- `gradient-text-purple`, `gradient-text-cyan`, `gradient-text-warm`
- `no-context-menu` (and the nested `img` rule)
- `bg-gradient-border-gold`, `animate-border-gold`
- `canvas-shimmer` (and the accompanying keyframes in `src/index.css`)

Pruning these removes unused CSS immediately while keeping shared helpers such as `section-shell`, `glass-card`, `badge-pill`, `btn-primary`, and `btn-ghost` intact.

### Font Imports
- The Tailwind stylesheet currently imports six Google fonts (`Agbalumo`, `Fraunces`, `Inter`, `League Spartan`, `Playfair Display`, `Poppins`). Only `Inter`, `Poppins`, `Fraunces`, and `Playfair Display` appear in markup (`font-sans`, `font-poppins`, `font-fraunces`, `font-display`).
- Drop `Agbalumo` and `League Spartan` from the `@import` statement and from `theme.extend.fontFamily` to trim render-blocking CSS and reduce the global sheet by ~14 KB.
- Consider self-hosting the remaining fonts or preloading them via `<link rel="preload" as="font">` in `index.html` so Tailwind’s output focuses on project utilities.

### Utility Duplication & Gradients
- High-traffic components reuse gradient/box-shadow stacks via raw Tailwind utilities (e.g., `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`, `border border-white/15 bg-white/10`). Every unique combination produces a separate JIT rule.
- Promote these recipes into `@layer components` helpers (e.g., `.wt-card-surface`, `.wt-gradient-canvas`, `.wt-pill`) so they compile once and are reused by Launchpad, Studio, and marketing. This also makes the design system easier to evolve.
- Pricing `TierCard` currently feeds gradient strings through props. Moving those variants into a shared enum or Tailwind plugin keeps class names static and allows Tailwind to purge unused options reliably.

### shadcn/ui Inventory
- All primitives under `src/components/ui` are in active use (`Button`, `Badge`, `Card`, `Modal`, `FloatingOrbs`, `PricingBenefitsStrip`, `TierCard`, `TokenDecrementToast`), so no dead shadcn clones remain.
- `class-variance-authority` is unused in the source tree—safe to drop alongside any future variant helper refactors.

### CSS Code Splitting Outlook
- Vite already emits component-scoped CSS (e.g., `ToneStyleCard.css` at 6.6 KB) that loads only when the component mounts—keep leaning on CSS modules for animation-heavy features.
- Marketing-only flourishes (FloatingOrbs, hero overlays) could keep their keyframes local to further shield Studio visitors from marketing-specific CSS.
- If Launchpad and Studio diverge more, we can pursue dual Tailwind entry points (`marketing.css` vs `studio.css`) backed by a shared core. For now, pruning dead utilities/fonts and consolidating gradients offers the clearest wins.

### Follow-Ups
- Delete the unused selectors above and rerun `npm run build:analyze` to measure the CSS delta.
- Trim the Google font import list and validate typography across marketing + Studio.
- Refactor recurring gradient/box-shadow patterns into shared helpers via `@layer components`.
- Remove `class-variance-authority` once confirmed unused to tighten the dependency surface.

---

## Phase 3 — Store Segmentation & Optional Features (Pre-Work)

### Phase 3A – Baseline Lock & Instrumentation
- **Build snapshot (2024-11-05, post-Phase 2 rollback)**: `npm run build:analyze` completes in ~16.4 s. Key bundles remain unchanged from the Phase 2 report—`index-Cm4IViD0.js` at **92.9 KB rendered / 27.1 KB gzip**, `StudioPage-CbZwR-m8.js` at **63.5 KB rendered / 19.3 KB gzip**, `StudioExperience-C6CQi0zg.js` at **59.9 KB rendered / 17.5 KB gzip**, `wondertoneAuthClient-DB2iLPU9.js` at **84.8 KB rendered / 22.0 KB gzip**, `motion-vendors-CP4TptGL.js` at **123.3 KB rendered / 41.0 KB gzip**, and `heic2any-C6FoSL36.js` at **1,352.9 KB rendered / 341.3 KB gzip**. CSS baseline holds at `index-CFaL65Xj.css` **139.7 KB raw / 20.2 KB gzip**.
- **Lighthouse reference (desktop, local dev build)**: performance score **55**, with headline diagnostics: render-blocking requests (est. 80 ms), unused JavaScript savings **1.36 MB**, minify JavaScript savings **3.90 MB**, deferred offscreen images **7.36 MB**, and total network payload **47.6 MB**. These numbers set the “before” target for segmentation.
- **Timeout note**: Previous build commands occasionally hit the CLI’s 19 s ceiling; reruns during Phase 3 will use a ≥60 s allowance to avoid partial logs.

### Phase 3B – Preview Engine Facade
- Extracted preview orchestration into `src/store/founder/previewEngine/core.ts`, exposing `startStylePreviewFlow`, `generatePreviewsFlow`, and `resumePendingAuthPreviewFlow`. `previewSlice` now delegates to the synchronous facade while preserving existing APIs and telemetry wiring.
- Added `debugPreviewStage` pass-through plus a shared abort-controller reference so the upcoming lazy loader can swap in without behavioural drift.
- Introduced targeted unit coverage (`tests/store/previewEngineCore.spec.ts`) that spies on `emitStepOneEvent`, `logPreviewStage`, cache writes, and gallery fetches, guaranteeing parity before we introduce dynamic imports.

### Phase 3C – Async Preview Engine Loader
- Created `src/store/founder/previewEngine/loader.ts` with a singleton `loadPreviewEngine()` that dynamically imports the facade and exposes thin wrappers (`startStylePreviewEngine`, `generatePreviewsEngine`, `resumePendingAuthPreviewEngine`, `abortPreviewGenerationEngine`).
- Updated `previewSlice` to delegate `startStylePreview`, `generatePreviews`, and `resumePendingAuthPreview` through the loader, while a new `abortPreviewGeneration` action uses the shared abort-controller and keeps store API intact.
- Expanded `tests/store/previewEngineCore.spec.ts` to exercise the loader path, verifying telemetry ordering (`emitStepOneEvent`), idempotency key generation, and abort behaviour across the dynamic boundary.

### Phase 3D – Optional Slice Gating
- Introduced `createLazySliceAccessor` (`src/store/utils/createLazySliceAccessor.ts`) as a shared helper for dynamic imports with promise deduping and cached modules.
- Moved style-catalog hydration into `src/store/founder/optional/styleCatalogEngine.ts`; `useFounderStore` now lazily wires `ensureStyleLoaded` / `ensureStylesLoaded`, swapping in the real implementations after the first call while preserving the public store API.
- Shifted gallery quickview selection logic to `src/store/optional/galleryQuickviewSelectionEngine.ts` and updated `useGalleryQuickviewSelection` to lazy-load it, adding guarded error handling so Launchflow → Studio telemetry still fires even if the optional module fails to load.
- Existing tests (`tests/store/useGalleryQuickviewSelection.spec.tsx`) and the optional-engine suite continue to pass, confirming the deferred slices behave identically once activated.

### Phase 3E — Deferred Studio Rails
- Added `useDeferredRender` hook to gate below-the-fold hydration with intersection observers.
- `CanvasPreviewPanel` now lazy-loads `GalleryQuickview` via Suspense with a lightweight skeleton, shrinking the initial Studio canvas payload while keeping orientation + Step One telemetry intact.
- `SocialProofSection` defers `SpotlightRail` until it scrolls into view; telemetry (`trackSocialProofEvent`) still fires when the carousel mounts.
- `InsightsRail` lazily hydrates heavy modules (`StylePreviewModule`, `DiscoverGrid`, `PaletteModule`, `CuratedStylesModule`, `SecondaryCanvasCta`, `ShareBadges`) once the right rail intersects, reducing up-front computation while preserving pre-upload messaging.
- Build snapshot (`npm run build:analyze`): core Studio chunk `StudioPage-BWFWT-s-.js` now **57.4 KB rendered / 17.9 KB gzip** (previously 63.5 KB / 19.3 KB); `StudioExperience-BGGzE1sQ.js` down to **49.5 KB rendered / 14.3 KB gzip** (was 59.9 KB / 17.5 KB). New deferred chunks include `galleryQuickviewSelectionEngine-T9gplrdi.js` **3.9 KB rendered / 1.6 KB gzip** and `PaletteModuleLazy` / `CuratedStylesModuleLazy` bundles (~2.2-3.3 KB rendered each).
- Lighthouse desktop run pending after QA (run via Chrome DevTools with the new build); expect lower main-thread and unused-JS warnings thanks to the deferred rails.

