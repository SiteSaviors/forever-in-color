# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wondertone is a premium AI-generated canvas artwork e-commerce platform. Users upload photos, select from curated AI art styles, configure canvas sizing, and purchase custom canvas prints. The app includes an optional "Living Memory" AR feature that links video moments to physical canvases via QR code.

**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand + React Query + Supabase (Postgres, Auth, Storage, Edge Functions) + Replicate/OpenAI (AI providers) + Stripe (payments)

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server on port 4175

# Building
npm run build            # Production build
npm run build:dev        # Development build (with sourcemaps)
npm run build:analyze    # Production build + open bundle treemap (dist/stats.html)
npm run preview          # Preview production build locally

# Code Quality (run before commits)
npm run lint             # ESLint checks
npm run dead-code:check  # Detect unused exports, files, and dependencies
npm run deps:check       # Check for unused dependencies (depcheck)
npm run deps:analyze     # Detect circular dependencies (madge)
```

## Architecture

### Application Entry & Routing

- **Entry**: [src/main.tsx](src/main.tsx) mounts the React app with BrowserRouter and AuthProvider
- **Routes**:
  - `/` → [LandingPage.tsx](src/pages/LandingPage.tsx)
  - `/create` → [StudioPage.tsx](src/pages/StudioPage.tsx) (main configurator)
  - `/pricing` → [PricingPage.tsx](src/pages/PricingPage.tsx)
  - `/studio/usage` → [UsagePage.tsx](src/pages/UsagePage.tsx)
  - `/studio/gallery` → [GalleryPage.tsx](src/pages/GalleryPage.tsx)
  - `/checkout` → [CheckoutPage.tsx](src/pages/CheckoutPage.tsx)

### State Management

**Primary Store**: [src/store/useFounderStore.ts](src/store/useFounderStore.ts) (Zustand)

Core state includes:
- **Image pipeline**: `uploadedImage`, `croppedImage`, `originalImage`, `smartCrops` (per orientation)
- **Style & previews**: `styles`, `selectedStyleId`, `previews` (Record<styleId, PreviewState>), `stylePreviewCache`, `stylePreviewStatus`
- **Canvas config**: `orientation` (horizontal/vertical/square), `selectedCanvasSize`, `selectedFrame`, `enhancements`
- **Entitlements**: `entitlements` object with `tier`, `tokensRemaining`, `tokensQuota`, `priority`, `requiresWatermark`, `anonToken`
- **Generation tracking**: `generationCount`, plus helpers like `canGenerateMore()`, `getGenerationLimit()`, `shouldShowAccountPrompt()`

**Other stores**:
- [useCheckoutStore.ts](src/store/useCheckoutStore.ts) - Stripe checkout state
- [useAuthModal.ts](src/store/useAuthModal.ts) - Auth modal visibility

### User Flow: Launchpad → Studio → Checkout

1. **Launchpad** ([src/sections/LaunchpadLayout.tsx](src/sections/LaunchpadLayout.tsx)): Photo upload, cropping, and AI image analysis
   - [PhotoUploader.tsx](src/components/launchpad/PhotoUploader.tsx) handles HEIC conversion, drag-drop, file selection
   - [CropperModal](src/components/launchpad/cropper/CropperModal.tsx) uses react-easy-crop for user-driven cropping
   - [SmartCropPreview.tsx](src/components/launchpad/SmartCropPreview.tsx) shows AI-generated crop suggestions
   - [AIAnalysisOverlay.tsx](src/components/launchpad/AIAnalysisOverlay.tsx) displays AI analysis results

2. **Studio** ([src/sections/StudioConfigurator.tsx](src/sections/StudioConfigurator.tsx)): Style selection, canvas customization, preview generation
   - [StyleCarousel.tsx](src/components/studio/StyleCarousel.tsx) displays available art styles
   - [CanvasConfig.tsx](src/components/studio/CanvasConfig.tsx) for orientation, size, frame selection
   - [StyleForgeOverlay.tsx](src/components/studio/StyleForgeOverlay.tsx) shows preview generation progress
   - [CanvasInRoomPreview.tsx](src/components/studio/CanvasInRoomPreview.tsx) AR-style room visualization
   - [StickyOrderRail.tsx](src/components/studio/StickyOrderRail.tsx) displays order summary and pricing
   - [TokenWarningBanner.tsx](src/components/studio/TokenWarningBanner.tsx) shows generation limits

3. **Checkout** ([src/pages/CheckoutPage.tsx](src/pages/CheckoutPage.tsx)): Stripe payment flow

### Preview Generation Pipeline

**Critical**: The preview pipeline has two parallel paths:

1. **Initial preview generation** (launchpad → studio transition):
   - [src/utils/founderPreviewGeneration.ts](src/utils/founderPreviewGeneration.ts) - Orchestrates initial generation
   - Called when user completes photo upload and cropping

2. **Style-specific preview generation** (user changes style in studio):
   - `startStylePreview()` in [useFounderStore.ts](src/store/useFounderStore.ts)
   - Calls [src/utils/previewClient.ts](src/utils/previewClient.ts) → invokes edge function
   - Uses [src/utils/previewPolling.ts](src/utils/previewPolling.ts) for async status checks
   - Caches results in `stylePreviewCache` keyed by `[styleId][orientation]`

**Key behaviors**:
- Orientation changes clear preview cache and trigger regeneration
- Watermarking applied based on entitlement tier (anonymous/free get watermarks)
- Preview polling has exponential backoff with jitter
- `ENABLE_AUTO_PREVIEWS` flag in store controls automatic generation (currently `false` for cost control)

### Supabase Edge Functions

Located in [supabase/functions/](supabase/functions/):

**Core functions**:
- `generate-style-preview` - Main preview generation orchestrator
  - Validates entitlements, checks cache, invokes Replicate API
  - Applies watermarking for free/anonymous users
  - Supports async webhook-based generation
  - Multi-layer caching: memory (LRU) + metadata table + storage bucket
- `anon-mint` - Creates anonymous tokens for unregistered users
- `create-checkout-session` - Stripe subscription checkout
- `create-order-payment-intent` - Canvas order payments
- `remove-watermark` - Premium watermark removal (token-based)
- `get-gallery`, `save-to-gallery` - User gallery management
- `stripe-webhook` - Stripe event handling

**Edge function integration**:
- Client imports [src/utils/supabaseClient.ts](src/utils/supabaseClient.ts)
- API wrappers: [stylePreviewApi.ts](src/utils/stylePreviewApi.ts), [galleryApi.ts](src/utils/galleryApi.ts), [checkoutApi.ts](src/utils/checkoutApi.ts), [entitlementsApi.ts](src/utils/entitlementsApi.ts)

### Entitlements System

**Tiers** (defined in [TECHNICAL-SPEC.md](TECHNICAL-SPEC.md)):
- **Anonymous**: 5 generations (soft gate), 10 hard gate, watermarked
- **Free (authenticated)**: 10 generations/month, watermarked
- **Creator** ($9.99/mo): 50/month, no watermarks, priority queue
- **Plus** ($29.99/mo): 250/month, no watermarks
- **Pro** ($59.99/mo): 500/month, no watermarks, priority support

**Client enforcement**:
- `canGenerateMore()`, `getGenerationLimit()`, `shouldShowAccountPrompt()` in store
- Anonymous users get soft prompt at 5th generation, hard gate at 10th
- Authenticated users hit subscription paywall after quota exhausted

**Server enforcement** (future):
- Edge function validates every preview request
- Deducts tokens transactionally in `preview_logs` table
- Returns `requires_watermark` flag to control overlay

### Critical Workflows & Conventions

**Image Processing**:
- [src/utils/imageUtils.ts](src/utils/imageUtils.ts) - Orientation detection, image loading, HEIC handling
- [src/utils/smartCrop.ts](src/utils/smartCrop.ts) - AI-powered crop suggestions per orientation
- Cropping results cached in `smartCrops` (Record<Orientation, SmartCropResult>)

**Canvas Sizing**:
- [src/utils/canvasSizes.ts](src/utils/canvasSizes.ts) - Size options, pricing, defaults per orientation
- Sizes keyed like `'landscape-24x18'`, `'square-20x20'`, `'portrait-18x24'`

**Analytics & Telemetry**:
- [src/utils/telemetry.ts](src/utils/telemetry.ts) - Web Vitals, custom events
- [src/utils/previewAnalytics.ts](src/utils/previewAnalytics.ts) - Preview pipeline logging

**UI Components**:
- shadcn/ui primitives in [src/components/ui/](src/components/ui/)
- Custom components organized by feature: `launchpad/`, `studio/`, `checkout/`, `modals/`, `navigation/`

## Important Guardrails

1. **Preview generation is expensive** - respect `ENABLE_AUTO_PREVIEWS` flag and don't trigger unnecessary generations
2. **Entitlements must gate previews** - always check `canGenerateMore()` before generation
3. **Orientation changes invalidate previews** - ensure cache clearing logic stays intact
4. **Edge functions are the source of truth** - don't bypass them to call AI providers directly
5. **Watermarking depends on tier** - free/anonymous users must receive watermarked previews
6. **Bundle size matters** - current baseline ~567 KB; run `npm run build:analyze` before/after changes
7. **Style landing pages are variants** - changes to one may need replication to others (ClassicOilPainting.tsx, WatercolorDreams.tsx, etc.)

## Configuration Files

- **Vite**: [vite.config.ts](vite.config.ts) - dev server on port 4175, path alias `@` → `src`
- **TypeScript**: [tsconfig.json](tsconfig.json), [tsconfig.app.json](tsconfig.app.json)
- **Tailwind**: [tailwind.config.ts](tailwind.config.ts) + [src/styles/tailwind.css](src/styles/tailwind.css)
- **ESLint**: [eslint.config.js](eslint.config.js)
- **Supabase**: Connection configured via `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Testing & Deployment

