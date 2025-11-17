# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wondertone is a premium e-commerce platform that transforms personal photos into AI-generated canvas artwork. The application features a four-step configurator (upload, style selection, canvas sizing/customization, checkout) with optional AR "Living Memory" functionality.

**Tech Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- State: Zustand (via `useFounderStore`) + React Query
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions)
- AI: Replicate + OpenAI (via edge functions)
- Payments: Stripe

## Development Commands

### Essential Commands
```bash
npm run dev                 # Start Vite dev server (port 4175, binds to ::)
npm run preview             # Preview production build locally
npm run build               # Production build (runs build:registry first)
npm run lint                # Run ESLint
npm run lint:unused         # Fix unused imports automatically
npm test                    # Run Vitest tests
npm test -- --watch         # Run tests in watch mode
```

### Build Variants
```bash
npm run build:registry      # Generate style registry from source (required before builds)
npm run build:analyze       # Build + open bundle analyzer (dist/stats.html)
npm run build:dev           # Development mode build
npm run validate:registry   # Verify registry output is up-to-date
npm run build:preview-validators # Generate JSON Schema validators from Zod
```

### Code Quality & Analysis
```bash
npm run dead-code:check     # Check for unused exports, files, and deps
npm run dead-code:exports   # Check unused exports only
npm run dead-code:files     # Check unimported files
npm run dead-code:deps      # Check unresolved imports
npm run dead-code:fix       # Auto-remove unused imports/exports
npm run dead-code:clean     # Remove unused code via unimported
npm run deps:analyze        # Find circular dependencies
npm run deps:check          # Check for unused dependencies
```

### Asset Generation
```bash
npm run thumbnails:generate # Generate WebP/AVIF variants for style assets
```

## Environment Variables

### Required for Development
```bash
VITE_SUPABASE_URL           # Supabase project URL (required)
VITE_SUPABASE_ANON_KEY      # Supabase anonymous key (required)
```

### Feature Flags
See [src/config/featureFlags.ts](src/config/featureFlags.ts) for complete definitions. Key flags:

```bash
VITE_REQUIRE_AUTH_FOR_PREVIEW=false       # Auth gate for previews
VITE_AUTH_GATE_ROLLOUT=0                  # Auth gate rollout percentage (0-100)
VITE_ENABLE_PREVIEW_QUERY=false           # React Query preview scaffolding
VITE_STORY_LAYER_ENABLED=true             # Style story layer
VITE_HEIC_EDGE_CONVERSION=false           # HEIC conversion via edge function
VITE_ENABLE_QUICKVIEW_DELETE_MODE=false   # Gallery delete UI

# OAuth Providers
VITE_AUTH_GOOGLE_ENABLED=true
VITE_AUTH_MICROSOFT_ENABLED=false
VITE_AUTH_FACEBOOK_ENABLED=false

# Canvas Checkout Features
VITE_SHOW_SIZE_RECOMMENDATIONS=true
VITE_USE_NEW_CTA_COPY=true
VITE_SHOW_STATIC_TESTIMONIALS=true
```

### Build Configuration
```bash
VERBOSE_SOURCEMAPS=true     # Enable detailed sourcemaps in builds
ANALYZE=1                   # Enable bundle analyzer during build
```

### Edge Function Configuration
```bash
WT_PREVIEW_ALLOWED_ORIGINS  # CORS origins for preview edge function
```

## Git Hooks & Pre-commit Workflow

The project uses Husky for automated git hooks:

```bash
npm run prepare             # Install git hooks (runs automatically after npm install)
```

### Pre-commit Hook
Automatically runs on `git commit`:
- ESLint with auto-fix on staged `.ts` and `.tsx` files
- Adds fixed files back to the commit

### Lint-Staged Configuration
Configured in package.json to run ESLint on TypeScript files before commit.

**Important**: Hooks ensure code quality but can be bypassed with `--no-verify` if needed for emergency commits. Avoid this in normal workflow.

## Architecture

### Entry Point & Routing
- **Entry:** [src/main.tsx](src/main.tsx) mounts the app, wraps routes with `BrowserRouter`, and splits marketing vs. studio routes
- **Marketing routes:** [src/routes/MarketingRoutes.tsx](src/routes/MarketingRoutes.tsx) - landing page, pricing, etc.
- **Studio routes:** [src/routes/StudioRoutes.tsx](src/routes/StudioRoutes.tsx) - `/create`, `/checkout`, `/studio/usage`
- **Studio providers:** [src/routes/StudioProviders.tsx](src/routes/StudioProviders.tsx) wraps studio routes with React Query boundary + Auth context

### State Management: Founder Store
Central Zustand store at [src/store/useFounderStore.ts](src/store/useFounderStore.ts) composed from four slices:

