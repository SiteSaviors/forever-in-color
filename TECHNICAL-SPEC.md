# Wondertone Technical Specification
**Version**: 2.1  
**Last Updated**: October 12, 2025  
**Implementation Target**: Wondertone Main App (`/src`)  
**For**: Claude & CODEX Alignment

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [State Management Schema](#state-management-schema)
3. [Generation & Entitlement Logic](#generation--entitlement-logic)
4. [Subscription Tiers](#subscription-tiers)
5. [Edge & API Integration](#edge--api-integration)
6. [Telemetry & Rollout](#telemetry--rollout)

---

## Architecture Overview

### Technology Stack

```
React 18.3.1 + TypeScript 5.6.3
├── State Management: Zustand 4.5.2
├── Routing: React Router 6.26.2
├── Styling: Tailwind CSS 3.4.11
├── Image Cropping: React Easy Crop 5.4.2
├── Animation: Framer Motion 11.0.12
└── Build Tool: Vite 7.1.9
```

### Directory Highlights

```
src/
├── components/
│   ├── navigation/FounderNavigation.tsx
│   ├── launchpad/ (PhotoUploader, CropperModal, etc.)
│   ├── studio/ (StickyOrderRail, StyleForgeOverlay, CanvasInRoomPreview)
│   └── ui/ (Badge, Button, Card)
├── sections/ (Hero, StyleShowcase, LaunchpadLayout, StudioConfigurator)
├── store/useFounderStore.ts
├── utils/ (canvasSizes, smartCrop, stylePreviewApi, telemetry, etc.)
└── pages/
    ├── LandingPage.tsx
    └── StudioPage.tsx
```

---

## State Management Schema

### Current Core State (`useFounderStore.ts`)
```typescript
type FounderState = {
  // Assets & styles
  uploadedImage: string | null;
  croppedImage: string | null;
  originalImage: string | null;
  orientation: Orientation;                      // 'horizontal' | 'vertical' | 'square'
  selectedCanvasSize: CanvasSize;                // e.g. 'landscape-24x18'
  styles: StyleOption[];
  selectedStyleId: string | null;

  // Preview pipeline
  previewStatus: 'idle' | 'generating' | 'ready';
  previews: Record<string, PreviewState>;
  pendingStyleId: string | null;
  stylePreviewStatus: StylePreviewStatus;
  stylePreviewCache: StylePreviewCache;
  orientationPreviewPending: boolean;

  // Crop & orientation metadata
  smartCrops: Record<Orientation, SmartCropResult>;
  orientationChanging: boolean;
  orientationTip: string | null;

  // Generation counters & gating
  generationCount: number;
  generationLimit: number;                       // derived via selectors
  isAuthenticated: boolean;
  accountPromptShown: boolean;
  accountPromptDismissed: boolean;
  accountPromptTriggerAt: number | null;
  subscriptionTier: 'free' | 'creator' | 'plus' | 'pro' | null;

  // Commerce & pricing
  basePrice: number;                             // fallback if size lookup fails
  enhancements: Enhancement[];
  selectedFrame: FrameColor;
  livingCanvasModalOpen: boolean;
  computedTotal: () => number;

  // Marketing
  styleCarouselData: StyleCarouselCard[];
  hoveredStyleId: string | null;

  // Representative actions
  incrementGenerationCount: () => void;
  setOrientation: (orientation: Orientation) => void;
  setCanvasSize: (id: CanvasSize) => void;
  canGenerateMore: () => boolean;
  getGenerationLimit: () => number;
  shouldShowAccountPrompt: () => boolean;
  setAuthenticated: (flag: boolean) => void;
  setSubscriptionTier: (tier: FounderState['subscriptionTier']) => void;
};
```

### Planned Extensions (Auth + Billing)
```typescript
type FounderState = {
  // Token ledger (hydrated from Supabase)
  freeTokensRemaining: number;
  monthlyTokenQuota: number;
  monthlyTokensUsed: number;
  entitlementWatermark: boolean;

  // Identity
  userId: string | null;
  subscriptionRenewAt: string | null;

  // Actions
  hydrateEntitlements: () => Promise<void>;
  spendToken: (count?: number) => Promise<boolean>;
  resetMonthlyTokens: (quota: number) => void;
};
```

---

## Generation & Entitlement Logic

| User Type | Limit | Behavior |
|-----------|-------|----------|
| **Anonymous** | 5 generations | After 5th: show soft account prompt (dismissible). Previews remain watermarked. |
| **Anonymous (Dismissed)** | Hard gate at 10th | Must create account to continue (still watermarked). |
| **Authenticated (Free)** | 10 generations / month | After 10th: subscription paywall. Watermarked. |
| **Creator Tier** | 50 / month | Unwatermarked previews, priority queue, download button. |
| **Plus Tier** | 250 / month | Unwatermarked previews. |
| **Pro Tier** | 500 / month | Unwatermarked previews. |

### Client Enforcement (Zustand helpers)
```typescript
canGenerateMore: () => {
  const { generationCount, subscriptionTier } = get();

  if (subscriptionTier === 'pro') return generationCount < 500;
  if (subscriptionTier === 'plus') return generationCount < 250;
  if (subscriptionTier === 'creator') return generationCount < 50;

  return generationCount < 10;
};

getGenerationLimit: () => {
  const { subscriptionTier } = get();

  if (subscriptionTier === 'pro') return 500;
  if (subscriptionTier === 'plus') return 250;
  if (subscriptionTier === 'creator') return 50;
  return 10;
};
```

### Server Enforcement (future)
- Supabase Edge Function validates every preview request.
- Deduct tokens and log usage transactionally (`preview_logs` table).
- Respond with `requires_watermark` flag used to control overlay.
- Hard gate responses return error code (e.g. `ENTITLEMENT_EXCEEDED`).

---

## Subscription Tiers

| Tier | Price | Generations / Month | Watermarks | Living Canvas | Priority |
|------|-------|----------------------|------------|---------------|----------|
| **Free** | $0 | 10 | Yes | Included | Email only |
| **Creator** | $9.99/mo | 50 | No | Included | Email + chat |
| **Plus** | $29.99/mo | 250 | No | Included | Priority queue |
| **Pro** | $59.99/mo | 500 | No | Included | Priority queue + phone |

### Stripe Product Placeholders
```typescript
const STRIPE_PRODUCTS = {
  creator: { monthly: 'price_creator_monthly' },
  plus: { monthly: 'price_plus_monthly' },
  pro: { monthly: 'price_pro_monthly' },
};
```

### Highlights
- Paid tiers remove watermarks and raise monthly quotas.
- Creator tier unlocks download button + faster queue.
- Plus/Pro tiers receive higher queue priority; Pro adds concierge support.

---

## Edge & API Integration

### Supabase Tables
```sql
CREATE TABLE preview_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  style_id TEXT NOT NULL,
  orientation TEXT,
  watermark BOOLEAN DEFAULT TRUE,
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
```

### Edge Function Responsibilities
- Authenticate Supabase session from request headers.
- Look up entitlements; reject when quota exhausted.
- Invoke preview pipeline (Replicate/Supabase Edge) and apply watermark decision.
- Deduct tokens + insert into `preview_logs` within a single transaction.
- Return `{ previewUrl, requires_watermark, remainingTokens }` to client.

### Stripe Webhooks
- `checkout.session.completed`: create/update `subscriptions` row, reset monthly quota, store `renew_at`.
- `invoice.paid` / `invoice.payment_failed`: adjust tier status and token availability.
- `customer.subscription.deleted`: downgrade tier to free, reinstate watermark requirement.

---

## Telemetry & Rollout

### Logging & Analytics
- Mirror preview events from edge function to PostHog (or chosen analytics) with properties: `tier`, `watermarked`, `orientation`.
- Emit Sentry warnings for repeated unauthorized preview attempts or quota overruns.
- Track upgrade funnel: free → subscription tier conversion.

### Rollout Phases
1. **Auth Foundation**: ship Supabase Auth, enforce sign-in before preview generation.
2. **Edge Enforcement**: move entitlement checks into edge function, add Supabase tables, connect Stripe webhooks.
3. **Subscription UX**: wire upgrade modals, token banners, and download behavior to real entitlements.
4. **Full Launch**: enable feature flag for 10% traffic, monitor metrics, ramp to 100% when stable.

---

**Context**: This spec defines the end-to-end implementation strategy for the Wondertone studio flow. The founder playground has been merged into the main application; all future work happens directly inside `src/`.
