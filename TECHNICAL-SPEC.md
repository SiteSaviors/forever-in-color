# Wondertone Technical Specification
**Version**: 2.1
**Last Updated**: October 12, 2025
**Implementation Target**: Wondertone Main App (`/src`)
**For**: Claude & CODEX Alignment

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [State Management Schema](#state-management-schema)
3. [Component Mapping](#component-mapping)
4. [API Contracts](#api-contracts)
5. [Data Models](#data-models)
6. [Generation Counter Logic](#generation-counter-logic)
7. [Subscription Tiers](#subscription-tiers)
8. [Key Decision Points](#key-decision-points)
9. [Integration Strategy](#integration-strategy)

---

## Architecture Overview

### Technology Stack (Wondertone Main App)

```
React 18.3.1 + TypeScript 5.6.3
├── State Management: Zustand 4.5.2
├── Routing: React Router 6.26.2
├── Styling: Tailwind CSS 3.4.11
├── Image Cropping: React Easy Crop 5.4.2
├── Animation: Framer Motion 11.0.12
└── Build Tool: Vite 7.1.9
```

### Directory Structure

```
src/
├── components/
│   ├── navigation/FounderNavigation.tsx   # Global nav (home + studio)
├── components/launchpad/                 # Upload & crop experience
│   ├── PhotoUploader.tsx
│   ├── ConfettiBurst.tsx
│   └── cropper/CropperModal.tsx
├── components/studio/                    # Studio + ordering UI
│   ├── StickyOrderRail.tsx
│   ├── CanvasInRoomPreview.tsx
│   ├── StyleForgeOverlay.tsx
│   └── LivingCanvasModal.tsx
├── sections/                             # Landing & studio sections
│   ├── HeroSection.tsx
│   ├── StyleShowcase.tsx
│   ├── LaunchpadLayout.tsx
│   └── StudioConfigurator.tsx
├── store/useFounderStore.ts              # Central Zustand store
├── utils/
│   ├── canvasSizes.ts                    # Orientation-aware canvas pricing
│   ├── stylePreviewApi.ts
│   ├── smartCrop.ts
│   └── telemetry.ts
└── pages/
    ├── LandingPage.tsx                   # Public homepage
    └── StudioPage.tsx                    # End-to-end configurator
```

---

## State Management Schema

### Zustand Store Extensions (`useFounderStore.ts`)

**Current Core Schema** (implemented in `useFounderStore.ts`):
```typescript
type FounderState = {
  // Assets & Styles
  uploadedImage: string | null;
  croppedImage: string | null;
  originalImage: string | null;
  orientation: Orientation;                    // 'horizontal' | 'vertical' | 'square'
  selectedCanvasSize: CanvasSize;              // orientation-aware ID, e.g. 'landscape-24x18'
  styles: StyleOption[];
  selectedStyleId: string | null;

  // Preview Pipeline
  previewStatus: 'idle' | 'generating' | 'ready';
  previews: Record<string, PreviewState>;
  pendingStyleId: string | null;
  stylePreviewStatus: StylePreviewStatus;
  stylePreviewCache: StylePreviewCache;        // Per-style, per-orientation cached renders
  orientationPreviewPending: boolean;

  // Crop + Orientation Metadata
  smartCrops: Record<Orientation, SmartCropResult>;
  orientationChanging: boolean;
  orientationTip: string | null;

  // Generation Counters & Gating
  generationCount: number;
  generationLimit: number;                     // derived via selectors
  isAuthenticated: boolean;
  accountPromptShown: boolean;
  accountPromptDismissed: boolean;
  accountPromptTriggerAt: number | null;
  subscriptionTier: 'free' | 'creator' | 'plus' | 'pro' | null;

  // Commerce & Pricing
  basePrice: number;                           // fallback when size price unavailable
  enhancements: Enhancement[];
  selectedFrame: FrameColor;
  livingCanvasModalOpen: boolean;
  computedTotal: () => number;

  // Homepage / marketing
  styleCarouselData: StyleCarouselCard[];
  hoveredStyleId: string | null;

  // Actions (selected sample)
  incrementGenerationCount: () => void;
  setOrientation: (next: Orientation) => void;
  setCanvasSize: (id: CanvasSize) => void;
  canGenerateMore: () => boolean;
  getGenerationLimit: () => number;
  shouldShowAccountPrompt: () => boolean;
  setAuthenticated: (flag: boolean) => void;
  setSubscriptionTier: (tier: FounderState['subscriptionTier']) => void;
};
```

**Planned Extensions** (post-auth & billing rollout):

```typescript
type FounderState = {
  // Token Ledger
  freeTokensRemaining: number;                 // anonymous or bonus tokens (local/session)
  monthlyTokenQuota: number;                   // server-synced quota from Supabase
  monthlyTokensUsed: number;                   // resets via webhook/cron
  entitlementWatermark: boolean;               // true = watermark required

  // Auth Session & Profile
  userId: string | null;
  subscriptionRenewAt: string | null;          // ISO timestamp from Stripe webhook
  anonymousSessionId: string | null;           // cookie/localStorage key for non-auth users

  // Actions
  hydrateEntitlements: () => Promise<void>;    // fetch token counts + tier from Supabase
  spendToken: (count?: number) => Promise<boolean>;
  resetMonthlyTokens: (quota: number) => void;
};
```

### Storage Strategy

**Session Storage** (for anonymous users):
- `generation_count`: number
- `account_prompt_dismissed`: boolean
- `temp_preview_cache`: Record<string, string>

**LocalStorage** (for authenticated users):
- `user_id`: string
- `subscription_tier`: string
- `generation_count_monthly`: number

**Supabase** (future production integration):
- `users` table: id, email, subscription_tier
- `generations` table: user_id, style_id, created_at
- `subscriptions` table: user_id, tier, status, billing_period

---

## Component Mapping

### FLOWMAP State → Component Architecture

| FLOWMAP State | Route | Primary Component | Child Components | Store Dependencies |
|---------------|-------|-------------------|------------------|--------------------|
| **STATE 0: Homepage Hero** | `/` | `HeroSection.tsx` | `StyleCarousel.tsx` | `styleCarouselData`, `setHoveredStyle` |
| **STATE 1: Product Page Hero** | `/product` | `HeroSection.tsx` (reuse) | `StyleCarousel.tsx` | Same as STATE 0 |
| **STATE 2: Cropper** | `/product` (modal) | `CropperModal.tsx` | Existing | `uploadedImage`, `setCroppedImage` |
| **STATE 3: Preview Generation** | `/product` (embedded) | `LaunchpadLayout.tsx` | `PhotoUploader.tsx` | `generatePreviews`, `previews` |
| **STATE 3A: First Preview Reveal** | `/product` (embedded) | `LaunchpadLayout.tsx` | `ConfettiBurst.tsx` | `celebrationAt` |
| **STATE 3B: Account Prompt** | `/product` (modal) | `AccountPromptModal.tsx` | NEW | `shouldShowAccountPrompt`, `incrementGenerationCount` |
| **STATE 4: Studio** | `/product` (section) | `StudioConfigurator.tsx` | `StickyOrderRail.tsx` | `enhancements`, `computedTotal` |
| **STATE 5: Checkout** | `/checkout` | `CheckoutPage.tsx` | NEW | `computedTotal`, `selectedStyleId` |
| **STATE 6: Order Confirmation** | `/confirmation` | `ConfirmationPage.tsx` | NEW | `watermarkRemovalOffered` |

---

## API Contracts

### Preview Generation

**Endpoint**: Supabase Edge Function (future) / Mock API (current)
**Current Implementation**: `utils/previewClient.ts`

```typescript
// Request
interface PreviewRequest {
  imageDataUrl: string;      // Base64 encoded image
  styleId: string;           // e.g., "watercolor-dreams"
  orientation: Orientation;  // "portrait" | "landscape" | "square"
  userId?: string;           // Optional for authenticated users
}

// Response
interface PreviewResponse {
  previewUrl: string;        // Generated preview image URL
  hasWatermark: boolean;     // True for free/unauthenticated users
  generationId: string;      // For tracking
  processingTime: number;    // In milliseconds
}

// Error Response
interface PreviewError {
  error: string;
  code: 'RATE_LIMIT' | 'INVALID_IMAGE' | 'STYLE_NOT_FOUND' | 'SERVER_ERROR';
  remainingGenerations?: number;
}
```

**Current Mock Implementation** (`fetchPreviewForStyle`):
```typescript
export async function fetchPreviewForStyle(
  style: StyleOption,
  imageDataUrl?: string
): Promise<PreviewResult> {
  // Simulates 2-second delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    styleId: style.id,
    previewUrl: style.preview, // Returns mock image
    timestamp: Date.now(),
  };
}
```

**Future Production Implementation**:
- Integrate with Supabase Edge Function
- Add authentication headers
- Implement watermark overlay for free tier
- Track generation count server-side

---

### Authentication Check

**Endpoint**: Supabase Auth (future)
**Current Implementation**: localStorage mock

```typescript
// Request
interface AuthCheckRequest {
  sessionToken?: string;
}

// Response
interface AuthCheckResponse {
  isAuthenticated: boolean;
  userId?: string;
  subscriptionTier: 'free' | 'creator' | 'pro' | null;
  generationsRemaining: number;
  generationsUsed: number;
  billingPeriodEnd?: string; // ISO date for subscribers
}
```

**Current Mock**:
```typescript
export function checkAuthStatus(): AuthCheckResponse {
  const userId = localStorage.getItem('user_id');
  const tier = localStorage.getItem('subscription_tier') as any;

  return {
    isAuthenticated: !!userId,
    userId: userId || undefined,
    subscriptionTier: tier || null,
    generationsRemaining: tier === 'creator' ? Infinity : 8,
    generationsUsed: parseInt(sessionStorage.getItem('generation_count') || '0'),
  };
}
```

---

### Subscription Management

**Endpoint**: Stripe API (via Supabase Edge Function)

```typescript
// Create Checkout Session
interface CreateCheckoutRequest {
  tier: 'creator' | 'pro';
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCheckoutResponse {
  checkoutUrl: string;       // Stripe Checkout Session URL
  sessionId: string;
}

// Check Subscription Status
interface SubscriptionStatusResponse {
  active: boolean;
  tier: 'creator' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;  // ISO date
  cancelAtPeriodEnd: boolean;
}
```

---

## Data Models

### StyleCarouselCard

Used for homepage/product page style carousel (STATE 0/1)

```typescript
interface StyleCarouselCard {
  id: string;                      // e.g., "watercolor-dreams"
  name: string;                    // Display name
  resultImage: string;             // URL to AI-generated result
  originalImage: string;           // URL to original photo (shown on hover)
  description?: string;            // Optional tagline
  ctaLabel: string;                // e.g., "Try This Style →"
}

// Example data
const styleCarouselData: StyleCarouselCard[] = [
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    resultImage: 'https://example.com/results/watercolor-1.jpg',
    originalImage: 'https://example.com/originals/photo-1.jpg',
    description: 'Soft, dreamy watercolor aesthetic',
    ctaLabel: 'Try This Style →',
  },
  // ... 5-7 more cards
];
```

### GenerationSession

Tracks user's generation activity (anonymous or authenticated)

```typescript
interface GenerationSession {
  sessionId: string;               // UUID for this session
  userId?: string;                 // If authenticated
  generationCount: number;         // Total this session
  generations: GenerationRecord[]; // History
  createdAt: number;               // Timestamp
  lastActivityAt: number;          // Timestamp
}

interface GenerationRecord {
  id: string;                      // UUID
  styleId: string;
  timestamp: number;
  previewUrl: string;
  hasWatermark: boolean;
}
```

### EnhancementConfig

Defines available enhancements in Studio (STATE 4)

```typescript
interface Enhancement {
  id: string;                      // e.g., "living-canvas"
  name: string;                    // Display name
  description: string;             // Sell copy
  price: number;                   // In USD
  enabled: boolean;                // User selection
  category: 'physical' | 'digital' | 'ar';
  icon?: string;                   // Icon component name
  requiresAuth?: boolean;          // Some features require account
}

// Example enhancements
const enhancements: Enhancement[] = [
  {
    id: 'floating-frame',
    name: 'Floating Frame',
    description: 'Premium walnut frame that arrives ready to hang.',
    price: 29.00,
    enabled: false,
    category: 'physical',
  },
  {
    id: 'living-canvas',
    name: 'Living Canvas AR',
    description: 'Attach a 30s video story that plays back when scanned.',
    price: 59.99,
    enabled: false,
    category: 'ar',
  },
  {
    id: 'digital-bundle',
    name: 'Canvas + Digital Bundle',
    description: 'Instant HD download while you wait for delivery.',
    price: 14.99,
    enabled: false,
    category: 'digital',
  },
  {
    id: 'watermark-removal',
    name: 'Remove Watermark',
    description: 'Download high-res preview without Wondertone branding.',
    price: 4.99,
    enabled: false,
    category: 'digital',
    requiresAuth: true,
  },
];
```

---

## Generation Counter Logic

### Rules (Updated October 2025)

| User Type | Limit | Behavior |
|-----------|-------|----------|
| **Anonymous** | 5 generations | After 5th: show soft account prompt (dismissible). Previews remain watermarked. |
| **Anonymous (Dismissed)** | Hard gate at 10th | Must create account to continue. |
| **Authenticated (Free)** | 10 generations / calendar month | After 10th: subscription gate (hard). |
| **Creator Tier** | 50 generations / month | Unwatermarked previews, priority queue, instant download. |
| **Plus Tier** | 250 generations / month | Unwatermarked previews. |
| **Pro Tier** | 500 generations / month | Unwatermarked previews. |

### Implementation Flow

```typescript
// In generatePreviews action (Zustand store)
generatePreviews: async (ids) => {
  const state = get();

  // 1. Check if user can generate
  if (!state.canGenerateMore()) {
    // Show appropriate modal:
    // - If count < 9 && !authenticated: Show account prompt
    // - If count >= 9 && !authenticated: Force account creation
    // - If authenticated && count >= 8: Show subscription gate
    return;
  }

  // 2. Increment counter
  state.incrementGenerationCount();

  // 3. Generate previews (existing logic)
  // ...

  // 4. After 3rd generation (for anonymous users)
  if (state.shouldShowAccountPrompt()) {
    // Delay modal by 2 seconds to not interrupt WOW moment
    setTimeout(() => {
      state.setAccountPromptShown(true);
    }, 2000);
  }

  // 5. Apply watermarks based on tier
  // If tier !== 'pro', add watermark overlay
}
```

### Helper Functions

```typescript
// In useFounderStore
canGenerateMore: () => {
  const {
    generationCount,
    isAuthenticated,
    subscriptionTier,
    accountPromptDismissed,
  } = get();

  if (subscriptionTier === 'pro') return generationCount < 500;
  if (subscriptionTier === 'plus') return generationCount < 250;
  if (subscriptionTier === 'creator') return generationCount < 50;

  if (isAuthenticated) {
    return generationCount < 10;
  }

  if (generationCount < 5) return true;
  if (!accountPromptDismissed && generationCount < 10) return true;
  return false;
},

getGenerationLimit: () => {
  const { isAuthenticated, subscriptionTier } = get();

  if (subscriptionTier === 'pro') return 500;
  if (subscriptionTier === 'plus') return 250;
  if (subscriptionTier === 'creator') return 50;

  return isAuthenticated ? 10 : 5;
},

shouldShowAccountPrompt: () => {
  const { generationCount, isAuthenticated, accountPromptShown, accountPromptDismissed } = get();

  return (
    generationCount === 5 &&
    !isAuthenticated &&
    !accountPromptShown &&
    !accountPromptDismissed
  );
},
```

---

## Subscription Tiers

### Pricing Structure

| Tier | Price | Generations / Month | Watermarks | Living Canvas | Priority |
|------|-------|----------------------|------------|---------------|----------|
| **Anonymous** | $0 | 5 soft gate / 10 hard gate | Yes | No | N/A |
| **Free (Authenticated)** | $0 | 10 | Yes | No | Email only |
| **Creator** | $9.99/mo | 50 | No | Included | Email + chat |
| **Plus** | $29.99/mo | 250 | No | Included | Priority queue |
| **Pro** | $59.99/mo | 500 | No | Included | Priority queue + phone |

### Stripe Product IDs (Placeholder - Replace in Production)

```typescript
const STRIPE_PRODUCTS = {
  creator: { monthly: 'price_creator_monthly' },
  plus: { monthly: 'price_plus_monthly' },
  pro: { monthly: 'price_pro_monthly' },
};
```

### Subscription Benefits

**Creator Tier ($9.99/mo)**
- 50 preview generations per billing month
- Unwatermarked previews + instant download button
- Living Canvas AR included on shipped canvases
- Priority rendering queue over free users
- Email and chat support

**Plus Tier ($29.99/mo)**
- 250 preview generations per month
- Everything in Creator + higher queue priority
- Ideal for photographers and boutique studios

**Pro Tier ($59.99/mo)**
- 500 preview generations per month
- Fastest queue priority + concierge support (email + phone)
- Team-friendly roadmap (multi-user accounts planned)

---

## Key Decision Points

### Where Alignment is Critical (CODEX must follow)

1. **Generation Counter Logic** → Prompt must appear immediately after the 5th anonymous generation; hard gate enforced at 10th.
2. **Style Carousel Hover Interaction** → Must show original photo on hover (NOT video, NOT animation loop).
3. **Account Prompt Timing** → Delay modal by ~2s after the triggering generation to preserve the reveal moment.
4. **Collapsible Sidebar in Studio** → Must remain collapsible (expanded by default on desktop, collapsed on mobile).
5. **Watermark Placement** → Centered, semi-transparent Wondertone logo, never obscure faces/subjects.
6. **Living Memory Upload** → Must happen post-checkout (not during the main preview flow).

### Where Flexibility is OK (CODEX can iterate)

1. **Style Carousel Animation Timing** → 300ms crossfade is suggested, but 200-400ms is acceptable
2. **Confetti Animation Duration** → Currently 1500ms, can be adjusted
3. **Preview Card Size** → Currently h-48 (192px), can adjust for visual balance
4. **Modal Dialog Styling** → As long as it's clearly visible and on-brand
5. **Enhancement Card Layout** → Grid vs. list layout in Studio section
6. **Trust Badge Copy** → Exact wording of "Secure checkout" / "Fast shipping" badges

### Areas Requiring Discussion (Check with User)

1. **Watermark Removal Pricing** → Current plan: $4.99 per image. Should this be bundled (e.g., 5 for $19.99)?
2. **Annual Subscription Discounts** → Should we offer 20% off annual plans?
3. **Generation Counter Reset** → Should authenticated users get monthly refresh or rolling limit?
4. **Living Memory Length Limit** → 30 seconds recommended, but should Pro tier get 60s?
5. **Style Carousel Card Count** → 6-8 styles recommended, but affects homepage performance

---

## Integration Strategy

### Phase 1: Auth & Token Foundation

**Timeline**: ~2 weeks
**Focus**: Reintroduce Supabase Auth, anonymous session tracking, entitlement counters in the main app.

**Deliverables**:
- Supabase client reinstated (`src/lib/supabaseClient.ts`).
- Anonymous session token issued + stored (cookie/localStorage + Supabase `anonymous_tokens`).
- Zustand store hydrated with `freeTokensRemaining`, `anonymousSessionId`.
- Soft prompt + hard gate wired to new limits (5 / 10).

**Testing**:
- Manual QA across fresh/incognito sessions.
- Verify counters persist after refresh, reset after sign-up.
- Ensure studio UI disables preview button when quota exhausted.

---

### Phase 2: Stripe Subscription Integration

**Timeline**: ~3 weeks
**Focus**: Wire Stripe Billing → Supabase profiles via webhooks, implement monthly token quotas for Creator/Plus/Pro.

**Tasks**:

1. **Identity & Profiles**
   - Store `stripe_customer_id`, `subscription_tier`, `monthlyTokenQuota`, `monthlyTokensUsed`, `renew_at` in Supabase `profiles`.
   - Provide `hydrateEntitlements()` action to sync store on page load.

2. **Database Schema** (Supabase additions):
   ```sql
   -- Add to existing schema
  CREATE TABLE anonymous_tokens (
    token TEXT PRIMARY KEY,
    free_tokens_remaining INT DEFAULT 5,
    dismissed_prompt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen_ip TEXT,
    last_user_agent TEXT
  );

  CREATE TABLE preview_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    anonymous_token TEXT,
    style_id TEXT,
    requires_watermark BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    tier TEXT NOT NULL,
    renew_at TIMESTAMP,
    stripe_subscription_id TEXT,
    tokens_used INT DEFAULT 0,
    tokens_quota INT NOT NULL
  );

  CREATE TABLE preview_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    anonymous_token TEXT,
    style_id TEXT NOT NULL,
    orientation TEXT,
    watermark BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

3. **Edge Function Enforcement**:
   - Extend `generate-style-preview` to:
     - Validate token/quota before invoking the generation pipeline.
     - Mark response with `requires_watermark` flag.
     - Deduct tokens + insert into `preview_logs` transactionally.
   - Add helper endpoint `GET /entitlements` returning current quota/usage for the client.

4. **Client Integration**:
   - Rehydrate entitlements on app load (`hydrateEntitlements`).
   - Gate “Generate Preview” button via `canGenerateMore()`; display remaining token count in StickyOrderRail.
   - Trigger upgrade modal when entitlements exhausted; link to Stripe Checkout session.
   - Ensure watermark badge (or overlay) reflects `requires_watermark` flag from preview response.

5. **Telemetry & Analytics**:
   - Stream preview events to Supabase `preview_logs` + PostHog (or chosen analytics) with tier and watermark info.
   - Emit alerts (Sentry/PostHog) on suspected abuse (e.g., repeated anonymous hard gate attempts beyond threshold).

6. **Rollout Plan**:
   - Phase 2 complete → release to 10% of traffic behind feature flag.
   - Monitor conversion (anonymous → signup, signup → subscribe), error rates, preview latency.
   - Incrementally ramp to 100% once metrics stable; document fallback to disable new gating if needed.

---

## Success Metrics

### North Star Metric
**Time-to-WOW < 10 seconds** (From upload to first preview reveal)

### Secondary Metrics
- **Upload-to-Purchase Conversion**: Target >8% (current: ~5%)
- **Account Creation Rate**: Target >20% at soft prompt
- **Subscription Conversion**: Target >3% of authenticated users
- **Mobile Conversion**: Target >6% (currently lags desktop)

### Technical Metrics
- **Preview Generation P95**: <3 seconds
- **Page Load Time**: <2 seconds
- **Carousel Interaction Rate**: >40% of visitors
- **Error Rate**: <1% of generations

---

## Notes for CODEX

**Context**: This spec defines the end-to-end implementation strategy for the Wondertone studio flow. The founder playground has been merged into the main application; all future work happens directly inside `src/`.

**Your Role**: Implement components and logic according to this spec. When you encounter ambiguity:
1. Check [Key Decision Points](#key-decision-points) section first
2. If it's marked "Critical" → follow the spec exactly
3. If it's marked "Flexible" → use your judgment
4. If it's marked "Requires Discussion" → ask the user before proceeding

**Communication Protocol**:
- Prefix all messages with `[CODEX]` so we know who's speaking
- Reference FLOWMAP states (e.g., "Working on STATE 3B account prompt")
- Flag any blockers immediately (don't struggle silently for >30 min)
- Share progress updates at end of each session

**Code Standards**:
- TypeScript strict mode (no `any` types)
- Tailwind classes (no inline styles)
- Zustand for state (no Redux/Context unless critical)
- Mobile-first responsive design
- Accessibility: ARIA labels, keyboard navigation

**Git Workflow**:
- Work in `founder/` directory only (Phase 1)
- Commit often with descriptive messages
- Use conventional commits format: `feat:`, `fix:`, `refactor:`, etc.
- Push to branch: `founder/flowmap-v2`

---

## Appendix: Reference Links

- [FLOWMAP.md](./FLOWMAP.md) - Complete product flow specification
- [TRANSFORMATION-PLAN.md](./TRANSFORMATION-PLAN.md) - Phase 1 visual changes (complete)
- [CLAUDE-UX-REVIEW.md](./CLAUDE-UX-REVIEW.md) - Original UX analysis
- [WONDERTONE-UX-STRATEGY.md](./WONDERTONE-UX-STRATEGY.md) - Magic-First architecture principles

---

**Document Version History**:
- v2.0 (Oct 6, 2025): Initial technical spec for FLOWMAP v2.0 implementation
