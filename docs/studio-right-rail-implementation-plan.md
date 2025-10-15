# Studio Right Rail Progressive Disclosure - Implementation Plan

**Created**: 2025-10-14
**Status**: Ready for Implementation
**Estimated Total Time**: Phase 1 (1-2 hrs), Phase 2 (3-4 hrs)

---

## Executive Summary

This plan implements progressive disclosure for the Studio right rail, creating two clear user paths (Download vs Canvas) while maintaining premium positioning. Canvas preview remains visible; orientation controls stay at top. Configuration complexity is hidden until requested.

### Key Success Metrics
- **Download conversion rate**: Track tier upgrade rate after CTA exposure
- **Canvas discovery rate**: % of users who expand canvas config
- **Revenue per session**: Blended metric across both streams
- **Mobile engagement**: Touch interaction rates with new CTAs

---

## Current State Analysis

### Existing Architecture

**StickyOrderRail.tsx** (555 lines)
- **Current structure**:
  1. Orientation selector (3-button grid)
  2. Canvas Size selector (always visible)
  3. Enhancements (Floating Frame, Living Canvas AR)
  4. Mobile Room Preview (conditional)
  5. Your Order summary + checkout button

**StudioConfigurator.tsx** (Lines 551-616)
- **Download flow**:
  - Download HD button currently below canvas preview
  - Tier gating: `isPremiumUser` check (creator/plus/pro)
  - Non-premium: Shows `DownloadUpgradeModal`
  - Premium: Calls `downloadCleanImage()` from `@/utils/premiumDownload`
  - Button has Lock icon for free users, Download icon for premium

**Key State**:
- `useFounderStore`: All product configuration state
- `croppedImage`, `orientation`, `selectedCanvasSize`, `selectedFrame`
- `enhancements` array with `enabled` boolean flags
- `entitlements.tier`: `'anonymous' | 'free' | 'creator' | 'plus' | 'pro'`
- `computedTotal()`: Calculates base price + enhancements

### Current User Pain Points
1. **Digital-first users** see canvas config they don't need (Size, Enhancements, Order Summary)
2. **Canvas buyers** experience is fine, but canvas config is always expanded (no clutter reduction)
3. **Download CTA** is buried below preview (lines 551-571), not prominent
4. **No clear "next steps"** after preview generation - users see canvas config by default

---

## Phase 1: Quick Win (1-2 Hours)

### Goal
Ship a low-risk restructure that surfaces both paths, removes clutter, and maintains all existing functionality.

### Implementation Steps

#### Step 1: Move Download CTA to Right Rail
**File**: `src/sections/StudioConfigurator.tsx`

**Current state** (Lines 551-571):
```tsx
{/* Action Buttons */}
{preview?.status === 'ready' && currentStyle && (
  <div className="mt-6 flex flex-col items-center gap-4">
    <div className="flex items-center gap-3">
      {/* Download HD Image Button */}
      <button onClick={handleDownloadHD}>...</button>
      {/* Save to Gallery Button */}
      <button onClick={handleSaveToGallery}>...</button>
    </div>
  </div>
)}
```

**Action**:
1. Extract `handleDownloadHD` logic to remain in StudioConfigurator
2. Pass as prop to StickyOrderRail: `onDownloadClick={handleDownloadHD}`, `downloadingHD`, `isPremiumUser`
3. Remove the action buttons section from below canvas preview (keep Save to Gallery if needed)

**Rationale**: Download action should be in the "options rail" alongside canvas configuration, not below preview.

---

#### Step 2: Create Action Row Component
**File**: `src/components/studio/ActionRow.tsx` (NEW)

