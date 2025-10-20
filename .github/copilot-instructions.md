# Copilot Instructions for Wondertone

Guide for AI coding agents working in this repo. Keep edits small, conversion-focused, and never break the purchase flow.

## Architecture Overview
- **App shell:** React + TypeScript + Vite + Tailwind. Entry point `src/main.tsx` mounts `App`, wires `BrowserRouter`, lazy-loads marketing vs. studio routes, and wraps studio routes with `StudioProviders` (React Query boundary + Auth).
- **Routing:** Marketing routes live in `src/routes/MarketingRoutes.tsx`; studio experiences are served from `/create`, `/checkout`, and `/studio/usage` via `src/routes/StudioRoutes.tsx`.
- **Studio flow:** Launchpad + Studio surfaces coordinate through the founder store.
  - **State:** `src/store/useFounderStore.ts` composes preview, entitlement, session, and favorites slices. `previewSlice.startStylePreview` is the single entry into Supabase preview generation.
  - **Step orchestration:** `src/sections/LaunchpadLayout.tsx` manages upload, smart crop, and telemetry, while `src/sections/StudioConfigurator.tsx` consumes store state for gating, preview display, and checkout hand-off.
  - **Previews:** `src/store/founder/previewSlice.ts` + `src/utils/founderPreviewGeneration.ts` build idempotency keys, emit telemetry, and call Supabase through `src/utils/stylePreviewApi.ts`.
  - **UI tree:** Launchpad components under `src/components/launchpad/**`, studio UI under `src/components/studio/**` and `src/sections/studio/components/**`, with shared skeletons in `src/components/skeletons/**`.
- **Supabase:** `src/utils/supabaseClient.ts` creates the browser client. Edge functions reside in `supabase/functions/*` (e.g., `generate-style-preview`, `create-payment`, `remove-watermark`).
- **Styling:** Tailwind utilities + shadcn/ui primitives. Additional motion/texture utilities live in `src/index.css`.

## Critical Workflows
- Dev server: `npm run dev` (Vite on port 8080).
- Build: `npm run build`.
- Bundle analysis: `npm run build:analyze` (generates and opens `dist/stats.html`).
- Preview mode: `npm run preview` (after building).
- Linting & cleanup: `npm run lint`, `npm run lint:unused`, `npm run dead-code:*`, `npm run deps:check`, `npm run deps:analyze`.

## Project Conventions
- **Founder store contract**
  - `useFounderStore.ts` exposes selector-friendly slices; mutations must flow through the provided actions (`setUploadedImage`, `setOrientation`, `startStylePreview`, etc.).
  - Preview generation must run through `previewSlice.startStylePreview` / `generatePreviews`; do not create alternate fetchers.
- **Step One UX**
  - Launchpad components raise telemetry via `emitStepOneEvent` and `launchflowTelemetry`; keep those calls when adjusting upload or crop flows.
  - Orientation updates must go through `setOrientation` so caches and pending previews reset correctly.
- **Suspense + fallbacks**
  - Studio surfaces rely on `React.Suspense` with skeletons (`StudioShellSkeleton`, `StyleSidebarFallback`, etc.). Preserve or update fallbacks whenever you change lazy boundaries.
- **Routing pattern**
  - Marketing pages live in `src/pages`; add routes via `src/routes/MarketingRoutes.tsx`. Studio routes belong in `src/routes/StudioRoutes.tsx`.
- **Supabase usage**
  - Use `supabaseClient` via `AuthProvider` or `store/utils/supabaseClient`. Call edge functions (`stylePreviewApi.ts`, `checkout` handlers) instead of hitting providers directly.
- **Styling guidelines**
  - Favor Tailwind utilities, shared design tokens, and shadcn components. Watch for heavy `filter` usage—prefer GPU-friendly transforms when adding motion.

## Cross-Component Communication
- Launchpad writes into the founder store; Studio reads via selectors. Use `useFounderStore` hooks instead of new contexts.
- React Query (via `ReactQueryBoundary`) is available for async Supabase interactions; keep UI-specific state local or in the store slices.

## File Reduction Mandate
- Check existing components under `components/launchpad/**`, `components/studio/**`, or `components/ui/**` before introducing new files.
- Before deleting, run `npm run dead-code:check` and verify with VS Code search.
- Avoid changing exported store actions/selectors unless every caller is updated within the same change set.
- Merge small related components inside their feature folders when refactoring.

## Examples to Mirror
- Founder store usage: `src/sections/LaunchpadLayout.tsx`, `src/sections/StudioConfigurator.tsx`, `src/store/useFounderStore.ts`.
- Tone gating + telemetry: `src/sections/studio/components/StyleSidebar.tsx`, `src/sections/studio/components/ToneStyleCard.tsx`.
- Supabase integration: `src/providers/AuthProvider.tsx`, `src/utils/stylePreviewApi.ts`.

## Non-Obvious Details
- Vite dev server binds to `::` on port 8080; alias `@` resolves to `src`.
- Preview caching + webhook flow resides in `supabase/functions/generate-style-preview`; keep client calls consistent with `stylePreviewApi.ts`.
- Edge token spend + refunds happen in `supabase/functions/remove-watermark`—guard against duplicate charges.
- Auto-preview is disabled in the founder store; UI affordances must trigger `startStylePreview` explicitly.

## Safe-Change Checklist
- Run `npm run lint` and `npm run build` before shipping.
- After store edits, confirm Launchpad upload → Studio preview gating still flows through `useFounderStore` (`uploadIntentAt`, `pendingStyleId`, `evaluateStyleGate`).
- When touching orientation or previews, verify `setOrientation` clears caches and `startStylePreview` resumes polling as expected.
- Keep `emitStepOneEvent` and launchflow telemetry intact so momentum widgets behave.

Need deeper guardrails? Read `agents.md` (living document) and the VS Code playbook in `FOUNDER_WORKFLOW.md`.
