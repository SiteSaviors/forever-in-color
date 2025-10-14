# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Wondertone is a premium AI-generated canvas artwork platform where users upload photos, explore AI art styles, and order custom canvas prints. Built with React + TypeScript + Vite, the app emphasizes fast performance, refined UX, and long-term maintainability.

**Key value proposition**: Four-step configurator (photo/style selection → sizing → customization → checkout) with optional AR "Living Memory" video moments.

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server on port 4175
npm run preview          # Preview production build locally
```

### Quality Checks (run before committing)
```bash
npm run lint             # ESLint check
npm run build            # Production build
npm run build:analyze    # Build + open bundle treemap at dist/stats.html
npm run deps:check       # Find unused dependencies (depcheck)
```

### Dead Code Analysis
```bash
npm run dead-code:check    # Run all dead code checks
npm run dead-code:exports  # Find unused exports
npm run dead-code:files    # Find unimported files
npm run dead-code:deps     # Show unresolved dependencies
npm run deps:analyze       # Check for circular dependencies
```

## Architecture

### Application Structure

```
src/
├── main.tsx                    # Entry point: BrowserRouter setup, routes
├── pages/                      # Top-level route pages
│   ├── LandingPage.tsx        # "/" - marketing landing
│   ├── StudioPage.tsx         # "/create" - main configurator
│   └── PricingPage.tsx        # "/pricing" - subscription tiers
├── components/
│   ├── launchpad/             # Photo upload, cropper modal
│   ├── studio/                # Canvas preview, sticky order rail, style carousel
│   ├── navigation/            # Top nav, auth UI
│   ├── modals/                # Auth modal, confirmation dialogs
│   ├── layout/                # Layout wrappers
│   └── ui/                    # shadcn/ui primitives (Button, Card, Badge, etc.)
├── sections/                   # Page sections (HeroSection, StyleShowcase, etc.)
├── store/
│   ├── useFounderStore.ts     # Main Zustand store (product state, previews, entitlements)
│   └── useAuthModal.ts        # Auth modal state
├── providers/
│   └── AuthProvider.tsx       # Supabase auth context
└── utils/
    ├── supabaseClient.ts      # Typed Supabase client
    ├── canvasSizes.ts         # Canvas size definitions + pricing
    ├── previewClient.ts       # Preview API calls
    ├── previewPolling.ts      # Long-polling for preview generation
    ├── stylePreviewApi.ts     # Style preview generation requests
    ├── entitlementsApi.ts     # User entitlement + token management
    ├── smartCrop.ts           # AI smart cropping logic
    ├── imageUtils.ts          # Image upload, HEIC conversion, orientation detection
    ├── telemetry.ts           # Event tracking
    └── checkoutApi.ts         # Stripe checkout integration
