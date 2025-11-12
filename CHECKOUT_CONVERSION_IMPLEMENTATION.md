# Canvas Checkout Conversion Optimization
## Implementation Specification v1.0

**Last Updated:** 2025-11-11
**Status:** Ready for Implementation
**Target Bundle Size:** ≤567 KB (current ceiling)
**Target Performance:** 60fps animations, <100ms interaction latency

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Feature Specifications](#feature-specifications)
3. [Component Architecture](#component-architecture)
4. [Animation Specifications](#animation-specifications)
5. [Copy Matrix](#copy-matrix)
6. [Analytics Events](#analytics-events)
7. [Testing Strategy](#testing-strategy)
8. [Implementation Sequence](#implementation-sequence)

---

## Executive Summary

### Objective
Transform the Canvas Checkout Modal from an administrative transaction flow into a conversion-optimized, celebration-driven experience that maintains emotional momentum from the Studio and guides users confidently through purchase decisions.

### Core Problems Addressed
1. **Decision Fatigue** → Intelligent recommendations with social proof
2. **Trust Gaps** → Contextual trust signals at friction points
3. **Administrative Feel** → Celebratory step indicator with progress feedback
4. **Weak Social Proof** → Dynamic, context-aware testimonials

### Success Metrics
- **Primary:** Canvas Step → Contact Step conversion rate (+8-12% target)
- **Secondary:** Frame attachment rate (+5-8%), completion time (-15-20%)
- **Tertiary:** Exit rate reduction (-10-15%), NPS improvement

### Scope
**MVP (Week 1):** Features 1-3 + CTA copy refresh
**V2 (Week 2):** Feature 4 + enhancements (room-scale hover, testimonial rotation)

---

## Feature Specifications

### Feature 1: Intelligent Recommendations (Canvas Size Section)

#### Visual Design

**Recommended Badge:**
```
┌─────────────────────────────────────┐
│ [✨ Best Match]  <- Floating pill   │
│ ┌─────────────────────────────────┐ │
│ │  24" × 24"                      │ │
│ │  MEDIUM                   $219  │ │
│ │  Perfect above your sofa        │ │ <- Context copy
│ │  Museum-Grade                   │ │ <- Quality badge
│ │  🟢 Collector Favorite          │ │ <- Social proof
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Badge Styling:**
- **Position:** Absolute, top: -8px, left: 12px
- **Badge:** `rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]`
- **Card Enhancement (when recommended):**
  - Border: `border-purple-400/70` (2px instead of 1px)
  - Shadow: `shadow-[0_4px_24px_rgba(168,85,247,0.25)]`
  - Background: `bg-purple-500/5` (subtle fill)
  - Transform: `hover:scale-[1.015]` (slightly more lift)

**Badge Priority Logic:**
```typescript
if (isRecommended && isMostPopular) {
  showBadge = "Best Match" // Recommended takes precedence
} else if (isRecommended) {
  showBadge = "Best Match"
} else if (isMostPopular) {
  showBadge = "Collector Favorite"
} else {
  showBadge = null
}
```

**Context Copy Placement:**
- Below size label and nickname
- Style: `text-[11px] text-white/60 leading-snug mt-1`
- Max width: fits within card, no wrapping

**Quality Badge:**
- Position: Below price, right-aligned
- Style: `text-[10px] uppercase tracking-wider text-purple-300/60`
- Text: "Museum-Grade"

**Social Proof:**
- Position: Bottom of card, full width
- Style: `text-[10px] text-white/45 flex items-center gap-1 mt-2`
- Icon: `<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />`
- Text: "Collector Favorite" (MVP: static, no count)

#### Interaction Behavior

**Selection Animation:**
1. Card scales to 1.02 with spring easing (200ms)
2. Frame (if enabled) shimmers on preview with gradient sweep (300ms)
3. Social proof count (if shown) ticks up 3-5 units over 400ms
4. Mobile drawer auto-expands (first selection only)

**Shimmer Effect on Badge (First Reveal Only):**
```css
@keyframes badge-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.badge-shimmer-once {
  background-size: 200% 100%;
  animation: badge-shimmer 1.5s ease-in-out 1;
}
```

#### Recommendation Logic

```typescript
/**
 * Determines the recommended canvas size based on:
 * 1. Uploaded image resolution
 * 2. Orientation
 * 3. Quality thresholds
 */
function getRecommendedSize(
  orientation: Orientation,
  imageWidth: number,
  imageHeight: number
): CanvasSize | null {
  const pixelCount = imageWidth * imageHeight;

  // High-res images (>4MP) can handle larger canvases
  if (pixelCount > 4_000_000) {
    return orientation === 'square' ? '32x32' : '24x24';
  }

  // Medium-res images (2-4MP) work well with medium sizes
  if (pixelCount > 2_000_000) {
    return orientation === 'square' ? '24x24' : '16x16';
  }

  // Lower-res: smaller canvases
  return '16x16';
}

/**
 * Fallback: if no clear recommendation, use orientation heuristic
 */
function getFallbackPopularSize(orientation: Orientation): CanvasSize {
  const popularSizes: Record<Orientation, CanvasSize> = {
    vertical: '16x16',
    square: '24x24',
    horizontal: '24x24',
  };
  return popularSizes[orientation];
}
```

**Badge Text Logic:**
```typescript
function getBadgeText(
  size: CanvasSize,
  recommendedSize: CanvasSize | null,
  mostPopularSize: CanvasSize
): string | null {
  if (recommendedSize && size === recommendedSize) {
    return "Best Match";
  }
  if (!recommendedSize && size === mostPopularSize) {
    return "Popular Choice"; // Fallback when no recommendation
  }
  if (size === mostPopularSize && size !== recommendedSize) {
    return "Collector Favorite";
  }
  return null;
}
```

#### Context Copy Matrix

**By Orientation × Size:**

| Size | Vertical | Square | Horizontal |
|------|----------|--------|------------|
| 16"×16" | Perfect for gallery walls | Ideal for bedroom accents | Great for entryway moments |
| 24"×24" | Beautiful above a console | Perfect above your sofa | Statement piece for living rooms |
| 32"×32" | Grand vertical statement | Living room focal point | Dramatic horizontal showcase |
| 36"×36" | Gallery-scale masterpiece | Creates powerful presence | Commanding great room feature |

**Implementation:**
```typescript
const SIZE_CONTEXT_COPY: Record<CanvasSize, Record<Orientation, string>> = {
  '16x16': {
    vertical: 'Perfect for gallery walls',
    square: 'Ideal for bedroom accents',
    horizontal: 'Great for entryway moments',
  },
  '24x24': {
    vertical: 'Beautiful above a console',
    square: 'Perfect above your sofa',
    horizontal: 'Statement piece for living rooms',
  },
  // ... etc
};
```

---

### Feature 2: Contextual Trust Signal Layering

#### Trust Signal Placement Map

**Location 1: Near Canvas Size Section**
*Timing:* Always visible, appears on modal open
*Purpose:* Overcome quality/commitment anxiety

```tsx
<div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm">
  <span className="text-lg" role="img" aria-label="Shield">🛡️</span>
  <p className="text-[13px] leading-snug text-emerald-100">
    <strong className="font-semibold">100-day satisfaction guarantee</strong> —
    Love it or we'll remake it, free of charge
  </p>
</div>
```

**Location 2: Near Frame Section**
*Timing:* Always visible when frame section in view
*Purpose:* Reinforce craftsmanship value

```tsx
<div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 text-xs text-white/70">
  <span className="text-base" role="img" aria-label="Artist palette">🎨</span>
  <p className="leading-relaxed">
    Hand-stretched by artisans · Museum-grade canvas · UV-resistant inks
  </p>
</div>
```

**Location 3: Above CTA (Sticky Footer)**
*Timing:* Always visible, sticky bottom
*Purpose:* Final reassurance before commitment

```tsx
<div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/50">
  <span className="flex items-center gap-1">
    <span role="img" aria-label="Lock">🔒</span> Secure payment
  </span>
  <span className="text-white/30" aria-hidden="true">·</span>
  <span className="flex items-center gap-1">
    <span role="img" aria-label="Truck">🚚</span> Insured shipping
  </span>
  <span className="text-white/30" aria-hidden="true">·</span>
  <span className="flex items-center gap-1">
    <span role="img" aria-label="Star">⭐</span> 4.9/5 from 1,200+ collectors
  </span>
</div>
```

**Location 4: Desktop Sticky Sidebar**
*Timing:* Fades in after scrolling past first fold (intersection observer)
*Purpose:* Always-visible guarantee reinforcement

```tsx
<div
  className="hidden lg:block mt-4 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 p-4 text-center transition-opacity duration-500"
  style={{ opacity: isScrolled ? 1 : 0 }}
>
  <p className="text-xs uppercase tracking-[0.32em] text-purple-300/70 mb-1">
    Your Protection
  </p>
  <p className="text-sm font-semibold text-white">💳 30-Day Money-Back</p>
  <p className="text-xs text-white/60 mt-1">Plus 100-day remake guarantee</p>
</div>
```

#### Mobile Adaptations

**Condensed Trust Strip (Mobile Only):**
```tsx
{/* Show only essentials on mobile */}
<div className="lg:hidden rounded-2xl border border-white/10 bg-white/5 p-3">
  <details className="text-xs text-white/70">
    <summary className="flex items-center justify-between cursor-pointer">
      <span className="font-semibold">🛡️ 100% Protected</span>
      <span className="text-white/40">Details</span>
    </summary>
    <div className="mt-2 space-y-1 text-white/60">
      <p>✓ 30-day money-back guarantee</p>
      <p>✓ 100-day remake guarantee</p>
      <p>✓ Secure payment via Stripe</p>
      <p>✓ Insured shipping included</p>
    </div>
  </details>
</div>
```

#### Animation: Scroll-Into-View Reveal

```tsx
// Use Intersection Observer for trust signal icons
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-[scaleIn_300ms_ease-out]');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const icons = document.querySelectorAll('[data-trust-icon]');
  icons.forEach((icon) => observer.observe(icon));

  return () => observer.disconnect();
}, []);
```

---

### Feature 3: Enhanced Step Indicator

#### Visual Enhancements

**Updated Step Labels:**
```typescript
export const MODAL_CHECKOUT_STEPS = [
  { id: 'canvas', label: 'Your Masterpiece', description: 'Setup' },
  { id: 'contact', label: 'Delivery Details', description: 'Who' },
  { id: 'shipping', label: 'Delivery Details', description: 'Where' },
  { id: 'payment', label: 'Make It Official', description: 'Secure' },
];
```

**Time Estimate Header (Desktop Only):**
```tsx
{/* Only show on lg+ screens */}
<div className="hidden lg:flex items-center justify-between text-xs text-white/50 px-1 mb-2">
  <span>Your progress</span>
  <span className="flex items-center gap-1">
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {timeMessage}
  </span>
</div>
```

**Time Message Logic:**
```typescript
function getTimeMessage(elapsedSeconds: number): string {
  if (elapsedSeconds < 120) {
    return "~2 min remaining";
  } else if (elapsedSeconds < 180) {
    return "~1 min remaining";
  } else {
    return "Take your time—no rush";
  }
}
```

**Progress Bar with Spring Easing:**
```tsx
<div
  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-300 transition-[width] duration-700"
  style={{
    width: `${progress}%`,
    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring easing
  }}
/>
```

**Glowing Gradient "Travels" with Fill:**
```tsx
{/* Add pseudo-element glow that follows the bar */}
<div
  className="pointer-events-none absolute bottom-0 h-[2px] w-12 blur-sm bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-80 transition-[left] duration-700"
  style={{
    left: `calc(${progress}% - 24px)`,
    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }}
/>
```

**Step Button States:**

*Active State:*
```tsx
className={clsx(
  // Base
  'relative flex min-w-[130px] flex-col rounded-2xl border px-3 py-2 transition-all duration-300',
  // Active
  isActive && [
    'border-purple-400/60 bg-purple-500/15 text-white shadow-[0_0_25px_rgba(139,92,246,0.45)]',
    'scale-[1.02]',
    // Very subtle pulse (barely noticeable)
    'animate-[pulse_3s_ease-in-out_infinite]',
  ],
)}
```

*Completed State with Checkmark:*
```tsx
{isComplete && (
  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-slate-900 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-[scaleIn_300ms_ease-out]">
    ✓
  </span>
)}
```

**Checkmark Animation:**
```css
@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

**Pulse Animation (Subtle):**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.92;
  }
}
```

---

### Feature 4: Dynamic Social Proof Integration

#### Component Architecture

**New Component:** `src/components/studio/ContextualTestimonial.tsx`

**Props Interface:**
```typescript
interface ContextualTestimonialProps {
  selectedSize?: CanvasSize;
  hasFrame: boolean;
  currentStyleId?: string;
  className?: string;
}
```

**Testimonial Data Structure:**
```typescript
interface Testimonial {
  id: string;
  quote: string;
  author: string; // "Sarah M."
  location?: string; // "Austin, TX" (optional)
  avatar?: string; // URL or null
  verified: boolean; // Show verified badge
  context: 'size' | 'frame' | 'style' | 'general';
  relatedSize?: CanvasSize;
  hasFrame?: boolean;
  styleId?: string;
}
```

**MVP Testimonials (Static):**
```typescript
const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: 'Perfect size for above our sofa. Museum-ready quality.',
    author: 'Sarah M.',
    location: 'Austin, TX',
    verified: true,
    context: 'size',
    relatedSize: '24x24',
  },
  {
    id: '2',
    quote: 'The floating frame makes it feel like a $2,000 gallery piece.',
    author: 'James K.',
    location: 'Seattle, WA',
    verified: true,
    context: 'frame',
    hasFrame: true,
  },
  {
    id: '3',
    quote: 'Instant conversation starter. Everyone asks where I got it.',
    author: 'Avery M.',
    verified: true,
    context: 'general',
  },
  {
    id: '4',
    quote: 'The colors are even richer in person. Totally worth it.',
    author: 'Jordan T.',
    location: 'Brooklyn, NY',
    verified: true,
    context: 'general',
  },
];
```

#### Visual Design

**Layout:**
```
┌─────────────────────────────────────────┐
│  [SM] "Perfect size for above our      │
│       sofa. Museum-ready quality."      │
│       — Sarah M. · Austin, TX           │
│       [✓ Verified collector]            │
│                                          │
│       ● ○ ○ ○  ← Dot indicators         │
└─────────────────────────────────────────┘
```

**Avatar Treatment (No Photo):**
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/30 text-sm font-semibold text-white">
  {author.charAt(0)}
</div>
```

