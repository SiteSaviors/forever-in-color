# Complete Flow Map with Timing & States
## Version 2.0 - Updated with Multi-Revenue Strategy

**Last Updated**: October 6, 2025
**Revenue Model**: Canvas Sales + Digital Subscriptions + Watermark Removal
**North Star**: Time-to-Wow < 10 seconds

---

## STATE 0: HERO SECTION - STYLE CAROUSEL
**Route**: `/` (Homepage)
**Time**: 0:00 (Page load)
**Auth**: NONE REQUIRED

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  HERO HEADLINE (Center, Large)                              │
│  "Transform Your Memories Into Museum-Quality Art"          │
│                                                              │
│  SUBHEADLINE                                                │
│  "AI-powered canvas art that brings your photos to life"    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PRIMARY CTA                                           │ │
│  │  [Upload Your Photo to Start the Magic →]             │ │
│  │  Large gradient button with glow                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ──────── Or Browse Styles First ────────                   │
│                                                              │
│  STYLE CAROUSEL (6-8 styles, horizontal scroll):            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │  [Image]  │ │  [Image]  │ │  [Image]  │ │  [Image]  │  │
│  │ Watercolor│ │ Oil Paint │ │ Charcoal  │ │ Abstract  │  │
│  │  Dreams   │ │  Classic  │ │  Sketch   │ │  Fusion   │  │
│  │           │ │           │ │           │ │           │  │
│  │ [Try This]│ │ [Try This]│ │ [Try This]│ │ [Try This]│  │
│  │  Style →  │ │  Style →  │ │  Style →  │ │  Style →  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                              │
│  Hover behavior: Image crossfades to show ORIGINAL photo    │
│  Label updates: "Hover to see original"                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Style Carousel Card Interaction

**Default State**:
- Shows: AI-generated art result (style applied)
- Label: Style name + "Hover to see original"

**Hover State** (Desktop):
- Crossfade animation (300ms)
- Shows: Original photo used for transformation
- Label: "Original photo"

**Tap State** (Mobile):
- Toggle between original and result
- Tap again to toggle back

**Click "Try This Style"**:
- Pre-selects that style
- Navigates to STATE 1 (Upload interface)
- First generation will prioritize selected style

### Technical Implementation

```typescript
// StyleCarouselCard.tsx
interface StyleExample {
  id: string;
  name: string;
  originalPhoto: string;  // URL to original photo
  resultPhoto: string;    // URL to transformed result
}

const StyleCarouselCard = ({ style }: { style: StyleExample }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setShowOriginal(true)}
      onMouseLeave={() => setShowOriginal(false)}
      onClick={() => setShowOriginal(!showOriginal)} // Mobile toggle
    >
      {/* Result image */}
      <img
        src={style.resultPhoto}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          showOriginal ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Original image */}
      <img
        src={style.originalPhoto}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          showOriginal ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white font-semibold">{style.name}</p>
        <p className="text-white/60 text-xs">
          {showOriginal ? "Original photo" : "Hover to see original"}
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleTryStyle(style.id);
        }}
        className="absolute top-4 right-4 px-4 py-2 bg-gradient-cta text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Try This Style →
      </button>
    </div>
  );
};
```

### Analytics Events

```typescript
// When user hovers over style card
trackEvent('style_carousel_hover', {
  style_id: string,
  hover_duration_ms: number
});

// When user clicks "Try This Style"
trackEvent('style_preselected', {
  style_id: string,
  source: 'hero_carousel'
});
```

---

## STATE 1: PRODUCT PAGE - HERO WITH UPLOAD & CAROUSEL
**Route**: `/product` (or `/product?preselected_style=watercolor`)
**Time**: 0:02 (2 seconds from homepage load)
**Auth**: NONE REQUIRED

