# Canvas Checkout Conversion – Microphased Implementation Plan
## Based on Corrected Integration Points

**Last Updated:** 2025-11-11
**Status:** Ready for Implementation
**Target:** World-class, testable, incremental delivery

---

## Integration Corrections Applied

### 1. Canvas Size Type System (CORRECTED)
- **Actual Type:** `CanvasSizeKey` (from `src/utils/canvasSizes.ts`)
- **Format:** `'portrait-18x24' | 'landscape-24x18' | 'square-24x24'` etc.
- **NOT:** Generic `'24x24'` strings
- **Impact:** All recommendation logic, context copy, and testimonials MUST use `CanvasSizeKey`

### 2. Image Resolution Source (CLARIFIED)
- **Available:** `smartCrops[orientation].imageDimensions.{width, height}`
- **Fallback:** Decode `uploadedImage` base64 if smart crop not available
- **Constraint:** Resolution-based recommendations are **best-effort**; always have orientation-based fallback

### 3. Badge Overflow Protection (ADDRESSED)
- **Issue:** Absolute positioned pill can clip
- **Solution:** Parent card has `overflow: visible`, pill renders outside with negative margin
- **Shadow:** Use `filter: drop-shadow()` instead of `box-shadow` for clipped elements

### 4. Social Proof Animation Gating (ADDRESSED)
- **Issue:** Count tick-up should be controllable
- **Solution:** `enableCountAnimation?: boolean` prop, default `false` for MVP
- **Future:** Enable when backend provides real counts

### 5. Desktop Sticky Guarantee (ADJUSTED)
- **Constraint:** Compact, non-competing with left rail header
- **Implementation:** Max-width 280px, IO threshold 0.65, opacity transition only

### 6. Time Estimate (SIMPLIFIED)
- **No countdown:** Static message based on elapsed time brackets
- **Display:** Desktop only (`hidden lg:flex`)
- **Logic:** `< 2min: "~2 min remaining"`, `> 3min: "Take your time—no rush"`

### 7. Animation Constraints (ENFORCED)
- **All new animations:** Wrapped in `@media (prefers-reduced-motion: no-preference)`
- **`will-change`:** Only on elements actively transforming (scale, translate)
- **Duration:** ≤300ms for UI interactions, ≤400ms for celebratory moments

---

## Microphased Implementation Roadmap

Each phase is **independently testable** and **shippable**. Phases are small enough to complete in 1-3 hours.

---

### **PHASE 0: Foundation Setup** ⏱️ 30 min

**Goal:** Create pure utility functions with correct types, no UI changes yet.

#### Phase 0.1: Type-Safe Utilities (15 min)
**File:** `src/utils/canvasRecommendations.ts` (NEW)

```typescript
import type { CanvasSizeKey, CanvasOrientation } from '@/utils/canvasSizes';

/**
 * Recommendation hints (pure, store-independent)
 */
export interface RecommendationHint {
  recommendedSize: CanvasSizeKey | null;
  mostPopularSize: CanvasSizeKey;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Get recommended size based on image dimensions + orientation
 */
export function getRecommendedSize(
  orientation: CanvasOrientation,
  imageWidth?: number,
  imageHeight?: number
): CanvasSizeKey | null {
  if (!imageWidth || !imageHeight) return null;

  const pixelCount = imageWidth * imageHeight;
  const megapixels = pixelCount / 1_000_000;

  // High-res images (>4MP) → larger canvases
  if (megapixels > 4) {
    switch (orientation) {
      case 'vertical':
        return 'portrait-24x36'; // Medium
      case 'horizontal':
        return 'landscape-36x24'; // Medium
      case 'square':
        return 'square-32x32'; // Large
    }
  }

  // Medium-res (2-4MP) → mid-tier canvases
  if (megapixels > 2) {
    switch (orientation) {
      case 'vertical':
        return 'portrait-18x24'; // Small
      case 'horizontal':
        return 'landscape-24x18'; // Small
      case 'square':
        return 'square-24x24'; // Medium
    }
  }

  // Lower-res (<2MP) → smaller canvases
  switch (orientation) {
    case 'vertical':
      return 'portrait-12x16'; // Extra Small
    case 'horizontal':
      return 'landscape-16x12'; // Extra Small
    case 'square':
      return 'square-16x16'; // Small
  }
}

/**
 * Fallback: most popular size by orientation (when no resolution data)
 */
export function getMostPopularSize(orientation: CanvasOrientation): CanvasSizeKey {
  switch (orientation) {
    case 'vertical':
      return 'portrait-18x24'; // Small (price: $199)
    case 'horizontal':
      return 'landscape-24x18'; // Small (price: $199)
    case 'square':
      return 'square-24x24'; // Medium (price: $219)
  }
}

/**
 * Main recommendation function
 */
export function getCanvasRecommendation(
  orientation: CanvasOrientation,
  imageWidth?: number,
  imageHeight?: number
): RecommendationHint {
  const recommended = getRecommendedSize(orientation, imageWidth, imageHeight);
  const mostPopular = getMostPopularSize(orientation);

  return {
    recommendedSize: recommended,
    mostPopularSize,
    confidence: recommended ? (imageWidth && imageHeight ? 'high' : 'low') : 'low',
  };
}
```

**Test:** Run in Node REPL:
```bash
npm run dev
# In browser console:
import { getCanvasRecommendation } from '@/utils/canvasRecommendations';
getCanvasRecommendation('square', 4000, 4000); // Should return { recommendedSize: 'square-32x32', ... }
```

#### Phase 0.2: Context Copy Constants (15 min)
**File:** `src/utils/canvasSizes.ts` (UPDATE)