**Verified Badge:**
```tsx
<span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80">
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Verified collector
</span>
```

**Full Component JSX:**
```tsx
<div className={clsx('relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4', className)}>
  {/* Testimonial content */}
  <div
    key={currentTestimonial.id}
    className="animate-[fadeIn_400ms_ease-in-out]"
  >
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/30 text-sm font-semibold text-white">
        {currentTestimonial.author.charAt(0)}
      </div>

      {/* Quote & Attribution */}
      <div className="flex-1 space-y-1.5">
        <p className="text-sm leading-relaxed text-white/85">
          "{currentTestimonial.quote}"
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/50">
            — {currentTestimonial.author}
            {currentTestimonial.location && ` · ${currentTestimonial.location}`}
          </span>
          {currentTestimonial.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Dot indicators (if multiple testimonials) */}
  {relevantTestimonials.length > 1 && (
    <div className="mt-3 flex items-center justify-center gap-1.5">
      {relevantTestimonials.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={clsx(
            'h-1.5 rounded-full transition-all duration-300',
            index === currentIndex
              ? 'w-6 bg-purple-400'
              : 'w-1.5 bg-white/30 hover:bg-white/50'
          )}
          aria-label={`View testimonial ${index + 1}`}
        />
      ))}
    </div>
  )}
</div>
```