1. **Preview slice** ([src/store/founder/previewSlice.ts](src/store/founder/previewSlice.ts)) - preview generation, caching, polling
2. **Entitlement slice** ([src/store/founder/entitlementSlice.ts](src/store/founder/entitlementSlice.ts)) - user tiers, token management
3. **Session slice** ([src/store/founder/sessionSlice.ts](src/store/founder/sessionSlice.ts)) - auth state
4. **Favorites slice** ([src/store/founder/favoritesSlice.ts](src/store/founder/favoritesSlice.ts)) - favorited styles

**Critical conventions:**
- ALL preview generation MUST flow through `previewSlice.startStylePreview` / `generatePreviews`
- Never create alternate preview fetchers
- Orientation changes via `setOrientation` clear caches and trigger preview re-polling
- Auto-preview is disabled (`ENABLE_AUTO_PREVIEWS = false` in useFounderStore.ts); UI must explicitly trigger previews

### Studio Flow Coordination
- **Launchpad:** [src/sections/LaunchpadLayout.tsx](src/sections/LaunchpadLayout.tsx) manages upload, smart crop, telemetry via `emitStepOneEvent` and `launchflowTelemetry`
- **Studio Configurator:** [src/sections/StudioConfigurator.tsx](src/sections/StudioConfigurator.tsx) consumes store state for gating, preview display, checkout handoff
- **Style Sidebar:** [src/sections/studio/components/StyleSidebar.tsx](src/sections/studio/components/StyleSidebar.tsx) handles tone gating and telemetry

### Preview Generation Pipeline
1. Client builds idempotency key via [src/utils/founderPreviewGeneration.ts](src/utils/founderPreviewGeneration.ts)
2. Call edge function via [src/utils/stylePreviewApi.ts](src/utils/stylePreviewApi.ts):
   - `generateStylePreview({ imageUrl, style, photoId, aspectRatio, options })`
   - Headers: `Authorization`, `X-Idempotency-Key`
3. Edge function: `supabase/functions/generate-style-preview/index.ts`
4. Polling: [src/utils/previewPolling.ts](src/utils/previewPolling.ts) + `fetchPreviewStatus(requestId)`

**Important:** Server determines watermark application based on entitlements; client no longer passes watermark parameter.

### Style Registry System
Styles are defined in `registry/styleRegistrySource.ts` and transformed into:
- Frontend registry: [src/config/styles/styleRegistry.generated.ts](src/config/styles/styleRegistry.generated.ts)
- Edge registry: `supabase/functions/_shared/styleRegistry.generated.ts`

**Build process:**
1. Run `npm run build:registry` (via [scripts/build-style-registry.ts](scripts/build-style-registry.ts))
2. Validates assets exist in `public/`
3. Generates WebP/AVIF variants (if present)
4. Syncs prompts from `docs/style_prompts_rows.json`

**Never edit generated files directly.** Always update `styleRegistrySource.ts` and rebuild.

### Supabase Integration
- **Client:** [src/utils/supabaseClient.ts](src/utils/supabaseClient.ts) (also duplicated at [src/store/utils/supabaseClient.ts](src/store/utils/supabaseClient.ts))
- **Important:** Never import `@supabase/supabase-js` directly - use `@/utils/wondertoneAuthClient` facade (enforced by ESLint)
- **Auth:** [src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx)

#### Edge Functions (supabase/functions/)

**Preview Generation:**
- `generate-style-preview` - AI preview generation + caching (v1)
- `generate-style-preview-v2` - V2 preview implementation

**Payments & Billing:**
- `create-payment` - Payment initiation
- `create-checkout-session` - Stripe checkout session
- `create-order-payment-intent` - Order payment intent creation
- `stripe-webhook` - Payment webhooks handler
- `create-billing-portal` - Stripe billing portal access

**Features:**
- `remove-watermark` - Token-gated watermark removal
- `purchase-tokens` - Token purchase processing
- `convert-heic` - HEIC/HEIF image conversion
- `get-gallery` - User gallery retrieval
- `save-to-gallery` - Save preview to user gallery
- `persist-original-upload` - Upload persistence to storage

**Edge function patterns:**
- Functions share code via `supabase/functions/_shared/`
- Style registry synced to `_shared/styleRegistry.generated.ts`
- Edge functions use service role key for database access
- CORS configuration via `WT_PREVIEW_ALLOWED_ORIGINS` environment variable

### Database Schema

Core tables in Supabase Postgres (see `supabase/migrations/` for full schema):

**`profiles`** - User profiles with Stripe integration
- Fields: `id`, `stripe_customer_id`, `dev_override`, timestamps
- RLS: Users can read own profile, service role has full access

**`subscriptions`** - Subscription tiers and quotas
- Fields: `user_id`, `tier` (free/creator/plus/pro), `tokens_quota`, period dates
- Related view: `v_entitlements` calculates remaining tokens

**`preview_logs`** - Preview generation tracking
- Fields: `idempotency_key`, `user_id`, `anon_token`, `style_id`, `outcome`, `tokens_spent`
- Indexes: user/anon lookups, outcome filtering

**`preview_cache_entries`** - Preview result caching
- Fields: `cache_key`, `style_id`, `image_digest`, `preview_url`, `ttl_expires_at`
- Used by edge functions to avoid duplicate AI generation