Add to existing file:
```typescript
/**
 * Context copy for each size × orientation
 */
export const CANVAS_SIZE_CONTEXT_COPY: Record<CanvasSizeKey, string> = {
  // Portrait
  'portrait-12x16': 'Perfect for gallery walls',
  'portrait-18x24': 'Beautiful above a console',
  'portrait-24x36': 'Statement piece for living rooms',
  'portrait-30x40': 'Grand vertical presence',
  'portrait-32x48': 'Dramatic focal point',
  'portrait-40x60': 'Gallery-scale masterpiece',

  // Landscape
  'landscape-16x12': 'Great for entryway moments',
  'landscape-24x18': 'Ideal for above your desk',
  'landscape-36x24': 'Perfect above your sofa',
  'landscape-40x30': 'Living room focal wall',
  'landscape-48x32': 'Commanding great room feature',
  'landscape-60x40': 'Expansive horizontal showcase',

  // Square
  'square-16x16': 'Ideal for bedroom accents',
  'square-24x24': 'Perfect above your sofa',
  'square-32x32': 'Living room focal point',
  'square-36x36': 'Creates powerful presence',
};

/**
 * Get context copy for a canvas size
 */
export function getCanvasSizeContextCopy(sizeKey: CanvasSizeKey): string {
  return CANVAS_SIZE_CONTEXT_COPY[sizeKey] || '';
}
```

**Test:** Import and check:
```typescript
import { getCanvasSizeContextCopy } from '@/utils/canvasSizes';
console.log(getCanvasSizeContextCopy('square-24x24')); // "Perfect above your sofa"
```

---

### **PHASE 1: Canvas Size Card Enhancement** ⏱️ 2 hours

**Goal:** Add badges, context copy, and recommendation logic to size cards. Testable in isolation.

#### Phase 1.1: Extract CanvasSizeCard Component (30 min)
**File:** `src/components/studio/CanvasSizeCard.tsx` (NEW)

```typescript
import { clsx } from 'clsx';
import type { CanvasSizeOption, CanvasSizeKey } from '@/utils/canvasSizes';
import { getCanvasSizeContextCopy } from '@/utils/canvasSizes';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface CanvasSizeCardProps {
  option: CanvasSizeOption;
  isSelected: boolean;
  isRecommended: boolean;
  isMostPopular: boolean;
  onSelect: () => void;
  showSocialProof?: boolean;
  enableCountAnimation?: boolean;
}

export const CanvasSizeCard: React.FC<CanvasSizeCardProps> = ({
  option,
  isSelected,
  isRecommended,
  isMostPopular,
  onSelect,
  showSocialProof = false,
  enableCountAnimation = false,
}) => {
  const contextCopy = getCanvasSizeContextCopy(option.id);

  // Badge priority: Recommended > Most Popular
  const badgeText = isRecommended
    ? 'Best Match'
    : isMostPopular && !isRecommended
    ? 'Collector Favorite'
    : null;

  const badgeIsRecommended = isRecommended;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'relative rounded-2xl border px-4 py-4 text-left transition-all duration-200',
        // Base states
        isSelected
          ? 'border-purple-400 bg-purple-500/15 text-white shadow-glow-purple'
          : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10',
        // Recommended enhancement (when NOT selected)
        isRecommended && !isSelected && [
          'border-purple-400/70',
          'bg-purple-500/5',
          'shadow-[0_4px_24px_rgba(168,85,247,0.25)]',
        ],
        // Hover transforms
        isRecommended && !isSelected
          ? 'hover:scale-[1.015]'
          : !isSelected && 'hover:scale-[1.01]',
        // CRITICAL: Allow badge overflow
        'overflow-visible'
      )}
    >
      {/* Badge */}
      {badgeText && (
        <span
          className={clsx(
            'absolute -top-2 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg',
            badgeIsRecommended
              ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
              : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900'
          )}
          style={{
            // Use filter drop-shadow for proper shadow outside parent
            filter: badgeIsRecommended
              ? 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))'
              : 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.6))',
          }}
        >
          {badgeIsRecommended && '✨ '}
          {badgeText}
        </span>
      )}

      {/* Card Content */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{option.label}</p>
          {option.nickname && (
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">
              {option.nickname}
            </p>
          )}
          {contextCopy && (
            <p className="text-[11px] text-white/60 leading-snug">{contextCopy}</p>
          )}
        </div>
        <div className="text-right space-y-0.5">
          <span className="block text-sm font-semibold text-white/80">
            {currency.format(option.price)}
          </span>
          <p className="text-[10px] uppercase tracking-wider text-purple-300/60">
            Museum-Grade
          </p>
        </div>
      </div>

      {/* Social Proof (MVP: static text) */}
      {showSocialProof && (
        <p className="mt-2 text-[10px] text-white/45 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
          Collector Favorite
        </p>
      )}
    </button>
  );
};

export default CanvasSizeCard;
```

**Test:** Render in Storybook or standalone test page with different props.

#### Phase 1.2: Integrate into CanvasCheckoutModal (45 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (UPDATE)

Replace existing canvas size button code (lines ~586-614) with:

```typescript
import CanvasSizeCard from '@/components/studio/CanvasSizeCard';
import { getCanvasRecommendation } from '@/utils/canvasRecommendations';

// Inside component, compute recommendation
const { smartCrops, orientation, uploadedImage } = useUploadState();
const currentCrop = smartCrops[orientation];

const recommendation = useMemo(() => {
  return getCanvasRecommendation(
    orientation,
    currentCrop?.imageDimensions?.width,
    currentCrop?.imageDimensions?.height
  );
}, [orientation, currentCrop?.imageDimensions]);

// In JSX (replace existing canvas size section):
<section className="space-y-4">
  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Canvas Size</p>
  <div className="grid gap-3 sm:grid-cols-2">
    {sizeOptions.map((option) => {
      const isRecommended = option.id === recommendation.recommendedSize;
      const isMostPopular = option.id === recommendation.mostPopularSize;

      return (
        <CanvasSizeCard
          key={option.id}
          option={option}
          isSelected={selectedCanvasSize === option.id}
          isRecommended={isRecommended}
          isMostPopular={isMostPopular}
          onSelect={() => setCanvasSize(option.id)}
          showSocialProof={false} // MVP: disabled
          enableCountAnimation={false} // MVP: disabled
        />
      );
    })}
  </div>
</section>
```