```tsx
import { Download, Lock, ShoppingBag } from 'lucide-react';

type ActionRowProps = {
  onDownloadClick: () => void;
  onCanvasClick: () => void;
  downloadingHD: boolean;
  isPremiumUser: boolean;
  canvasConfigExpanded: boolean;
  disabled?: boolean;
};

export default function ActionRow({
  onDownloadClick,
  onCanvasClick,
  downloadingHD,
  isPremiumUser,
  canvasConfigExpanded,
  disabled = false,
}: ActionRowProps) {
  return (
    <div className="space-y-4">
      {/* Download HD Button */}
      <button
        onClick={onDownloadClick}
        disabled={downloadingHD || disabled}
        className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10">
          {isPremiumUser ? (
            <Download className="w-5 h-5 text-white" />
          ) : (
            <Lock className="w-5 h-5 text-white/60" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Download HD</p>
          <p className="text-xs text-white/60">
            {isPremiumUser ? 'Instant 4K files • Uses 1 token' : 'Upgrade to download watermark-free'}
          </p>
        </div>
      </button>

      {/* Order Canvas Button */}
      <button
        onClick={onCanvasClick}
        disabled={disabled}
        className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
          canvasConfigExpanded
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-400/40 hover:border-purple-400/60'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            canvasConfigExpanded ? 'bg-purple-500 shadow-glow-soft' : 'bg-purple-500/50'
          }`}
        >
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Order Canvas</p>
          <p className="text-xs text-white/60">
            Handcrafted gallery canvas • Ships in 5 days
          </p>
        </div>
      </button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
