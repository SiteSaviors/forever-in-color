# Wondertone Technical Specification
**Version**: 2.0
**Last Updated**: October 6, 2025
**Implementation Target**: Founder Playground (`/founder`)
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

### Technology Stack (Founder Playground)

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
founder/
├── src/
│   ├── components/
│   │   ├── ui/              # Base UI components (Button, Card, Badge)
│   │   ├── layout/          # Layout wrappers (Section)
│   │   ├── launchpad/       # Upload & crop components
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── ConfettiBurst.tsx
│   │   │   └── cropper/
│   │   │       └── CropperModal.tsx
│   │   └── studio/          # Studio customization components
│   │       ├── StickyOrderRail.tsx
│   │       ├── LivingCanvasModal.tsx
│   │       └── StyleCarousel.tsx         # NEW - To implement
│   ├── sections/
│   │   ├── HeroSection.tsx               # NEW - To upgrade with carousel
│   │   ├── LaunchpadLayout.tsx           # Photo upload + style selection
│   │   └── StudioConfigurator.tsx        # Enhancement selection
│   ├── modals/                           # NEW - Modal components
│   │   └── AccountPromptModal.tsx        # NEW - After 3rd generation
│   ├── store/
│   │   └── useFounderStore.ts            # Zustand store (EXTEND)
│   ├── utils/
│   │   ├── previewClient.ts              # Preview generation API
│   │   ├── telemetry.ts                  # Event tracking
│   │   └── imageUtils.ts                 # Image processing
│   └── pages/
│       ├── LandingPage.tsx               # Homepage (STATE 0)
│       └── StudioPage.tsx                # Full flow (STATE 1-6)
```

---

## State Management Schema

### Zustand Store Extensions (`useFounderStore.ts`)

**Current Schema** (already implemented):
```typescript
type FounderState = {
  // Photo & Style
  uploadedImage: string | null;
  croppedImage: string | null;
  orientation: Orientation;
  styles: StyleOption[];
  selectedStyleId: string | null;

  // Preview State
  previewStatus: 'idle' | 'generating' | 'ready';
  previews: Record<string, PreviewState>;
  firstPreviewCompleted: boolean;
  celebrationAt: number | null;

  // Enhancements
  enhancements: Enhancement[];
  livingCanvasModalOpen: boolean;

  // Pricing
  basePrice: number;
  computedTotal: () => number;
}
```

**NEW Schema Extensions** (to implement):

```typescript
type FounderState = {
  // ... existing state ...

  // Generation Counter & Account Gating
  generationCount: number;                    // Total generations this session
  isAuthenticated: boolean;                   // User auth status
  accountPromptShown: boolean;                // Have we shown the modal?
  accountPromptDismissed: boolean;            // Did user dismiss it?
  subscriptionTier: 'free' | 'creator' | 'pro' | null;

  // Style Carousel (Homepage/Product Page)
  styleCarouselData: StyleCarouselCard[];     // Pre-loaded style examples
  hoveredStyleId: string | null;              // Track hover state

  // Watermark Management
  watermarkedPreviews: Set<string>;           // Which previews have watermarks
  watermarkRemovalOffered: boolean;           // Upsell shown?

  // Actions
  incrementGenerationCount: () => void;
  setAuthenticated: (status: boolean) => void;
  setAccountPromptShown: (shown: boolean) => void;
  dismissAccountPrompt: () => void;
  setSubscriptionTier: (tier: FounderState['subscriptionTier']) => void;
  setHoveredStyle: (id: string | null) => void;
  shouldShowAccountPrompt: () => boolean;     // Logic: count === 3 && !shown && !dismissed
  canGenerateMore: () => boolean;             // Logic: Check generation limits
  getGenerationLimit: () => number;           // Logic: 3 (anon) | 8 (auth) | unlimited (sub)
}
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

### Rules (As Per FLOWMAP.md)

| User Type | Limit | Behavior |
|-----------|-------|----------|
| **Anonymous** | 3 generations | After 3rd: Show soft account prompt (dismissible) |
| **Anonymous (Dismissed)** | Hard gate at 9th | Must create account to continue |
| **Authenticated (Free)** | 8 generations/month | After 8th: Subscription gate (hard) |
| **Creator Tier** | Unlimited | Watermarks on previews (removable for $4.99 each) |
| **Pro Tier** | Unlimited | No watermarks |

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
  const { generationCount, isAuthenticated, subscriptionTier } = get();

  // Pro tier: unlimited
  if (subscriptionTier === 'pro') return true;

  // Creator tier: unlimited (but watermarked)
  if (subscriptionTier === 'creator') return true;

  // Authenticated free tier: 8 limit
  if (isAuthenticated) return generationCount < 8;

  // Anonymous: 9 hard limit (soft prompt at 3)
  return generationCount < 9;
},

getGenerationLimit: () => {
  const { isAuthenticated, subscriptionTier } = get();

  if (subscriptionTier === 'creator' || subscriptionTier === 'pro') {
    return Infinity;
  }

  return isAuthenticated ? 8 : 9;
},