**Test:**
- [ ] Open checkout modal, verify badges appear
- [ ] Upload high-res image, check "Best Match" on correct size
- [ ] Upload low-res image, check badge changes
- [ ] Select a size, verify card styles update
- [ ] Verify badge shadow not clipped

#### Phase 1.3: Add Badge Shimmer Animation (15 min)
**File:** `src/index.css` (UPDATE)

Add keyframe:
```css
@keyframes badge-shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .badge-shimmer-once {
    background-size: 200% 100%;
    animation: badge-shimmer 1.5s ease-in-out 1;
  }
}
```

Update CanvasSizeCard badge:
```typescript
const [hasShimmered, setHasShimmered] = useState(false);

useEffect(() => {
  if (badgeText && !hasShimmered) {
    setHasShimmered(true);
  }
}, [badgeText, hasShimmered]);

// In badge className:
className={clsx(
  // ... existing classes
  !hasShimmered && 'badge-shimmer-once'
)}
```

**Test:**
- [ ] Open modal for first time, badge shimmers once
- [ ] Refresh, badge doesn't shimmer again (component remounts, so this behavior may vary)

#### Phase 1.4: Add Selection Analytics (15 min)
**File:** `src/utils/telemetry.ts` (UPDATE)

Add new events:
```typescript
export function trackCheckoutRecommendationShown(
  sizeId: CanvasSizeKey,
  orientation: Orientation,
  isRecommended: boolean,
  isMostPopular: boolean
) {
  if (!window.analytics) return;
  window.analytics.track('checkout_recommendation_shown', {
    size_id: sizeId,
    orientation,
    is_recommended: isRecommended,
    is_most_popular: isMostPopular,
    timestamp: Date.now(),
  });
}

export function trackCheckoutRecommendationSelected(
  sizeId: CanvasSizeKey,
  wasRecommended: boolean,
  wasMostPopular: boolean
) {
  if (!window.analytics) return;
  window.analytics.track('checkout_recommendation_selected', {
    size_id: sizeId,
    was_recommended: wasRecommended,
    was_most_popular: wasMostPopular,
    timestamp: Date.now(),
  });
}
```

Call in CanvasCheckoutModal:
```typescript
// On mount, track shown
useEffect(() => {
  if (canvasModalOpen && step === 'canvas') {
    sizeOptions.forEach((option) => {
      const isRecommended = option.id === recommendation.recommendedSize;
      const isMostPopular = option.id === recommendation.mostPopularSize;
      trackCheckoutRecommendationShown(option.id, orientation, isRecommended, isMostPopular);
    });
  }
}, [canvasModalOpen, step, sizeOptions, recommendation, orientation]);

// On selection
const handleSizeSelect = (sizeId: CanvasSizeKey) => {
  const wasRecommended = sizeId === recommendation.recommendedSize;
  const wasMostPopular = sizeId === recommendation.mostPopularSize;
  setCanvasSize(sizeId);
  trackCheckoutRecommendationSelected(sizeId, wasRecommended, wasMostPopular);
};
```

**Test:**
- [ ] Open console, verify events fire
- [ ] Select size, verify `recommendation_selected` event

---

### **PHASE 2: Contextual Trust Signals** ⏱️ 1.5 hours

**Goal:** Break apart trust signals, place contextually. Testable per placement.

#### Phase 2.1: Trust Signal Components (30 min)
**File:** `src/components/checkout/TrustSignals.tsx` (NEW)

```typescript
interface TrustSignalProps {
  context: 'canvas_quality' | 'artisan_craft' | 'cta_strip' | 'sticky_guarantee';
  className?: string;
}

export const TrustSignal: React.FC<TrustSignalProps> = ({ context, className }) => {
  switch (context) {
    case 'canvas_quality':
      return (
        <div
          className={clsx(
            'flex items-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm',
            className
          )}
        >
          <span className="text-lg" role="img" aria-label="Shield" data-trust-icon>
            🛡️
          </span>
          <p className="text-[13px] leading-snug text-emerald-100">
            <strong className="font-semibold">100-day satisfaction guarantee</strong> — Love it or
            we'll remake it, free of charge
          </p>
        </div>
      );

    case 'artisan_craft':
      return (
        <div
          className={clsx(
            'flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 text-xs text-white/70',
            className
          )}
        >
          <span className="text-base" role="img" aria-label="Artist palette" data-trust-icon>
            🎨
          </span>
          <p className="leading-relaxed">
            Hand-stretched by artisans · Museum-grade canvas · UV-resistant inks
          </p>
        </div>
      );

    case 'cta_strip':
      return (
        <div
          className={clsx(
            'flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/50',
            className
          )}
        >
          <span className="flex items-center gap-1">
            <span role="img" aria-label="Lock">
              🔒
            </span>{' '}
            Secure payment
          </span>
          <span className="text-white/30" aria-hidden="true">
            ·
          </span>
          <span className="flex items-center gap-1">
            <span role="img" aria-label="Truck">
              🚚
            </span>{' '}
            Insured shipping
          </span>
          <span className="text-white/30" aria-hidden="true">
            ·
          </span>
          <span className="flex items-center gap-1">
            <span role="img" aria-label="Star">
              ⭐
            </span>{' '}
            4.9/5 from 1,200+ collectors
          </span>
        </div>
      );

    case 'sticky_guarantee':
      return (
        <div
          className={clsx(
            'hidden lg:block rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 p-4 text-center transition-opacity duration-500',
            className
          )}
          style={{ maxWidth: '280px' }}
        >
          <p className="text-xs uppercase tracking-[0.32em] text-purple-300/70 mb-1">
            Your Protection
          </p>
          <p className="text-sm font-semibold text-white">💳 30-Day Money-Back</p>
          <p className="text-xs text-white/60 mt-1">Plus 100-day remake guarantee</p>
        </div>
      );

    default:
      return null;
  }
};

export default TrustSignal;
```