#### Rotation Behavior

```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [isPaused, setIsPaused] = useState(false);

// Auto-rotate every 5 seconds
useEffect(() => {
  if (relevantTestimonials.length <= 1 || isPaused) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % relevantTestimonials.length);
  }, 5000);

  return () => clearInterval(interval);
}, [relevantTestimonials.length, isPaused]);

// Pause on hover
const handleMouseEnter = () => setIsPaused(true);
const handleMouseLeave = () => setIsPaused(false);
```

#### Context Filtering Logic

```typescript
function getRelevantTestimonials(
  selectedSize?: CanvasSize,
  hasFrame?: boolean,
  styleId?: string
): Testimonial[] {
  return TESTIMONIALS.filter((t) => {
    // Size-specific
    if (t.context === 'size' && t.relatedSize === selectedSize) return true;

    // Frame-specific (only show if frame is enabled)
    if (t.context === 'frame' && t.hasFrame === hasFrame && hasFrame) return true;

    // Style-specific
    if (t.context === 'style' && t.styleId === styleId) return true;

    // General always matches
    if (t.context === 'general') return true;

    return false;
  });
}
```

#### Placement

**Desktop (Left Sidebar):**
After "Preview updates as you adjust..." text (line ~451 in CanvasCheckoutModal.tsx):