```

**Key Design Decisions**:
- Both buttons same size (equal visual weight initially)
- Download: Ghost/outline style, shows value prop for each tier
- Canvas: Gradient background (hints at premium offering)
- Canvas button changes state when config is expanded (visual feedback)
- 1-line value props under each button for quick comprehension

---

#### Step 3: Make Canvas Config Collapsible
**File**: `src/components/studio/CanvasConfig.tsx` (NEW - Extract from StickyOrderRail)

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import type { Orientation } from '@/utils/imageUtils';

type CanvasConfigProps = {
  isExpanded: boolean;
  // Size selector props
  orientation: Orientation;
  sizeOptions: Array<{ id: string; label: string; nickname?: string; price: number }>;
  selectedSize: string;
  onSizeChange: (sizeId: string) => void;
  // Enhancements props
  floatingFrame: { enabled: boolean; name: string; price: number; description: string } | undefined;
  livingCanvas: { enabled: boolean; name: string; price: number; description: string } | undefined;
  selectedFrame: 'none' | 'black' | 'white';
  onToggleFloatingFrame: () => void;
  onToggleLivingCanvas: () => void;
  onFrameChange: (frame: 'black' | 'white') => void;
  // Order summary props
  currentStyleName: string | undefined;
  selectedSizeLabel: string | undefined;
  basePrice: number;
  enabledEnhancements: Array<{ id: string; name: string; price: number }>;
  total: number;
  checkoutDisabled: boolean;
  checkoutError: string | null;
  onCheckout: () => void;
  // Mobile room preview
  mobileRoomPreview?: React.ReactNode;
};

export default function CanvasConfig({
  isExpanded,
  // ... all props
}: CanvasConfigProps) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="space-y-4 overflow-hidden"
        >
          {/* Canvas Size Selector */}
          <Card glass className="space-y-4 border-2 border-white/20 p-5">
            <h3 className="text-base font-bold text-white">Canvas Size</h3>
            {/* ... existing size selector UI ... */}
          </Card>

          {/* Enhancements */}
          <Card glass className="space-y-4 border-2 border-white/20 p-5">
            <h3 className="text-base font-bold text-white">Enhancements</h3>
            {/* ... existing enhancements UI ... */}
          </Card>

          {/* Mobile Room Preview */}
          {mobileRoomPreview && (
            <div className="lg:hidden">
              {mobileRoomPreview}
            </div>
          )}

          {/* Your Order Summary */}
          <Card glass className="space-y-4 border-2 border-white/20 p-5">
            {/* ... existing order summary UI ... */}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Key Design Decisions**:
- Use Framer Motion `AnimatePresence` for smooth height animation
- Extract all canvas-specific UI into this component
- Maintain exact same UI as current (no visual regressions)
- Component is fully controlled by `isExpanded` prop

---

#### Step 4: Refactor StickyOrderRail
**File**: `src/components/studio/StickyOrderRail.tsx`

**Changes**:
1. Add new state: `const [canvasConfigExpanded, setCanvasConfigExpanded] = useState(false);`
2. Add new props: `onDownloadClick`, `downloadingHD`, `isPremiumUser`
3. Replace Canvas Size + Enhancements + Order sections with:

```tsx
return (
  <aside className="md:sticky md:top-24 space-y-4">
    {/* Orientation Selector - UNCHANGED */}
    <Card glass className="space-y-4 border-2 border-white/20 p-5">
      {/* ... existing orientation UI ... */}
    </Card>

    {/* Action Row - NEW */}
    <ActionRow
      onDownloadClick={onDownloadClick}
      onCanvasClick={() => setCanvasConfigExpanded(!canvasConfigExpanded)}
      downloadingHD={downloadingHD}
      isPremiumUser={isPremiumUser}
      canvasConfigExpanded={canvasConfigExpanded}
      disabled={!hasFinalizedPhoto || orientationChanging}
    />

    {/* Canvas Config - Collapsible */}
    <CanvasConfig
      isExpanded={canvasConfigExpanded}
      orientation={activeOrientationValue}
      sizeOptions={sizeOptionsForOrientation}
      selectedSize={selectedSize}
      onSizeChange={setCanvasSize}
      floatingFrame={floatingFrame}
      livingCanvas={livingCanvas}
      selectedFrame={selectedFrame}
      onToggleFloatingFrame={() => {
        toggleEnhancement('floating-frame');
        if (!floatingFrame?.enabled) {
          setFrame('black');
        } else {
          setFrame('none');
        }
      }}
      onToggleLivingCanvas={handleLivingCanvasToggle}
      onFrameChange={setFrame}
      currentStyleName={currentStyle?.name}
      selectedSizeLabel={selectedSizeOption?.label}
      basePrice={basePrice}
      enabledEnhancements={enabledEnhancements}
      total={total}
      checkoutDisabled={checkoutDisabled}
      checkoutError={checkoutError}
      onCheckout={handleCheckout}
      mobileRoomPreview={mobileRoomPreview}
    />

    {/* Cropper Modal - UNCHANGED */}
    <Suspense fallback={null}>
      {(cropperOpen || pendingOrientation !== null) && (
        <CropperModal {...cropperProps} />
      )}
    </Suspense>
  </aside>
);
```

**Key Changes**:
- Remove ~300 lines of Canvas/Enhancements/Order UI → moved to CanvasConfig
- Add ActionRow component between Orientation and CanvasConfig
- Canvas config collapsed by default
- Clicking "Order Canvas" button toggles `canvasConfigExpanded`

---

#### Step 5: Update StudioConfigurator Integration
**File**: `src/sections/StudioConfigurator.tsx`

**Changes**:

1. **Remove action buttons from below canvas preview** (Lines 551-571):
```tsx
// DELETE THIS ENTIRE SECTION
{/* Action Buttons */}
{preview?.status === 'ready' && currentStyle && (
  <div className="mt-6 flex flex-col items-center gap-4">
    <div className="flex items-center gap-3">
      {/* Download HD Image Button */}
      ...
    </div>
  </div>
)}
```

2. **Keep Save to Gallery somewhere visible** (optional - could move to right rail too):
```tsx
{/* Optional: Keep Save to Gallery below preview or move to right rail */}
{preview?.status === 'ready' && currentStyle && (
  <div className="mt-6 flex justify-center">
    <button onClick={handleSaveToGallery} className="...">
      {savedToGallery ? <BookmarkCheck /> : <Bookmark />}
      {savedToGallery ? 'Saved to Gallery' : 'Save to Gallery'}
    </button>
  </div>
)}
```

3. **Pass download props to StickyOrderRail** (Line ~638):
```tsx
<StickyOrderRail
  onDownloadClick={handleDownloadHD}
  downloadingHD={downloadingHD}
  isPremiumUser={isPremiumUser}
  mobileRoomPreview={...}