shouldShowAccountPrompt: () => {
  const { generationCount, isAuthenticated, accountPromptShown, accountPromptDismissed } = get();

  return (
    generationCount === 3 &&
    !isAuthenticated &&
    !accountPromptShown &&
    !accountPromptDismissed
  );
},
```

---

## Subscription Tiers

### Pricing Structure

| Tier | Price | Generations | Watermarks | Living Canvas | Priority Support |
|------|-------|-------------|------------|---------------|-----------------|
| **Free (Anonymous)** | $0 | 3 (soft gate) <br> 9 (hard gate) | Yes | No | No |
| **Free (Authenticated)** | $0 | 8/month | Yes | No | Email only |
| **Creator** | $9.99/mo | Unlimited | Yes (removable $4.99/ea) | Included | Email + Chat |
| **Pro** | $29.99/mo | Unlimited | No | Included | Priority + Phone |

### Stripe Product IDs (Placeholder - Replace in Production)

```typescript
const STRIPE_PRODUCTS = {
  creator: {
    monthly: 'price_creator_monthly',
    yearly: 'price_creator_yearly',  // Optional 20% discount
  },
  pro: {
    monthly: 'price_pro_monthly',
    yearly: 'price_pro_yearly',
  },
  watermark_removal: 'price_watermark_removal_single',
};
```

### Subscription Benefits

**Creator Tier**:
- Unlimited preview generations
- Watermarked downloads (pay $4.99 to remove per image)
- Living Canvas AR included on all orders
- Access to new styles first (beta features)
- Email + chat support

**Pro Tier**:
- Everything in Creator
- **No watermarks** on any downloads
- Bulk export tools
- API access (future)
- Priority rendering queue
- Phone support

---

## Key Decision Points

### Where Alignment is Critical (CODEX must follow)

1. **Generation Counter Logic** → User MUST see soft prompt at exactly 3 generations (not 4, not 5)
2. **Style Carousel Hover Interaction** → Must show original photo on hover (NOT video, NOT animation loop)
3. **Account Prompt Timing** → Must appear 2 seconds after 3rd generation completes (to not ruin WOW moment)
4. **Collapsible Sidebar in Studio** → Must be collapsible (not always-visible), default to expanded on desktop, collapsed on mobile
5. **Watermark Placement** → Centered, semi-transparent Wondertone logo, cannot obscure face/subject
6. **Living Memory Upload** → Must happen POST-checkout (not during main flow)

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

### Phase 1: Build in Founder Playground (Current)

**Timeline**: 1-2 weeks
**Focus**: Validate complete FLOWMAP flow without production dependencies

**Deliverables**:
- ✅ Phase 1 visual transformation (complete)
- [ ] Hero section with style carousel
- [ ] Account prompt modal
- [ ] Generation counter logic (mock auth)
- [ ] Collapsible Studio sidebar
- [ ] Watermark removal upsells

**Testing**:
- Manual QA of complete flow
- Gather user feedback on UX
- Measure time-to-WOW metric
- Test on mobile devices

---

### Phase 2: Port to Production (Future)

**Timeline**: 2-3 weeks (after Founder validation)
**Focus**: Integrate with Supabase, Stripe, and existing production infrastructure

**Tasks**:

1. **State Management Migration**:
   - Evaluate: Keep Zustand vs. integrate with existing `useProductFlow` hook
   - Recommendation: **Keep Zustand** for this feature, create adapter layer if needed

2. **Database Schema** (Supabase):
   ```sql
   -- Add to existing schema
   CREATE TABLE generation_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     session_id TEXT NOT NULL,
     generation_count INT DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     last_activity_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE generations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     session_id UUID REFERENCES generation_sessions(id),
     style_id TEXT NOT NULL,
     preview_url TEXT,
     has_watermark BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     stripe_subscription_id TEXT UNIQUE,
     tier TEXT CHECK (tier IN ('creator', 'pro')),
     status TEXT,
     current_period_end TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **API Integration**:
   - Create Supabase Edge Function: `generate-preview`
   - Integrate Stripe Checkout for subscriptions
   - Add watermark overlay service (Canvas API or image processing library)

4. **Component Porting**:
   - Copy `StyleCarousel.tsx` → `src/components/carousel/`
   - Copy `AccountPromptModal.tsx` → `src/components/modals/`
   - Integrate with existing `ProductStateManager.tsx`

5. **A/B Testing**:
   - Feature flag: `ENABLE_NEW_FLOW` (default: false)
   - Split traffic: 10% new flow, 90% old flow
   - Metrics to track:
     - Conversion rate (upload → purchase)
     - Time to first preview
     - Account creation rate
     - Subscription conversion rate

6. **Rollout Plan**:
   - Week 1: 10% traffic
   - Week 2: 25% traffic (if metrics positive)
   - Week 3: 50% traffic
   - Week 4: 100% rollout (deprecate old flow)

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

**Context**: This spec defines the complete implementation strategy for the FLOWMAP.md product flow. We're building this first in the Founder playground (`/founder`) to validate the UX before porting to production.

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