**Note**: This is functionally the same as STATE 0 (Homepage). The `/product` route is the main entry point.

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                │
│                                                              │
│  LARGE HEADLINE (Center, Large)                             │
│  "Transform Your Memories Into Museum-Quality Art"          │
│                                                              │
│  SUBHEADLINE                                                │
│  "AI-powered canvas art that brings your photos to life"    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PRIMARY CTA                                           │ │
│  │  [Upload Your Photo to Start the Magic →]             │ │
│  │  Large gradient button with glow                      │ │
│  │  (Triggers file picker)                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ──────── Or Browse Styles First ────────                   │
│                                                              │
│  STYLE CAROUSEL (6-8 styles, horizontal scroll):            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │  [Image]  │ │  [Image]  │ │  [Image]  │ │  [Image]  │  │
│  │ Watercolor│ │ Oil Paint │ │ Charcoal  │ │ Abstract  │  │
│  │  Dreams   │ │  Classic  │ │  Sketch   │ │  Fusion   │  │
│  │           │ │           │ │           │ │           │  │
│  │ [Try This]│ │ [Try This]│ │ [Try This]│ │ [Try This]│  │
│  │  Style →  │ │  Style →  │ │  Style →  │ │  Style →  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                              │
│  Hover behavior: Image crossfades to show ORIGINAL photo    │
│  Label updates: "Hover to see original"                     │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  Below fold (optional):                                     │
│  - Trust signals (reviews, recent orders)                   │
│  - "How it works" (3-step process)                          │
│  - Example gallery                                          │
└──────────────────────────────────────────────────────────────┘
```

### Style Carousel Interaction

**Same as STATE 0** - See above for full details

**Default State**: Shows AI-generated art result
**Hover State**: Crossfade to original photo (300ms)
**Mobile**: Tap to toggle between result and original

### User Actions (Two Primary Paths)

**Path A: Upload First** (Traditional flow)
1. User clicks "Upload Your Photo to Start the Magic" CTA button
2. File picker opens
3. User selects photo → Triggers STATE 2 (Cropper)

**Path B: Browse Styles First** (Discovery flow)
1. User scrolls to style carousel
2. User hovers over styles (sees before/after)
3. User clicks "Try This Style" on preferred style
4. Style is pre-selected (`?preselected_style=watercolor` query param)
5. File picker opens
6. User selects photo → Triggers STATE 2 (Cropper)
7. First generation will prioritize the pre-selected style

### Alternate Upload Methods

- **Drag & Drop**: User can drag image directly onto the hero section (entire viewport becomes dropzone on dragover)
- **Mobile Camera**: On mobile, CTA button includes camera option via `capture="environment"`

### If User Came From Homepage (STATE 0)

If user clicked "Upload Photo" on homepage and was redirected to `/product`:
- Same experience as STATE 1
- No difference in behavior

### System Actions (On Upload)

1. Validate file (size <10MB, format: image/jpeg|png)
2. Generate data URI (client-side)
3. Auto-detect orientation via ML (portrait/square/landscape)
4. Store: `uploadedImage`, `selectedOrientation`, `preselectedStyle` (if applicable)
5. IMMEDIATELY transition to STATE 2 (Cropper)

**Timing**: <1 second validation → instant transition

---

## STATE 2: CROPPER INTERFACE (Auto-Opens)
**Route**: `/product` (same page, modal/overlay)
**Time**: 0:03 (1 second after upload)

### Full-Screen Overlay

```
┌──────────────────────────────────────────────────────────────┐
│  "Perfect your framing"                                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │    [Uploaded photo with crop overlay]                  │  │
│  │    React-easy-crop component                           │  │
│  │                                                         │  │
│  │    Pinch/zoom/drag enabled                             │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Orientation selector (auto-selected based on detection):    │
│  ○ Portrait  ● Square  ○ Landscape                           │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ Back            │  │ Continue with Cropped Photo →    │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### User Actions
- Adjust crop area (pinch/zoom/drag)
- Select orientation (portrait/square/landscape)
- Click "Continue with Cropped Photo"

### System Actions

1. Generate cropped image (canvas operation, client-side)
2. Store: `uploadedImage`, `croppedImage`, `selectedOrientation`
3. **IMMEDIATELY start preview generation** (background, parallel)
4. Transition to STATE 3

**Timing**: <500ms crop processing → instant transition

**Key Change**: Orientation is DEFAULT, not locked. User can re-crop or change orientation later in Studio.

---

## STATE 3: STYLE SELECTION - INTELLIGENT LOADING
**Route**: `/product`
**Time**: 0:05 (2 seconds after crop complete)
**Background**: **PREVIEW GENERATION STARTED** (3 styles in parallel)

### Header
"Your photo is being transformed..."

### Main Canvas Preview (Center, Large)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │    [User's cropped photo with blur effect]             │  │
│  │                                                         │  │
│  │    Shimmer overlay animation                           │  │
│  │    "✨ Creating your masterpiece..."                   │  │
│  │                                                         │  │
│  │    Progress: ▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 60%                   │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Style Grid (Below preview, 2 rows × 3 cols)

```
STYLE CARDS (showing placeholders initially):
┌─────────┐ ┌─────────┐ ┌─────────┐
│ ⭐      │ │         │ │         │  Row 1: Recommended
│ Water-  │ │ Classic │ │ Modern  │  (based on photo analysis)
│ color   │ │ Oil     │ │ Pastel  │
│ Dreams  │ │ Paint   │ │ Bliss   │  [Shimmer loading state]
│ LOADING │ │ LOADING │ │ LOADING │
└─────────┘ └─────────┘ └─────────┘
```

### System Background Process (Parallel)

1. **Intelligent recommendation engine** analyzes photo
   - Colors, content, composition → 3 recommended styles
   - If user came from hero carousel with preselected style, prioritize that one

2. **Generate preview for TOP recommendation** (Watercolor Dreams)
   - API call: `generateAndWatermarkPreview()`
   - Watermark: "WONDERTONE" diagonal, 20% opacity

3. **Generate previews for 2nd & 3rd recommendations** (parallel)

4. **As EACH preview completes** → update card, animate reveal

### Timing Targets

- **0:08** (3s from STATE 3 entry): First preview ready ✨ **WOW MOMENT**
- **0:10** (5s): Second preview ready
- **0:12** (7s): Third preview ready

### Generation Counter Logic

```typescript
// State management
interface GenerationState {
  totalGenerations: number;        // Lifetime counter
  sessionGenerations: number;      // Current session
  remainingFreeGenerations: number; // 3 for anonymous, 8 for account
  isAuthenticated: boolean;
  isSubscriber: boolean;
}

// After each generation completes
if (totalGenerations >= 3 && !isAuthenticated) {
  // Trigger account creation prompt (STATE 3B)
  showAccountCreationPrompt();
}

if (totalGenerations >= 8 && !isSubscriber) {
  // Hard gate - must create account or subscribe
  showSubscriptionGate();
}
```

---

## STATE 3A: FIRST PREVIEW REVEAL (THE "WOW" MOMENT)
**Route**: `/product`
**Time**: 0:08 (8 seconds from upload click)
**Critical**: 40% of purchase decisions happen here

### Animation Sequence (1.2 seconds total)