/>
```

4. **Keep DownloadUpgradeModal** (already exists, no changes needed):
```tsx
{showDownloadUpgradeModal && (
  <Suspense fallback={null}>
    <DownloadUpgradeModal
      open={showDownloadUpgradeModal}
      onClose={() => setShowDownloadUpgradeModal(false)}
    />
  </Suspense>
)}
```

---

#### Step 6: Test Checklist

**Functional Testing**:
- [ ] Download HD button appears in right rail (top section)
- [ ] Order Canvas button appears in right rail (below Download)
- [ ] Canvas config is collapsed by default
- [ ] Clicking "Order Canvas" expands canvas config smoothly
- [ ] Clicking "Order Canvas" again collapses config
- [ ] Download HD shows Lock icon for free/anonymous users
- [ ] Download HD shows Download icon for premium users
- [ ] Clicking Download HD (non-premium) opens DownloadUpgradeModal
- [ ] Clicking Download HD (premium) triggers download
- [ ] All canvas configuration works as before (size, frame, enhancements)
- [ ] Checkout button still functional
- [ ] Mobile room preview appears in correct position (between Enhancements & Order)

**Visual Testing**:
- [ ] Action buttons have equal visual weight
- [ ] Canvas config animation is smooth (200ms ease)
- [ ] No layout jumps on expand/collapse
- [ ] Responsive on mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] All existing styles preserved (no regressions)

**State Testing**:
- [ ] Collapsing canvas config does NOT reset selections (size, frame, enhancements)
- [ ] Orientation change does NOT reset expanded/collapsed state
- [ ] Style change does NOT reset expanded/collapsed state
- [ ] Refresh page: canvas config defaults to collapsed

---

## Phase 2: Optimization (3-4 Hours)

### Goal
Polish hierarchy, add motion, implement analytics, enhance mobile experience, add conversion touches.

### Implementation Steps

#### Step 1: Visual Hierarchy Enhancement
**File**: `src/components/studio/ActionRow.tsx`

**Changes**:
1. **Make Order Canvas button primary gradient**:
```tsx
// Order Canvas Button - UPDATED
<button
  onClick={onCanvasClick}
  className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
    canvasConfigExpanded
      ? 'bg-gradient-cta text-white border-2 border-purple-400 shadow-glow-purple'
      : 'bg-gradient-cta/80 text-white border-2 border-purple-400/60 hover:bg-gradient-cta hover:border-purple-400 hover:shadow-glow-purple'
  }`}
>
  {/* ... */}
</button>
```

2. **Make Download HD button secondary (ghost)**:
```tsx
// Download HD Button - UPDATED
<button
  onClick={onDownloadClick}
  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all bg-transparent border-2 border-white/20 hover:bg-white/5 hover:border-white/30"
>
  {/* ... */}
</button>
```

3. **Update microcopy** (more emotional for canvas, more utility for download):
```tsx
// Download
<p className="text-xs text-white/60">
  {isPremiumUser
    ? 'Instant 4K JPEG • Perfect for sharing'
    : 'Unlock watermark-free downloads • Upgrade to Creator'
  }
</p>

// Canvas
<p className="text-xs text-white/60">
  Turn this into wall art • Gallery-quality prints
</p>
```

**Rationale**: Canvas is higher-margin, should have visual priority. Download is utility action, secondary styling appropriate.

---

#### Step 2: Enhanced Animations
**File**: `src/components/studio/CanvasConfig.tsx`

**Changes**:
1. **Add stagger animations for cards**:
```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
  className="space-y-4 overflow-hidden"
>
  {/* Size Card */}
  <motion.div
    initial={{ y: -10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.05 }}
  >
    <Card glass className="...">
      {/* Size selector UI */}
    </Card>
  </motion.div>

  {/* Enhancements Card */}
  <motion.div
    initial={{ y: -10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.1 }}
  >
    <Card glass className="...">
      {/* Enhancements UI */}
    </Card>
  </motion.div>

  {/* Order Summary Card */}
  <motion.div
    initial={{ y: -10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.15 }}
  >
    <Card glass className="...">
      {/* Order summary UI */}
    </Card>
  </motion.div>
</motion.div>
```

2. **Auto-scroll to first card on expand**:
```tsx
import { useEffect, useRef } from 'react';

export default function CanvasConfig({ isExpanded, ...props }: CanvasConfigProps) {
  const sizeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && sizeCardRef.current) {
      // Smooth scroll to size card
      setTimeout(() => {
        sizeCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 250); // Wait for expand animation
    }
  }, [isExpanded]);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div {...animationProps}>
          <motion.div ref={sizeCardRef} {...staggerProps}>
            {/* Size Card */}
          </motion.div>
          {/* ... */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Rationale**: Stagger animation feels premium. Auto-scroll ensures user sees what they opened (especially mobile).

---

#### Step 3: Analytics Tracking
**File**: `src/utils/telemetry.ts`

**Add new event types**:
```typescript
// Add to existing telemetry events
export const trackDownloadCTAClick = (userTier: string, isPremium: boolean) => {
  track('cta_download_click', {
    user_tier: userTier,
    is_premium: isPremium,
    timestamp: Date.now(),
  });
};

