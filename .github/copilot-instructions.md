# Copilot Instructions for Wondertone

Guide for AI coding agents working in this repo. Keep edits small, conversion-focused, and never break the purchase flow.

## Architecture Overview
- **App shell:** React + TypeScript + Vite + Tailwind. Entry point `src/main.tsx` mounts `App`, wires `BrowserRouter`, and sets up React Query.
- **Routing:** `/` landing, `/product` configurator, and style-specific landers (e.g. `/classic-oil-painting`) defined in `src/pages/*.tsx`.
- **Product flow:** Everything lives in `src/components/product/`.
  - **State:** `useProductFlow` (hooks/) is the single source of truth for steps, image, style, size, orientation, customizations, and preview status. Exported via `useProductState`.
  - **Step orchestration:** `Product.tsx` feeds `ProductContent`, which renders `ProductStepsManager` inside `CascadeErrorBoundary`. Gating comes from `useProductSteps` helpers.
  - **Step One experience:** `PhotoAndStyleStep` wraps UI in `StepOneExperienceProvider` for sub-step tracking, contextual help, and social momentum signals.
  - **Previews:** `usePreviewGeneration` performs manual preview generation (triggered on style selection), handles watermarking, polling, and Supabase persistence while staying in sync with orientation changes.
  - **UI tree:** Rich component hierarchy under `components/product/components/**`, `progress/`, `order/`, and style-specific folders.
- **Supabase:** `@/integrations/supabase/client` provides the typed client. Edge functions reside in `supabase/functions/*` (e.g., `generate-style-preview`, `create-payment`, `remove-watermark`).
- **Styling:** Tailwind utilities + shadcn/ui primitives. Additional motion/texture utilities live in `src/index.css`.

## Critical Workflows
- Dev server: `npm run dev` (Vite on port 8080).
- Build: `npm run build`.
- Bundle analysis: `npm run build:analyze` (generates and opens `dist/stats.html`).
- Preview mode: `npm run preview` (after building).
- Linting & cleanup: `npm run lint`, `npm run lint:unused`, `npm run dead-code:*`, `npm run deps:check`, `npm run deps:analyze`.

## Project Conventions
- **Product state contract**
  - Types in `components/product/types/productState.ts`.
  - Mutations must flow through `useProductFlow`; do not create alternate stores.
  - Event handler signatures used by `ProductStepsManager`: `onPhotoAndStyleComplete(imageUrl, styleId, styleName, orientation?)`, `onOrientationSelect`, `onSizeSelect`, `onCustomizationChange`.
- **Step One UX**
  - Keep `StepOneExperienceProvider`, `SmartProgressIndicator`, and `ContextualHelp` in sync; hesitation signals drive social momentum widgets.
  - Orientation resets must clear previews via `useProductFlow` + `usePreviewGeneration`.
- **Error handling**
  - Wrap risky UI in `CascadeErrorBoundary` (`components/product/components/ErrorBoundaries/CascadeErrorBoundary.tsx`) for retry/backoff behavior.
- **Routing pattern**
  - Pages live in `src/pages`. Adding a lander means creating the page and adding a `<Route />` in `src/main.tsx`.
- **Supabase usage**
  - Import the shared client; call edge functions rather than hitting AI or Stripe directly.
- **Styling guidelines**
  - Favor Tailwind utilities, shared design tokens, and shadcn components. Watch for heavy `filter` usage—prefer GPU-friendly transforms when adding motion.

## Cross-Component Communication
- Props-down, hooks-up: `ProductContent` gives props to children while hooks manage shared state.
- React Query is available for async server state; UI-specific state stays local or in `useProductFlow` slices.

## File Reduction Mandate
- Check existing components under `components/product/**` or `components/ui/**` before introducing new files.
- Before deleting, run `npm run dead-code:check` and verify with VS Code search.
- Avoid changing exported signatures unless every caller is updated within the same change set.
- Merge small related components inside their feature folders when refactoring.

## Examples to Mirror
- Product state access: `src/components/product/ProductStateManager.tsx` + `hooks/useProductFlow.ts`.
- Defensive composition: `ProductContent` → `StepAccordion` → `ProductStepsManager` with `CascadeErrorBoundary`.
- Supabase integration: `src/integrations/supabase/client.ts`.

## Non-Obvious Details
- Vite dev server binds to `::` on port 8080; alias `@` resolves to `src`.
- Preview caching + webhook flow resides in `supabase/functions/generate-style-preview`; keep client calls consistent with that API.
- Edge token spend + refunds happen in `supabase/functions/remove-watermark`—guard against duplicate charges.
- Style previews now require explicit user action; ensure UI affordances call `generatePreviewForStyle`.

## Safe-Change Checklist
- Run `npm run lint` and `npm run build` before shipping.
- After state or step edits, confirm `canProceedToStep` logic and `completedSteps` mutations still gate correctly.
- When touching orientation or previews, verify `usePreviewGeneration` clears caches and resumes polling as expected.
- Keep StepOneExperience telemetry intact so social/momentum widgets behave.

Need deeper guardrails? Read `agents.md` (living document) and the VS Code playbook in `FOUNDER_WORKFLOW.md`.
