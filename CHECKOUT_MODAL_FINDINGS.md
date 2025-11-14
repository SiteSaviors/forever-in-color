# Canvas Checkout Modal – Findings Log

## Phase 3.5 – Checkout Footer
- Extracted trust strip + CTA into `CheckoutFooter`, subscribing only to `selectedCanvasSize`, `orientationPreviewPending`, and `computedTotal` for targeted re-renders.
- Preserved premium visuals (gradient trust panels, testimonial, gradient CTA) while centralizing the logic for button disable states and CTA copy flag.
- Added accessibility-friendly `aria-label` that surfaces the formatted total without changing the visible UI.

## Phase 3.6 – Integration & Profiling Prep
- Removed the inline footer markup from `CanvasCheckoutModal` and wired the memoized `handlePrimaryCta` callback down into `CheckoutFooter`.
- Eliminated redundant imports (`Package`, `Flag`, `Shield`, `USE_NEW_CTA_COPY` in the modal) and deleted the now-unneeded `renderPremiumTrustBar` helper.
- Updated selector plan to reflect the extracted components and tracked follow-up perf items (DOM ref wiring, telemetry throttling, trust/testimonial dedupe).

## Stability Fixes
- Added descriptive subtitles to `CanvasFrameSelector` options so the component aligns with its UI copy and TypeScript typing.
- Moved the step indicator shimmer keyframes into `src/index.css` and removed the inline `<style>` block to appease TypeScript and keep animations GPU-friendly.

## UX Polishing
- Reordered the canvas-step footer so the order summary sits between the trust strip and the CTA; the button now renders after the summary and includes a mirrored divider line beneath it for visual balance.

## Validation
- `npm run lint` (warnings only: existing deprecations in `scripts/generate-preview-validators.ts`, `InsightsRail`, `useDeferredRender`, `useDeferredReveal`).
- `npm run build` / `npm run build:analyze` (success; bundle summary attached to run output).
- `npm run deps:check` flags `zod` + `ajv` as “unused” (known false positives documented in `docs/studio-right-rail-refactor.md:112` because schemas are consumed via generated artifacts and Supabase edge functions).