export const trackCanvasCTAClick = (userTier: string) => {
  track('cta_canvas_click', {
    user_tier: userTier,
    timestamp: Date.now(),
  });
};

export const trackCanvasPanelOpen = (userTier: string) => {
  track('canvas_panel_open', {
    user_tier: userTier,
    timestamp: Date.now(),
  });
};

export const trackDownloadSuccess = (userTier: string, styleId: string) => {
  track('download_success', {
    user_tier: userTier,
    style_id: styleId,
    timestamp: Date.now(),
  });
};

export const trackOrderStarted = (userTier: string, total: number, hasEnhancements: boolean) => {
  track('order_started', {
    user_tier: userTier,
    order_total: total,
    has_enhancements: hasEnhancements,
    timestamp: Date.now(),
  });
};
```

**Instrument components**:

**ActionRow.tsx**:
```tsx
import { trackDownloadCTAClick, trackCanvasCTAClick, trackCanvasPanelOpen } from '@/utils/telemetry';

export default function ActionRow({ ... }: ActionRowProps) {
  const userTier = useFounderStore((state) => state.entitlements?.tier ?? 'anonymous');

  const handleDownloadClick = () => {
    trackDownloadCTAClick(userTier, isPremiumUser);
    onDownloadClick();
  };

  const handleCanvasClick = () => {
    trackCanvasCTAClick(userTier);
    if (!canvasConfigExpanded) {
      trackCanvasPanelOpen(userTier);
    }
    onCanvasClick();
  };

  return (
    {/* ... */}
    <button onClick={handleDownloadClick}>Download HD</button>
    <button onClick={handleCanvasClick}>Order Canvas</button>
  );
}
```

**StudioConfigurator.tsx** (in handleDownloadHD):
```tsx
const handleDownloadHD = async () => {
  // ... existing tier check ...

  if (isPremiumUser) {
    setDownloadingHD(true);
    try {
      // ... existing download logic ...
      trackDownloadSuccess(userTier, currentStyle.id);
      // ... success toast ...
    } catch (error) {
      // ... error handling ...
    } finally {
      setDownloadingHD(false);
    }
  }
};
```

**StickyOrderRail.tsx** (in handleCheckout):
```tsx
const handleCheckout = async () => {
  if (checkoutDisabled) return;

  trackOrderStarted(
    useFounderStore.getState().entitlements?.tier ?? 'anonymous',
    total,
    enabledEnhancements.length > 0
  );

  // ... existing checkout logic ...
};
```

---

#### Step 4: Canvas Upsell Toast After Download
**File**: `src/sections/StudioConfigurator.tsx`

**Add new component** (inline or separate file):
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type CanvasUpsellToastProps = {
  show: boolean;
  onDismiss: () => void;
  onCanvasClick: () => void;
};

function CanvasUpsellToast({ show, onDismiss, onCanvasClick }: CanvasUpsellToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl shadow-glow-purple border-2 border-purple-400/60">
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="font-bold text-sm mb-1">Love this artwork?</p>
            <p className="text-xs text-white/90 mb-3">
              Turn it into a premium canvas print and bring it to life in your space.
            </p>
            <button
              onClick={onCanvasClick}
              className="w-full bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-white/90 transition-all text-sm"
            >
              Explore Canvas Options →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Wire up in StudioConfigurator**:
```tsx
const [showCanvasUpsellToast, setShowCanvasUpsellToast] = useState(false);

const handleDownloadHD = async () => {
  // ... existing logic ...

  if (isPremiumUser) {
    try {
      // ... download logic ...
      trackDownloadSuccess(userTier, currentStyle.id);

      // Show canvas upsell toast after successful download
      setShowCanvasUpsellToast(true);
      setTimeout(() => setShowCanvasUpsellToast(false), 8000); // Auto-dismiss after 8s
    } catch (error) {
      // ... error handling ...
    }
  }
};

