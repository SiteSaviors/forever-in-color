0. Purpose & Scope
- Anchor every change to Wondertone's premium AI canvas mandate; sustain performance, UX, and maintainability expectations (README.md:1).
- Follow the founder VS Code-first workflow for branching, diffing, and running scripts before touching git (FOUNDER_WORKFLOW.md:14).
- Begin each session with the Agents Summary handshake so reviewers see the guardrails before plans or code (this document, Section 3).

1. Derived Goals (ranked)
- Preserve the Launchflow → Studio configurator sequence driven by `useFounderStore` and the preview slice (src/sections/LaunchpadLayout.tsx, src/sections/StudioConfigurator.tsx, src/store/useFounderStore.ts:320-452, src/store/founder/previewSlice.ts:300-520).
- Maintain Step One telemetry and momentum cues emitted through `emitStepOneEvent`, Launchflow analytics, and studio feedback hooks (src/utils/telemetry.ts, src/utils/launchflowTelemetry.ts, src/store/founder/previewSlice.ts:318-420).
- Protect preview throughput and caching by keeping `previewSlice.startStylePreview` / `startFounderPreviewGeneration` as the single Supabase preview pipeline (src/store/founder/previewSlice.ts:300-520, src/utils/founderPreviewGeneration.ts:1-85, src/utils/stylePreviewApi.ts:1-156).
- Style landing pages remain copy-varied twins; keep pixel parity unless coordinating a wider dedupe pass (src/pages/ClassicOilPainting.tsx:12, src/pages/WatercolorDreams.tsx:12).

2. Guardrails (derived, not prescriptive)
- Launchpad upload/crop flow (`src/components/launchpad/PhotoUploader.tsx`, `src/components/launchpad/SmartCropPreview.tsx`, `src/sections/LaunchpadLayout.tsx`) must continue raising Step One telemetry and updating `useFounderStore` so progress widgets and nudges stay accurate.
- Preview telemetry and stage messaging flow through `previewSlice.startStylePreview` and `emitStepOneEvent`; do not bypass those helpers when triggering previews (src/store/founder/previewSlice.ts:300-520, src/utils/telemetry.ts:1-120).
- Orientation changes must go through `useFounderStore.setOrientation` to clear caches and repopulate previews safely (src/store/useFounderStore.ts:381-449).
- Tone/style selection relies on `ToneStyleCard`, `useToneSections`, and `evaluateStyleGate`; keep gating, retries, and premium badges in sync (src/sections/studio/components/ToneStyleCard.tsx, src/sections/studio/components/StyleSidebar.tsx, src/store/hooks/useToneSections.ts).
- Launchpad and Studio share Supabase state via `AuthProvider` and entitlement slices; preserve toast/modal coordination and listener cleanup (src/providers/AuthProvider.tsx, src/store/founder/entitlementSlice.ts, src/components/ui/TokenDecrementToast.tsx).
- Prefer GPU-friendly transforms for new animations; existing utilities lean on `filter`, so watch for perf regressions (src/index.css:121, src/index.css:402).
- Carousel autoplay sets timers—debounce extra interactions to avoid jank (src/hooks/useCarouselAutoplay.tsx:22).
- Exit-intent logic attaches window/document listeners; preserve cleanup and debounce if you add triggers (src/components/ExitIntentPopup.tsx:8).

3. Required Workflow (non-negotiable)
- Before any plan or edit, re-read this doc, reply with ≤10 bullets citing the active guardrails, and share the checklist you will follow (Section 0 + this section).
- Work inside the founder’s VS Code workflow: create a branch, compare in-editor diffs, run scripts via the NPM panel before git operations (FOUNDER_WORKFLOW.md:14).
- After edits, run the repo checks: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` (package.json:6).

4. Commit/Branching
- Keep `main` production-ready with focused feature branches and small, reviewable commits—no direct pushes (FOUNDER_WORKFLOW.md:60).

5. Checks & Budgets (derived)
- Mandatory checks stay: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` (package.json:6).
- Current production bundle baseline is `dist/assets/index-CJh0zBXk.js` at ~567 KB—treat this as the ceiling until a planned reduction.

6. Front-end Practices (derived)
- Style landing pages share the same sticky CTA/scroll watcher; apply fixes across all variants to keep parity (src/pages/ClassicOilPainting.tsx:16, src/pages/WatercolorDreams.tsx:16).
- Step One flow layers upload gestures, smart crop previews, and tone recommendations; keep Launchpad components coordinated when experimenting (src/components/launchpad/PhotoUploader.tsx, src/components/launchpad/SmartCropPreview.tsx, src/sections/LaunchpadLayout.tsx).
- Studio configurator + checkout experiences centralize state in `useFounderStore` and `src/components/checkout/*`; extend payment or upsell behavior within those shared modules (src/sections/StudioConfigurator.tsx, src/components/studio/StickyOrderRail.tsx, src/components/checkout/PaymentStep.tsx).
- Product hero and momentum surfaces drive social proof; keep motion and ticker updates inside their dedicated components to avoid regressions (src/sections/ProductHeroSection.tsx, src/components/hero/MomentumTicker.tsx, src/sections/studio/components/StudioHeader.tsx).

7. Edge Function Practices (derived)
- The generate-style-preview edge handler validates requests, handles async webhooks, manages cache keys, and persists previews—keep this contract untouched (supabase/functions/generate-style-preview/index.ts:270).
- Cache metadata + storage clients govern Supabase persistence; on misses/hits update both metadata and memory cache (supabase/functions/generate-style-preview/cache/cacheMetadataService.ts:1, supabase/functions/generate-style-preview/cache/storageClient.ts:1).
- Polling retries are centralized with jitter/backoff—respect `resolvePreviewTimingConfig` and `executeWithRetry` budgets before changing timing (supabase/functions/generate-style-preview/replicate/pollingService.ts:9, supabase/functions/generate-style-preview/errorHandling.ts:100).
- Style prompts load with metadata per style for cache versioning; ensure fallbacks stay fast (supabase/functions/generate-style-preview/stylePromptService.ts:7).
- Token spend flows may re-invoke preview generation; always guard against double charges and issue refunds on failures (supabase/functions/remove-watermark/index.ts:57).

8. Deletion Policy
- Run the dead-code sweep before removals and document findings: `npm run dead-code:check` (package.json:11).
- Confirm zero references (via `rg` or equivalent) before deleting helpers like `CanvasWatermarkService` to avoid breaking edge deployments (supabase/functions/generate-style-preview/canvasWatermarkService.ts:1).

9. Acceptance Criteria Templates
- ✅ Launchflow upload → Studio preview gating intact, with Step One telemetry still firing via `emitStepOneEvent` (src/sections/LaunchpadLayout.tsx, src/store/founder/previewSlice.ts:300-520).
- ✅ `npm run lint && npm run build` succeed (package.json:6).
- ✅ AI preview API request/response contract unchanged (supabase/functions/generate-style-preview/index.ts:293).
- ✅ No regressions in token spend/refund flows (supabase/functions/remove-watermark/index.ts:57).

10. Runbooks / Scripts (optional)
- Use the VS Code NPM Scripts panel to run `dev`, `build`, and `build:analyze` per the founder workflow (FOUNDER_WORKFLOW.md:24).