**Test:** Render each variant in isolation.

#### Phase 2.2: Place Trust Signals (30 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (UPDATE)

Insert trust signals:

```typescript
import TrustSignal from '@/components/checkout/TrustSignals';

// 1. After Canvas Size section (after line ~616):
<TrustSignal context="canvas_quality" className="mt-4" />

// 2. After Frame section (after line ~655):
<TrustSignal context="artisan_craft" className="mt-3" />

// 3. Above CTA in footer (inside <footer>, before button):
<footer className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-white/10 bg-slate-950/80 pt-4">
  <TrustSignal context="cta_strip" />
  <button type="button" onClick={handlePrimaryCta} {...}>
    Begin Production →
  </button>
</footer>
```

**Test:**
- [ ] Trust signals appear in correct locations
- [ ] Responsive on mobile (cta_strip wraps correctly)

#### Phase 2.3: Desktop Sticky Guarantee with IO (30 min)
**File:** `src/hooks/useScrollVisibility.ts` (NEW)

```typescript
import { useEffect, useState, RefObject } from 'react';

export function useScrollVisibility(
  triggerRef: RefObject<HTMLElement>,
  threshold = 0.65
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible when trigger is OUT of view
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

Update CanvasCheckoutModal:
```typescript
import { useScrollVisibility } from '@/hooks/useScrollVisibility';

// Inside component:
const headerRef = useRef<HTMLDivElement>(null);
const showStickyGuarantee = useScrollVisibility(headerRef, 0.65);

// In desktop preview column (after preview, ~line 451):
<div ref={headerRef}> {/* Wrap header for IO trigger */}
  <div className="flex items-center gap-3">
    {/* ... existing style thumbnail ... */}
  </div>
</div>

{/* Below preview */}
<TrustSignal
  context="sticky_guarantee"
  style={{ opacity: showStickyGuarantee ? 1 : 0 }}
  className="mt-4"
/>
```

**Test:**
- [ ] Desktop only, guarantee fades in when scrolling past header
- [ ] Smooth opacity transition (500ms)
- [ ] No flickering

#### Phase 2.4: Scroll-Into-View Icon Animations (30 min)
**File:** `src/components/checkout/TrustSignals.tsx` (UPDATE)

Add IO for icon reveal:
```typescript
import { useEffect, useRef } from 'react';

// Inside component:
const iconRef = useRef<HTMLSpanElement>(null);

useEffect(() => {
  const icon = iconRef.current;
  if (!icon) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        icon.classList.add('motion-safe:animate-[scaleIn_300ms_ease-out]');
        observer.unobserve(icon);
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(icon);
  return () => observer.disconnect();
}, []);

// Update icon span:
<span ref={iconRef} className="text-lg" role="img" aria-label="Shield" data-trust-icon>
  🛡️
</span>
```

**Test:**
- [ ] Icons scale-in when scrolled into view
- [ ] Animation only plays once
- [ ] Respects prefers-reduced-motion

---

### **PHASE 3: Enhanced Step Indicator** ⏱️ 1.5 hours

**Goal:** Upgrade step indicator with spring easing, checkmarks, time estimate.

#### Phase 3.1: Update Step Labels (10 min)
**File:** `src/components/studio/CanvasCheckoutStepIndicator.tsx` (UPDATE)

```typescript
export const MODAL_CHECKOUT_STEPS: Array<{
  id: CheckoutStep;
  label: string;
  description: string;
}> = [
  { id: 'canvas', label: 'Your Masterpiece', description: 'Setup' },
  { id: 'contact', label: 'Delivery Details', description: 'Who' },
  { id: 'shipping', label: 'Delivery Details', description: 'Where' },
  { id: 'payment', label: 'Make It Official', description: 'Secure' },
];
```

**Test:** Visual inspection in UI.

#### Phase 3.2: Add Spring Easing + Traveling Glow (30 min)
**File:** `src/components/studio/CanvasCheckoutStepIndicator.tsx` (UPDATE)

```typescript
<div
  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-300 transition-[width] duration-700"
  style={{
    width: `${progress}%`,
    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring
  }}
/>

{/* Traveling glow */}
<div
  className="pointer-events-none absolute bottom-0 h-[2px] w-12 blur-sm bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-80 transition-[left] duration-700"
  style={{
    left: `calc(${progress}% - 24px)`,
    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }}
/>
```

**Test:**
- [ ] Progress bar moves with spring bounce
- [ ] Glow follows the bar edge
- [ ] No layout shift

#### Phase 3.3: Add Checkmark Animations (30 min)
**File:** `src/index.css` (UPDATE)

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

Update step button:
```typescript
{isComplete && (
  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-slate-900 shadow-[0_0_15px_rgba(52,211,153,0.8)] motion-safe:animate-[scaleIn_300ms_ease-out]">
    ✓
  </span>
)}
```

**Test:**
- [ ] Checkmark appears with bounce
- [ ] Happens when advancing to next step
- [ ] Respects reduced motion

#### Phase 3.4: Add Time Estimate Header (30 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (UPDATE)

Add timer state:
```typescript
const [modalOpenedAt] = useState(Date.now());
const [elapsedSeconds, setElapsedSeconds] = useState(0);