```tsx
<div className="space-y-3">
  <div className="relative">
    <Suspense fallback={<div className="h-64 rounded-3xl bg-white/5" />}>
      <CanvasInRoomPreview enableHoverEffect showDimensions={false} />
    </Suspense>
    {/* ... existing overlay states ... */}
  </div>
  <p className="text-xs text-white/60">
    Preview updates as you adjust materials and finishes.
  </p>

  {/* NEW: Contextual Testimonial */}
  <ContextualTestimonial
    selectedSize={selectedCanvasSize}
    hasFrame={floatingFrame?.enabled ?? false}
    currentStyleId={currentStyle?.id}
  />
</div>
```

**Mobile:**
After canvas size selection, before Order Summary (show only after user has made selections):

```tsx
{selectedCanvasSize && (
  <div className="lg:hidden mt-6">
    <ContextualTestimonial
      selectedSize={selectedCanvasSize}
      hasFrame={floatingFrame?.enabled ?? false}
      currentStyleId={currentStyle?.id}
    />
  </div>
)}
```

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── studio/
│   │   ├── CanvasCheckoutModal.tsx          (main modal, updated)
│   │   ├── CanvasCheckoutStepIndicator.tsx  (updated)
│   │   ├── ContextualTestimonial.tsx        (NEW)
│   │   └── CanvasSizeCard.tsx               (NEW - extracted component)
│   └── checkout/
│       ├── ContactForm.tsx                   (CTA copy update)
│       ├── ShippingForm.tsx                  (CTA copy update)
│       └── PaymentStep.tsx                   (CTA copy update)
├── utils/
│   ├── canvasSizes.ts                        (updated with context copy)
│   ├── canvasRecommendations.ts             (NEW)
│   └── testimonials.ts                       (NEW)
└── hooks/
    └── useScrollVisibility.ts                (NEW - for sticky badge)