return (
  <>
    {/* ... existing JSX ... */}

    <CanvasUpsellToast
      show={showCanvasUpsellToast}
      onDismiss={() => setShowCanvasUpsellToast(false)}
      onCanvasClick={() => {
        setShowCanvasUpsellToast(false);
        // Scroll to right rail and expand canvas config
        // Implementation depends on component refs
      }}
    />
  </>
);
```

**Rationale**: Capitalize on emotional momentum after successful download. User just got value, receptive to upsell.

---

#### Step 5: Mobile Enhancements
**File**: `src/components/studio/ActionRow.tsx`

**Add sticky mini-bar when scrolled past**:
```tsx
import { useEffect, useState } from 'react';

export default function ActionRow({ ... }: ActionRowProps) {
  const [isSticky, setIsSticky] = useState(false);
  const actionRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (actionRowRef.current) {
        const rect = actionRowRef.current.getBoundingClientRect();
        setIsSticky(rect.top < 60); // Below mobile header
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div ref={actionRowRef} className="space-y-4">
        {/* Regular action buttons */}
      </div>

      {/* Sticky mini-bar on mobile when scrolled past */}
      {isSticky && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur border-b border-white/10 p-3 animate-slideDown">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button
              onClick={onDownloadClick}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold"
            >
              {isPremiumUser ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Download
            </button>
            <button
              onClick={onCanvasClick}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-cta text-white text-sm font-semibold shadow-glow-purple"
            >
              <ShoppingBag className="w-4 h-4" />
              Order Canvas
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

**Rationale**: On mobile, users scroll past right rail. Sticky CTAs keep actions accessible.

---

#### Step 6: Conversion Touches
**File**: `src/components/studio/ActionRow.tsx`

**Add token balance display**:
```tsx
export default function ActionRow({ ... }: ActionRowProps) {
  const entitlements = useFounderStore((state) => state.entitlements);
  const remainingTokens = entitlements?.tokens_remaining ?? 0;
  const userTier = entitlements?.tier ?? 'anonymous';

  return (
    <div className="space-y-4">
      {/* Download HD Button */}
      <button onClick={handleDownloadClick} className="...">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">Download HD</p>
            {isPremiumUser && (
              <span className="text-xs text-purple-300 font-semibold">
                {remainingTokens} tokens left
              </span>
            )}
          </div>
          <p className="text-xs text-white/60">
            {isPremiumUser
              ? 'Instant 4K JPEG • Perfect for sharing'
              : 'Unlock watermark-free downloads'
            }
          </p>
        </div>
      </button>

      {/* Order Canvas Button with social proof */}
      <button onClick={handleCanvasClick} className="...">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">Order Canvas</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold">
              ⭐ 4.9 avg
            </span>
          </div>
          <p className="text-xs text-white/60">
            Turn this into wall art • Gallery-quality prints
          </p>
        </div>
      </button>
    </div>
  );
}
```

**File**: `src/components/studio/CanvasConfig.tsx`

**Add social proof in order summary**:
```tsx
{/* Inside Order Summary Card, before checkout button */}
<div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
  <p className="text-xs text-emerald-300 flex items-center gap-2">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <span className="font-semibold">Rated 4.9/5 by 1,200+ customers</span>
  </p>
</div>
```

**Rationale**: Social proof + scarcity (token count) drive conversion.

---

## Phase 3: Personalization (Future - Out of Scope)

This phase is outlined in the original plan document but not detailed here. Covers:
- localStorage preference memory (collapsed vs expanded default)
- Smart defaults based on user tier/history
- Dynamic CTA copy rotation
- Cross-sell modules (frames, gift cards)
- Lifecycle marketing integration

---

## Testing Strategy

### Unit Tests (Optional - Future)
- ActionRow component: prop handling, click events
- CanvasConfig component: expand/collapse state, animation completion
- Telemetry: event firing on interactions

### Integration Tests
- Full flow: Upload → Style → Download CTA → Download success → Toast
- Full flow: Upload → Style → Canvas CTA → Expand → Configure → Checkout
- State persistence: Collapse config, change size, re-expand, verify selection preserved

### Visual Regression Tests
- Screenshot comparison before/after on desktop/mobile/tablet
- Verify no layout shifts during expand/collapse
- Verify existing canvas config UI unchanged

### Analytics Validation
- Run in dev mode, check console for telemetry events:
  - `cta_download_click`
  - `cta_canvas_click`
  - `canvas_panel_open`
  - `download_success`
  - `order_started`
- Verify event properties (user_tier, timestamps, etc.)

### Performance Tests
- Lighthouse score: Target >90 performance
- Bundle size: Check `npm run build:analyze` - ActionRow + CanvasConfig should be <5kb gzipped
- Animation smoothness: 60fps on iPhone 12 / Pixel 5

---

## Rollback Plan

If issues arise, rollback is surgical:

### Phase 1 Rollback
1. Revert `StickyOrderRail.tsx` to previous version (restore Canvas Size + Enhancements + Order as always-visible)
2. Revert `StudioConfigurator.tsx` to restore Download HD button below canvas preview
3. Delete new files: `ActionRow.tsx`, `CanvasConfig.tsx`
4. Deploy

**Impact**: Users see original experience. No data loss.

### Phase 2 Rollback
1. Remove analytics calls (telemetry events)
2. Remove canvas upsell toast
3. Remove sticky mobile mini-bar
4. Revert visual hierarchy changes (keep progressive disclosure, remove gradient tweaks)

**Impact**: Keep core progressive disclosure, remove conversion optimizations.

---

## Success Criteria

### Phase 1
- [ ] Zero functional regressions (all existing features work)
- [ ] Canvas config collapsed by default
- [ ] Both CTAs visible and functional
- [ ] Download tier gating works correctly
- [ ] Mobile responsive (320px+)
- [ ] Ship within 2 hours

### Phase 2
- [ ] Analytics events firing correctly
- [ ] Canvas upsell toast appears after download
- [ ] Visual hierarchy clearly guides users to canvas (primary styling)
- [ ] Mobile sticky CTAs functional
- [ ] Animation performance >60fps
- [ ] Ship within 4 hours

### Business Metrics (30-day post-launch)
- **Download CTA click rate**: >40% of users who generate preview
- **Canvas panel open rate**: >25% of users who generate preview
- **Canvas conversion rate**: Hold steady or improve (baseline: ~2-3%)
- **Subscription upgrade rate**: +10% from download CTA exposure
- **Revenue per session**: +5-10% blended

---

## Open Questions / Decisions Needed

1. **Save to Gallery placement**: Keep below canvas preview, or move to right rail? (Recommend: keep below, it's tertiary action)
2. **Default state**: Canvas config collapsed for all users, or smart default based on tier? (Recommend: collapsed for all in Phase 1, add smart defaults in Phase 3)
3. **Mobile bottom sheet**: Should canvas config open as bottom sheet on mobile instead of inline? (Recommend: inline for Phase 1, bottom sheet in Phase 2)
4. **Token display**: Show token count on Download button for premium users? (Recommend: yes, adds urgency)
5. **Canvas CTA label**: "Order Canvas" vs "Get Canvas Print" vs "Turn Into Canvas"? (Recommend: "Order Canvas" - clear action verb)

---

## Risk Assessment

### Low Risk
- ActionRow component: Simple button group, no complex logic
- CanvasConfig extraction: Just moving existing UI into collapsible wrapper
- Analytics: Non-blocking, won't break functionality if telemetry fails

### Medium Risk
- Animation performance: Framer Motion height animations can be janky on low-end mobile
  - **Mitigation**: Test on real device, fallback to instant toggle if <60fps
- State persistence: Ensuring collapsed config doesn't reset selections
  - **Mitigation**: All state in Zustand (already global), no local state for config values

### High Risk
- **None identified** - This is primarily a UI reorganization with no backend changes, no new business logic, and clear rollback path.

---

## Conclusion

This implementation plan provides surgical, phased delivery of progressive disclosure for the Studio right rail. Phase 1 ships quickly with minimal risk, establishing the foundation. Phase 2 layers on conversion optimization and analytics. The approach balances simplicity (no toggle confusion) with premium positioning (canvas is primary CTA), serving both revenue streams without burying either.

**Ready to begin implementation.** Please approve this plan or request changes.