1. Blur clears from canvas (0-400ms)
2. Preview scales in with bounce (400-800ms)
3. Subtle confetti burst (800-1000ms)
4. Success checkmark appears (1000-1200ms)

### Main Canvas Preview

```
┌──────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │    [AI-GENERATED WATERCOLOR PREVIEW]                   │  │
│  │    Full resolution, watermarked                        │  │
│  │    Scale: 1.0, opacity: 1.0                            │  │
│  │                                                         │  │
│  │    Watermark: "WONDERTONE" diagonal, 20% opacity       │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  "Watercolor Dreams" - ✓ Created                              │
│  [💖 Love it] [👁️ View Fullscreen] [🔓 Remove Watermark]    │
└──────────────────────────────────────────────────────────────┘
```

### Style Grid Updates

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ ⭐ ✓    │ │ Classic │ │ Modern  │
│ [READY] │ │ Oil     │ │ Pastel  │  First card shows preview
│ Water-  │ │ Paint   │ │ Bliss   │  with purple border (selected)
│ color   │ │ LOADING │ │ LOADING │  Others still generating
│ Dreams  │ │ 73%...  │ │ 45%...  │
└─────────┘ └─────────┘ └─────────┘
```

### AR Modal (2 seconds after preview reveal)

**Note**: This is DISMISSIBLE, not blocking.

```
┌──────────────────────────────────────────────────────────────┐
│  ✨ Want to See It in Your Space?                            │
│                                                               │
│  [QR Code] ← Scan with your phone                            │
│                                                               │
│  View this artwork on your wall using AR                     │
│  No app required - instant preview                           │
│                                                               │
│  [Maybe Later]  [Show Me →]                                  │
└──────────────────────────────────────────────────────────────┘
```

### Bottom Bar (5 seconds after first preview, fades in)

```
┌──────────────────────────────────────────────────────────────┐
│  Watercolor Dreams • Square • From $89                       │
│  [Continue to Customize →]                                   │
└──────────────────────────────────────────────────────────────┘
```

### User Actions (Multiple Paths)

- **Path A**: Scan QR for AR → STATE 3B (AR Preview)
- **Path B**: Dismiss AR modal → Stay in STATE 3A
- **Path C**: Click different style card → Regenerate preview (increments counter)
- **Path D**: Click "Continue" → STATE 4 (Studio)
- **Path E**: Click "Remove Watermark" → Watermark removal modal (subscription upsell)

---

## STATE 3B: ACCOUNT CREATION PROMPT
**Trigger**: After 3rd generation completes
**Timing**: Immediately after 3rd preview reveals
**Type**: Non-blocking lightbox overlay

### Lightbox UI

```
┌──────────────────────────────────────────────────────────────┐
│                    [X Dismiss]                                │
│                                                               │
│  ┌─────────┬─────────┬─────────┐                            │
│  │[Style 1]│[Style 2]│[Style 3]│  Your 3 generated styles    │
│  │ preview │ preview │ preview │                             │
│  └─────────┴─────────┴─────────┘                            │
│                                                               │
│  Love What You're Creating?                                  │
│                                                               │
│  Create a free account to save your artwork and              │
│  unlock 5 more generations                                   │
│                                                               │
│  ✓ Personal art library (unlimited storage)                  │
│  ✓ Access your work from any device                          │
│  ✓ 5 more free generations today (8 total)                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Create Free Account]                                  │  │
│  │ Gradient CTA with glow                                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  [Maybe Later] ← Dismissible link                            │
└──────────────────────────────────────────────────────────────┘
```

### User Actions

**Option A**: Click "Create Free Account"
- Quick signup flow (email + password, or Google/Facebook OAuth)
- Account created immediately
- `remainingFreeGenerations` updated to 5 more (8 total)
- Lightbox closes, user continues in STATE 3A
- Email captured for remarketing

**Option B**: Click "Maybe Later"
- Lightbox closes
- User continues with remaining generations (3 used, 5 left before hard gate)
- Lightbox will re-appear at generation #6 with more urgency
- At generation #9, hard gate (must create account or subscribe)

### System Actions

```typescript
// After 3rd generation
if (generationCount === 3 && !isAuthenticated) {
  showAccountPrompt({
    title: "Love What You're Creating?",
    benefits: [
      "Personal art library (unlimited storage)",
      "Access your work from any device",
      "5 more free generations today (8 total)"
    ],
    dismissable: true,
    priority: "soft" // Can be dismissed
  });
}

// After 6th generation (if still not authenticated)
if (generationCount === 6 && !isAuthenticated) {
  showAccountPrompt({
    title: "Almost at Your Limit",
    benefits: [
      "You have 2 more generations left",
      "Create account to save your work",
      "Get 8 total free generations"
    ],
    dismissable: true,
    priority: "medium"
  });
}

// After 8th generation (hard gate)
if (generationCount === 8 && !isAuthenticated && !isSubscriber) {
  showSubscriptionGate({
    title: "You've Used Your Free Generations",
    options: [
      {
        type: "account",
        cta: "Create Free Account",
        benefit: "Save all your work, no subscription needed"
      },
      {
        type: "subscription",
        cta: "Upgrade to Pro - $9.99/month",
        benefit: "Unlimited generations + watermark removal"
      }
    ],
    dismissable: false, // Hard gate
    priority: "hard"
  });
}
```

### Analytics Events

```typescript
trackEvent('account_prompt_shown', {
  generation_count: 3,
  prompt_type: 'soft',
  user_id: null // Anonymous
});

trackEvent('account_created_from_prompt', {
  generation_count: 3,
  source: 'generation_limit_prompt'
});