```

### New Components

#### CanvasSizeCard.tsx
Extracted from CanvasCheckoutModal for better reusability and testing.

```typescript
interface CanvasSizeCardProps {
  option: CanvasSizeOption;
  isSelected: boolean;
  isRecommended: boolean;
  isMostPopular: boolean;
  contextCopy: string;
  onSelect: () => void;
  showSocialProof?: boolean;
}

export const CanvasSizeCard: React.FC<CanvasSizeCardProps> = ({
  option,
  isSelected,
  isRecommended,
  isMostPopular,
  contextCopy,
  onSelect,
  showSocialProof = false,
}) => {
  const badgeText = getBadgeText(isRecommended, isMostPopular);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'relative rounded-2xl border px-4 py-4 text-left transition-all duration-200',
        isSelected
          ? 'border-purple-400 bg-purple-500/15 text-white shadow-glow-purple'
          : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10',
        isRecommended && !isSelected && [
          'border-purple-400/70 bg-purple-500/5',
          'shadow-[0_4px_24px_rgba(168,85,247,0.25)]',
          'hover:scale-[1.015]',
        ],
        !isRecommended && 'hover:scale-[1.01]'
      )}
    >
      {badgeText && (
        <span className={clsx(
          'absolute -top-2 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white',
          isRecommended
            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]'
            : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
        )}>
          {isRecommended && '✨ '}{badgeText}
        </span>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{option.label}</p>
          {option.nickname && (
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">
              {option.nickname}
            </p>
          )}
          <p className="mt-1 text-[11px] text-white/60 leading-snug">
            {contextCopy}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-white/80">
            {currency.format(option.price)}
          </span>
          <p className="text-[10px] uppercase tracking-wider text-purple-300/60 mt-0.5">
            Museum-Grade
          </p>
        </div>
      </div>

      {showSocialProof && (
        <p className="mt-2 text-[10px] text-white/45 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Collector Favorite
        </p>
      )}
    </button>
  );
};
```

#### useScrollVisibility.ts
Hook for sticky guarantee badge fade-in.

```typescript
import { useEffect, useState, RefObject } from 'react';

export function useScrollVisibility(
  triggerRef: RefObject<HTMLElement>,
  threshold = 0
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [triggerRef, threshold]);

  return isVisible;
}
```

---

## Animation Specifications

### Performance Budget
- **Target:** 60fps for all animations
- **Tools:** `will-change` on animated elements, GPU-accelerated properties (transform, opacity)
- **Constraint:** Max 5 simultaneous animations

### Animation Timing Functions

```typescript
export const EASING = {
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',      // Spring bounce
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',         // Smooth deceleration
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Standard
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',   // Gentle
};

export const DURATION = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 700,
};
```

### Key Animations

**1. Canvas Size Selection:**
```typescript
// Scale + shimmer
const handleSizeSelect = (sizeId: CanvasSize) => {
  setSelectedCanvasSize(sizeId);

  // Card animation handled by CSS transition
  // Preview animation:
  if (floatingFrame?.enabled) {
    triggerFrameShimmer(); // 300ms gradient sweep
  }

  // Mobile drawer (first time only)
  if (isMobile && !hasExpandedOnce) {
    setMobilePreviewExpanded(true);
    setHasExpandedOnce(true);
  }
};
```

**Frame Shimmer Effect:**
```css
@keyframes frame-shimmer {
  0% {
    filter: brightness(1) drop-shadow(0 0 0px rgba(168,85,247,0));
  }
  50% {
    filter: brightness(1.15) drop-shadow(0 0 15px rgba(168,85,247,0.6));
  }
  100% {
    filter: brightness(1) drop-shadow(0 0 0px rgba(168,85,247,0));
  }
}

