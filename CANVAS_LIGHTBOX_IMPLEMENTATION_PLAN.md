# Canvas Lightbox + Story Layer Migration - Implementation Plan

**Objective**: Transform Wondertone's canvas ordering experience into a world-class, conversion-optimized flow by establishing a clear three-column layout with story/insights in the right rail and a dedicated canvas checkout lightbox.

**Design Philosophy**: Canva-level UX, Amazon-level conversion optimization, minimal engineering complexity, maximum code reuse.

**Strategic Framework**: Left rail = discovery hub, Center = hero workspace, Right rail = story & upsell column.

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current vs. Target Architecture](#current-vs-target-architecture)
3. [Detailed Requirements](#detailed-requirements)
4. [Component Architecture](#component-architecture)
5. [User Flow Diagrams](#user-flow-diagrams)
6. [Implementation Phases](#implementation-phases)
7. [Visual Specifications](#visual-specifications)
8. [Copy & Messaging](#copy--messaging)
9. [Testing Strategy](#testing-strategy)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

### What We're Building

**Phase A: Story Layer & Right Rail Transformation**
- Move full Story Layer (1500px content) from center column to right rail
- Create pre-upload teaser with style name + color palette chips + descriptive text
- Add curated style recommendations in right rail (horizontally scrollable cards)
- Add secondary "Order Canvas Print" CTA in right rail (below story content)
- Reduce center column scroll by ~60%

**Phase B: Canvas Lightbox Checkout**
- Create full-screen modal (desktop) / sheet (mobile) for canvas configuration
- **Reuse existing CheckoutFormShell** component for checkout steps (no rebuild)
- Include live Canvas-in-Room preview with mini style preview badge
- Add orientation selector in modal (triggers smart crop if needed)
- Optimize for conversion with trust signals ("Ships in 5 days", "4.9/5 rating")
- Modal shows live preview, size/frame/enhancement selection, stepper controls
- Primary CTA in center column + Secondary CTA in right rail both open modal

**Phase C: Orientation & Cleanup**
- Keep orientation pills near preview in center column for easy experimentation
- Add optional "Fine-tune crop" button to launch cropper modal
- Remove redundant canvas config from right rail (modal is now the checkout)
- Polish modal copy and trust signals

**Phase D: QA, Rollout & Telemetry**
- Comprehensive testing (performance, accessibility, cross-browser)
- Staged rollout with feature flag
- Monitor conversion metrics and iterate

### Expected Impact

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Center column scroll depth | ~3000px | ~1200px | **-60%** |
| Scroll fatigue complaints | High | Low | **-80%** |
| Subscription conversion | 15-20% | 25-35% | **+40-75%** |
| Canvas conversion | 8-12% | 10-15% | **+10-25%** |
| Checkout abandonment | 45% | 25% | **-44%** |
| Time to checkout | 3.2 min | 1.8 min | **-44%** |

---

## Current vs. Target Architecture

### Current State (Problems)

```
┌─────────────┬──────────────────────┬─────────────────────┐
│ LEFT RAIL   │ CENTER COLUMN        │ RIGHT RAIL          │
│             │                      │                     │
│ Style       │ Style Preview        │ Orientation (card)  │
│ Categories  │ Action Row           │ Canvas Config       │
│             │ Canvas-in-Room       │ - Size selector     │
│             │ ConfidenceFooter     │ - Frame selector    │
│             │ Story Layer (1500px) │ - Enhancements      │
│             │                      │ - Order summary     │
│             │                      │ - Checkout button   │
└─────────────┴──────────────────────┴─────────────────────┘

❌ Problems:
1. Center column has 3000px of scroll (Story Layer = 1500px)
2. Canvas config in right rail makes ordering look mandatory
3. Orientation card adds visual clutter
4. Checkout flow requires navigation to /checkout page
5. Story Layer competes for attention with primary actions
```

### Target State (Solution)

**Three-Column North Star Layout:**

```
┌─────────────┬──────────────────────┬─────────────────────┐
│ LEFT RAIL   │ CENTER COLUMN        │ RIGHT RAIL          │
│ (Discovery) │ (Hero Workspace)     │ (Story & Upsell)    │
│             │                      │                     │
│ Tokens      │ Sticky Preview Card  │ Story Layer Teaser  │
│ Original    │ Orientation Pills    │ (pre-upload) OR     │
│ Image       │ Action Row:          │ Full Story:         │
│ Tone Lists  │  - Download CTA      │  - Confidence       │
│             │  - Create Canvas     │  - Narrative        │
│             │  - Save Gallery      │  - Palette          │
│             │ Canvas-in-Room       │  - Curator Notes    │
│             │ ConfidenceFooter     │ Curated Styles      │
│             │                      │ (horizontal cards)  │
│             │                      │ [Order Canvas] CTA  │
│             │                      │ (secondary)         │
└─────────────┴──────────────────────┴─────────────────────┘

    [User clicks Center "Create Canvas" OR Right Rail "Order Canvas"]
                            ↓
        ┌───────────────────────────────────────┐
        │  CANVAS CHECKOUT MODAL                │
        │  (Reuses CheckoutFormShell)           │
        │  ┌─────────────────────────────────┐  │
        │  │ [✕]  Configure Your Canvas      │  │
        │  ├─────────────────────────────────┤  │
        │  │ [Canvas-in-Room Preview]        │  │
        │  │ [Mini Style Preview Badge]      │  │
        │  ├─────────────────────────────────┤  │
        │  │ Orientation: ○ ● ○              │  │
        │  │ Size: ○ ● ○ ○                   │  │
        │  │ Frame: ● ○ ○                    │  │
        │  │ Enhancements: ☑ Living Canvas   │  │
        │  ├─────────────────────────────────┤  │
        │  │ ⭐ 4.9/5  📦 Ships in 5 days     │  │
        │  │ 🔒 100% satisfaction guarantee  │  │
        │  ├─────────────────────────────────┤  │
        │  │ Your Order Summary              │  │
        │  │ [Complete Your Order →]         │  │
        │  │ (Uses CheckoutFormShell + Stripe)│  │
        │  └─────────────────────────────────┘  │
        └───────────────────────────────────────┘

✅ Benefits:
1. Clear purpose zones (discovery, hero, context)
2. Center column reduced to 1200px (60% less scroll)
3. Canvas ordering explicitly opt-in (modal pattern)
4. Dual CTAs (center primary + rail secondary) for conversion psychology
5. Story Layer discoverable but not intrusive
6. Checkout reuses existing tested code (low risk)
7. Orientation stays prominent for experimentation
8. Curated recommendations drive style discovery
```

---

## Detailed Requirements

### 1. Story Layer Migration

#### 1.1 Pre-Upload Teaser State

**DECIDED**: Use rich teaser (style name + color palette chips + descriptive text) for visual interest and engagement.

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ RIGHT RAIL                              │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │  ✨                               │   │
│ │  The Story Behind [Style Name]    │   │
│ │                                   │   │
│ │  [Color Palette Chips]            │   │
│ │  ████ ████ ████ ████ ████ ████   │   │
│ │  (6 chips, 40px x 40px each)      │   │
│ │                                   │   │
│ │  [Style description from registry]│   │
│ │  Transform your photo with this   │   │
│ │  unique artistic style...         │   │
│ │                                   │   │
│ │  The full story of this style will│   │
│ │  appear here once your preview is │   │
│ │  ready. Discover the inspiration, │   │
│ │  technique, and artistic vision.  │   │
│ │                                   │   │
│ │  ● ● ● (pulsing dots)             │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Behavior:**
- Renders when `!hasCroppedImage && currentStyle !== 'original-image'`
- Shows style name dynamically: "The Story Behind Impressionist Sunrise"
- Displays color palette chips from `style.colorPalette` (6 colors, 40px squares with rounded corners)
- Shows style description from style registry
- Teaser copy about full story appearing after preview
- Subtle pulsing dots loading indicator
- Professional styling: border, shadow, gradient background

**Why this approach**:
- Creates visual interest before upload
- Educates user about what's coming
- Uses existing palette data from style registry
- Builds anticipation for full story content
- More engaging than collapsed line or empty placeholder

#### 1.2 Post-Upload State (Photo Uploaded & Styled)

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ RIGHT RAIL (Scrollable)                 │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │ 📖 The Story Behind [Style Name]  │   │
│ │                                   │   │
│ │ [Confidence Badge]                │   │
│ │ ⭐ 4.9/5 • Highly Rated           │   │
│ │                                   │   │
│ │ [Narrative Card]                  │   │
│ │ 300-500 word story from curator...│   │
│ │                                   │   │
│ │ [Color Palette with Hex Codes]    │   │
│ │ ████ #4A5568  ████ #ED8936        │   │
│ │                                   │   │
│ │ [Curator Notes / Technique]       │   │
│ │ Brief technical insights...       │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ Try These Styles                  │   │
│ │ (Horizontally scrollable)         │   │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │   │
│ │ │ S1 │ │ S2 │ │ S3 │ │ S4 │ ───→ │   │
│ │ └────┘ └────┘ └────┘ └────┘      │   │
│ │ [Try Style] buttons               │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ [🛍️ Order Canvas Print]           │   │
│ │ (Secondary CTA - black with       │   │
│ │  white outline, less prominent)   │   │
│ │ Gallery-quality prints from $89   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ [Share to Social Buttons]         │   │
│ │ [Copy Caption]                    │   │
│ └───────────────────────────────────┘   │
│         ↓ (User can scroll)             │
└─────────────────────────────────────────┘
```

**Behavior:**
- Renders full `<StoryLayer>` component with enhancements
- **NEW**: Curated style recommendations as horizontally scrollable cards
  - Cards show style thumbnail + name + "Try this style" button
  - On click: highlights style in left rail + triggers preview generation
  - Analytics: track clicks, impressions
- **NEW**: Secondary "Order Canvas Print" CTA
  - Positioned after story content, before share buttons
  - Styled as secondary CTA (less prominent than center column primary)
  - Opens same canvas checkout modal as center CTA
  - Copy: "Keep creating, or turn this into wall art"
- All existing features preserved:
  - Narrative from `getNarrative(style)`
  - Color palette with hex codes
  - Share buttons with clipboard copy
  - IntersectionObserver impression tracking
- Scrollable within right rail container
- Analytics: track secondary CTA clicks separately from primary

**Technical Implementation:**
- Move render from `CanvasPreviewPanel.tsx` → `StickyOrderRail.tsx`
- Use same props: `style`, `previewUrl`, `orientation`, `entitlements`, `onToast`, `onUpgradePrompt`
- Wrap in scrollable container: `max-h-[calc(100vh-200px)] overflow-y-auto`

#### 1.3 Mobile Story Layer Behavior

**DECIDED**: Use drawer/sheet approach to keep center column preview-only on mobile.

**Strategy:**
- **Desktop (>= 1024px)**: Story Layer visible in right rail (as described above)
- **Mobile (< 1024px)**: Story Layer hidden behind "View Story" button
  - Button positioned below Canvas-in-Room preview (or in header)
  - Opens full-screen sheet/drawer from bottom
  - Same content as desktop (story, palette, curated styles, secondary CTA)
  - Close via backdrop, swipe down, or X button
  - Consistent with existing mobile style drawer pattern

**Why drawer approach**:
- Keeps center column preview-focused (maximizes scroll reduction benefit on mobile)
- Story is completely optional for converters
- Reuses existing mobile drawer UX pattern (familiar to users)
- Prevents center column scroll fatigue on small screens

---

### 2. Canvas Checkout Modal

**CRITICAL DECISION**: Reuse existing CheckoutFormShell component instead of rebuilding checkout logic.

**Architecture Strategy**:
- Modal contains configuration UI (orientation, size, frame, enhancements) + live preview
- "Complete Your Order" button either:
  - **Option A (Phase B)**: Navigate to `/checkout` route with pre-filled state (fastest, safest)
  - **Option B (Future)**: Embed CheckoutFormShell directly in modal (better UX, more complex)
- Start with Option A, iterate to Option B if conversion data supports investment
- This avoids duplicating Stripe integration, payment logic, and checkout validation

#### 2.1 Modal Structure & Layout

**Dimensions & Behavior:**
- **Desktop**: 900px width, max-height: 90vh, centered, 60% backdrop opacity with blur
- **Tablet**: 80vw width, max-height: 90vh, centered
- **Mobile**: Full-screen sheet with slide-up animation (100vw x 100vh)
- **Backdrop**: `bg-black/60 backdrop-blur-sm`
- **Animations**: Spring animation (300ms), scale from 0.95 to 1.0, fade backdrop (200ms)
- **Close methods**: ESC key, backdrop click, X button (all should work)
- **Focus trap**: Auto-focus first interactive element, trap tab navigation within modal
- **State persistence**: Save configuration to Zustand on every change (modal can close/reopen without losing config)

**Layout Sections (Top to Bottom):**

```
┌───────────────────────────────────────────────────────┐
│ HEADER                                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [✕] Configure Your Canvas       [Style Name]   │   │
│ └─────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ PREVIEW SECTION                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │                                                 │   │
│ │          [Canvas-in-Room Preview]              │   │
│ │              (Live Updates)                     │   │
│ │                                                 │   │
│ │  ┌────────────┐                                │   │
│ │  │ [Mini      │ ← Floating badge               │   │
│ │  │  Style     │   with style preview           │   │
│ │  │  Preview]  │                                │   │
│ │  └────────────┘                                │   │
│ └─────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ CONFIGURATION SECTION (Scrollable if needed)          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Orientation                                     │   │
│ │ ○ Portrait  ● Square  ○ Landscape              │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Canvas Size                                     │   │
│ │ ○ 8x10"  $89   ○ 12x16"  $129                  │   │
│ │ ● 16x20" $169  ○ 24x36"  $249                  │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Frame Style                                     │   │
│ │ ● Floating Frame  ○ Gallery Wrap  ○ Wood       │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Enhancements                                    │   │
│ │ ☑ Living Canvas AR  +$49  [ℹ️ See Demo]        │   │
│ └─────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ TRUST SIGNALS                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⭐ 4.9/5 from 1,200+ customers                  │   │
│ │ 📦 Ships in 3-5 business days                   │   │
│ │ 🔒 100% satisfaction guarantee                  │   │
│ └─────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ CHECKOUT SECTION                                      │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Your Order                                      │   │
│ │ ┌─────────────────────────────────────────┐     │   │
│ │ │ Impressionist Sunrise • 16x20"      $169│     │   │
│ │ │ Floating Frame                       +$39│     │   │
│ │ │ Living Canvas AR                     +$49│     │   │
│ │ ├─────────────────────────────────────────┤     │   │
│ │ │ Subtotal                             $257│     │   │
│ │ │ Shipping                              $15│     │   │
│ │ │ Tax (estimated)                       $22│     │   │
│ │ ├─────────────────────────────────────────┤     │   │
│ │ │ Total                                $294│     │   │
│ │ └─────────────────────────────────────────┘     │   │
│ │                                                 │   │
│ │ [Complete Your Order →]                         │   │
│ │                                                 │   │
│ │ For FREE users: "You'll receive the            │   │
│ │ unwatermarked canvas and full preview via email"│   │
│ └─────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

#### 2.2 Preview Section Details

**Canvas-in-Room Preview:**
- Reuse existing `<CanvasInRoomPreview>` component
- Enable `enableHoverEffect={true}`
- Show dimensions badge (size updates live)
- Updates in real-time when user changes:
  - Orientation (triggers smart crop if needed)
  - Size (updates dimensions overlay)
  - Frame (updates frame visual)

**Mini Style Preview Badge:**
- **Position**: Floating badge, top-right or bottom-left of Canvas-in-Room
- **Size**: 80px x 80px
- **Content**: Thumbnail of styled image
- **Border**: 2px white border with subtle shadow
- **Purpose**: Reminds user which style they're ordering

**Visual Example:**
```
┌────────────────────────────────────┐
│                                    │
│   [Canvas-in-Room Preview]         │
│                                    │
│                                    │
│             ┌──────────┐           │
│             │          │           │
│             │  Style   │ ← Badge   │
│             │  Preview │           │
│             └──────────┘           │
└────────────────────────────────────┘
```

#### 2.3 Configuration Section Details

**Orientation Selector:**
- 3 radio buttons: Portrait / Square / Landscape
- Current orientation pre-selected
- On change:
  1. Check if smart crop exists for new orientation
  2. If not, trigger `generateSmartCrop()` (existing utility)
  3. Show loading state ("Adapting to [orientation]...")
  4. Update Canvas-in-Room preview
  5. Keep modal open throughout

**Canvas Size Options:**
- Same options as current implementation (from `CANVAS_SIZE_OPTIONS[orientation]`)
- Display as cards with radio buttons
- Show price clearly
- Default to `getDefaultSizeForOrientation(orientation)`

**Frame Style Selector:**
- Same 3 options: Floating Frame / Gallery Wrap / Natural Wood
- Visual previews if possible (or icon representations)
- Default to "Floating Frame"

**Enhancements:**
- Living Canvas AR toggle (same as current)
- Show "+$49" price clearly
- [ℹ️ See Demo] button opens `LivingCanvasModal` (existing)

#### 2.4 Trust Signals Section

**Copy:**
- ⭐ "4.9/5 from 1,200+ customers" (use actual review count from backend if available)
- 📦 "Ships in 3-5 business days"
- 🔒 "100% satisfaction guarantee"

**Visual Design:**
- Light background (white/10 or emerald/10)
- Icons + text in horizontal row
- Small, subtle, professional
- Not overwhelming, just reassuring

#### 2.5 Checkout Section

**Order Summary:**
- Line items:
  - Style name + size (e.g., "Impressionist Sunrise • 16x20"")
  - Frame (if selected)
  - Enhancements (if enabled)
- Subtotal
- Shipping (calculate based on size/location - or show "FREE shipping over $150")
- Tax (estimate based on user location if available, or show "calculated at checkout")
- **Total** (large, bold)

**Checkout Button:**
- Large, prominent, gradient purple
- Copy: "Complete Your Order →"
- On click:
  - Validate all selections
  - Navigate to `/checkout` with state pre-filled
  - OR (future): Embed Stripe checkout directly in modal

**FREE User Messaging:**
- Shown only if `requiresWatermark === true`
- Copy: "You'll receive the unwatermarked canvas and full preview via email"
- Small, reassuring, not alarming
- Positioned below checkout button or in order summary

---

### 3. Orientation Simplification

#### Current State (Right Rail)

```
┌─────────────────────────────────────┐
│ Orientation                         │
│ ┌─────────────────────────────────┐ │
│ │ ○ Portrait  ● Square  ○ Land.   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Problem**: Takes up vertical space in right rail, adds visual clutter.

#### Target State (Center Column, Below Canvas-in-Room)

```
CENTER COLUMN:

[Canvas-in-Room Preview]
      ↓
┌─────────────────────────────────────┐
│     [Change Orientation]            │
│     Current: Square                 │
└─────────────────────────────────────┘
```

**Behavior:**
- Single button: "Change Orientation"
- Shows current orientation: "Current: Square"
- On click: Opens `<CropperModal>` with orientation selector
- User selects new orientation → Smart crop → Modal closes → Preview updates

**Visual Design:**
- Subtle button (not as prominent as Action Row buttons)
- Border: white/20, bg: white/5, hover: white/10
- Text: "Change Orientation" (bold) + "Current: Square" (subtle)
- Centered below Canvas-in-Room preview

**Alternative**: Keep orientation in modal only (remove from main UI entirely)
- Pro: Even simpler main UI
- Con: User must open modal to change orientation

**Decision Point**: Which approach?
- **Option A**: Single button in center column (described above)
- **Option B**: Remove from main UI, only in canvas modal

**Recommendation**: **Option A** - Allows orientation changes without opening checkout modal.

---

## Component Architecture

### New Components

#### 1. `CanvasCheckoutModal.tsx`

**Location**: `src/components/studio/CanvasCheckoutModal.tsx`

**Purpose**: Full-screen/centered modal for canvas configuration + checkout

**Props:**
```typescript
type CanvasCheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // Preview
  currentStyle: StyleOption;
  previewUrl: string;
  croppedImage: string | null;
  // Configuration
  orientation: Orientation;
  onOrientationChange: (orientation: Orientation) => void;
  sizeOptions: CanvasSizeOption[];
  selectedSize: string | null;
  onSizeChange: (sizeId: string) => void;
  // Frame & Enhancements
  floatingFrame: Enhancement | undefined;
  livingCanvas: Enhancement | undefined;
  selectedFrame: 'none' | 'black' | 'white';
  onToggleFloatingFrame: () => void;
  onToggleLivingCanvas: () => void;
  onFrameChange: (frame: 'black' | 'white') => void;
  onLivingCanvasInfoClick: () => void;
  // Order Summary
  currentStyleName: string;
  selectedSizeLabel: string | undefined;
  selectedSizePrice: number | null;
  enabledEnhancements: Enhancement[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  // Checkout
  checkoutDisabled: boolean;
  checkoutError: string | null;
  onCheckout: () => void;
  // User info
  isPremiumUser: boolean;
};
```

**Structure:**
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Panel */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
          <CanvasCheckoutModalContent {...props} />
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### 2. `StoryLayerTeaser.tsx`

**Location**: `src/components/studio/story-layer/StoryLayerTeaser.tsx`

**Purpose**: Pre-upload state for Story Layer

**Props:**
```typescript
type StoryLayerTeaserProps = {
  style: StyleOption;
};
```

**Implementation:**
```tsx
export default function StoryLayerTeaser({ style }: StoryLayerTeaserProps) {
  const palette = useMemo(() => getPalette(style), [style]);

  return (
    <div className="rounded-2xl border-2 border-white/10 bg-white/5 p-6 space-y-4">
      <h3 className="text-lg font-bold text-white">
        📖 The Story Behind {style.name}
      </h3>

      {palette && <PaletteStrip palette={palette} compact />}

      <p className="text-sm text-white/60">
        Upload a photo to discover the full story behind this artistic style.
      </p>
    </div>
  );
}
```

#### 3. `ChangeOrientationButton.tsx`

**Location**: `src/components/studio/ChangeOrientationButton.tsx`

**Purpose**: Single button to open orientation selector

**Props:**
```typescript
type ChangeOrientationButtonProps = {
  currentOrientation: Orientation;
  onClick: () => void;
};
```

**Implementation:**
```tsx
export default function ChangeOrientationButton({
  currentOrientation,
  onClick,
}: ChangeOrientationButtonProps) {
  const orientationLabel = ORIENTATION_PRESETS[currentOrientation].label;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 transition-all text-white"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <div className="text-left">
        <p className="text-sm font-bold">Change Orientation</p>
        <p className="text-xs text-white/60">Current: {orientationLabel}</p>
      </div>
    </button>
  );
}
```

### Modified Components

#### 1. `CanvasPreviewPanel.tsx`

**Changes:**
- **Remove**: Story Layer render (lines 297-331)
- **Remove**: ConfidenceFooter render (lines 294-300) - WAIT, keep this per user request
- **Add**: `ChangeOrientationButton` below Canvas-in-Room preview
- **Keep**: Everything else (Style Preview, Action Row, Canvas-in-Room)

#### 2. `StickyOrderRail.tsx`

**Changes:**
- **Remove**: All canvas config logic (orientation selector, canvas size, frame, checkout)
- **Add**: Story Layer teaser (pre-upload) OR full Story Layer (post-upload)
- **Simplify**: Component becomes just a story content container

#### 3. `StudioConfigurator.tsx`

**Changes:**
- **Add**: State for canvas modal open/close
- **Add**: Handler for opening canvas modal
- **Update**: Action Row `onCanvasClick` to open modal
- **Update**: Prop threading for Story Layer in right rail
- **Add**: Render `<CanvasCheckoutModal>` at root level (like other modals)

---

## User Flow Diagrams

### Flow 1: First-Time User (No Photo Uploaded)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER LANDS ON STUDIO                                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ CENTER: Empty state "Upload a photo"                       │
│ RIGHT: Story Layer Teaser (placeholder)                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS STYLE (before uploading photo)              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ CENTER: Still empty state                                   │
│ RIGHT: Story Layer Teaser updates with style name + palette│
│        "The Story Behind Impressionist Sunrise"            │
│        [Color palette displayed]                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER UPLOADS PHOTO                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ CENTER: Photo uploaded, no style applied yet                │
│ RIGHT: Story Layer Teaser (waiting for style selection)    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. USER SELECTS STYLE                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ CENTER: Style Preview appears, Action Row appears           │
│ RIGHT: Full Story Layer loads (1500px content)             │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Canvas Checkout (Happy Path)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER HAS STYLED PHOTO                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ CENTER: Style Preview + Action Row + Canvas-in-Room        │
│ RIGHT: Full Story Layer (scrollable)                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS "CREATE CANVAS" BUTTON                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CANVAS CHECKOUT MODAL OPENS                             │
│    - Background dims to 60% opacity                         │
│    - Modal fades in + scales up (300ms)                     │
│    - Focus trap activated                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MODAL DISPLAYS                                           │
│    ✅ Canvas-in-Room preview (top)                          │
│    ✅ Mini style preview badge                              │
│    ✅ Orientation: Square (pre-selected)                    │
│    ✅ Size: 12x16" (pre-selected default)                   │
│    ✅ Frame: Floating Frame (pre-selected)                  │
│    ✅ Enhancements: None (user can toggle)                  │
│    ✅ Trust signals (4.9 rating, shipping, guarantee)       │
│    ✅ Order summary: $129 (base price)                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. USER CONFIGURES CANVAS                                  │
│    - Selects 16x20" size → Preview + price update          │
│    - Toggles Living Canvas AR → Price +$49                 │
│    - Changes frame to Gallery Wrap → Preview updates       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ORDER SUMMARY UPDATES IN REAL-TIME                      │
│    Impressionist Sunrise • 16x20"        $169              │
│    Gallery Wrap                           +$0              │
│    Living Canvas AR                      +$49              │
│    ─────────────────────────────────────────               │
│    Subtotal                               $218             │
│    Shipping                                $15             │
│    Tax                                     $19             │
│    ─────────────────────────────────────────               │
│    Total                                  $252             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. USER CLICKS "COMPLETE YOUR ORDER"                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 8A. CURRENT IMPLEMENTATION (Phase 2)                       │
│     - Navigate to /checkout page                           │
│     - Pre-fill all selections                               │
│     - User completes Stripe checkout                        │
└─────────────────────────────────────────────────────────────┘
                         OR
┌─────────────────────────────────────────────────────────────┐
│ 8B. FUTURE IMPLEMENTATION (Phase 3 - Next Pass)            │
│     - Stripe checkout embedded in modal                     │
│     - User never leaves modal                               │
│     - One-click checkout experience                         │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Orientation Change in Modal

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER OPENS CANVAS MODAL                                 │
│    Current orientation: Square                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER SELECTS "PORTRAIT" ORIENTATION                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CHECK IF SMART CROP EXISTS FOR PORTRAIT                 │
│    - Check smartCrops[vertical] in store                   │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↓
    EXISTS                         DOESN'T EXIST
         ↓                              ↓
┌──────────────────┐          ┌──────────────────────────┐
│ 4A. INSTANT      │          │ 4B. GENERATE SMART CROP  │
│     UPDATE       │          │     - Show loading state │
│  - Update preview│          │     - Generate crop      │
│  - Update size   │          │     - Cache result       │
│    options       │          │     - Update preview     │
└──────────────────┘          └──────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MODAL STAYS OPEN, PREVIEW UPDATES                       │
│    - Canvas-in-Room shows portrait orientation             │
│    - Size options update (8x10, 11x14, 16x20, 20x30)       │
│    - Price recalculates based on new default size          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. USER CONTINUES CONFIGURING                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

**Updated Roadmap** (A, B, C, D phases):

### Phase A: Story Layer & Right Rail Transformation (4-5 hours)

**Goal**: Move Story Layer to right rail, add teaser state, curated recommendations, and secondary CTA. Reduce center column scroll dramatically.

**Tasks:**

#### A.1 Create Story Layer Teaser Component (1 hour)
- [ ] Create `src/components/studio/story-layer/StoryLayerTeaser.tsx`
- [ ] Implement rich teaser:
  - [ ] Style name with sparkle icon
  - [ ] 6 color palette chips (40px squares, `style.colorPalette`)
  - [ ] Style description from registry
  - [ ] Teaser copy about full story
  - [ ] Pulsing dots loading indicator
- [ ] Professional styling: border, shadow, gradient background
- [ ] Add prop-types and TypeScript types
- [ ] Test with multiple styles

#### A.2 Add Curated Style Recommendations Component (1 hour)
- [ ] Create `src/components/studio/story-layer/CuratedStyleCards.tsx`
- [ ] Implement horizontally scrollable cards:
  - [ ] Style thumbnail + name
  - [ ] "Try this style" button
  - [ ] On click: highlight in left rail + trigger preview generation
- [ ] Analytics: track `trackCuratedStyleClicked`
- [ ] Responsive: 3-4 cards visible at once, smooth scroll

#### A.3 Add Secondary Canvas CTA Component (30 min)
- [ ] Create `src/components/studio/SecondaryCanvasCTA.tsx`
- [ ] Style as secondary CTA (black bg, white outline, less prominent)
- [ ] Copy: "Order Canvas Print" + "Keep creating, or turn this into wall art"
- [ ] On click: Opens canvas modal (same as primary CTA)
- [ ] Analytics: track `trackSecondaryCanvasCTAClick` with scroll depth

#### A.4 Modify StickyOrderRail (1.5 hours)
- [ ] Open `src/components/studio/StickyOrderRail.tsx`
- [ ] Remove all canvas config sections (keep for Phase C removal):
  - [ ] Mark for deletion: Canvas Size selector
  - [ ] Mark for deletion: Frame Style selector
  - [ ] Mark for deletion: Enhancements section
  - [ ] Mark for deletion: Order Summary
  - [ ] Mark for deletion: Checkout button
- [ ] Add Story Layer render logic:
  ```tsx
  {!hasCroppedImage && currentStyle && (
    <StoryLayerTeaser style={currentStyle} />
  )}

  {hasCroppedImage && currentStyle && previewUrl && entitlements && (
    <Suspense fallback={<StoryLayerFallback />}>
      <StoryLayer
        style={currentStyle}
        previewUrl={previewUrl}
        croppedImage={croppedImage}
        orientation={orientation}
        entitlements={entitlements}
        onToast={onStoryToast}
        onUpgradePrompt={onStoryUpgradePrompt}
      />
    </Suspense>
  )}
  ```
- [ ] Update component props (remove canvas config props, add story props)
- [ ] Add scrollable wrapper: `max-h-[calc(100vh-200px)] overflow-y-auto`

#### 1.3 Update CanvasPreviewPanel (1 hour)
- [ ] Open `src/components/studio/components/CanvasPreviewPanel.tsx`
- [ ] Remove Story Layer render (lines 297-331)
- [ ] Remove Story Layer imports
- [ ] Keep ConfidenceFooter (per user requirement)
- [ ] Verify Canvas-in-Room still renders correctly

#### 1.4 Update StudioConfigurator Prop Threading (1 hour)
- [ ] Open `src/sections/StudioConfigurator.tsx`
- [ ] Pass story props to `StickyOrderRailLazy`:
  ```tsx
  <StickyOrderRailLazy
    // Story Layer props
    currentStyle={currentStyle}
    previewUrl={displayPreviewUrl}
    croppedImage={croppedImage}
    orientation={orientation}
    entitlements={entitlements}
    onStoryToast={showToast}
    onStoryUpgradePrompt={showUpgradeModal}
    hasCroppedImage={hasCroppedImage}
    // Existing props
    canvasConfigExpanded={canvasConfigExpanded}
    onCanvasConfigToggle={handleCanvasConfigToggle}
    mobileRoomPreview={...}
  />
  ```
- [ ] Remove story props from `CanvasPreviewPanel`
- [ ] Verify no TypeScript errors

#### A.5 Add Mobile Story Drawer (30 min)
- [ ] Wrap Story Layer in conditional render based on screen size
- [ ] Desktop (>= 1024px): Render in right rail as-is
- [ ] Mobile (< 1024px): Add "View Story" button below Canvas-in-Room
- [ ] Button opens full-screen sheet/drawer from bottom
- [ ] Reuse existing mobile drawer pattern (same as style drawer)
- [ ] Analytics: track mobile story drawer opens

#### A.6 Testing & Verification (1 hour)
- [ ] Test pre-upload state (rich teaser with palette chips appears)
- [ ] Test post-upload state (full story + curated cards + secondary CTA)
- [ ] Test curated style cards trigger preview generation
- [ ] Test secondary CTA opens modal (track source as 'rail_cta')
- [ ] Test story analytics still fire (IntersectionObserver)
- [ ] Test mobile drawer opens/closes correctly
- [ ] Verify scroll reduction (measure center column height before/after)
- [ ] Test on mobile (story layer in drawer, not center column)

**Deliverables:**
- ✅ Story Layer moved to right rail with rich teaser
- ✅ Curated style recommendations (horizontally scrollable)
- ✅ Secondary canvas CTA in right rail
- ✅ Mobile drawer for story layer
- ✅ Center column scroll reduced by ~60%
- ✅ All story functionality preserved + enhanced
- ✅ Analytics for dual CTAs + curated clicks

---

### Phase B: Canvas Checkout Modal (6-8 hours)

**Goal**: Create world-class canvas checkout modal with configuration UI + live preview. **Reuse CheckoutFormShell** for actual checkout.

**Strategy**: Modal navigates to `/checkout` with pre-filled state (Phase B). Future iteration can embed checkout directly in modal (Phase 3+).

**Tasks:**

#### B.1 Create Modal Component Structure (1.5 hours)
- [ ] Create `src/components/studio/CanvasCheckoutModal.tsx`
- [ ] Set up Framer Motion animations:
  - [ ] Backdrop fade in/out (200ms)
  - [ ] Modal scale + fade (300ms spring)
  - [ ] Exit animations
- [ ] Implement responsive layout:
  - [ ] Desktop: 900px centered modal
  - [ ] Mobile: Full-screen takeover
- [ ] Add close handlers:
  - [ ] Backdrop click
  - [ ] [X] button
  - [ ] ESC key (via useEffect + event listener)
- [ ] Implement focus trap (prevent tab outside modal)

#### 2.2 Build Preview Section (2 hours)
- [ ] Integrate `<CanvasInRoomPreview>`
  - [ ] Enable `enableHoverEffect={true}`
  - [ ] Show dimensions overlay (updates with size selection)
  - [ ] Pass orientation, size, frame props
- [ ] Create mini style preview badge:
  - [ ] 80px x 80px thumbnail
  - [ ] Floating position (top-right or bottom-left)
  - [ ] 2px white border + shadow
  - [ ] Display current style preview image
- [ ] Add live update logic:
  - [ ] Listen to size changes → update dimensions
  - [ ] Listen to frame changes → update frame visual
  - [ ] Listen to orientation changes → trigger smart crop + update

#### 2.3 Build Configuration Section (3 hours)
- [ ] Orientation Selector:
  - [ ] 3 radio buttons (Portrait/Square/Landscape)
  - [ ] Pre-select current orientation
  - [ ] On change: trigger `ensureSmartCropForOrientation()`
  - [ ] Show loading state during smart crop generation
  - [ ] Update size options when orientation changes
- [ ] Canvas Size Selector:
  - [ ] Display options from `CANVAS_SIZE_OPTIONS[orientation]`
  - [ ] Show price for each size
  - [ ] Pre-select default size
  - [ ] Highlight selected size (purple gradient)
- [ ] Frame Style Selector:
  - [ ] 3 options: Floating / Gallery / Natural Wood
  - [ ] Visual icons or thumbnails
  - [ ] Color selector for Floating Frame (Black/White)
  - [ ] Update Canvas-in-Room preview on change
- [ ] Enhancements:
  - [ ] Living Canvas AR toggle
  - [ ] Show "+$49" price
  - [ ] [ℹ️ See Demo] button → opens `LivingCanvasModal`
  - [ ] Update total when toggled

#### 2.4 Add Trust Signals & Checkout (2 hours)
- [ ] Create Trust Signals component:
  - [ ] ⭐ 4.9/5 rating (pull from backend or hardcode)
  - [ ] 📦 Shipping info
  - [ ] 🔒 Guarantee
  - [ ] Subtle styling, light background
- [ ] Build Order Summary:
  - [ ] Line items (style + size, frame, enhancements)
  - [ ] Subtotal calculation
  - [ ] Shipping calculation (or "FREE over $150")
  - [ ] Tax estimation (or "calculated at checkout")
  - [ ] Total (large, bold)
  - [ ] Real-time updates as user changes configuration
- [ ] Checkout Button:
  - [ ] Large purple gradient CTA
  - [ ] "Complete Your Order →"
  - [ ] Disabled state if no size selected
  - [ ] Loading state during checkout
  - [ ] On click: navigate to `/checkout` with pre-filled state
- [ ] FREE User Messaging:
  - [ ] Conditionally render if `requiresWatermark === true`
  - [ ] Copy: "You'll receive the unwatermarked canvas and full preview via email"
  - [ ] Subtle, reassuring tone

#### 2.5 State Management & Integration (1 hour)
- [ ] Add modal state to `StudioConfigurator.tsx`:
  ```tsx
  const [canvasModalOpen, setCanvasModalOpen] = useState(false);
  ```
- [ ] Update Action Row:
  ```tsx
  onCanvasClick={() => setCanvasModalOpen(true)}
  ```
- [ ] Render modal at root level:
  ```tsx
  <Suspense fallback={null}>
    <CanvasCheckoutModal
      isOpen={canvasModalOpen}
      onClose={() => setCanvasModalOpen(false)}
      // ... all other props
    />
  </Suspense>
  ```
- [ ] Persist modal state during session:
  - [ ] Save selections to Zustand when modal closes
  - [ ] Restore selections when modal reopens

#### 2.6 Testing & Polish (1 hour)
- [ ] Test modal open/close animations
- [ ] Test backdrop click-to-close
- [ ] Test ESC key close
- [ ] Test orientation change → smart crop flow
- [ ] Test size/frame/enhancement changes → preview updates
- [ ] Test order summary calculations
- [ ] Test checkout navigation with pre-filled state
- [ ] Test FREE user messaging appears correctly
- [ ] Test mobile full-screen layout
- [ ] Test keyboard navigation (focus trap)

**Deliverables:**
- ✅ Fully functional canvas checkout modal
- ✅ Live preview updates
- ✅ Embedded configuration (orientation, size, frame, enhancements)
- ✅ Trust signals + social proof
- ✅ Order summary with real-time calculations
- ✅ Checkout navigation (foundation for embedded Stripe in Phase 3)

---

### Phase 3: Orientation Simplification (2 hours)

**Goal**: Remove orientation card from right rail, add single "Change Orientation" button below Canvas-in-Room preview.

**Tasks:**

#### 3.1 Create ChangeOrientationButton Component (30 min)
- [ ] Create `src/components/studio/ChangeOrientationButton.tsx`
- [ ] Implement button with:
  - [ ] Icon (rotate/refresh icon)
  - [ ] Text: "Change Orientation"
  - [ ] Subtext: "Current: [orientation]"
  - [ ] Border + subtle background
- [ ] Add onClick handler to open cropper modal

#### 3.2 Remove Orientation from Right Rail (30 min)
- [ ] Open `src/components/studio/StickyOrderRail.tsx`
- [ ] Remove orientation selector card render
- [ ] Remove orientation change handlers
- [ ] Simplify component (now just Story Layer container)

#### 3.3 Add Button to CanvasPreviewPanel (30 min)
- [ ] Open `src/sections/studio/components/CanvasPreviewPanel.tsx`
- [ ] Add `ChangeOrientationButton` below Canvas-in-Room preview:
  ```tsx
  <div className="hidden lg:block w-full max-w-2xl mt-8">
    <CanvasInRoomPreview ... />

    <div className="mt-4">
      <ChangeOrientationButton
        currentOrientation={orientation}
        onClick={handleOpenCropper}
      />
    </div>
  </div>
  ```
- [ ] Add handler to open cropper modal

#### 3.4 Wire Up Cropper Modal (30 min)
- [ ] Add state for cropper modal open/close
- [ ] On button click: Open cropper modal with orientation selector
- [ ] On orientation change: Trigger smart crop → Update preview
- [ ] Close cropper modal after orientation change completes

#### 3.5 Testing (30 min)
- [ ] Test button appears below Canvas-in-Room
- [ ] Test button opens cropper modal
- [ ] Test orientation change flow
- [ ] Test right rail no longer has orientation selector
- [ ] Verify vertical space savings in right rail

**Deliverables:**
- ✅ Orientation selector removed from right rail
- ✅ Single "Change Orientation" button in center column
- ✅ Cropper modal integration
- ✅ Cleaner, simpler UI

---

### Phase 4: Polish, Testing & Optimization (4-6 hours)

**Goal**: Ensure world-class quality - performance, accessibility, analytics, edge cases.

#### 4.1 Performance Optimization (2 hours)
- [ ] Lazy load Canvas Checkout Modal (React.lazy)
- [ ] Memoize expensive calculations (useMemo):
  - [ ] Size options by orientation
  - [ ] Order total calculation
  - [ ] Canvas-in-Room preview props
- [ ] Optimize animations:
  - [ ] Use GPU-accelerated transforms
  - [ ] Respect `prefers-reduced-motion`
  - [ ] Avoid layout shifts
- [ ] Bundle size check:
  - [ ] Run `npm run build:analyze`
  - [ ] Ensure modal doesn't balloon bundle
  - [ ] Check for duplicate dependencies

#### 4.2 Accessibility (1 hour)
- [ ] Modal:
  - [ ] Add `role="dialog"` and `aria-modal="true"`
  - [ ] Implement focus trap (focus stays inside modal)
  - [ ] Focus close button on open
  - [ ] Return focus to trigger button on close
  - [ ] Add `aria-label` to close button
- [ ] Keyboard navigation:
  - [ ] ESC closes modal
  - [ ] Tab navigates through interactive elements
  - [ ] Enter/Space activates buttons
- [ ] Screen reader support:
  - [ ] Add `aria-live` region for order total updates
  - [ ] Add descriptive labels for radio buttons
  - [ ] Test with VoiceOver (Mac) or NVDA (Windows)

#### 4.3 Analytics & Telemetry (1 hour)
- [ ] Add tracking events:
  - [ ] Modal opened: `trackCanvasModalOpen(userTier, styleId)`
  - [ ] Orientation changed in modal: `trackModalOrientationChange()`
  - [ ] Size selected: `trackCanvasSizeSelect(size, price)`
  - [ ] Frame selected: `trackFrameSelect(frame)`
  - [ ] Enhancement toggled: `trackEnhancementToggle(enhancement)`
  - [ ] Checkout clicked: `trackModalCheckout(total, items)`
  - [ ] Modal abandoned: `trackModalAbandoned(configuredItems)`
- [ ] Story Layer analytics:
  - [ ] Verify existing events still fire
  - [ ] Track teaser impressions
  - [ ] Track right rail scroll depth
- [ ] A/B test preparation:
  - [ ] Add feature flag: `VITE_CANVAS_LIGHTBOX_ENABLED`
  - [ ] Log variant assignment to analytics

#### 4.4 Edge Case Testing (1-2 hours)
- [ ] Test error states:
  - [ ] Smart crop generation fails → Show fallback
  - [ ] Checkout API fails → Show error message
  - [ ] No size selected → Disable checkout button
- [ ] Test loading states:
  - [ ] Smart crop generating → Show spinner
  - [ ] Canvas-in-Room loading → Show skeleton
  - [ ] Checkout processing → Disable button + show loading
- [ ] Test orientation changes:
  - [ ] Square → Portrait → Landscape → back to Square
  - [ ] Verify size options update correctly
  - [ ] Verify price recalculates
- [ ] Test modal state persistence:
  - [ ] Configure canvas → Close modal → Reopen → Verify config saved
  - [ ] Change style → Reopen modal → Verify config reset
- [ ] Test FREE user flow:
  - [ ] Verify watermark messaging appears
  - [ ] Verify checkout still works
  - [ ] Verify email messaging is clear

#### 4.5 Cross-Browser Testing (1 hour)
- [ ] Chrome (Desktop + Mobile)
- [ ] Safari (Desktop + iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Test on different screen sizes:
  - [ ] Mobile: 375px, 414px
  - [ ] Tablet: 768px, 1024px
  - [ ] Desktop: 1280px, 1920px

**Deliverables:**
- ✅ Optimized performance (no jank, smooth animations)
- ✅ Full accessibility compliance
- ✅ Comprehensive analytics
- ✅ All edge cases handled gracefully
- ✅ Cross-browser compatibility verified

---

## Visual Specifications

### Color Palette

```
Background:
- Modal backdrop: rgba(0, 0, 0, 0.6) with backdrop-blur
- Modal surface: bg-slate-900
- Card backgrounds: bg-white/5 to bg-white/10

Borders:
- Default: border-white/20
- Hover: border-white/30
- Active: border-purple-400

Text:
- Primary: text-white
- Secondary: text-white/70
- Tertiary: text-white/60

Accents:
- Primary CTA: bg-gradient-cta (purple gradient)
- Success: text-emerald-300, bg-emerald-500/20
- Warning: text-amber-300, bg-amber-500/20
- Trust signals: text-white/70 with emerald/blue accents
```

### Typography

```
Headings:
- Modal title: text-2xl font-bold
- Section headers: text-lg font-bold
- Card titles: text-base font-bold

Body:
- Primary: text-sm
- Secondary: text-xs
- Tertiary: text-[10px]

Buttons:
- Primary CTA: text-base font-bold
- Secondary: text-sm font-semibold
```

### Spacing

```
Modal:
- Padding (desktop): p-8
- Padding (mobile): p-6
- Section spacing: space-y-6

Cards:
- Padding: p-5 to p-6
- Margin between: gap-4

Buttons:
- Padding: px-6 py-3.5 (large), px-4 py-2.5 (medium)
- Border radius: rounded-2xl (modal), rounded-xl (cards/buttons)
```

### Animations

```typescript
// Modal entrance
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}

// Backdrop entrance
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.2 }}

// Canvas-in-Room preview update
transition={{ duration: 0.15, ease: 'easeInOut' }}

// Loading spinner
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
```

---

## Copy & Messaging

### Modal Header
- **Title**: "Configure Your Canvas"
- **Style badge**: "[Style Name]" (e.g., "Impressionist Sunrise")

### Configuration Sections
- **Orientation**: "Orientation"
- **Size**: "Canvas Size"
- **Frame**: "Frame Style"
- **Enhancements**: "Enhancements"

### Trust Signals (Modal Footer)
- ⭐ "4.9/5 from 1,200+ customers" (use actual review count if available)
- 📦 "Ships in 5 days" (concise, confident)
- 🔒 "100% satisfaction guarantee"
- **Styling**: Small, subtle, professional - reassuring but not overwhelming

### CTAs
**Primary CTA (Center Column)**:
- "Create Canvas" (with 4.9 star badge)
- Subtext: "Gallery-quality prints"

**Secondary CTA (Right Rail)**:
- "Order Canvas Print" or "Turn This Into Wall Art"
- Subtext: "Keep creating, or turn this into wall art"
- Styled as black background with white outline (less prominent than primary)

**Both CTAs open the same canvas modal**

### Order Summary
- **Header**: "Your Order"
- **Line items**: "[Style Name] • [Size]"
- **Enhancements**: "[Enhancement Name]"
- **Subtotal**: "Subtotal"
- **Shipping**: "Shipping" or "FREE shipping"
- **Tax**: "Tax (estimated)" or "Tax (calculated at checkout)"
- **Total**: "Total"

### Checkout Button
- **Primary**: "Complete Your Order →"
- **Loading**: "Processing..."
- **Disabled**: "Select a size to continue"

### FREE User Messaging
- "You'll receive the unwatermarked canvas and full preview via email"
- Positioned below checkout button, text-xs, text-white/60

### Story Layer Teaser (Pre-Upload)
- **Title**: "📖 The Story Behind [Style Name]"
- **Body**: "Upload a photo to discover the full story behind this artistic style."

### Change Orientation Button
- **Primary**: "Change Orientation"
- **Secondary**: "Current: [orientation]"

---

## Testing Strategy

### Unit Tests

**Components to test:**
- `CanvasCheckoutModal` - modal open/close, prop passing
- `StoryLayerTeaser` - renders palette, shows correct style name
- `ChangeOrientationButton` - displays current orientation, onClick fires

**Test cases:**
```typescript
describe('CanvasCheckoutModal', () => {
  it('renders when isOpen is true', () => {});
  it('does not render when isOpen is false', () => {});
  it('calls onClose when backdrop is clicked', () => {});
  it('calls onClose when ESC key is pressed', () => {});
  it('updates preview when size changes', () => {});
  it('calculates total correctly', () => {});
  it('shows FREE user messaging when requiresWatermark is true', () => {});
});

describe('StoryLayerTeaser', () => {
  it('displays style name', () => {});
  it('renders color palette', () => {});
  it('shows teaser text', () => {});
});
```

### Integration Tests

**User flows to test:**
1. Open modal → Configure canvas → Checkout
2. Change orientation → Verify smart crop triggers
3. Toggle enhancement → Verify price updates
4. Close modal → Reopen → Verify state persists

**Test with Playwright:**
```typescript
test('canvas checkout flow', async ({ page }) => {
  await page.goto('/create');
  await page.click('[data-testid="create-canvas-button"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.click('[data-size="16x20"]');
  await expect(page.locator('[data-testid="order-total"]')).toContainText('$169');
  await page.click('[data-testid="checkout-button"]');
  await expect(page).toHaveURL('/checkout');
});
```

### Manual Testing Checklist

**Modal Behavior:**
- [ ] Modal opens smoothly (no jank)
- [ ] Modal closes on backdrop click
- [ ] Modal closes on [X] button click
- [ ] Modal closes on ESC key
- [ ] Focus traps inside modal
- [ ] Focus returns to trigger button on close

**Configuration:**
- [ ] Orientation change triggers smart crop
- [ ] Size selection updates price
- [ ] Frame selection updates preview
- [ ] Enhancement toggle updates price
- [ ] All changes update order summary in real-time

**Preview:**
- [ ] Canvas-in-Room shows correct orientation
- [ ] Mini style preview badge displays
- [ ] Preview updates smoothly (no flicker)

**Checkout:**
- [ ] Total calculates correctly
- [ ] Checkout button navigates to /checkout
- [ ] FREE user messaging shows for free tier
- [ ] Error states display correctly

**Story Layer:**
- [ ] Teaser shows before photo upload
- [ ] Full story shows after photo upload
- [ ] Story scrollable in right rail
- [ ] Analytics fire correctly

### Performance Testing

**Metrics to measure:**
- [ ] Modal open time: < 300ms
- [ ] Preview update time: < 150ms
- [ ] Smart crop generation: < 2s
- [ ] Lighthouse performance score: > 90
- [ ] Bundle size increase: < 50kb gzipped

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse CI
- `npm run build:analyze` (bundle size)

---

## Success Metrics

### Primary Metrics (30-day post-launch)

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Subscription Conversion** | 15-20% | 25-35% | Stripe webhooks + GA4 |
| **Canvas Conversion** | 8-12% | 10-15% | Checkout completions / modal opens |
| **Checkout Abandonment** | 45% | 25% | Modal opens / checkout completions |
| **Time to Checkout** | 3.2 min | 1.8 min | GA4 user timings |
| **Scroll Depth (Center)** | 3000px avg | 1200px avg | GA4 scroll tracking |
| **Modal Abandonment** | N/A | < 30% | Modal opens / (completions + closes) |

### Secondary Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Story Layer Impressions | 60% | 70% | IntersectionObserver events |
| Story Layer Engagement | 12% | 15% | Clicks / impressions |
| Orientation Changes | 8% | 10% | Orientation change events |
| Enhancement Adoption | 5% | 8% | Living Canvas AR toggles |
| Mobile Modal Usage | N/A | > 25% | Device type + modal opens |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Modal Load Time | < 300ms | Performance API |
| Preview Update Time | < 150ms | Performance API |
| Modal Animation Smoothness | 60 FPS | Chrome DevTools |
| Accessibility Score | 100 | Lighthouse |
| Mobile Usability | No issues | Google Search Console |

### Analytics Events to Track

**Implementation-Ready Event Schema** (copy-paste into analytics.ts):

```typescript
// Modal events
trackCanvasModalOpen(params: {
  source: 'center_cta' | 'rail_cta';  // Dual CTA tracking
  userTier: string;
  styleId: string;
  hasConfiguredBefore: boolean;
})

trackCanvasModalClose(params: {
  reason: 'backdrop' | 'x_button' | 'esc_key' | 'purchase_complete';
  configuredItems: string[];  // ['size', 'frame', 'living_canvas']
  timeSpent: number;  // milliseconds
})

trackCanvasModalCheckout(params: {
  total: number;
  items: OrderItem[];
  timeSpent: number;  // time from modal open to checkout click
})

// Configuration events
trackCanvasSizeSelected(params: {
  size: string;  // '16x20'
  price: number;
  previousSize: string | null;
})

trackCanvasFrameToggled(params: {
  frame: 'floating_black' | 'floating_white' | 'gallery_wrap' | 'natural_wood';
  previousFrame: string | null;
})

trackCanvasEnhancementToggled(params: {
  enhancement: 'living_canvas' | 'other';
  enabled: boolean;
  price: number;
})

trackModalOrientationChanged(params: {
  from: Orientation;
  to: Orientation;
  smartCropRequired: boolean;
  smartCropDuration?: number;  // if crop was needed
})

// Story Layer events
trackStoryImpressionInRail(params: {
  styleId: string;
  userTier: string;
  source: 'teaser' | 'full_story';
})

trackStoryTeaserView(params: {
  styleId: string;
  hasUploadedPhoto: boolean;
})

trackStoryRailScroll(params: {
  depth: number;  // scroll percentage (0-100)
  styleId: string;
})

trackCuratedStyleClicked(params: {
  currentStyleId: string;
  clickedStyleId: string;
  position: number;  // position in carousel (1-indexed)
})

trackSecondaryCanvasCTAClick(params: {
  source: 'right_rail';
  styleId: string;
  scrollDepth: number;  // how far user scrolled before clicking
})
```

**Key improvements over original schema**:
- Source tracking for dual CTAs (center vs right rail)
- Smart crop duration tracking for performance analysis
- Curated style click tracking
- Scroll depth when secondary CTA is clicked
- `hasConfiguredBefore` flag to detect returning modal users
- More granular frame options (includes color selection)

---

## Risk Mitigation

### Technical Risks

**Risk 1: Modal Performance on Low-End Devices**
- **Impact**: Janky animations, slow load times
- **Mitigation**:
  - Lazy load modal component
  - Use GPU-accelerated animations
  - Test on low-end devices (throttled CPU)
  - Provide reduced-motion fallback

**Risk 2: Smart Crop Generation Delays**
- **Impact**: User waits > 2s for orientation change
- **Mitigation**:
  - Show clear loading state
  - Pre-generate smart crops in background (when idle)
  - Cache aggressively
  - Provide "Skip crop" option if generation takes > 5s

**Risk 3: State Synchronization Issues**
- **Impact**: Modal shows stale data, price calculations wrong
- **Mitigation**:
  - Use Zustand for single source of truth
  - Memoize calculations with proper dependencies
  - Add comprehensive unit tests
  - Log state changes in dev mode

### UX Risks

**Risk 1: Users Don't Discover Story Layer in Right Rail**
- **Impact**: Engagement drops, value prop diminished
- **Mitigation**:
  - Add scroll hint/arrow on first visit
  - Track scroll depth, iterate if < 50% reach Story Layer
  - Consider adding "Discover Story" badge that pulses

**Risk 2: Modal Feels Too Complex**
- **Impact**: Users abandon checkout, conversion drops
- **Mitigation**:
  - Design for progressive disclosure (show basics first)
  - Use visual hierarchy (important items larger)
  - Add helper text / tooltips
  - A/B test simplified vs. full version

**Risk 3: Mobile Modal Unusable**
- **Impact**: Mobile users can't complete checkout
- **Mitigation**:
  - Test on real devices (iPhone SE, Android mid-range)
  - Ensure all controls thumb-friendly (44px min)
  - Avoid horizontal scroll
  - Test with iOS Safari (strict modal rendering)

### Business Risks

**Risk 1: Canvas Sales Drop**
- **Impact**: Revenue decreases despite better UX
- **Mitigation**:
  - A/B test before full rollout
  - Monitor canvas conversion daily for 2 weeks
  - Rollback if conversion drops > 15%
  - Iterate on modal copy/design based on data

**Risk 2: Increased Support Tickets**
- **Impact**: Users confused by new flow
- **Mitigation**:
  - Add in-modal help text
  - Update help center docs
  - Monitor support tickets for common issues
  - Prepare support team with FAQs

---

## Rollout Strategy

### Phase 1: Internal Testing (Week 1)
- [ ] Deploy to staging
- [ ] Team walkthrough + feedback session
- [ ] Fix critical bugs
- [ ] Polish based on team input

### Phase 2: Beta Testing (Week 2)
- [ ] Deploy to 5% of users (via feature flag)
- [ ] Monitor analytics hourly
- [ ] Collect user feedback (optional survey)
- [ ] Fix any discovered issues

### Phase 3: Gradual Rollout (Week 3-4)
- [ ] 25% rollout (if metrics positive)
- [ ] 50% rollout (if metrics hold)
- [ ] 100% rollout (if all green)
- [ ] Monitor for 2 weeks post-100%

### Phase 4: Iteration (Week 5+)
- [ ] Analyze conversion data
- [ ] Identify drop-off points
- [ ] A/B test improvements
- [ ] Plan Phase 3 (embedded Stripe checkout)

---

## Next Steps

### Immediate Actions
1. **Review & Approve Plan** - Ensure alignment on all decisions
2. **Answer Open Questions**:
   - Story Layer teaser: Option A (palette + text) or Option B (dotted rectangle)?
   - Orientation: Keep button in center column or remove entirely?
   - Mobile Story Layer: Drawer, button, or center column?
3. **Finalize Visual Design** - Create high-fidelity mockups in Figma (optional)
4. **Begin Phase 1** - Story Layer migration (lowest risk, highest impact)

### Future Enhancements (Phase 3+)
- Embed Stripe checkout directly in modal
- Add canvas material preview (show texture differences)
- Implement "Save Configuration" feature (bookmark a canvas config)
- Add "Gift This Canvas" option
- Create canvas configurator for existing gallery items

---

## Appendix

### Component File Tree

```
src/
├── components/
│   └── studio/
│       ├── CanvasCheckoutModal.tsx (NEW)
│       ├── ChangeOrientationButton.tsx (NEW)
│       └── story-layer/
│           ├── StoryLayer.tsx (EXISTING - moved to right rail)
│           └── StoryLayerTeaser.tsx (NEW)
├── sections/
│   ├── StudioConfigurator.tsx (MODIFIED)
│   └── studio/
│       └── components/
│           ├── CanvasPreviewPanel.tsx (MODIFIED - Story Layer removed)
│           └── StickyOrderRail.tsx (MODIFIED - Canvas config removed, Story added)
└── utils/
    └── analytics.ts (MODIFIED - new events added)
```

### Dependencies

**No new npm packages required** - all functionality uses existing dependencies:
- Framer Motion (already installed)
- Zustand (already installed)
- React Router (already installed)
- Existing utility functions (smart crop, canvas sizes, etc.)

### Estimated Timeline (Updated)

| Phase | Duration | Complexity | Risk |
|-------|----------|------------|------|
| Phase A: Story Layer & Right Rail | 4-5 hours | Low | Low (mostly UI moves) |
| Phase B: Canvas Checkout Modal | 6-8 hours | Medium | Low (reuses checkout) |
| Phase C: Orientation & Cleanup | 2-3 hours | Low | Low (removal + polish) |
| Phase D: QA, Rollout & Telemetry | 3-4 hours | Medium | Medium (cross-browser) |
| **Total Development Time** | **15-20 hours** | **Medium** | **Low-Medium** |

**Key Time Savings vs. Original Plan**:
- **-3 hours**: Reusing CheckoutFormShell instead of rebuilding checkout
- **-2 hours**: Simpler orientation approach (keep pills, no complex button logic)
- **Total saved: 5 hours** (from 18-24h → 15-20h)

**Calendar Timeline (Conservative):**
- Week 1: Phase 1 + Phase 2 (80% complete)
- Week 2: Phase 2 (100%) + Phase 3 + Phase 4
- Week 3: Testing, bug fixes, polish
- Week 4: Gradual rollout + monitoring

---

## Sign-Off

**Plan Status**: ✅ Ready for Review

**Required Approvals:**
- [ ] Product Owner (alignment on UX decisions)
- [ ] Design Lead (visual specifications approved)
- [ ] Engineering Lead (technical approach validated)

**Open Questions for Review:**
1. Story Layer teaser: Option A or Option B?
2. Mobile Story Layer placement: Drawer, button, or center column?
3. Any additional trust signals or copy changes needed?

**Once approved, we'll proceed with Phase 1 implementation.** 🚀
