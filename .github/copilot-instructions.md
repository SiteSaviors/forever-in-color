# Copilot Instructions for Wondertone

This guide equips AI coding agents to be productive in this repo. Keep edits small, conversion-focused, and avoid breaking the purchase flow.

## Architecture Overview
- App: React + TypeScript + Vite + Tailwind. Entry in `src/main.tsx` mounts `App` and sets up `React Router` and `@tanstack/react-query`.
- Routing: `BrowserRouter` defines `/` landing and `/product` flow, plus individual style landing pages (e.g., `/classic-oil-painting`). See `src/pages/*.tsx`.
- Product Flow: Centralized in `src/components/product/`.
  - State: `useProductFlow` (in `hooks/`) is the single state source. It manages steps, image, style, size, orientation, and customizations. Exposed via `useProductState`.
  - Steps: `ProductContent` renders `ProductStepsManager` inside a `CascadeErrorBoundary`. Step gating and navigation are delegated to `useProductSteps`.
  - Previews: `usePreviewGeneration` autogenerates style previews keyed by orientation.
  - UI Composition: Rich component tree in `components/product/components/**` and sibling folders.
- Supabase: Typed client in `src/integrations/supabase/client.ts` using `Database` from `types.ts`. Edge functions live in `supabase/functions/*` (e.g., `create-payment/`, `remove-watermark/`).
- Styling: Tailwind with extended theme in `tailwind.config.ts`. UI primitives come from `shadcn/ui` and Radix.

## Critical Workflows
- Dev server: `npm run dev` (Vite on port 8080; see `vite.config.ts`).
- Build: `npm run build`. Bundle analysis: `npm run build:analyze` (opens `dist/stats.html`).
- Preview: `npm run preview`.
- Linting: `npm run lint` and `npm run lint:unused`.
- Dead code and deps: `npm run dead-code:*`, `npm run deps:check`, `npm run deps:analyze`. Use for file/dependency reduction.

## Project Conventions
- Product State Contract:
  - Types in `components/product/types/productState.ts`.
  - Mutations via `useProductFlow` only; do not fork state elsewhere.
  - Event handlers expected by `ProductContent`/`ProductStepsManager`: `onPhotoAndStyleComplete(imageUrl, styleId, styleName, orientation?)`, `onOrientationSelect`, `onSizeSelect`, `onCustomizationChange`.
- Error Handling: Wrap risky UI with `CascadeErrorBoundary` (see `components/product/components/ErrorBoundaries/CascadeErrorBoundary.tsx`). Prefer using its retry/backoff and keep error UI minimal elsewhere.
- Routing Pattern: Pages live in `src/pages`. Adding a style landing page means creating `src/pages/StyleName.tsx` and registering a `<Route />` in `src/main.tsx`.
- Supabase Usage: Import `supabase` from `@/integrations/supabase/client`. Do not recreate clients. Keep keys/types centralized.
- Styling: Use Tailwind utility classes and existing design tokens in `tailwind.config.ts`. Prefer shadcn components in `src/components/ui/*` for consistent look/feel.

## Cross-Component Communication
- Props-down, hooks-up pattern: components receive state via props from `ProductContent` and raise changes through the handlers listed above.
- React Query should be used for async server state if needed; local UI state stays in `useProductFlow` or component-local state.

## File Reduction Mandate (Project-Specific)
- Before adding files, check for existing equivalents in `components/product/**` or `components/ui/**`.
- When consolidating:
  - Verify imports with VS Code search and `npm run dead-code:check`.
  - Avoid changing public function/component signatures unless updating all callers within the same PR.
  - Prefer merging small related components within their feature folder (e.g., `components/product/components/*`).

## Examples to Mirror
- Product state access: `src/components/product/ProductStateManager.tsx` and `hooks/useProductFlow.ts`.
- Defensive composition: `ProductContent` → `StepAccordion` → `ProductStepsManager` wrapped by `CascadeErrorBoundary`.
- Supabase integration: `src/integrations/supabase/client.ts`.

## Non-Obvious Details
- Vite dev server runs on `::` host and port `8080`. Aliases `@` → `src`.
- Some generation and payment logic lives in Supabase Edge Functions (`supabase/functions/*`); prefer calling those rather than embedding server logic in the frontend.
- Many style-specific components exist under `src/components/<style>`. Prefer reusing shared patterns under `components/product` or `components/shared` first.

## Safe-Change Checklist
- Run `npm run lint` and `npm run build` locally after edits.
- For state or step changes: validate `canProceedToStep` gating still works and that `completedSteps` updates are idempotent.
- When touching orientation/preview code: `usePreviewGeneration` expects `uploadedImage` and `selectedOrientation` and resets previews on orientation change.
- Wrap new complex step UIs in `CascadeErrorBoundary`.

Keep changes incremental and conversion-focused. When unsure, align with `PROJECT_GUIDELINES.md` and avoid increasing file count without justification.