useEffect(() => {
  if (!canvasModalOpen) return;

  const interval = setInterval(() => {
    setElapsedSeconds(Math.floor((Date.now() - modalOpenedAt) / 1000));
  }, 1000);

  return () => clearInterval(interval);
}, [canvasModalOpen, modalOpenedAt]);

const timeMessage = useMemo(() => {
  if (elapsedSeconds < 120) return '~2 min remaining';
  if (elapsedSeconds < 180) return '~1 min remaining';
  return 'Take your time—no rush';
}, [elapsedSeconds]);
```

Pass to step indicator:
```typescript
<CanvasCheckoutStepIndicator timeMessage={timeMessage} />
```

Update CanvasCheckoutStepIndicator:
```typescript
interface Props {
  timeMessage?: string;
}

const CanvasCheckoutStepIndicator: React.FC<Props> = ({ timeMessage }) => {
  // ... existing code

  return (
    <div className="space-y-2">
      {/* Time header (desktop only) */}
      {timeMessage && (
        <div className="hidden lg:flex items-center justify-between text-xs text-white/50 px-1">
          <span>Your progress</span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {timeMessage}
          </span>
        </div>
      )}

      {/* Existing step indicator */}
      <div className="relative ...">
        {/* ... */}
      </div>
    </div>
  );
};
```

**Test:**
- [ ] Time shows on desktop only
- [ ] Updates every second
- [ ] Switches messages at correct thresholds

---

### **PHASE 4: CTA Copy Updates** ⏱️ 30 min

**Goal:** Update button copy across all form steps.

#### Phase 4.1: CanvasCheckoutModal CTA (5 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (line ~692)

```typescript
<button type="button" onClick={handlePrimaryCta} disabled={canvasAdvanceDisabled} {...}>
  Begin Production →
</button>
```

#### Phase 4.2: ContactForm CTA (5 min)
**File:** `src/components/checkout/ContactForm.tsx`

Find submit button, update:
```typescript
Delivery Details →
```

#### Phase 4.3: ShippingForm CTA (5 min)
**File:** `src/components/checkout/ShippingForm.tsx`

Find submit button, keep as:
```typescript
Continue to Payment →
```

#### Phase 4.4: PaymentStep CTA (5 min)
**File:** `src/components/checkout/PaymentStep.tsx`

Find submit button, update:
```typescript
Make It Official →
```

**Test:**
- [ ] All CTAs have updated copy
- [ ] Flow feels cohesive

---

### **PHASE 5: Dynamic Social Proof (Testimonials)** ⏱️ 2 hours

**Goal:** Context-aware testimonials with rotation, pause-on-hover.

#### Phase 5.1: Testimonial Data Structure (20 min)
**File:** `src/utils/testimonials.ts` (NEW)

```typescript
import type { CanvasSizeKey } from '@/utils/canvasSizes';

export interface Testimonial {
  id: string;
  quote: string;
  author: string; // "Sarah M."
  location?: string; // "Austin, TX"
  avatar?: string; // URL or null
  verified: boolean;
  context: 'size' | 'frame' | 'style' | 'general';
  relatedSize?: CanvasSizeKey;
  hasFrame?: boolean;
  styleId?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'tm1',
    quote: 'Perfect size for above our sofa. Museum-ready quality.',
    author: 'Sarah M.',
    location: 'Austin, TX',
    verified: true,
    context: 'size',
    relatedSize: 'square-24x24',
  },
  {
    id: 'tm2',
    quote: 'Perfect size for above our sofa. Museum-ready quality.',
    author: 'Sarah M.',
    location: 'Austin, TX',
    verified: true,
    context: 'size',
    relatedSize: 'landscape-36x24',
  },
  {
    id: 'tm3',
    quote: 'The floating frame makes it feel like a $2,000 gallery piece.',
    author: 'James K.',
    location: 'Seattle, WA',
    verified: true,
    context: 'frame',
    hasFrame: true,
  },
  {
    id: 'tm4',
    quote: 'Instant conversation starter. Everyone asks where I got it.',
    author: 'Avery M.',
    verified: true,
    context: 'general',
  },
  {
    id: 'tm5',
    quote: 'The colors are even richer in person. Totally worth it.',
    author: 'Jordan T.',
    location: 'Brooklyn, NY',
    verified: true,
    context: 'general',
  },
];

/**
 * Filter testimonials by context
 */
export function getRelevantTestimonials(
  selectedSize?: CanvasSizeKey | null,
  hasFrame?: boolean,
  styleId?: string
): Testimonial[] {
  return TESTIMONIALS.filter((t) => {
    if (t.context === 'size' && t.relatedSize === selectedSize) return true;
    if (t.context === 'frame' && t.hasFrame === hasFrame && hasFrame) return true;
    if (t.context === 'style' && t.styleId === styleId) return true;
    if (t.context === 'general') return true;
    return false;
  });
}
```

#### Phase 5.2: ContextualTestimonial Component (60 min)
**File:** `src/components/studio/ContextualTestimonial.tsx` (NEW)

```typescript
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import type { CanvasSizeKey } from '@/utils/canvasSizes';
import { getRelevantTestimonials, type Testimonial } from '@/utils/testimonials';

interface Props {
  selectedSize?: CanvasSizeKey | null;
  hasFrame: boolean;
  currentStyleId?: string;
  className?: string;
}