**`anonymous_tokens`** - Anonymous user tracking
- Fields: `token`, `free_tokens_remaining`, `ip_ua_hash`, `month_bucket`

**`user_gallery`** - Saved user previews
- Tracks user's favorited/saved style previews

**`heic_conversion_cache`** - HEIC conversion results
- Caches converted images to avoid re-processing

**Key patterns:**
- All tables use RLS (Row Level Security)
- Service role bypasses RLS for edge functions
- `updated_at` triggers on all tables
- Entitlements calculated via `v_entitlements` view

### Suspense & Fallbacks
Studio surfaces use React.Suspense with dedicated skeletons:
- [src/components/skeletons/StudioShellSkeleton.tsx](src/components/skeletons/StudioShellSkeleton.tsx)
- [src/components/skeletons/AppShellSkeleton.tsx](src/components/skeletons/AppShellSkeleton.tsx)
- [src/sections/studio/components/StyleSidebarFallback.tsx](src/sections/studio/components/StyleSidebarFallback.tsx)

Preserve or update fallbacks when changing lazy boundaries.

### Styling Conventions
- Tailwind utilities + shadcn/ui components
- Design tokens: [src/styles/tokens.css](src/styles/tokens.css)
- Motion utilities: [src/index.css](src/index.css)
- Prefer GPU-friendly transforms over heavy CSS filters
- Path alias: `@/` resolves to `src/`

## Critical Workflows & Constraints

### State Mutation Rules
- Use `useFounderStore` selectors; never create new contexts for overlapping concerns
- Mutations flow through exposed actions (`setUploadedImage`, `setOrientation`, `startStylePreview`, etc.)
- Launchpad writes state; Studio reads via selectors

### Telemetry Requirements
- Step One events via `emitStepOneEvent` + `launchflowTelemetry` ([src/sections/LaunchpadLayout.tsx](src/sections/LaunchpadLayout.tsx))
- Preview analytics via [src/utils/previewAnalytics.ts](src/utils/previewAnalytics.ts)
- Keep telemetry calls intact when adjusting upload/crop flows

### File Reduction Mandate
Before creating new files:
1. Check `components/launchpad/**`, `components/studio/**`, `components/ui/**`
2. Run `npm run dead-code:check` before deleting
3. Verify with VS Code search
4. Merge small related components into feature folders

### CI Expectations
GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on PRs to `main`:
- Linting, tests, production build
- Bundle size enforcement via `scripts/verify-bundle-sizes.cjs`
- Build must be deterministic (use `npm ci` locally)

### Feature Flags
See [src/config/featureFlags.ts](src/config/featureFlags.ts):
- `VITE_REQUIRE_AUTH_FOR_PREVIEW` - auth gate for previews
- `VITE_AUTH_GATE_ROLLOUT` - rollout percentage
- Disable locally for easier testing

### Vite Configuration
- Dev server: port 4175, binds to `::`
- Path alias: `@` → `src/`
- Manual chunks: react-vendors, router-vendors, motion-vendors, radix-vendors, state-vendors, query-vendors
- Treemap analysis: `npm run build:analyze` → `dist/stats.html`

## Common Patterns

### Adding a New Style
1. Update `registry/styleRegistrySource.ts`
2. Add assets to `public/styles/`
3. Run `npm run build:registry`
4. Verify with `npm run validate:registry`

### Changing Orientation
- Use `setOrientation(orientation)` - this clears caches and triggers preview re-polling
- Never mutate `orientation` directly

### Checking Preview Status
- Use `evaluateStyleGate(styleId)` to determine if preview is ready/pending/gated
- Check `stylePreviewCache[styleId][orientation]` for cached previews

### Cross-Component Communication
- Launchpad → Store → Studio (one-way data flow)
- React Query (via `ReactQueryBoundary`) for async Supabase interactions
- Keep UI-specific state local or in store slices

## Non-Obvious Details

- Preview generation is **disabled by default** (`ENABLE_AUTO_PREVIEWS = false`); UI must explicitly call `startStylePreview`
- Edge functions handle token spend + refunds (`remove-watermark`); guard against duplicate charges
- Orientation tips stored in `orientationTip` state
- Smart crop results cached per-orientation in `smartCrops: Partial<Record<Orientation, SmartCropResult>>`
- Idempotency keys prevent duplicate preview requests
- Watermark application determined server-side based on user entitlements

## Safe-Change Checklist

Before committing:
1. `npm run lint` (auto-fixes imports)
2. `npm run build` (includes registry generation)
3. `npm run deps:check` (find unused deps)
4. Verify Launchpad upload → Studio preview gating still flows through `useFounderStore`
5. After store edits, confirm `uploadIntentAt`, `pendingStyleId`, `evaluateStyleGate` still work
6. When touching orientation/previews, verify `setOrientation` clears caches and `startStylePreview` resumes polling
7. Keep `emitStepOneEvent` and launchflow telemetry intact