**Pre-commit checks** (see [agents.md](agents.md)):
```bash
npm run lint
npm run build
npm run build:analyze  # optional, confirms bundle size
npm run deps:check
```

**Branching**: Feature branches off `main`, no direct pushes to main (see [FOUNDER_WORKFLOW.md](FOUNDER_WORKFLOW.md))

**Husky**: Pre-commit hooks configured in [.husky/](.husky/) for lint-staged

## Key Files Reference

- **State**: [src/store/useFounderStore.ts](src/store/useFounderStore.ts) - single source of truth
- **Main configurator**: [src/sections/StudioConfigurator.tsx](src/sections/StudioConfigurator.tsx)
- **Preview orchestration**: [src/utils/founderPreviewGeneration.ts](src/utils/founderPreviewGeneration.ts), [src/utils/previewClient.ts](src/utils/previewClient.ts)
- **Edge preview handler**: [supabase/functions/generate-style-preview/index.ts](supabase/functions/generate-style-preview/index.ts)
- **Entitlements logic**: [supabase/functions/generate-style-preview/entitlements.ts](supabase/functions/generate-style-preview/entitlements.ts)
- **Canvas sizing**: [src/utils/canvasSizes.ts](src/utils/canvasSizes.ts)
- **Smart cropping**: [src/utils/smartCrop.ts](src/utils/smartCrop.ts)

## Additional Context

- **Detailed architecture**: Read [.github/copilot-instructions.md](.github/copilot-instructions.md) for component hierarchy and cross-component communication patterns
- **Development workflow**: See [FOUNDER_WORKFLOW.md](FOUNDER_WORKFLOW.md) for VS Code-first process
- **Living guardrails**: [agents.md](agents.md) contains derived guardrails and acceptance criteria
- **Full spec**: [TECHNICAL-SPEC.md](TECHNICAL-SPEC.md) details state schema, subscription tiers, edge API integration, and rollout phases
