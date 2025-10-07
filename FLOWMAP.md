# Wondertone Product Flow Map
## Version 2.0 - Multi-Revenue Strategy

**Last Updated**: October 6, 2025
**Revenue Model**: Canvas Sales + Digital Subscriptions + Watermark Removal
**North Star Metric**: Time-to-Wow < 10 seconds

---

## Table of Contents
2. [STATE 1: Product Page Hero] AI 
3. [STATE 2: Cropper](#state-2-cropper)
4. [STATE 3: Preview Generation](#state-3-preview-generation)
5. [STATE 3A: First Preview Reveal](#state-3a-first-preview-reveal)
6. [STATE 3B: Account Creation Prompt](#state-3b-account-creation-prompt)
7. [STATE 4: Studio Customization](#state-4-studio-customization)
8. [STATE 5: Checkout](#state-5-checkout)
9. [STATE 6: Order Confirmation](#state-6-order-confirmation)
10. [Revenue Model Summary](#revenue-model-summary)
11. [Technical Implementation](#technical-implementation)

---


## STATE 1: Product Page Hero
**Route**: `/product` or `/product?preselected_style=watercolor`
**Time**: 0:00 (Page load)
**Auth**: None required

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  HERO HEADLINE (Center, Bold, Large)                      │
│  "Transform Your Memories Into Museum-Quality Art"        │
│                                                            │
│  SUBHEADLINE                                              │
│  "AI-powered canvas art that brings your photos to life"  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Upload Your Photo to Start the Magic →]           │ │
│  │  Large gradient button with purple glow             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ─────────── Or Browse Styles First ───────────           │
│                                                            │
│  STYLE CAROUSEL (12 styles, horizontal scroll)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ [Result] │ │ [Result] │ │ [Result] │ │ [Result] │    │
│  │ Image    │ │ Image    │ │ Image    │ │ Image    │    │
│  │          │ │          │ │          │ │          │    │
│  │Watercolor│ │Oil Paint │ │Charcoal  │ │Abstract  │    │
│  │Dreams    │ │Classic   │ │Sketch    │ │Fusion    │    │
│  │          │ │          │ │          │ │          │    │
│  │[Try This]│ │[Try This]│ │[Try This]│ │[Try This]│    │
│  │ Style →] │ │ Style →] │ │ Style →] │ │ Style →] │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                            │
│  HOVER INTERACTION: Image crossfades to original photo    │
│  Label changes: "Original photo" / "Hover to see original"│
└────────────────────────────────────────────────────────────┘
```

### Style Carousel Card Behavior

**Default State**:
- Shows: AI-generated result (transformed style)
- Label: Style name + "Hover to see original"

**On Hover** (Desktop):
- 300ms crossfade animation
- Shows: Original photo used for the transformation
- Label: "Original photo"

**On Tap** (Mobile):
- Toggle between result and original
- Tap again to toggle back

**On Click "Try This Style"**:
- Pre-selects that style
- Opens file picker
- Navigates to STATE 1 with query param: `?preselected_style=watercolor`

### User Actions

1. **Click main CTA** → Opens file picker → STATE 2 (Cropper)
2. **Click "Try This Style"** → Pre-selects style → Opens file picker → STATE 2 (Cropper)
3. **Drag & drop image** → STATE 2 (Cropper)

---

## STATE 2: Cropper Interface
**Route**: `/product` (modal overlay)
**Time**: 0:03 (1 second after upload)
**Auth**: None required

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  Full-screen dark overlay (80% opacity)                   │
│                                                            │
│  "Perfect Your Framing"                                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │   [Uploaded photo with crop overlay grid]           │ │
│  │   React-easy-crop component                         │ │
│  │   Pinch/zoom/drag enabled                           │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Orientation (auto-detected, changeable):                 │
│  ○ Portrait    ● Square    ○ Landscape                    │
│                                                            │
│  ┌──────────┐            ┌───────────────────────────┐   │
│  │  Back    │            │ Continue with Photo →     │   │
│  └──────────┘            └───────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### User Actions

1. Adjust crop (pinch/zoom/drag)
2. Change orientation (optional)
3. Click "Continue with Photo"

### System Actions

1. Generate cropped image (canvas operation, client-side)
2. Store: `croppedImage`, `selectedOrientation`
3. **IMMEDIATELY start preview generation** (background, 3 styles parallel)
4. Transition to STATE 3

**Timing**: <500ms crop processing → instant transition

**Important**: Orientation is DEFAULT, not locked. User can re-crop later in Studio.

---

## STATE 3: Preview Generation & Style Selection
**Route**: `/product`
**Time**: 0:05 (2 seconds after crop)
**Background Process**: **3 PARALLEL STYLE GENERATIONS STARTED**

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  Header: "Your photo is being transformed..."             │
│                                                            │
│  MAIN CANVAS PREVIEW (Center, Large)                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  [User's cropped photo with blur + shimmer]         │ │
│  │  "✨ Creating your masterpiece..."                  │ │
│  │  Progress: ▓▓▓▓▓▓▓░░░░░ 60%                        │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  STYLE GRID (3 cards, loading state)                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ ⭐         │ │            │ │            │           │
│  │ Watercolor │ │ Oil Paint  │ │ Charcoal   │           │
│  │ Dreams     │ │ Classic    │ │ Sketch     │           │
│  │            │ │            │ │            │           │
│  │ LOADING... │ │ LOADING... │ │ LOADING... │           │
│  │ [Shimmer]  │ │ [Shimmer]  │ │ [Shimmer]  │           │
│  └────────────┘ └────────────┘ └────────────┘           │
└────────────────────────────────────────────────────────────┘
```

### System Background Process

1. **Intelligent recommendation** analyzes photo (colors, content, composition)
2. Determines 3 recommended styles
3. If `preselectedStyle` exists, prioritize it first
4. **Generate 3 previews in parallel**:
   - API call: `generateAndWatermarkPreview()`
   - Watermark: "WONDERTONE" diagonal, 20% opacity
5. As EACH preview completes → Update card with image, animate reveal

### Timing Targets

- **0:08** (3s from crop): **First preview ready** ← **WOW MOMENT**
- **0:10** (5s): Second preview ready
- **0:12** (7s): Third preview ready

### Generation Counter Logic

```typescript
// State tracked per user
interface GenerationState {
  totalGenerations: number;        // Lifetime count
  remainingFreeGenerations: number; // 3 anon, 8 with account
  isAuthenticated: boolean;
  isSubscriber: boolean;
}

// After first 3 generations complete
if (totalGenerations === 3 && !isAuthenticated) {
  showAccountPrompt(); // STATE 3B (soft prompt)
}

// After 8th generation
if (totalGenerations === 8 && !isSubscriber) {
  showSubscriptionGate(); // Hard gate
}
```

---

## STATE 3A: First Preview Reveal (WOW MOMENT)
**Route**: `/product`
**Time**: 0:08 (8 seconds from upload)
**Critical**: 40% of purchase decisions happen here

### Animation Sequence (1.2 seconds)

1. Blur clears from canvas (0-400ms)
2. Preview scales in with bounce (400-800ms)
3. Confetti burst (800-1000ms)
4. Success checkmark (1000-1200ms)

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  MAIN CANVAS (Large, Watermarked Preview)                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  [AI-GENERATED WATERCOLOR PREVIEW]                  │ │
│  │  Full resolution                                     │ │
│  │  Watermark: "WONDERTONE" diagonal, 20% opacity      │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  "Watercolor Dreams" - ✓ Created                          │
│  [💖 Love it] [👁️ Fullscreen] [🔓 Remove Watermark]     │
│                                                            │
│  STYLE GRID (Updated)                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ ⭐ ✓       │ │ Oil Paint  │ │ Charcoal   │           │
│  │ READY      │ │ Classic    │ │ Sketch     │           │
│  │ Watercolor │ │ LOADING    │ │ LOADING    │           │
│  │ Dreams     │ │ 73%...     │ │ 45%...     │           │
│  │ [Selected] │ │            │ │            │           │
│  └────────────┘ └────────────┘ └────────────┘           │
│  Purple border on selected                                │
└────────────────────────────────────────────────────────────┘
```

### AR Modal (2 seconds after first preview)

**Dismissible, non-blocking**

```
┌────────────────────────────────────────────────────────────┐
│  ✨ Want to See It in Your Space?                         │
│                                                            │
│  [QR Code]  ← Scan with your phone                        │
│                                                            │
│  View this artwork on your wall using AR                  │
│  No app required - instant preview                        │
│                                                            │
│  [Maybe Later]      [Show Me →]                           │
└────────────────────────────────────────────────────────────┘
```

### Bottom Bar (5 seconds after first preview)

```
┌────────────────────────────────────────────────────────────┐
│  Watercolor Dreams • Square • From $89                    │
│  [Customize Your Art →]                                   │
└────────────────────────────────────────────────────────────┘
```
Sticky, always visible

### User Actions

- **Click different style card** → Regenerate (increments counter)
- **Click "Continue"** → STATE 4 (Studio)
- **Click "Remove Watermark"** → Subscription upsell modal
- **Scan QR** → AR preview (mobile)

---

## STATE 3B: Account Creation Prompt
**Trigger**: After 3rd generation completes
**Type**: Non-blocking lightbox overlay
**Dismissible**: Yes

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│                               [X Dismiss]                  │
│                                                            │
│  ┌──────────┬──────────┬──────────┐                       │
│  │[Preview 1│[Preview 2│[Preview 3│  Your 3 styles        │
│  │ Thumb]   │ Thumb]   │ Thumb]   │                       │
│  └──────────┴──────────┴──────────┘                       │
│                                                            │
│  Love What You're Creating?                               │
│                                                            │
│  Create a free account to save your artwork               │
│  and unlock 5 more generations                            │
│                                                            │
│  ✓ Personal art library (unlimited storage)               │
│  ✓ Access your work from any device                       │
│  ✓ 5 more free generations today (8 total)                │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Create Free Account]                               │ │
│  │  Gradient button with glow                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Maybe Later] ← Dismissible                              │
└────────────────────────────────────────────────────────────┘
```

### User Actions

**Option A: Create Account**
- Quick signup (email + password, or OAuth)
- `remainingFreeGenerations` → 5 more (8 total)
- Email captured for remarketing
- Lightbox closes, continues in STATE 3A

**Option B: Dismiss**
- Lightbox closes
- User continues (3 used, 5 left before hard gate)
- Re-prompts at generation #6 (more urgent)
- Hard gate at generation #9

### Follow-up Prompts

```typescript
// After 6th generation (if still not authenticated)
if (generationCount === 6 && !isAuthenticated) {
  showAccountPrompt({
    title: "Almost at Your Limit",
    message: "You have 2 more generations left",
    urgency: "medium"
  });
}

// After 8th generation (hard gate)
if (generationCount === 8 && !isAuthenticated && !isSubscriber) {
  showSubscriptionGate({
    title: "You've Used Your Free Generations",
    dismissable: false, // Must choose
    options: [
      "Create Free Account",
      "Upgrade to Pro - $9.99/month"
    ]
  });
}
```

**Key**: User can ALWAYS checkout with existing previews. Generation limit only blocks NEW style generation.

---

## STATE 4: Studio Customization
**Route**: `/product` (layout transforms)
**Time**: 0:15 (after user clicks "Continue")
**Header**: "Customize Your Canvas"

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  [☰ All Styles (5 left)] Studio  Watercolor Dreams  [↗️]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│         ┌──────────────────────┐     ┌─────────────────┐  │
│         │                      │     │ Canvas Size     │  │
│         │  HERO CANVAS PREVIEW │     │ ─────────────   │  │
│         │  (60% screen width)  │     │ ● 8×10"  $49    │  │
│         │                      │     │ ○ 12×16" $89    │  │
│         │  Watermarked         │     │ ○ 16×20" $129   │  │
│         │                      │     │ ○ 20×24" $169   │  │
│         └──────────────────────┘     │                 │  │
│                                      │ Frame           │  │
│  [8×10" $49] [12×16" $89] [...]      │ ─────────────   │  │
│                                      │ ☐ Floating +$29 │  │
│  ✨ Make It Yours                    │                 │  │
│  ┌─────────┬──────────┬─────────┐   │ Living Memory   │  │
│  │ Frame   │ Living   │ AI      │   │ ─────────────   │  │
│  │ +$29    │ Memory   │ Upscale │   │ ☐ AR +$59.99    │  │
│  │ [Toggle]│ +$59.99  │ +$9     │   │ [🎥 Demo]       │  │
│  └─────────┴──────────┴─────────┘   │                 │  │
│                                      │ Your Order      │  │
│                                      │ ──────────────  │  │
│                                      │ Total: $89      │  │
│                                      │                 │  │
│                                      │ [Checkout →]    │  │
│                                      └─────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Collapsible Style Sidebar

Click **[☰ All Styles (5 left)]** → Left sidebar slides in:

```
┌───────────┬───────────────────────────────────┐
│ STYLES    │                                   │
│           │   [Hero canvas preview]           │
│ [Water ✓] │                                   │
│ [Oil]     │                                   │
│ [Pastel]  │                                   │
│ [Charcoal]│                                   │
│ [Abstract]│                                   │
│ [Pop Art] │                                   │
│           │                                   │
│ ──────────│                                   │
│ 5 more    │                                   │
│ generations│                                  │
│ left today│                                   │
│           │                                   │
│ [Upgrade] │                                   │
│ $9.99/mo  │                                   │
│           │                                   │
│ [<< Close]│                                   │
└───────────┴───────────────────────────────────┘
```

### Style Switching Logic

```typescript
const handleStyleSwitch = async (newStyleId: string) => {
  // Check if preview cached
  if (previewCache[newStyleId]) {
    setCurrentStyle(newStyleId); // Instant (200ms fade)
    return;
  }

  // Not cached - need to generate
  if (remainingGenerations > 0) {
    await generatePreview(newStyleId);
    incrementGenerationCounter();

    // Check limits
    if (totalGenerations === 3 && !isAuthenticated) {
      showAccountPrompt();
    }
    if (totalGenerations === 8 && !isSubscriber) {
      showSubscriptionGate();
    }
  } else {
    showSubscriptionModal(); // Upsell
  }
};
```

### User Interactions

1. **Change size** → Price updates instantly
2. **Toggle frame** → Visual frame overlays on preview (CSS, no regeneration)
3. **Toggle Living Memory** → Price updates
4. **Click "See Demo"** → Video modal (non-blocking)
5. **Click "Remove Watermark"** → Subscription upsell
6. **All changes** → Reflected in right sidebar + bottom bar

### Living Memory Demo Modal

```
┌────────────────────────────────────────────────────────────┐
│  Make Your Canvas Come Alive                              │
│                                                            │
│  [Embedded 15-second video demo]                          │
│  Shows: Person scans QR → Video plays in AR               │
│                                                            │
│  How it works:                                            │
│  1. Add Living Memory to order ($59.99)                   │
│  2. Upload your video after checkout                      │
│  3. We generate QR code for your canvas                   │
│  4. Scan with phone → Video plays over art                │
│                                                            │
│  ⭐ 847 people added Living Memory this week               │
│                                                            │
│  [No Thanks]    [Add to My Canvas - $59.99]               │
└────────────────────────────────────────────────────────────┘
```

**Key Change**: User doesn't upload video here. Just toggles it on. Video upload happens post-checkout.

### Bottom Bar (Sticky)

```
┌────────────────────────────────────────────────────────────┐
│  Subtotal: $89.00                                         │
│  Free shipping on orders over $75 ✓                       │
│                                                            │
│  [← Back]        [Continue to Checkout →]                 │
└────────────────────────────────────────────────────────────┘
```

---

## STATE 5: Checkout
**Route**: `/product/checkout`
**Time**: 0:45 (30 seconds in Studio)
**Header**: "Complete Your Order"

### Visual Layout

```
┌───────────────────────────┬────────────────────────────────┐
│ LEFT (60%)                │ RIGHT (40%)                    │
│ Order Form                │ Order Summary                  │
├───────────────────────────┼────────────────────────────────┤
│                           │  Your Artwork                  │
│ Guest Checkout            │  ┌──────────────────────────┐  │
│ ──────────────            │  │ [Preview thumbnail]      │  │
│                           │  │ 200×200px (watermarked)  │  │
│ Email *                   │  └──────────────────────────┘  │
│ ┌──────────────────────┐  │                                │
│ │ your@email.com       │  │  Watercolor Dreams            │
│ └──────────────────────┘  │  12×16" Square Canvas         │
│                           │  $89.00                        │
│ Shipping Address          │                                │
│ ──────────────            │  Customizations:               │
│ Full Name *               │  • Floating Frame (Black)      │
│ Address Line 1 *          │    +$29.00                     │
│ City, State, ZIP *        │  • Living Memory AR            │
│                           │    +$59.99                     │
│ ──────────────            │                                │
│                           │  ────────────────────────      │
│ ☐ Create account (10% off│  Subtotal: $167.99             │
│                           │  Shipping: FREE                │
│ If checked:               │  Tax: $13.44                   │
│ Password: [_________]     │                                │
│                           │  ────────────────────────      │
│ ──────────────            │  Total: $181.43                │
│                           │                                │
│ Payment                   │  ┌──────────────────────────┐  │
│ ───────                   │  │ Complete Order           │  │
│ [Stripe Payment Element]  │  │ $181.43                  │  │
│ • Card                    │  └──────────────────────────┘  │
│ • Apple Pay / Google Pay  │                                │
│                           │  🔒 Secure checkout            │
│ ┌──────────────────────┐  │  Powered by Stripe             │
│ │ Place Order →        │  │                                │
│ └──────────────────────┘  │  💳 30-day money-back          │
│                           │     guarantee                  │
└───────────────────────────┴────────────────────────────────┘
```

### System Actions (On "Place Order")

1. Create Stripe payment intent
2. If account created: Register user in Supabase Auth
3. Store order in database (`orders` table)
4. Associate preview with order (`previews` table)
5. If Living Memory: Create pending AR video record (status: "awaiting_upload")
6. Send confirmation email

**Success** → STATE 6
**Failure** → Show error inline, allow retry

---

## STATE 6: Order Confirmation
**Route**: `/product/success?order_id=xxx`
**Time**: 1:15 (30 seconds in checkout)

### Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│  ✓ Order Confirmed!                                       │
│                                                            │
│  Order #WT-12847                                          │
│  Confirmation sent to: your@email.com                     │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Your artwork preview - watermarked]                │ │
│  │  Large display                                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  What happens next:                                       │
│  1. ✓ Your artwork is in production                       │
│  2. 📦 Ships within 5-7 business days                     │
│  3. 🚚 Tracking sent to your email                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Download Watermarked Preview]                      │ │
│  │  Share on social media while you wait                │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Living Memory Upload Prompt (If Applicable)

```
┌────────────────────────────────────────────────────────────┐
│  📹 Next: Upload Your Living Memory Video                 │
│                                                            │
│  You added Living Memory AR to your order!                │
│  Upload now or we'll email you a link.                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Drag & Drop Video Here]                            │ │
│  │  6-30 seconds • MP4, MOV, or AVI                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Upload Now]         [I'll Do This Later]                │
│                                                            │
│  If later: We'll email you a secure upload link          │
└────────────────────────────────────────────────────────────┘
```

### Watermark Removal Upsell (Primary Revenue Driver)

```
┌────────────────────────────────────────────────────────────┐
│  🔓 Want the Unwatermarked Version?                       │
│                                                            │
│  Get your artwork without watermark for sharing/printing  │
│                                                            │
│  ┌──────────────────────┬───────────────────────────────┐ │
│  │ ONE-TIME PURCHASE    │ CREATOR SUBSCRIPTION          │ │
│  │                      │ (Best Value)                  │ │
│  ├──────────────────────┼───────────────────────────────┤ │
│  │ $24.99               │ $9.99/month                   │ │
│  │                      │                               │ │
│  │ • This artwork only  │ • Unlimited generations       │ │
│  │ • HD download (4K)   │ • Remove all watermarks       │ │
│  │ • Instant access     │ • HD downloads (4K)           │ │
│  │                      │ • Save unlimited library      │ │
│  │                      │ • Priority processing         │ │
│  │                      │                               │ │
│  │ [Buy - $24.99]       │ [Subscribe - $9.99/mo]        │ │
│  └──────────────────────┴───────────────────────────────┘ │
│                                                            │
│  [No Thanks, Keep Watermarked]                            │
└────────────────────────────────────────────────────────────┘
```

### Account Creation Upsell (If Guest Checkout)

```
┌────────────────────────────────────────────────────────────┐
│  💾 Create Your Account to Track This Order               │
│                                                            │
│  Get instant access to:                                   │
│  • Order status and tracking                              │
│  • Your saved artwork library                             │
│  • Reorder or create new art anytime                      │
│                                                            │
│  [Activate My Account]                                    │
│  → Sends magic link to your@email.com                     │
└────────────────────────────────────────────────────────────┘
```

---

## Revenue Model Summary

### Customer Segments

**1. Canvas Buyers** (Primary - 5% conversion)
- Flow: Upload → Preview → Buy Canvas ($129-250)
- Upsells: Frame (+$29), Living Memory (+$59.99), AI Upscale (+$9)
- Post-purchase: Watermark removal offer

**2. Digital-Only Creators** (Recurring - 15% of visitors)
- Flow: Upload → Preview → Subscribe for watermark removal
- Price: $9.99/month (Creator tier)
- Use case: Social media, digital portfolios
- LTV: $119.88/year

**3. Power Users / Agencies** (High-LTV - 2% of visitors)
- Flow: Generate 8+ styles → Subscribe to Pro
- Price: $29.99/month
- Use case: Professional photographers, agencies
- LTV: $359.88/year

### Generation Limits Strategy

| User Type | Free Generations | Action After Limit | Revenue Goal |
|-----------|------------------|-------------------|--------------|
| Anonymous | 3 instant styles | Soft account prompt | Email capture |
| With Account | 8 total (3+5 more) | Soft subscription prompt | Subscription conversion |
| After 8th Gen | 0 more free | Hard gate: Account or subscribe | Forced decision |
| Subscriber (Creator/Pro) | Unlimited | N/A | Retained revenue |

### Watermark Removal Pricing

| Option | Price | When Offered | Target |
|--------|-------|--------------|--------|
| One-time removal | $24.99 | Post-purchase, library view | Canvas buyers wanting digital |
| Creator subscription | $9.99/mo | Generation limit, post-purchase | Regular creators |
| Pro subscription | $29.99/mo | Power users (8+ generations) | Agencies, professionals |

### Subscription Tiers

```typescript
enum SubscriptionTier {
  FREE = 'free',       // 3 anon, 8 with account
  CREATOR = 'creator', // $9.99/mo - Unlimited + watermark removal
  PRO = 'pro'          // $29.99/mo - Creator + priority + bulk
}
```

---

## Technical Implementation

### State Management (Zustand Store)

```typescript
interface ProductFlowState {
  // User Identity
  isAuthenticated: boolean;
  isSubscriber: boolean;
  userId: string | null;
  email: string | null;

  // Upload & Style
  uploadedImage: string | null;
  croppedImage: string | null;
  selectedOrientation: 'portrait' | 'square' | 'landscape';
  selectedStyle: { id: string; name: string } | null;
  preselectedStyleFromHero: string | null;

  // Customization
  selectedSize: '8x10' | '12x16' | '16x20' | '20x24';
  floatingFrame: { enabled: boolean; color: string };
  livingMemory: boolean;
  aiUpscale: boolean;

  // Preview Generation & Caching
  previewUrls: { [styleId: string]: string };
  isGenerating: boolean;
  generationErrors: { [styleId: string]: string };

  // Generation Limits
  totalGenerations: number;
  sessionGenerations: number;
  remainingFreeGenerations: number;
  accountPromptShown: boolean;

  // Analytics
  uploadTimestamp: number;
  firstPreviewTimestamp: number | null;

  // Actions
  setUploadedImage: (img: string) => void;
  generatePreview: (styleId: string) => Promise<void>;
  incrementGenerationCounter: () => void;
  checkGenerationLimits: () => 'allowed' | 'account_prompt' | 'subscription_gate';
}
```

### Key Components

**STATE 0-1**:
- `HeroSection.tsx` - Hero + CTA + carousel
- `StyleCarouselCard.tsx` - Hover interaction

**STATE 2**:
- `PhotoCropperModal.tsx` - react-easy-crop

**STATE 3**:
- `StyleSelectionLayout.tsx` - Canvas + grid
- `usePreviewGeneration.ts` - Generation logic

**STATE 3B**:
- `AccountCreationModal.tsx` - Prompt

**STATE 4**:
- `StudioLayout.tsx` - Main layout
- `CollapsibleStyleSidebar.tsx` - Slide-in picker
- `StickyOrderRail.tsx` - Order summary

**STATE 5**:
- `CheckoutLayout.tsx` - Guest checkout form
- `StripePaymentForm.tsx` - Stripe integration

**STATE 6**:
- `OrderConfirmation.tsx` - Success
- `WatermarkRemovalUpsell.tsx` - Subscription modal

### API Endpoints

```typescript
// Supabase Edge Functions
generateAndWatermarkPreview(image, styleId) → { url, status }
pollPreviewStatus(previewId) → { status, url? }
createOrder(orderData) → { orderId }
uploadLivingMemoryVideo(orderId, video) → { videoUrl, qrCode }
```

### Critical Timing Benchmarks

| Milestone | Target | Critical Factor |
|-----------|--------|-----------------|
| Homepage → Upload | 0:02 | No auth wall |
| Upload → Cropper | 0:03 | <1s validation |
| **First Preview** | **0:08** | **WOW MOMENT** |
| 2nd & 3rd Previews | 0:10-0:12 | Progressive |
| Continue to Studio | 0:15 | User decision |
| Checkout Complete | 1:15 | Fast users |

**Median Journey**: 2-3 minutes
**Fast Path**: 75 seconds
**Exploratory Path**: 5-8 minutes

---

## Key Principles

1. **No auth barriers** - Guest-first until generation limit
2. **Instant transitions** - <1s between states
3. **Time-to-wow < 10s** - First preview is critical
4. **Progressive disclosure** - Don't overwhelm
5. **Persistent conversion** - Bottom bar always visible
6. **Multi-revenue** - Canvas + Subscriptions + Watermark
7. **Mobile-first** - 50%+ traffic
8. **Cost control** - Soft prompts before hard gates

---

**END OF FLOWMAP**

This flow balances:
- ✅ Instant wow moment (8 seconds)
- ✅ Early email capture (after 3 generations)
- ✅ Multiple revenue streams (canvas + digital + pro)
- ✅ Cost control (generation limits with soft prompts)
- ✅ User freedom (can always checkout with existing previews)