.frame-shimmer {
  animation: frame-shimmer 300ms ease-out;
}
```

**2. Step Transition (between canvas/contact/shipping/payment):**
```typescript
// Exit current step (180ms)
element.classList.add('animate-[fadeOut_180ms_ease-out]');

await new Promise(resolve => setTimeout(resolve, 180));

// Enter next step (240ms)
newElement.classList.add('animate-[slideFade_240ms_ease-out]');
```

**3. Mobile Drawer Auto-Expand:**
```css
.mobile-drawer {
  transition: max-height 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 300ms ease-out;
}

/* Pulse hint (once) */
@keyframes drawer-pulse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.drawer-pulse-hint {
  animation: drawer-pulse 600ms ease-in-out 2;
}
```

### Reduced Motion Support

```typescript
// Wrap all non-essential animations
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Apply decorative animations (shimmer, pulse, confetti)
} else {
  // Use instant transitions or simplified versions
}
```

All CSS animations:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Copy Matrix

### CTA Button Text

| Step | Button Text | Context |
|------|-------------|---------|
| Canvas | `Begin Production →` | Aspirational, exciting |
| Contact | `Delivery Details →` | Clear next action |
| Shipping | `Make It Official →` | Commitment, final step |
| Payment | `Complete Order` | Standard, from Stripe flow |

### Trust Signal Copy

| Location | Copy | Icon |
|----------|------|------|
| Near canvas size | `100-day satisfaction guarantee — Love it or we'll remake it, free of charge` | 🛡️ |
| Near frame section | `Hand-stretched by artisans · Museum-grade canvas · UV-resistant inks` | 🎨 |
| Above CTA | `Secure payment · Insured shipping · 4.9/5 from 1,200+ collectors` | 🔒 🚚 ⭐ |
| Sticky sidebar | `30-Day Money-Back · Plus 100-day remake guarantee` | 💳 |

### Badge Text

| Badge | Context | Priority |
|-------|---------|----------|
| `✨ Best Match` | Recommended size based on image resolution + orientation | 1 (highest) |
| `Collector Favorite` | Most popular size (when not recommended) | 2 |
| `Popular Choice` | Fallback when no recommendation available | 3 |

### Size Context Copy