```

### State Management

**Primary store**: `useFounderStore` (Zustand) - single source of truth for:
- Uploaded/cropped images and orientation (`horizontal` | `vertical` | `square`)
- Selected style, canvas size, enhancements, frame color
- Preview generation state and cache (per-style previews)
- Entitlements: generation counts, subscription tier, watermarking
- Smart crop results per orientation
- Commerce: pricing, cart total

**Critical patterns**:
- All product state mutations flow through `useFounderStore` actions
- Preview generation is managed via `previewClient.ts` → Supabase Edge Functions
- Orientation changes trigger smart crop recalculation and preview invalidation
- Generation limits are enforced client-side based on tier (anonymous: 5/10, free: 10/month, creator: 50/month, plus: 250/month, pro: 500/month)

### Supabase Integration

**Edge Functions** (under `supabase/functions/`):
- `generate-style-preview` - Main preview generation with polling, caching, watermarking
- `generate-style-preview-v2` - Updated generation endpoint
- `create-checkout-session` - Stripe checkout for canvas orders
- `create-payment` - Legacy payment flow
- `purchase-tokens` - Token purchase flow
- `remove-watermark` - Token-gated watermark removal
- `stripe-webhook` - Stripe event handling
- `anon-mint` - Anonymous session token minting

**Client usage**: Import from `@/utils/supabaseClient.ts`. Never call AI providers (Replicate, OpenAI) or Stripe directly from frontend—always use edge functions.

**Migrations**: Database schema under `supabase/migrations/`

### Routing

Routes defined in `src/main.tsx`:
- `/` - Landing page
- `/create` - Studio configurator
- `/pricing` - Pricing/subscription page

To add a new route: create page in `src/pages/`, add `<Route>` in `main.tsx`.

### Styling

- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components in `src/components/ui/`
- **Framer Motion** for animations
- Favor Tailwind utilities over custom CSS; watch for heavy `filter` usage (prefer GPU-friendly transforms)

## Critical Workflows

### Preview Generation Flow
1. User uploads photo → smart crop analysis runs for all orientations
2. User selects style → `stylePreviewApi.ts` calls `generate-style-preview` edge function
3. Edge function generates preview via Replicate/OpenAI, applies watermark (if tier requires), stores in Supabase Storage
4. Client polls via `previewPolling.ts` until ready
5. Preview cached in `useFounderStore.stylePreviewCache` (max 12 styles)

**Key constraint**: Orientation changes invalidate cached previews and trigger regeneration.

### Entitlement & Watermarking
- Anonymous users: 5 free generations (soft prompt at 5, hard gate at 10), always watermarked
- Authenticated free: 10/month, watermarked
- Creator/Plus/Pro: unwatermarked, higher monthly quotas, priority queue
- Token spend tracked in Supabase; edge functions enforce limits

### Order Flow
1. User configures canvas (style, size, frame, enhancements)
2. `StickyOrderRail` displays live pricing via `useFounderStore.computedTotal()`
3. Click "Order" → `checkoutApi.ts` calls `create-checkout-session` → redirect to Stripe Checkout
4. On success, Stripe webhook updates database

## Development Workflow

**Recommended process** (per `FOUNDER_WORKFLOW.md`):
1. Create feature branch in VS Code (bottom-left branch switcher)
2. Make changes, review diffs in Source Control panel
3. Run quality checks: `npm run lint && npm run build && npm run deps:check`
4. Commit small, focused changes
5. Push branch, open PR on GitHub
6. Merge to `main` triggers Vercel deployment

**Pre-commit hooks**: Husky runs ESLint on staged files (see `lint-staged` in `package.json`)

## Important Constraints

### State Management Contract
- **Do not create alternate stores** - all product state lives in `useFounderStore`
- Event handlers follow signature patterns (e.g., `onPhotoAndStyleComplete`, `onOrientationSelect`)
- Preview state must stay in sync with orientation via `usePreviewGeneration` hooks

### File Reduction Mandate
- Check existing components before creating new files
- Run `npm run dead-code:check` before deletions
- Merge small related components within feature folders

### Performance
- Current production bundle: ~567 KB gzipped (baseline ceiling)
- Use `npm run build:analyze` to inspect bundle composition
- Minimize dependency additions; audit with `npm run deps:check`

### Error Handling
- Wrap risky UI in `CascadeErrorBoundary` for retry/backoff behavior
- Edge functions return structured errors; client displays user-friendly messages

## Project Conventions

### TypeScript
- Strict mode enabled
- Type definitions in component files or co-located `types/` folders
- Product state types in `store/useFounderStore.ts`

### Component Patterns
- Props-down, hooks-up: parent components pass props, children use hooks for shared state
- React Query available for server state (not yet widely used)
- UI-specific state stays local or in `useFounderStore` slices

### Import Aliases
- `@/` resolves to `src/` (configured in `vite.config.ts`)

### Environment Variables
- `.env` required for local dev (at minimum `VITE_SUPABASE_URL`)
- Other secrets provided through Supabase edge functions

## Testing

**Status**: No test suite currently configured (no test files in repo)

## Deployment

- **Vercel** auto-deploys on push to `main`
- **Supabase Edge Functions** deployed separately via Supabase CLI

## Reference Documents

For deeper context, refer to these in-repo docs:
- `agents.md` - Detailed guardrails, acceptance criteria, derived goals
- `FOUNDER_WORKFLOW.md` - VS Code-first workflow guide for non-technical users
- `.github/copilot-instructions.md` - AI coding agent instructions (architecture deep-dive)
- `TECHNICAL-SPEC.md` - State schema, entitlement logic, subscription tiers
- `README.md` - Quick-start guide

## When Making Changes

**Always**:
1. Run `npm run lint && npm run build` before committing
2. Verify changes don't break configurator step gating or preview generation
3. Check bundle size impact with `npm run build:analyze` for large changes
4. Test orientation changes clear preview caches correctly
5. Ensure entitlement logic (generation limits, watermarking) remains intact

**Never**:
- Bypass `useFounderStore` for product state
- Call Replicate, OpenAI, or Stripe APIs directly from frontend
- Break the four-step configurator flow
- Skip quality checks before merging to `main`