const ContextualTestimonial: React.FC<Props> = ({
  selectedSize,
  hasFrame,
  currentStyleId,
  className,
}) => {
  const relevantTestimonials = getRelevantTestimonials(selectedSize, hasFrame, currentStyleId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Hide if no testimonials
  if (relevantTestimonials.length === 0) return null;

  const currentTestimonial = relevantTestimonials[currentIndex];

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (relevantTestimonials.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % relevantTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [relevantTestimonials.length, isPaused]);

  // Reset index when testimonials change
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSize, hasFrame, currentStyleId]);

  return (
    <div
      className={clsx('relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonial content */}
      <div
        key={currentTestimonial.id}
        className="motion-safe:animate-[fadeIn_400ms_ease-in-out]"
      >
        <div className="flex items-start gap-3">
          {/* Avatar: gradient placeholder */}
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

      {/* Dot indicators */}
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
  );
};

export default ContextualTestimonial;
```

#### Phase 5.3: Integrate Testimonials (30 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (UPDATE)

Import:
```typescript
import ContextualTestimonial from '@/components/studio/ContextualTestimonial';
```

**Desktop (Left Sidebar):**
After preview text (~line 451):
```typescript
<div className="space-y-3">
  {/* ... existing preview ... */}
  <p className="text-xs text-white/60">
    Preview updates as you adjust materials and finishes.
  </p>

  {/* NEW: Testimonial */}
  <ContextualTestimonial
    selectedSize={selectedCanvasSize}
    hasFrame={floatingFrame?.enabled ?? false}
    currentStyleId={currentStyle?.id}
  />
</div>
```

**Mobile:**
After size selection (conditionally render after line ~680):
```typescript
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

**Test:**
- [ ] Shows size-specific testimonial when 'square-24x24' selected
- [ ] Shows frame testimonial when frame enabled
- [ ] Shows general testimonial if no match
- [ ] Auto-rotates every 5 seconds
- [ ] Pauses on hover
- [ ] Dot navigation works
- [ ] Hides if no testimonials match

#### Phase 5.4: Analytics for Testimonials (10 min)
**File:** `src/utils/telemetry.ts` (UPDATE)

```typescript
export function trackTestimonialView(testimonialId: string, context: string) {
  if (!window.analytics) return;
  window.analytics.track('testimonial_view', {
    testimonial_id: testimonialId,
    context,
    timestamp: Date.now(),
  });
}

export function trackTestimonialRotate(fromId: string, toId: string, automatic: boolean) {
  if (!window.analytics) return;
  window.analytics.track('testimonial_rotate', {
    from_id: fromId,
    to_id: toId,
    automatic,
    timestamp: Date.now(),
  });
}
```

Add to ContextualTestimonial:
```typescript
// Track view on mount or change
useEffect(() => {
  if (currentTestimonial) {
    trackTestimonialView(currentTestimonial.id, currentTestimonial.context);
  }
}, [currentTestimonial]);

// Track rotation
useEffect(() => {
  const prev = relevantTestimonials[currentIndex - 1 < 0 ? relevantTestimonials.length - 1 : currentIndex - 1];
  if (prev && currentIndex > 0) {
    trackTestimonialRotate(prev.id, currentTestimonial.id, !isPaused);
  }
}, [currentIndex]);
```

---

### **PHASE 6: Polish & Performance** ⏱️ 1 hour

**Goal:** Animation refinements, mobile enhancements, performance audit.

#### Phase 6.1: Frame Shimmer on Selection (20 min)
**File:** `src/index.css` (UPDATE)

```css
@keyframes frame-shimmer {
  0% {
    filter: brightness(1) drop-shadow(0 0 0px rgba(168, 85, 247, 0));
  }
  50% {
    filter: brightness(1.15) drop-shadow(0 0 15px rgba(168, 85, 247, 0.6));
  }
  100% {
    filter: brightness(1) drop-shadow(0 0 0px rgba(168, 85, 247, 0));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .frame-shimmer {
    animation: frame-shimmer 300ms ease-out;
  }
}
```

Update CanvasCheckoutModal:
```typescript
const [triggerFrameShimmer, setTriggerFrameShimmer] = useState(false);

const handleSizeSelect = (sizeId: CanvasSizeKey) => {
  setCanvasSize(sizeId);

  // Trigger frame shimmer if frame enabled
  if (floatingFrame?.enabled) {
    setTriggerFrameShimmer(true);
    setTimeout(() => setTriggerFrameShimmer(false), 300);
  }
};

// In preview container:
<div className={clsx(triggerFrameShimmer && 'frame-shimmer')}>
  <CanvasInRoomPreview ... />
</div>
```

**Test:**
- [ ] Frame shimmers when size selected (only if frame enabled)
- [ ] 300ms duration, no jank

#### Phase 6.2: Mobile Drawer Auto-Expand (20 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (UPDATE)

Add state:
```typescript
const [hasAutoExpandedOnce, setHasAutoExpandedOnce] = useState(false);

// In handleSizeSelect:
const handleSizeSelect = (sizeId: CanvasSizeKey) => {
  setCanvasSize(sizeId);

  // Auto-expand mobile drawer (once)
  if (!hasAutoExpandedOnce && window.innerWidth < 1024) {
    setMobilePreviewExpanded(true);
    setHasAutoExpandedOnce(true);

    // Brief pulse hint
    const drawer = document.querySelector('[data-mobile-drawer]');
    if (drawer) {
      drawer.classList.add('motion-safe:animate-[pulse_600ms_ease-in-out_2]');
      setTimeout(() => {
        drawer.classList.remove('motion-safe:animate-[pulse_600ms_ease-in-out_2]');
      }, 1200);
    }
  }
};
```

Add data attribute to drawer:
```typescript
<div
  data-mobile-drawer
  className={clsx(...)}
>
  {/* ... */}
</div>
```

**Test:**
- [ ] First size selection expands drawer
- [ ] Drawer pulses briefly
- [ ] Subsequent selections don't auto-expand

#### Phase 6.3: Performance Audit (20 min)
**Tools:** Chrome DevTools Performance tab

**Checklist:**
- [ ] All animations run at 60fps
- [ ] No layout thrashing during step transitions
- [ ] Intersection Observers clean up properly
- [ ] Bundle size stays under 567KB
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3s

**Optimize if needed:**
- Add `will-change: transform` to animating elements
- Use `contain: layout` on isolated cards
- Lazy import testimonial component if bundle exceeds limit

---

### **PHASE 7: Feature Flags & A/B Setup** ⏱️ 30 min

**Goal:** Gate features for A/B testing.

#### Phase 7.1: Feature Flag Config (15 min)
**File:** `src/config/featureFlags.ts` (UPDATE)

```typescript
export const CHECKOUT_OPTIMIZATION_FLAGS = {
  SHOW_SIZE_RECOMMENDATIONS: {
    enabled: import.meta.env.VITE_SHOW_SIZE_RECOMMENDATIONS !== 'false', // Default ON
    rollout: 100, // Start at 100%, can dial down later
  },
  USE_NEW_CTA_COPY: {
    enabled: import.meta.env.VITE_USE_NEW_CTA_COPY !== 'false', // Default ON
    rollout: 100,
  },
  SHOW_CONTEXTUAL_TESTIMONIALS: {
    enabled: import.meta.env.VITE_SHOW_CONTEXTUAL_TESTIMONIALS !== 'false', // Default ON
    rollout: 100,
  },
};

// Simple hash-based bucketing
export function isFeatureEnabled(flagKey: keyof typeof CHECKOUT_OPTIMIZATION_FLAGS): boolean {
  const flag = CHECKOUT_OPTIMIZATION_FLAGS[flagKey];
  if (!flag.enabled) return false;

  // For now, simple rollout (could use user ID hash later)
  return Math.random() * 100 < flag.rollout;
}
```

#### Phase 7.2: Apply Flags (15 min)
**File:** `src/components/studio/CanvasCheckoutModal.tsx` (UPDATE)

```typescript
import { isFeatureEnabled } from '@/config/featureFlags';

// Inside component:
const showRecommendations = isFeatureEnabled('SHOW_SIZE_RECOMMENDATIONS');
const useNewCtaCopy = isFeatureEnabled('USE_NEW_CTA_COPY');
const showTestimonials = isFeatureEnabled('SHOW_CONTEXTUAL_TESTIMONIALS');

// Conditionally pass to CanvasSizeCard:
<CanvasSizeCard
  {...}
  isRecommended={showRecommendations && isRecommended}
  isMostPopular={showRecommendations && isMostPopular}
/>

// CTA copy:
<button {...}>
  {useNewCtaCopy ? 'Begin Production →' : 'Continue to Contact & Shipping →'}
</button>

// Testimonials:
{showTestimonials && (
  <ContextualTestimonial {...} />
)}
```

**Test:**
- [ ] Toggle env vars, verify features turn on/off
- [ ] No errors when disabled

---

### **PHASE 8: Testing & QA** ⏱️ 2 hours

**Goal:** Comprehensive cross-browser, cross-device, accessibility testing.

#### Phase 8.1: Functional Testing (45 min)
**Test Scenarios:**

1. **Recommendation Accuracy:**
   - [ ] Upload 4000×4000 image → 'square-32x32' recommended
   - [ ] Upload 2000×1500 image → 'landscape-24x18' recommended
   - [ ] Low-res 800×600 → 'landscape-16x12' recommended
   - [ ] No image data → 'square-24x24' shows "Collector Favorite"

2. **Badge Display:**
   - [ ] Recommended size has "Best Match" badge
   - [ ] Most popular (when not recommended) has "Collector Favorite"
   - [ ] Badge shadow not clipped
   - [ ] Badge shimmers once on first view

3. **Trust Signals:**
   - [ ] Canvas quality guarantee shows near size section
   - [ ] Artisan note shows near frame section
   - [ ] CTA strip always visible in footer
   - [ ] Desktop sticky guarantee fades in after scrolling

4. **Step Indicator:**
   - [ ] Progress bar moves with spring easing
   - [ ] Traveling glow follows bar
   - [ ] Checkmarks appear with bounce on completed steps
   - [ ] Time estimate shows on desktop only
   - [ ] Time message updates after 2 min, 3 min

5. **CTA Copy:**
   - [ ] Canvas: "Begin Production →"
   - [ ] Contact: "Delivery Details →"
   - [ ] Payment: "Make It Official →"

6. **Testimonials:**
   - [ ] Shows size-specific when 'square-24x24' selected
   - [ ] Shows frame-specific when frame enabled
   - [ ] Shows general if no match
   - [ ] Auto-rotates every 5 sec
   - [ ] Pauses on hover
   - [ ] Dot navigation works
   - [ ] Hides if no testimonials

7. **Mobile:**
   - [ ] Time estimate hidden
   - [ ] Trust signals condensed
   - [ ] Testimonial shows after size selection
   - [ ] Drawer auto-expands on first selection
   - [ ] Drawer pulses once

8. **Animations:**
   - [ ] Frame shimmers when size selected (with frame enabled)
   - [ ] Step transitions smooth
   - [ ] All animations respect `prefers-reduced-motion`

#### Phase 8.2: Cross-Browser Testing (30 min)
**Browsers:**
- [ ] Chrome 90+ (Windows, macOS)
- [ ] Safari 14+ (macOS, iOS)
- [ ] Firefox 88+ (Windows, macOS)
- [ ] Edge 90+ (Windows)

**Focus Areas:**
- Badge shadow rendering (Safari may differ)
- Spring easing support (all modern browsers support cubic-bezier)
- Intersection Observer (IE11 not supported, but not target)

#### Phase 8.3: Accessibility Audit (30 min)
**Tools:** axe DevTools, Lighthouse

**Checklist:**
- [ ] All badges have proper semantic HTML
- [ ] Testimonial rotation has pause control (hover)
- [ ] Step indicator keyboard navigable (Tab, Enter)
- [ ] Trust signals have semantic HTML (not just styled divs)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Icons have `aria-label` or `aria-hidden="true"`
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces step changes
- [ ] Reduced motion preferences respected

**Run Lighthouse:**
```bash
npm run build
npm run preview
# Open in Chrome, run Lighthouse audit
```

Target Scores:
- Performance: ≥90
- Accessibility: 100
- Best Practices: ≥95

#### Phase 8.4: Performance Testing (15 min)
**Chrome DevTools Performance:**

1. Record interaction:
   - Open modal
   - Select size
   - Advance step
   - Check for jank (FPS drops)

2. Check bundle size:
```bash
npm run build
ls -lh dist/assets/*.js
```

Target: Main bundle ≤567 KB

3. Network throttling (Fast 3G):
   - Time to Interactive <5s
   - No layout shift (CLS <0.1)

---

### **PHASE 9: Staging Deployment & Review** ⏱️ 1 hour

**Goal:** Deploy to staging, gather feedback, iterate.

#### Phase 9.1: Build & Deploy (15 min)
```bash
npm run lint
npm run test
npm run build
# Deploy to staging environment
```

#### Phase 9.2: Stakeholder Review (30 min)
**Feedback Areas:**
- [ ] Copy tone (badges, CTAs, trust signals)
- [ ] Visual hierarchy (badges too prominent?)
- [ ] Animation feel (too much? too subtle?)
- [ ] Mobile experience
- [ ] Trust signal placement effectiveness

**Iterate based on feedback.**

#### Phase 9.3: Pre-Launch Checklist (15 min)
- [ ] All feature flags set to 100% rollout
- [ ] Analytics events firing correctly
- [ ] No console errors
- [ ] No Sentry errors
- [ ] Bundle size under limit
- [ ] All tests passing
- [ ] README/IMPLEMENTATION.md updated

---

### **PHASE 10: Production Rollout** ⏱️ Ongoing

**Goal:** Gradual rollout with monitoring.

#### Phase 10.1: Initial Rollout (Day 1)
- Deploy to production
- Enable for internal team only (5%)
- Monitor analytics dashboard
- Check for errors in Sentry

**Metrics to Watch:**
- Canvas → Contact conversion rate
- Frame attachment rate
- Size decision time
- Exit rate
- Page load time
- Error rate

#### Phase 10.2: Scale Up (Days 2-5)
**Day 2:** 25% rollout
**Day 3:** 50% rollout
**Day 4:** 75% rollout
**Day 5:** 100% rollout (if metrics positive)

**Success Criteria:**
- Canvas → Contact conversion: +5% minimum (target: +10%)
- Frame attachment: +3% minimum (target: +5%)
- Exit rate: -5% minimum (target: -10%)
- No performance degradation

#### Phase 10.3: Post-Launch Monitoring (Week 2)
- Daily analytics review
- User feedback collection
- A/B test analysis (if variants enabled)
- Plan iteration/enhancements

---

## Summary: Microphase Overview

| Phase | Duration | Key Deliverables | Test Checkpoint |
|-------|----------|------------------|-----------------|
| 0 | 30 min | Recommendation logic, context copy constants | Unit tests pass |
| 1 | 2 hrs | Canvas size card with badges | Visual inspection + selection works |
| 2 | 1.5 hrs | Contextual trust signals placed | All signals visible, IO works |
| 3 | 1.5 hrs | Enhanced step indicator | Spring easing, checkmarks, time |
| 4 | 30 min | CTA copy updates | All buttons updated |
| 5 | 2 hrs | Dynamic testimonials | Rotation works, context filtering |
| 6 | 1 hr | Frame shimmer, mobile drawer, performance | 60fps, no jank |
| 7 | 30 min | Feature flags for A/B | Features toggle correctly |
| 8 | 2 hrs | Comprehensive testing | All tests pass |
| 9 | 1 hr | Staging review | Stakeholder approval |
| 10 | Ongoing | Production rollout | Metrics positive |

**Total Implementation Time:** ~12 hours (1.5 days focused work)

---

## Key Integration Corrections Summary

1. ✅ **Canvas Size Types:** Using actual `CanvasSizeKey` format (`'portrait-18x24'`, not `'24x24'`)
2. ✅ **Image Dimensions:** From `smartCrops[orientation].imageDimensions`
3. ✅ **Badge Overflow:** Parent has `overflow: visible`, pill uses `filter: drop-shadow()`
4. ✅ **Social Proof Animation:** Gated with `enableCountAnimation` prop (disabled for MVP)
5. ✅ **Sticky Guarantee:** Max-width 280px, IO threshold 0.65, desktop only
6. ✅ **Time Estimate:** Static brackets, no live countdown, desktop only
7. ✅ **Animation Budget:** All behind `prefers-reduced-motion`, `will-change` sparingly, ≤300ms durations

---

## Next Steps

**Ready to begin?** Start with Phase 0.1 (Recommendation utility) and proceed sequentially. Each phase is independently testable and shippable.

**Questions before starting?** Clarify now to ensure smooth execution.