See [Feature 1 > Context Copy Matrix](#context-copy-matrix)

---

## Analytics Events

### New Events to Implement

```typescript
// Feature 1: Recommendations
trackCheckoutRecommendationShown(sizeId: CanvasSize, orientation: Orientation, isRecommended: boolean)
trackCheckoutRecommendationClicked(sizeId: CanvasSize, wasRecommended: boolean)

// Feature 2: Trust Signals
trackTrustSignalView(context: 'canvas_size' | 'frame' | 'cta' | 'sidebar', signalType: string)

// Feature 3: Step Indicator
trackCheckoutStepAdvance(fromStep: CheckoutStep, toStep: CheckoutStep, timeTakenMs: number)
trackCheckoutStepBack(fromStep: CheckoutStep, toStep: CheckoutStep)

// Feature 4: Social Proof
trackTestimonialView(testimonialId: string, context: string)
trackTestimonialRotate(fromId: string, toId: string, automatic: boolean)
trackTestimonialClick(testimonialId: string, action: 'dot' | 'pause')

// General
trackSizeDecisionTiming(sizeId: CanvasSize, decisionTimeMs: number)
trackFlowCompletion(totalTimeMs: number, stepsCompleted: number)
```

### Event Payloads

**Example: trackCheckoutRecommendationShown**
```typescript
{
  event: 'checkout_recommendation_shown',
  properties: {
    size_id: '24x24',
    orientation: 'square',
    is_recommended: true,
    timestamp: Date.now(),
    user_tier: 'free' | 'pro',
    session_id: string,
  }
}
```

### Integration with Existing Telemetry

Add to `src/utils/telemetry.ts`:
```typescript
export function trackCheckoutRecommendationShown(
  sizeId: CanvasSize,
  orientation: Orientation,
  isRecommended: boolean
) {
  if (!window.analytics) return;

  window.analytics.track('checkout_recommendation_shown', {
    size_id: sizeId,
    orientation,
    is_recommended: isRecommended,
    user_tier: getCurrentUserTier(),
    timestamp: Date.now(),
  });
}
```

---

## Testing Strategy

### A/B Test Configuration

**Feature Flags (via `src/config/featureFlags.ts`):**

```typescript
export const CHECKOUT_OPTIMIZATION_FLAGS = {
  // Feature 1: Intelligent Recommendations
  SHOW_SIZE_RECOMMENDATIONS: {
    enabled: import.meta.env.VITE_SHOW_SIZE_RECOMMENDATIONS === 'true',
    rollout: 50, // 50% of users
  },

  // Feature 2: Trust Signal Placement (always on, no flag)

  // Feature 3: Enhanced Step Indicator (always on, no flag)

  // Feature 4: Dynamic Testimonials
  SHOW_CONTEXTUAL_TESTIMONIALS: {
    enabled: import.meta.env.VITE_SHOW_CONTEXTUAL_TESTIMONIALS === 'true',
    rollout: 50,
  },

  // CTA Copy Variants
  USE_NEW_CTA_COPY: {
    enabled: import.meta.env.VITE_USE_NEW_CTA_COPY === 'true',
    rollout: 50,
  },
};
```

**Variant Assignment:**
```typescript
// Deterministic user bucketing based on user ID or session
function getUserVariant(flagKey: string, rollout: number): boolean {
  const userId = getUserId() || getSessionId();
  const hash = simpleHash(userId + flagKey);
  return (hash % 100) < rollout;
}
```

### Test Scenarios

**1. Recommendation Accuracy**
- [ ] Vertical 2000x3000px image → Recommends 16"×16"
- [ ] Square 4000x4000px image → Recommends 24"×24" or 32"×32"
- [ ] Horizontal 6000x4000px image → Recommends 24"×24"
- [ ] Low-res 800x600px image → Recommends smallest size
- [ ] If no image data, shows "Popular Choice" on 24"×24"

**2. Badge Priority**
- [ ] If size is both recommended AND popular → Shows "Best Match"
- [ ] If size is popular but not recommended → Shows "Collector Favorite"
- [ ] If size is neither → No badge

**3. Trust Signal Visibility**
- [ ] Canvas size guarantee appears on modal open
- [ ] Frame artisan note appears when frame section visible
- [ ] CTA trust strip always visible in sticky footer
- [ ] Desktop sidebar guarantee fades in after scrolling past first fold

**4. Step Indicator Behavior**
- [ ] Active step shows subtle pulse animation
- [ ] Completed step shows green checkmark with bounce animation
- [ ] Progress bar moves with spring easing
- [ ] Time estimate shows "~2 min" initially, updates after 2 min
- [ ] Clicking completed step navigates back

**5. Testimonial Rotation**
- [ ] Shows size-specific testimonial when 24"×24" selected
- [ ] Shows frame-specific testimonial when frame enabled
- [ ] Shows general testimonial if no context match
- [ ] Auto-rotates every 5 seconds
- [ ] Pauses rotation on hover
- [ ] Manual dot navigation works
- [ ] Hides component if no testimonials available

**6. Mobile Behavior**
- [ ] Time estimate hidden on mobile
- [ ] Trust signals condensed into collapsible details
- [ ] Testimonial appears after size selection
- [ ] Drawer auto-expands on first selection only
- [ ] Drawer shows pulse hint once

**7. Animation Performance**
- [ ] All animations run at 60fps (use Chrome DevTools Performance tab)
- [ ] No jank during size selection + preview update
- [ ] Step transition smooth even on lower-end devices
- [ ] Respects `prefers-reduced-motion` setting

### Browser/Device Matrix

**Desktop:**
- [ ] Chrome 90+ (Windows, macOS)
- [ ] Safari 14+ (macOS)
- [ ] Firefox 88+ (Windows, macOS)
- [ ] Edge 90+ (Windows)

**Mobile:**
- [ ] iOS Safari 14+
- [ ] Chrome Android 90+
- [ ] Samsung Internet 14+

**Viewport Sizes:**
- [ ] 1920×1080 (desktop)
- [ ] 1440×900 (laptop)
- [ ] 768×1024 (tablet portrait)
- [ ] 390×844 (iPhone 12 Pro)
- [ ] 360×800 (Android)

---

## Implementation Sequence

### Phase 1: Foundation (Day 1-2)

**Day 1 Morning:**
1. Create new utility files:
   - `src/utils/canvasRecommendations.ts`
   - `src/utils/testimonials.ts`
2. Create new hook:
   - `src/hooks/useScrollVisibility.ts`
3. Update `src/utils/canvasSizes.ts` with context copy constants

**Day 1 Afternoon:**
4. Extract `CanvasSizeCard.tsx` component from CanvasCheckoutModal
5. Implement recommendation logic + badges in CanvasSizeCard
6. Add animation keyframes to `src/index.css`

**Day 2 Morning:**
7. Update `CanvasCheckoutStepIndicator.tsx`:
   - New step labels
   - Spring easing on progress bar
   - Checkmark animations
   - Time estimate header (desktop only)

**Day 2 Afternoon:**
8. Update CTA copy in ContactForm, ShippingForm, PaymentStep
9. Implement contextual trust signal placement in CanvasCheckoutModal

---

### Phase 2: Social Proof (Day 3)

**Day 3 Morning:**
10. Create `ContextualTestimonial.tsx` component
11. Add testimonial data to `testimonials.ts`
12. Implement rotation logic + pause-on-hover

**Day 3 Afternoon:**
13. Integrate ContextualTestimonial into CanvasCheckoutModal (desktop + mobile)
14. Add fade-in animations
15. Test context filtering logic

---

### Phase 3: Polish & Testing (Day 4-5)

**Day 4:**
16. Add analytics events to `telemetry.ts`
17. Implement feature flags in `featureFlags.ts`
18. Add scroll-into-view animations for trust signal icons
19. Implement mobile drawer auto-expand on first selection
20. Frame shimmer effect on selection

**Day 5:**
21. Cross-browser testing
22. Mobile responsive testing
23. Animation performance profiling
24. Accessibility audit (WCAG 2.1 AA)
25. Final polish + bug fixes

---

### Phase 4: Launch & Monitor (Day 6-7)

**Day 6:**
26. Deploy to staging
27. QA review
28. Stakeholder review
29. Fix any issues

**Day 7:**
30. Enable flags for 10% rollout
31. Monitor analytics dashboard
32. Check for errors in Sentry/logging
33. Gather initial feedback
34. Scale to 50% if metrics positive

---

## Rollout Strategy

### Week 1: Staged Rollout
- **Monday:** Deploy to production, flags disabled
- **Tuesday:** Enable for internal team (5%)
- **Wednesday:** Scale to 25% of users
- **Thursday:** Review metrics, scale to 50% if positive
- **Friday:** Scale to 100% if no issues

### Success Criteria (Week 1)
- Canvas → Contact conversion rate: +5% minimum (target: +10%)
- Frame attachment rate: +3% minimum (target: +5%)
- Exit rate: -5% minimum (target: -10%)
- No increase in page load time (stay <2s)
- No increase in error rate

### Monitoring Dashboard

**Key Metrics:**
1. **Conversion Funnel:**
   - Canvas step views
   - Size selections
   - Frame additions
   - Contact step entries
   - Payment completions

2. **Engagement:**
   - Recommended size selection rate
   - Trust signal clicks (if interactive)
   - Testimonial interactions
   - Time to size decision

3. **Technical:**
   - Page load time (p50, p95)
   - Animation frame rate
   - Error rate
   - Bundle size

**Alerts:**
- Exit rate spike >10% above baseline
- Conversion rate drop >5% below baseline
- Error rate >1%
- Page load time >3s (p95)

---

## Appendix

### Accessibility Checklist

- [ ] All badges have proper ARIA labels
- [ ] Testimonial rotation has pause/play control (via hover)
- [ ] Step indicator keyboard navigable (Tab, Enter)
- [ ] Trust signals have semantic HTML (not just styled divs)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Icons have `aria-label` or `aria-hidden="true"`
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces step changes
- [ ] Reduced motion preferences respected

### Content Governance

**Testimonial Guidelines:**
- Must be from real, verified customers
- Include full consent for usage
- No personally identifiable information beyond first name + initial
- Review every 6 months for freshness

**Copy Updates:**
- All copy changes require PM approval
- A/B test new variants before full rollout
- Maintain brand voice guidelines

**Social Proof Numbers:**
- Update monthly from backend analytics
- If backend unavailable, use static conservative estimates
- Never inflate numbers for marketing

---

## Questions & Decisions Log

| Date | Question | Decision | Rationale |
|------|----------|----------|-----------|
| 2025-11-11 | Show count animation on selection? | Yes, gentle +3-5 tick | Adds delight without being distracting |
| 2025-11-11 | Testimonial avatars required? | No, gradient placeholders MVP | Reduces bundle size, async load later |
| 2025-11-11 | Time countdown live or static? | Static "~2 min" | Reduces anxiety, less distracting |
| 2025-11-11 | Badge shimmer always or once? | Once on reveal | Avoids distraction, premium feel |

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Next Review:** After Phase 1 completion

