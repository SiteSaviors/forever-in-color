# Wondertone Founder Vision — Playground

This workspace explores a founder-led reinvention of Wondertone without touching production code. Use it to prototype, validate, and iterate quickly.

## Quick Start
1. `cd founder`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase keys.
4. `npm run dev`
4. Visit `http://localhost:4175`

### Environment Variables
The founder build expects Supabase credentials. Create a `.env` file in this folder (there is a `.env.example` to copy) with:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Optional helpers:
- `TEST_IMAGE_URL` for load testing scripts.
- `VITE_FOUNDER_PREVIEW_MODE=stub` to run the UI without hitting Supabase/Replicate.

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
