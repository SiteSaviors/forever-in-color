# Wondertone Founder Vision — Playground

This workspace explores a founder-led reinvention of Wondertone without touching production code. Use it to prototype, validate, and iterate quickly.

## Quick Start
1. `cd founder`
2. `npm install`
3. `npm run dev`
4. Visit `http://localhost:4175`

## Phase 0 (Complete)
- North star storyboard for hero → launchpad → studio.
- Integration notes covering telemetry, preview API, payments.
- Success metrics defined (time-to-wow, Living Canvas attach, checkout start, etc.).

## Phase 1 Highlights
- Tailwind design tokens + CSS variables (`src/styles/tokens.css`) for gradients, glassmorphism, brand colors.
- UI primitives: `Card`, `Badge`, `Button`, `Section` wrappers.
- Landing sections upgraded to use shared tokens, metrics band, and CTAs.
- Launchpad + Studio configured with mock state via `useFounderStore` (Zustand) simulating style selection, preview status, pricing, and enhancement toggles.

## Phase 2 Progress
- Preview engine now runs parallel requests with skeletons and hooks into `VITE_FOUNDER_PREVIEW_ENDPOINT` when provided.
- StepOne telemetry adapter emits upload/style/complete/CTA events for analytics.
- Sticky order rail reflects bundle toggles; Living Canvas modal auto-prompts after first preview.
- Integration docs updated with guidance for Supabase + Stripe wiring.
- Launchpad now supports real photo upload, smart crops, manual crop adjustments, and orientation detection.

## Next Up
- Connect to Supabase + Stripe credentials and persist previews in Supabase storage.
- Build actual checkout experiment flow (guest vs. account) + token refills.
- Extend analytics + experimentation (feature flags, event bus) for landing tests.