trackEvent('account_prompt_dismissed', {
  generation_count: 3,
  dismiss_count: 1
});
```

---

## STATE 4: STUDIO WORKSPACE - UNIFIED CUSTOMIZATION
**Route**: `/product` (same page, layout transforms)
**Time**: 0:15 (7 seconds user viewing preview + interaction)
**Header**: "Customize Your Canvas"

### Layout: Center Canvas + Right Sidebar (No permanent left sidebar)

```
┌─────────────────────────────────────────────────────────────┐
│ [☰ All Styles] Studio    Watercolor Dreams    [🔍 ↗ ✏️]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌─────────────────────┐        ┌─────────────┐│
│              │                     │        │ Canvas Size ││
│              │   HERO CANVAS       │        │ ────────    ││
│              │   PREVIEW           │        │ ● 8×10"     ││
│              │   (60% width)       │        │   $49       ││
│              │                     │        │             ││
│              │   Watermarked       │        │ ○ 12×16"    ││
│              │                     │        │   $89       ││
│              └─────────────────────┘        │             ││
│                                             │ ○ 16×20"    ││
│  [8×10" $49] [12×16" $89] [16×20" $169]    │   $129      ││
│                                             │             ││
│  ✨ Make It Yours                           │ ○ 20×24"    ││
│  ┌──────────┬──────────┬──────────┐        │   $169      ││
│  │ Frame    │ Living   │ AI       │        │             ││
│  │ +$29     │ Memory   │ Upscale  │        │ Frame       ││
│  │ [Toggle] │ +$59.99  │ +$9      │        │ ────────    ││
│  │          │ [Toggle] │ [Toggle] │        │ ☐ Floating  ││
│  └──────────┴──────────┴──────────┘        │   +$29      ││
│                                             │             ││
│                                             │ Living Mem. ││
│                                             │ ────────    ││
│                                             │ ☐ AR Video  ││
│                                             │   +$59.99   ││
│                                             │ [🎥 Demo]   ││
│                                             │             ││
│                                             │ Your Order  ││
│                                             │ ──────────  ││
│                                             │ Total: $89  ││
│                                             │             ││
│                                             │ [Checkout]  ││
│                                             └─────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Collapsible Style Sidebar (Click [☰ All Styles])

```
When clicked, left sidebar slides in:
┌──────────┬──────────────────────────────────────┐
│ STYLES   │                                      │
│          │      [Hero canvas preview]           │
│ [Water]  │                                      │
│ [Oil]    │                                      │
│ [Pastel] │                                      │
│ [Char.]  │                                      │
│ [Abs.]   │                                      │
│ [Pop]    │                                      │
│          │                                      │
│ ─────────│                                      │
│ Generate │                                      │
│ More:    │                                      │
│ 5 left   │                                      │
│ today    │                                      │
│          │                                      │
│ [<< Close│                                      │
└──────────┴──────────────────────────────────────┘
```

### Style Switching Logic

```typescript
// When user clicks a different style in sidebar
const handleStyleSwitch = async (newStyleId: string) => {
  // Check if preview already cached
  if (previewCache[newStyleId]) {
    // Instant switch (200ms fade animation)
    setCurrentStyle(newStyleId);
    return;
  }

  // Not cached - need to generate
  if (remainingGenerations > 0) {
    // Generate new preview
    await generatePreview(newStyleId);
    incrementGenerationCounter();

    // Check if hit generation limit
    if (totalGenerations === 3 && !isAuthenticated) {
      showAccountPrompt();
    }
    if (totalGenerations === 8 && !isSubscriber) {
      showSubscriptionGate();
    }
  } else {
    // Hit limit - show subscription prompt
    showSubscriptionModal();
  }
};
```

### Generation Counter Display

```
Visible in collapsed sidebar button and in expanded sidebar:

[☰ All Styles (5 generations left)] ← Always visible

When sidebar expanded:
┌────────────────────────────────┐
│ You have 5 more generations    │
│ included today                 │
│                                │
│ [Generate Another Style]       │
│                                │
│ Or get unlimited:              │
│ [Upgrade to Pro - $9.99/mo]    │
└────────────────────────────────┘
```

### Bottom Bar (Sticky, Always Visible)

```
┌──────────────────────────────────────────────────────────────┐
│  Subtotal: $89.00                                            │
│  Free shipping on orders over $75 ✓                          │
│                                                               │
│  [← Back to Styles]  [Continue to Checkout →]                │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Stacked)

- Preview on top (full width)
- Size selector below (horizontal scroll)
- Options below (accordion sections, collapsed by default)
- Bottom bar sticky

### User Interactions

1. **Change size** → Price updates, preview stays same
2. **Toggle frame** → Visual frame overlays on preview (live)
3. **Enable Living Memory** → Checkbox checked, price updates (no modal blocking)
4. **Click "See Demo"** → Demo video modal (non-blocking)
5. **Click "Remove Watermark"** → Subscription upsell modal
6. **All changes** reflected in right sidebar total + bottom bar

### Living Memory Demo Modal (Non-Blocking)

```
┌──────────────────────────────────────────────────────────────┐
│  Make Your Canvas Come Alive                                 │
│                                                               │
│  [Embedded video: 15 seconds]                                │
│  Shows person scanning canvas → video plays in AR            │
│                                                               │
│  How it works:                                               │
│  1. Add Living Memory to your order ($59.99)                 │
│  2. Upload your video after checkout (or later)              │
│  3. We generate a QR code for your canvas                    │
│  4. Scan with any phone → video plays over artwork           │
│                                                               │
│  ⭐ 847 people added Living Memory this week                  │
│                                                               │
│  [No Thanks]  [Add to My Canvas - $59.99]                    │
└──────────────────────────────────────────────────────────────┘
```

**Key Change**: User doesn't upload video here. They just toggle it on, pay for it, and upload after checkout.

---

## STATE 5: CHECKOUT - GUEST-FIRST FLOW
**Route**: `/product/checkout` or scroll to checkout section
**Time**: 0:45 (30 seconds in customization)
**Header**: "Complete Your Order"

### Layout: Two-Column

```
┌──────────────────────────────┬──────────────────────────────┐
│ LEFT (60%)                   │ RIGHT (40%)                  │
│ Order Form                   │ Order Summary                │
├──────────────────────────────┼──────────────────────────────┤
│                              │  Your Artwork                │
│ Guest Checkout               │  ┌────────────────────────┐  │
│ ──────────────               │  │ [Preview thumbnail]    │  │
│                              │  │ 200×200px (watermark)  │  │
│ Email *                      │  └────────────────────────┘  │
│ ┌─────────────────────────┐  │                              │
│ │ your@email.com          │  │  Watercolor Dreams          │
│ └─────────────────────────┘  │  12×16" Square Canvas       │
│ For order confirmation       │  $89.00                      │
│                              │                              │
│ Shipping Address             │  Customizations:             │
│ ────────────────             │  • Floating Frame (Black)    │
│ Full Name *                  │    +$29.00                   │
│ Address Line 1 *             │  • Living Memory AR          │
│ City, State, ZIP *           │    +$59.99                   │
│                              │                              │
│ ─────────────────────────    │  ──────────────────────      │
│                              │  Subtotal: $167.99           │
│ ☐ Create account for 10% off│  Shipping: FREE              │
│   (optional)                 │  Tax: $13.44 (est.)          │
│                              │                              │
│ If checked:                  │  ──────────────────────      │
│ Password: [______________]   │  Total: $181.43              │
│                              │                              │
│ ─────────────────────────    │  ┌────────────────────────┐  │
│                              │  │ Complete Order         │  │
│ Payment                      │  │ $181.43                │  │
│ ───────                      │  └────────────────────────┘  │
│ [Stripe Payment Element]     │                              │
│ • Card                       │  🔒 Secure checkout         │
│ • Apple Pay / Google Pay     │  Powered by Stripe           │
│                              │                              │
│ ┌─────────────────────────┐  │  💳 30-day money-back       │
│ │ Place Order →           │  │     guarantee                │
│ └─────────────────────────┘  │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### System Validations

1. Email format validation (real-time)
2. Address validation via Stripe
3. Payment processing via Stripe Checkout

### Backend Process (On "Place Order")

1. Create Stripe payment intent
2. If account created: Register user in Supabase Auth
3. Store order in database (`orders` table)
4. Associate AI preview with order (`previews` table)
5. If Living Memory selected: Create pending AR video record (status: "awaiting_upload")
6. Send confirmation email

**Success**: → STATE 6
**Failure**: Show error inline, allow retry

---

## STATE 6: ORDER CONFIRMATION & UPSELLS
**Route**: `/product/success?order_id=xxx`
**Time**: 1:15 (30 seconds in checkout)

### Order Confirmation

```
┌──────────────────────────────────────────────────────────────┐
│  ✓ Order Confirmed!                                          │
│                                                               │
│  Order #WT-12847                                             │
│  Confirmation sent to: your@email.com                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Your AI artwork preview - watermarked]                │  │
│  │ Large display                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  What happens next:                                          │
│  1. ✓ Your artwork is in production                          │
│  2. 📦 Ships within 5-7 business days                        │
│  3. 🚚 Tracking number sent to your email                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Download Watermarked Preview]                         │  │
│  │ Share on social media while you wait                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Living Memory Upload Prompt (If Applicable)

```
┌──────────────────────────────────────────────────────────────┐
│  📹 Next Step: Upload Your Living Memory Video               │
│                                                               │
│  You added Living Memory AR to your order!                   │
│  Upload your video now, or we'll email you a link.           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Drag & Drop Video Here]                               │  │
│  │ 6-30 seconds • MP4, MOV, or AVI                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  [Upload Now]  [I'll Do This Later]                          │
│                                                               │
│  If later: We'll email you a secure upload link             │
└──────────────────────────────────────────────────────────────┘
```

### Watermark Removal Upsell (Primary Revenue Driver)

```
┌──────────────────────────────────────────────────────────────┐
│  🔓 Want the Unwatermarked Version?                          │
│                                                               │
│  Get your artwork without the watermark for sharing,         │
│  printing, or digital use.                                   │
│                                                               │
│  ┌────────────────────────┬──────────────────────────────┐  │
│  │ ONE-TIME PURCHASE      │ CREATOR SUBSCRIPTION         │  │
│  │                        │ (Best Value)                 │  │
│  ├────────────────────────┼──────────────────────────────┤  │
│  │ $24.99                 │ $9.99/month                  │  │
│  │                        │                              │  │
│  │ • This artwork only    │ • Unlimited generations      │  │
│  │ • HD download (4K)     │ • Remove all watermarks      │  │
│  │ • Instant access       │ • HD downloads (4K)          │  │
│  │                        │ • Save unlimited library     │  │
│  │                        │ • Priority processing        │  │
│  │                        │                              │  │
│  │ [Buy HD Download]      │ [Start Free Trial]           │  │
│  └────────────────────────┴──────────────────────────────┘  │
│                                                               │
│  [No Thanks, I'll Keep Watermarked Version]                  │
└──────────────────────────────────────────────────────────────┘
```

### Account Creation Upsell (If No Account)

```
┌──────────────────────────────────────────────────────────────┐
│  💾 Create Your Account to Track This Order                  │
│                                                               │
│  Get instant access to:                                      │
│  • Order status and tracking                                 │
│  • Your saved artwork library                                │
│  • Reorder or create new art anytime                         │
│                                                               │
│  [Activate My Account]                                       │
│  → Sends magic link to your@email.com                        │
└──────────────────────────────────────────────────────────────┘
```

### Analytics Events Fired

```typescript
trackEvent('purchase', {
  order_id: 'WT-12847',
  total: 181.43,
  items: ['canvas_12x16', 'floating_frame', 'living_memory'],
  style_id: 'watercolor-dreams',
  living_memory_added: true,
  account_created: false
});

trackEvent('conversion_complete', {
  time_from_upload: 75, // seconds
  style_id: 'watercolor-dreams',
  size: '12x16',
  source: 'direct'
});
```

### Email Triggered

1. **Order confirmation** with order details
2. **If Living Memory**: AR video upload instructions with secure link
3. **If no account**: Magic link for account activation
4. **24 hours later**: "Your canvas is being made" update
5. **5 days later**: "Shipped! Here's your tracking number"

---

## Alternative User Paths & Edge Cases

### Path B: User Changes Style Mid-Flow

**STATE 3A** (First preview shown) →
User clicks different style card in sidebar →

**STATE 3C: PREVIEW REGENERATION**
- Main canvas shows selected style's placeholder
- "Generating [Style Name]..." loading state
- **If preview already cached**: Instant display (200ms fade)
- **If not cached**: Generate new preview (8-12 seconds)
  - Increments generation counter
  - Checks if account prompt or subscription gate should trigger
- Previous style card becomes unselected (gray border)
- New style card gets purple border (selected)

Returns to STATE 3A with new preview

---

### Path C: User Tries AR Preview

**STATE 3A** (AR modal appears) →
User scans QR code with phone →

**STATE 3B: AR EXPERIENCE** (Mobile Browser)
- Opens camera on user's phone
- AR view overlays canvas preview on detected wall
- User can move phone to see different sizes
- "Tap to see it larger" interactive resize
- "Order This Size" button → Deeplink back to desktop session (sets size based on AR preview selected)

User returns to desktop/continues on mobile →
Resumes STATE 4 (Studio) with AR-selected size pre-filled

---

### Path D: User Hits Generation Limit (8 without account)

**STATE 3A or STATE 4** (Studio) →
User tries to generate 9th style →

**STATE 3D: SUBSCRIPTION GATE** (Hard Gate, Non-Dismissable)

```
┌──────────────────────────────────────────────────────────────┐
│  You've Used Your Free Generations                           │
│                                                               │
│  Choose an option to continue:                               │
│                                                               │
│  ┌────────────────────────┬──────────────────────────────┐  │
│  │ CREATE FREE ACCOUNT    │ UPGRADE TO PRO               │  │
│  │                        │ (Recommended)                │  │
│  ├────────────────────────┼──────────────────────────────┤  │
│  │ FREE                   │ $9.99/month                  │  │
│  │                        │                              │  │
│  │ • Save all your work   │ • Unlimited generations      │  │
│  │ • Access from anywhere │ • Remove watermarks          │  │
│  │ • No subscription      │ • Priority processing        │  │
│  │                        │ • HD downloads               │  │
│  │                        │                              │  │
│  │ [Create Account]       │ [Start Free Trial]           │  │
│  └────────────────────────┴──────────────────────────────┘  │
│                                                               │
│  Note: You can still purchase your canvas with current       │
│  styles. Account or subscription needed for more styles.     │
│                                                               │
│  [Continue to Checkout with Current Styles]                  │
└──────────────────────────────────────────────────────────────┘
```

**Key**: User can ALWAYS checkout with existing previews. Generation limit only blocks NEW style generation.

---

### Path E: Watermark Removal Request (Mid-Flow)

**STATE 3A or STATE 4** →
User clicks "Remove Watermark" button on preview →

**WATERMARK REMOVAL MODAL**

```
┌──────────────────────────────────────────────────────────────┐
│  🔓 Remove Watermark                                         │
│                                                               │
│  Get this artwork without the "WONDERTONE" watermark         │
│                                                               │
│  ┌────────────────────────┬──────────────────────────────┐  │
│  │ THIS ARTWORK ONLY      │ UNLIMITED (Best Value)       │  │
│  ├────────────────────────┼──────────────────────────────┤  │
│  │ $24.99 one-time        │ $9.99/month                  │  │
│  │                        │                              │  │
│  │ • Remove watermark     │ • Unlimited generations      │  │
│  │ • HD download (4K)     │ • All watermarks removed     │  │
│  │ • Instant access       │ • HD downloads               │  │
│  │                        │ • Cancel anytime             │  │
│  │                        │                              │  │
│  │ [Purchase - $24.99]    │ [Subscribe - $9.99/mo]       │  │
│  └────────────────────────┴──────────────────────────────┘  │
│                                                               │
│  [Maybe Later] ← Can dismiss and continue                    │
└──────────────────────────────────────────────────────────────┘
```

---

### Path F: Returning User With Account

**Homepage** → User clicks CTA →

**IF** user has session cookie (authenticated):
- STATE 1 shows: "Welcome back, [Name]!"
- Shows recent projects: "Continue working on: Watercolor Dreams (Oct 5)"
- Options:
  - "Start Fresh" → Normal flow (STATE 1: Upload)
  - "Continue Last Project" → Loads saved state from database → Jump to STATE 4 (Studio) with previous preview, selections restored

**ELSE**:
- Normal flow (STATE 1: Upload)

---

## Critical Timing Benchmarks

| Milestone | Target Time | Critical Success Factor |
|-----------|-------------|-------------------------|
| Homepage → Upload interface | 0:02 | Instant navigation, no auth wall |
| Upload → Cropper | 0:03 | <1s file validation |
| Crop → Style selection | 0:05 | Instant transition, generation starts in background |
| **First Preview Reveal** | **0:08** | **THE WOW MOMENT - Most critical timing** |
| 2nd & 3rd Previews | 0:10-0:12 | Progressive enhancement, not required |
| AR Modal Appears | 0:10 | 2s after first preview (emotional peak) |
| Bottom Bar Fades In | 0:13 | 5s after first preview (user has absorbed) |
| User Clicks Continue | 0:15 | Average viewing time before decision |
| Studio/Customization | 0:15-0:45 | 30s average exploration time |
| Checkout Form | 0:45-1:15 | 30s form completion (with autofill) |
| Order Placed | 1:15 | Total journey: <90 seconds for fast users |

**Median User Journey**: 2-3 minutes (upload → preview → customize → checkout)
**Fast Path**: 75 seconds (upload → continue → checkout with defaults)
**Exploratory Path**: 5-8 minutes (tries multiple styles, AR preview, reads Living Memory details)

---

## State Management Requirements

### Global State (Zustand Store)

```typescript
interface ProductFlowState {
  // User Identity
  isAuthenticated: boolean;
  isSubscriber: boolean;
  userId: string | null;
  email: string | null;

  // Upload & Style
  uploadedImage: string | null;           // Data URI
  originalImage: string | null;           // Before crop
  croppedImage: string | null;            // After crop
  selectedOrientation: 'portrait' | 'square' | 'landscape';
  selectedStyle: { id: string; name: string } | null;
  preselectedStyleFromHero: string | null; // If came from carousel

  // Customization
  selectedSize: '8x10' | '12x16' | '16x20' | '20x24';
  floatingFrame: { enabled: boolean; color: 'white' | 'black' | 'espresso' };
  livingMemory: boolean;
  aiUpscale: boolean;

  // Preview Generation & Caching
  previewUrls: { [styleId: string]: string };  // Cached previews
  isGenerating: boolean;
  generationErrors: { [styleId: string]: string };
  autoGenerationComplete: boolean;

  // Generation Limits & Subscriptions
  totalGenerations: number;              // Lifetime counter (session + DB)
  sessionGenerations: number;            // Current session only
  remainingFreeGenerations: number;      // 3 anon, 8 with account
  accountPromptShown: boolean;
  subscriptionGateShown: boolean;

  // Checkout
  shippingAddress: Address | null;

  // Analytics
  uploadTimestamp: number;
  firstPreviewTimestamp: number | null;

  // Actions
  setUploadedImage: (img: string) => void;
  setSelectedStyle: (style: {id: string, name: string}) => void;
  generatePreview: (styleId: string) => Promise<void>;
  incrementGenerationCounter: () => void;
  checkGenerationLimits: () => 'allowed' | 'account_prompt' | 'subscription_gate';
  // ... other actions
}
```

### Subscription Tiers

```typescript
enum SubscriptionTier {
  FREE = 'free',           // 3 generations anon, 8 with account
  CREATOR = 'creator',     // $9.99/mo - Unlimited + watermark removal
  PRO = 'pro'              // $29.99/mo - Creator + priority + bulk + commercial
}

interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  generationsThisMonth: number;  // For analytics
}
```

---

## Revenue Model Summary

### Customer Segments & Paths

**1. Canvas Buyers** (Primary Revenue - 5% conversion)
- Flow: Upload → Preview → Customize → Buy Canvas ($129-250)
- Upsells: Frame (+$29), Living Memory (+$59.99), AI Upscale (+$9)
- Post-purchase: Watermark removal offer ($24.99 one-time or $9.99/mo subscription)

**2. Digital-Only Creators** (Recurring Revenue - 15% of visitors)
- Flow: Upload → Preview → Want unwatermarked → Subscribe to Creator ($9.99/mo)
- Use case: Social media content, digital portfolios, print-at-home
- LTV: $119.88/year (if retained 12 months)

**3. Power Users / Agencies** (High-LTV - 2% of visitors)
- Flow: Generate 8+ styles → Subscribe to Pro ($29.99/mo)
- Use case: Professional photographers, design agencies, bulk projects
- LTV: $359.88/year

### Generation Limits Strategy

| User Type | Free Generations | Action After Limit | Revenue Opportunity |
|-----------|------------------|-------------------|---------------------|
| Anonymous | 3 instant styles | Soft prompt to create account | Email capture |
| With Account | 8 total (3+5 more) | Soft prompt to subscribe | Subscription conversion |
| After 8th Gen | 0 more free | Hard gate: Account or subscribe | Forced decision point |
| Subscriber (Creator/Pro) | Unlimited | N/A | Retained revenue |

### Watermark Removal Pricing

| Option | Price | When Offered | Conversion Target |
|--------|-------|--------------|-------------------|
| One-time removal | $24.99 | Post-purchase, library view | Canvas buyers who want digital too |
| Creator subscription | $9.99/mo | Generation limit, post-purchase | Creators who generate often |
| Pro subscription | $29.99/mo | Power users (8+ generations) | Agencies, professional use |

---

## Technical Implementation Notes

### STATE 1: Upload Interface + Hero Carousel

**Components**:
- `HeroSection.tsx` - Hero headline + CTA + style carousel
- `StyleCarouselCard.tsx` - Individual style card with hover interaction
- `PhotoUploadContainer.tsx` - Upload dropzone

**File validation**: Client-side (size <10MB, type: image/jpeg|png)
**Performance**: Lazy load react-easy-crop until needed
**Mobile**: Use `capture="environment"` for camera input
**Analytics**: Fire `upload_started`, `style_preselected_from_hero` events

---

### STATE 2: Cropper

**Component**: `PhotoCropperModal.tsx`
**Library**: react-easy-crop (already in dependencies)
**Orientation detection**: `detectOrientationFromImage()` utility
**Canvas operation**: Client-side crop, generate new data URI
**Exit**: Store cropped image, trigger preview generation

---

### STATE 3: Style Selection & Preview

**Components**:
- `StyleSelectionLayout.tsx` - Main layout with canvas + grid
- `StyleGrid.tsx` - Grid of style cards
- `StyleCard.tsx` - Individual card with loading states
- `usePreviewGeneration.ts` - Generation logic hook

**API**: `generateAndWatermarkPreview()` → Supabase Edge Function
**Polling**: `pollPreviewStatusUntilReady()` with 2s intervals
**Caching**: Check `previewUrls` state before generating
**Concurrency**: Queue management for parallel generations (limit 3 concurrent)

---

### STATE 3B: Account Creation Prompt

**Component**: `AccountCreationModal.tsx`
**Trigger Logic**:
```typescript
// In usePreviewGeneration hook
useEffect(() => {
  if (totalGenerations === 3 && !isAuthenticated && !accountPromptShown) {
    showAccountPrompt();
    setAccountPromptShown(true);
  }
}, [totalGenerations, isAuthenticated]);
```

**Analytics**: Track prompt shown, dismissed, converted

---

### STATE 4: Studio Workspace

**Components**:
- `StudioLayout.tsx` - Main layout
- `CollapsibleStyleSidebar.tsx` - Slide-in style picker
- `HeroCanvasPreview.tsx` - Large preview with overlays
- `SizeSelector.tsx` - Size radio buttons
- `EnhancementToggles.tsx` - Frame, Living Memory, AI Upscale
- `StickyOrderRail.tsx` - Right sidebar with order summary

**Live Preview**: Update frame overlay via CSS (no regeneration needed)
**Price Calculation**: Real-time update in right sidebar + bottom bar
**Living Memory Modal**: Video demo (lazy load video file)

---

### STATE 5: Checkout

**Components**:
- `CheckoutLayout.tsx` - Two-column layout
- `GuestCheckoutForm.tsx` - Email + shipping form
- `OrderSummary.tsx` - Right sidebar order details
- `StripePaymentForm.tsx` - Stripe payment element

**Stripe Integration**: `useStripePayment.ts` hook
**Payment Element**: Stripe.js embedded (lazy loaded at this state)
**Validation**: Real-time email/address validation
**Guest Checkout**: Optional account creation checkbox (10% off incentive)

---

### STATE 6: Confirmation & Upsells

**Components**:
- `OrderConfirmation.tsx` - Success message + order details
- `LivingMemoryUploadPrompt.tsx` - Video upload if applicable
- `WatermarkRemovalUpsell.tsx` - Subscription modal
- `AccountActivationPrompt.tsx` - If no account

**Email Triggers**: Via Supabase Edge Function
**Database**: Order record created, associated with user (if account)
**Upsells**: Digital download, watermark removal, account creation
**Sharing**: Generate shareable link to preview

---

## Mobile-Specific Adaptations

### STATE 0-1: Hero + Upload

- Single column layout
- Style carousel: Horizontal scroll with snap
- Larger touch targets (min 44px)
- Upload button prominent

### STATE 2: Cropper

- Full-screen overlay
- Pinch-zoom native support
- Orientation selector: Larger radio buttons

### STATE 3-4: Preview & Studio

- Stack layout (no sidebars)
- Style grid: 2×3 on mobile (vs 3×2 desktop)
- Bottom bar sticky (always visible)
- Collapsible sidebar: Full-screen overlay on mobile
- Accordions for options (collapsed by default)

### STATE 5: Checkout

- Single column form
- Order summary collapsible (expanded by default)
- Stripe mobile-optimized payment element
- Apple Pay / Google Pay prominent

---

## Key Principles

1. **No auth barriers until necessary** - Guest-first, account creation optional until generation limit
2. **Instant transitions** (<1s between states)
3. **Time-to-wow < 10 seconds** (First preview reveal is the critical metric)
4. **Progressive disclosure** (Don't show all options at once)
5. **Persistent conversion path** (Bottom bar after first preview, always visible)
6. **Multi-revenue model** (Canvas + Subscriptions + Watermark removal)
7. **Mobile-first design** (50%+ traffic will be mobile)
8. **Cost control without friction** (Soft prompts before hard gates)

---

**END OF FLOWMAP**

This flow balances:
- ✅ Instant wow moment (8 seconds)
- ✅ Early email capture (after 3 generations)
- ✅ Multiple revenue streams (canvas + subscriptions)
- ✅ Cost control (generation limits with soft prompts)
- ✅ User freedom (can always checkout with existing previews)
