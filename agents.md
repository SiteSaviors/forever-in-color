0. Purpose & Scope
- Anchor every change to Wondertone's premium AI canvas mandate; sustain performance, UX, and maintainability expectations (README.md:1).
- Follow the founder VS Code-first workflow for branching, diffing, and running scripts before touching git (FOUNDER_WORKFLOW.md:14).
- Begin each session with the Agents Summary handshake so reviewers see the guardrails before plans or code (this document, Section 3).

1. Derived Goals (ranked)
- Preserve the four-step configurator flow and gating logic owned by `useProductFlow`, rendered by `Product`, and orchestrated in `ProductStepsManager` (src/components/product/hooks/useProductFlow.ts:8, src/pages/Product.tsx:30, src/components/product/components/ProductStepsManager.tsx:75).
- Maintain Step One experiential telemetry—StepOneExperience provider, smart progress, contextual nudges, and upload UX must stay aligned (src/components/product/components/PhotoAndStyleStep.tsx:65, src/components/product/progress/useStepOneExperience.ts:7, src/components/product/progress/SmartProgressIndicator.tsx:7).
- Protect preview generation throughput and caching by keeping `usePreviewGeneration` as the single source feeding the style pipeline and Supabase edge API (src/components/product/hooks/usePreviewGeneration.ts:7, src/utils/stylePreviewApi.ts:18).
- Style landing pages remain copy-varied twins; keep pixel parity unless coordinating a wider dedupe pass (src/pages/ClassicOilPainting.tsx:12, src/pages/WatercolorDreams.tsx:12).

2. Guardrails (derived, not prescriptive)
- StepOneExperienceProvider must wrap Step 1 so sub-step tracking, AI analysis, and contextual help continue to power progress/momentum widgets (src/components/product/components/PhotoAndStyleStep.tsx:147, src/components/product/progress/StepOneExperienceContext.tsx:6).
- Smart progress + help cues depend on StepOneExperience state; avoid bypassing `SmartProgressIndicator` or `ContextualHelp` hooks when modifying the upload flow (src/components/product/progress/SmartProgressIndicator.tsx:7, src/components/product/help/ContextualHelp.tsx:1).
- Orientation changes clear previews through `useProductFlow`—do not short-circuit the reset that keeps preview caches valid (src/components/product/hooks/useProductFlow.ts:117, src/components/product/hooks/usePreviewGeneration.ts:41).
- Style previews run through `StyleCard` → `useStyleCardHooks` → `useStylePreview`; keep retries, watermarking, and touch interactions in sync (src/components/product/StyleCard.tsx:15, src/components/product/hooks/useStyleCardHooks.ts:1, src/components/product/hooks/useStylePreview.ts:18).
- Intelligent recommendations analyze uploads before rendering hero/popular grids; any UX changes must respect the recommendation engine’s contract (src/components/product/components/IntelligentStyleGrid.tsx:22, src/components/product/utils/styleRecommendationEngine.ts:21).
- Social momentum auto-expansion reads hesitation from StepOneExperience context—maintain listener cleanup and debounce thresholds (src/components/product/components/UnifiedSocialMomentumWidget.tsx:42).
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
- Step One flow layers gesture handling, cropper UX, and style recommendations; keep these hooks coordinated when experimenting (src/components/product/components/PhotoAndStyleStep.tsx:84).
- Order surfaces, token purchases, and momentum popups all rely on the shared Stripe hook—extend behavior in one place (src/hooks/useStripePayment.ts:23, src/components/product/components/BottomMomentumPopup.tsx:41, src/components/product/order/OrderActions.tsx:27).
- Product header/testimonials animate social proof; large visual tweaks should stay inside existing components to prevent regressions (src/components/product/ProductHeader.tsx:1).

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
- ✅ Four-step configurator gating intact, with StepOneExperience telemetry still firing (src/components/product/hooks/useProductFlow.ts:157, src/components/product/components/PhotoAndStyleStep.tsx:65).
- ✅ `npm run lint && npm run build` succeed (package.json:6).
- ✅ AI preview API request/response contract unchanged (supabase/functions/generate-style-preview/index.ts:293).
- ✅ No regressions in token spend/refund flows (supabase/functions/remove-watermark/index.ts:57).

10. Runbooks / Scripts (optional)
- Use the VS Code NPM Scripts panel to run `dev`, `build`, and `build:analyze` per the founder workflow (FOUNDER_WORKFLOW.md:24).
