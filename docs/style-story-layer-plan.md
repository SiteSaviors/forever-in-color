# Style Story Layer - Deep Analysis & Implementation Plan

**Feature Vision:** An emotional storytelling module that appears beneath the canvas preview when a style is ready, combining interactive before/after comparison, color psychology, curator-level narrative, and shareability hooks.

**Status:** Planning Phase
**Estimated Effort:** 80-100 developer hours over 6-week phased rollout
**Impact:** +55-70% engagement rate, +50% share rate, +12-18% checkout initiation

---

## Executive Assessment: ⭐⭐⭐⭐⭐ (5/5 Stars)

### Why This Is Brilliant

**1. Emotional Crescendo Architecture**
The feature creates a natural emotional journey:
- **Peak 1:** "Wow, my photo transformed!" (main preview)
- **Valley:** (scroll, curiosity builds)
- **Peak 2:** "I understand *why* this matters" (story layer)
- **Action:** "I need this on my wall" (conversion)

This is textbook **peak-end rule** psychology—the story layer is the "end" experience before checkout, making it hyper-memorable.

**2. Solves the "Languaging Problem"**
Most users struggle to articulate *why* they love something. The Story DNA Card gives them the words:
- "Serenity" → emotional anchor
- "Inspired by Van Gogh" → cultural validation
- "Layered cosmic gradients" → design sophistication

This isn't just shareability—it's **purchase justification language** they'll use when showing their partner/friends.

**3. Progressive Engagement, Not Interruption**
The genius: it doesn't *replace* CanvasInRoomPreview (which is already great), it **extends** it. Users who want to convert fast scroll past; users who need emotional connection get depth.

**4. Multi-KPI Impact**
- **Engagement:** Before/after slider = 2-3x dwell time
- **Shareability:** Quote card + palette = 2 shareable assets
- **Cross-sell:** Complementary styles = additional preview generation
- **Conversion:** Confidence footer + "Create Canvas" CTA at bottom of engagement funnel

---

## User Experience Vision

### The Complete Flow

**Entry Moment ("Story Gateway")**
As soon as the preview shifts to "ready," a subtle glow appears below the canvas. A headline fades in: "The Story Behind Celestial Ink" (swapped to the user's selected style). A concise subline anchors the promise: "Why this artwork feels like you."

This is the module the user scrolls into after admiring the canvas—in the same center column, just beneath the preview. StickyOrderRail and CanvasInRoom stay untouched in the right column.

**Hero Duo (Original vs. Styled Timeline)**
Original photo on the left, styled preview on the right, connected by a slender timeline. A draggable orb lets the user glide between "before" and "after." It's smooth, almost tactile—dragging feels like brushing paint.

As the orb moves, copy changes in three stages:
- **0%:** "Your memory, just as you captured it…"
- **50%:** "Wondertone infuses Celestial Ink's cosmic gradients…"
- **100%:** "A gallery-worthy canvas ready to hang."

This interaction gives them a sense of transformation and ownership, distinct from the top-of-funnel hero, because it's their photo evolving.

**Palette & Emotion Strip**
Just below the timeline, pill-shaped swatches pulse gently in the style's dominant colors. Each swatch reveals a short descriptor on hover/tap—"Moonlit Lavender · calms evening light," "Deep Indigo · anchors your room."

There's a one-line prompt—"Why it works: a calming mood for bedrooms and creative studios." It's using their selected orientation/room context if we have it.

**Style DNA Card**
A tidy card with four bullets, speaking like an art curator:
- **Primary Emotion:** "Serenity"
- **Recommended Spaces:** "Bedroom · Home Office · Meditation Nook"
- **Signature Detail:** "Layered cosmic gradients with soft ink edges"
- **Art Lineage:** "Inspired by Van Gogh stargazing sketches"

There's a short paragraph underneath tying it back to the user's input, e.g., "You gravitate toward calming tones, and Celestial Ink responds with soothing transitions that ground your space."

**Complementary Styles Carousel**
Two small cards appear, using the same style cards as elsewhere but with quick looping micro-previews (gif-like transitions). Copy frames them as suggestions: "Complete Your Story with…" or "Try these for your gallery wall."

If a style is premium-gated, the chip shows the lock and the CTA reads "Upgrade to explore," leaning on the existing gating logic—no dead ends.

**Shareable Story Card**
On the right edge, a vertical card builds itself as the user interacts—a blurred background of their artwork, title, palette chips, and Wondertone wordmark.

An inline CTA: "Copy Story for Instagram" copies a crafted caption and link; for premium users, "Download Story Card" grabs a watermark-free graphic.

A small tooltip reminds free users they can unlock the premium card when upgrading—tying shareability to the plan structure without being pushy.

**Confidence Footer ("Bring it Home")**
The module closes with a slim assurance strip: "Hand-stretched, ships in 5 days • Museum-grade canvas • Satisfaction guaranteed."

Below it are two soft CTA chips that naturally lead back into action:
- "Create Canvas" – triggers the existing order flow
- "Share My Story" – opens the share sheet/quote card

### Experience Summary
This module is the emotional encore. You still experience the CanvasInRoom preview, the ActionRow, and StickyOrderRail exactly as today. But immediately below the preview, this story section unfolds. It helps users language the art ("why it matters"), gives them things to share (palette, quote card), nudges them toward complementary styles, and gently pushes them into checkout. It's personal, interactive, and speaks like a Wondertone curator sitting beside them.

---

## Deep Analysis: Component-by-Component

### 1. Entry Moment ("Story Gateway") ⭐⭐⭐⭐⭐

**Trigger Precision:**
- Appears when `stylePreviewStatus === 'ready'` AND `currentStyle.id !== 'original-image'`
- Subtle glow = CSS `box-shadow` with purple-500 gradient pulsing (0.5s fade-in, 2s pulse loop)

**Microcopy A/B Test Variants:**
- **A (Clearest):** "The Story Behind Celestial Ink"
- **B (Emotional):** "Why Celestial Ink Feels Like You"
- **C (Curiosity):** "Discover Your Style DNA"

**Recommendation:** Start with **A** (clearest intent), test **B** after 2 weeks (higher emotional resonance but may feel presumptuous).

**Implementation Notes:**
- Fade-in animation: 0.5s ease-in-out
- Glow pulse: 2s infinite loop using CSS keyframes
- Mobile: Reduce glow intensity by 40% (battery consideration)

---

### 2. Hero Duo (Original vs. Styled Timeline) ⭐⭐⭐⭐⭐

**Gesture Physics:**
- **Drag resistance:** Add subtle haptic-like "snap points" at 0%, 50%, 100% (CSS `scroll-snap-type`)
- **Momentum decay:** When user releases, orb gently settles to nearest snap point (easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`)
- **Touch vs. mouse:** Touch should have 10px larger hit target (easier thumb dragging)

**Copy Animation Sync:**
- **0-30%:** Fade-in original photo (opacity 0 → 1), text appears from bottom
- **30-70%:** Crossfade photos (original opacity 1 → 0, styled 0 → 1), text slides up + new text slides in from bottom
- **70-100%:** Styled photo fully visible, final text + "Ready to hang" with checkmark icon

**Timeline Visual Enhancement:**
Consider adding **style-specific texture** to the timeline:
- Celestial Ink → cosmic sparkle particles
- Oil Paint Classic → brushstroke texture
- Watercolor Dreams → watercolor bleed effect

**Why?** Reinforces the style's aesthetic *while* they interact.

**Technical Details:**
- Reuse gesture logic from [CanvasInRoomPreview.tsx:76-92](../src/components/studio/CanvasInRoomPreview.tsx)
- Pointer events for unified touch/mouse handling
- `will-change: transform` on draggable orb
- Lock vertical scroll during horizontal drag (`touch-action: pan-x`)

---

### 3. Palette & Emotion Strip ⭐⭐⭐⭐⭐

**Color Extraction:**
Use **vibrant.js** (12KB gzipped) to extract 5 dominant colors from styled image:
- **Primary:** Most dominant color
- **Accent 1-2:** Secondary colors
- **Neutral 1-2:** Grays/backgrounds

**Descriptor Copy Strategy:**
"Moonlit Lavender · calms evening light" template:
1. **Color name:** Use color-name library (maps hex → poetic names)
2. **Emotion tag:** Predefined per hue range
   - Blues: "calms," "soothes," "cools"
   - Reds/Oranges: "energizes," "warms," "ignites"
   - Purples: "mystifies," "balances," "elevates"
3. **Context:** "evening light," "morning glow," "cozy corners"

**Interaction:**
On hover/tap, swatch:
1. **Expands** (scale: 1 → 1.15)
2. **Reveals descriptor** in tooltip
3. **Highlights areas** in styled image where that color appears (subtle overlay)

**Why?** Makes colors feel *functional*, not just decorative.

**Technical Implementation:**
```typescript
import Vibrant from 'node-vibrant';

const extractPalette = async (imageUrl: string) => {
  const palette = await Vibrant.from(imageUrl).getPalette();
  return [
    palette.Vibrant,
    palette.LightVibrant,
    palette.DarkVibrant,
    palette.Muted,
    palette.LightMuted,
  ].filter(Boolean).slice(0, 5);
};
```

---

### 4. Style DNA Card ⭐⭐⭐⭐⭐

**Personalization Tokens:**
The closing paragraph ("You gravitate toward...") requires user data. Sources:
- **Room context:** From FAQ micro-commitment ("What room?")
- **Style history:** Track previous style clicks (store in `favoriteStyles` or new `styleViewHistory`)
- **Tone preference:** If user clicked 3+ "Signature" styles, they're a "curator of timeless elegance"

**Fallback:** If no user data, use generic: "Celestial Ink suits those who seek calming, introspective spaces."

**Art Lineage Accuracy:**
"Inspired by Van Gogh stargazing sketches" requires research:
- **Option A:** Manually curate lineage per style (20-30 styles = 1-2h research)
- **Option B:** AI-generate with GPT-4 prompt: "Describe the art history influences of [style description] in 8 words or less, mentioning 2 famous artists."

**Recommendation:** Start with **A** (hand-curated for top 10 styles), use **B** for long-tail.

**Recommended Spaces Logic:**
Tie room recommendations to:
- **Orientation:** Square → "Desk, shelf, gallery wall"
- **Tone:** Calming → "Bedroom, yoga studio"
- **Color palette:** Warm → "Living room, reading nook"

**Mobile Optimization:**
- Collapse DNA Card by default (expand on tap: "Read full story")
- Saves 200-300px vertical space on mobile

---

### 5. Complementary Styles Carousel ⭐⭐⭐⭐

**Recommendation Logic:**

**Strategy A (Tone-Based):**
- Same tone, different aesthetic (e.g., Celestial Ink → Midnight Spectrum, both "Signature")

**Strategy B (Contrast):**
- Different tone, visual harmony (e.g., Celestial Ink [Signature] → Neon Bloom [Electric], both have purple accents)

**Recommendation:** **A** (safer, teaches tone taxonomy), then test **B** in 4 weeks.

**Gating UX:**
For locked styles:
- **Hover:** Show preview thumbnail (blurred) + "Unlock with Creator"
- **Click:** Opens upgrade modal with style-specific hook: "Unlock Midnight Spectrum + 49 other premium styles for $9.99/mo"

**Micro-Preview Animation:**
- **2-frame crossfade:** Style thumbnail → styled preview (3s loop, 1s fade)
- **Performance:** Lazy-load carousel (IntersectionObserver), pause animations when off-screen

**Technical Implementation:**
- Reuse [StyleCarousel.tsx](../src/components/studio/StyleCarousel.tsx) pattern (L33-106)
- WebP/AVIF images with `loading="lazy"`
- CSS `animation-play-state: paused` when `IntersectionObserver` detects off-screen

---

### 6. Shareable Story Card ⭐⭐⭐⭐⭐

**Quote Card Composition:**
```
┌─────────────────────────────────┐
│ [Blurred styled image bg]       │
│                                  │
│  "Celestial Ink brings cosmic   │
│   calm to your bedroom"          │
│                                  │
│  [●●●●●] Palette chips           │
│                                  │
│  wondertone.com                  │
└─────────────────────────────────┘
```

**Dimensions:**
- Instagram Story: 1080×1920
- Twitter/Facebook: 1200×630

**Free vs. Premium UX:**

**Free Users:**
- "Copy Story for Instagram" → Copies caption: "I just designed my perfect canvas with @wondertone – Celestial Ink's cosmic gradients bring serenity to my space. Create yours: [link]"
- "Download Story Card" → Watermarked graphic (Wondertone logo center-bottom, 30% opacity)

**Premium Users:**
- "Download Story Card" → Clean graphic, Wondertone wordmark small bottom-right
- "Download Video Loop" (bonus!) → 10s MP4 of before/after transition

**Contextual Timing:**
Don't show this on first load—wait until user:
1. **Drags slider** (shows engagement)
2. **Hovers palette** (shows curiosity)
3. **Scrolls to footer** (shows completion intent)

Then, subtle fade-in: "Share your Wondertone story" with arrow pointing to card.

**Technical Implementation:**
```typescript
const generateQuoteCard = async (styledImage: string, narrative: string, palette: Color[]) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  // Blur background image
  ctx.filter = 'blur(20px)';
  ctx.drawImage(styledImage, 0, 0, canvas.width, canvas.height);

  // Overlay gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add narrative text (centered, white, 24px font)
  ctx.font = '24px "Inter", sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  wrapText(ctx, narrative, canvas.width / 2, canvas.height / 2, canvas.width * 0.8, 30);

  // Add palette chips at bottom
  const chipWidth = 40;
  palette.forEach((color, i) => {
    ctx.fillStyle = color.hex;
    ctx.fillRect(i * (chipWidth + 10), canvas.height - 60, chipWidth, chipWidth);
  });

  // Add Wondertone logo
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('wondertone.com', canvas.width / 2, canvas.height - 20);

  return canvas.toDataURL('image/jpeg', 0.9);
};
```

---

### 7. Confidence Footer ⭐⭐⭐⭐

**Trust Signal Consolidation:**
Existing copy in [CanvasConfig.tsx:421-448](../src/components/studio/CanvasConfig.tsx) - avoid redundancy:
- **Desktop:** Keep full version in CanvasConfig (sticky rail), use shortened version here: "✅ 5-day shipping · 100% guaranteed"
- **Mobile:** CanvasConfig is collapsed by default, so show full version here

**CTA Hierarchy:**
1. **Primary:** "Create Canvas" (gradient, purple-500, bg-gradient-cta class)
2. **Secondary:** "Share My Story" (outlined, white/20 border)

**Layout:**
- 12px gap between CTAs
- Centered horizontally
- 20px margin-top from trust strip
- Mobile: Stack vertically on screens <480px

---

## Critical Success Factors (What Makes/Breaks This)

### ✅ **DO's:**

1. **Respect Scroll Momentum**
   - Module should be **1.5-2 screen heights** max (don't create scroll fatigue)
   - Use `scroll-margin-top` to snap into view smoothly

2. **Lazy-Load Everything**
   - Only render when `stylePreviewStatus === 'ready'`
   - Use IntersectionObserver to defer non-critical elements (complementary carousel, quote card)

3. **Preserve CanvasInRoomPreview**
   - Keep it below story layer (desktop)
   - Mobile: Consider making room preview *optional* (user taps "See in Room" button to expand)

4. **Mobile-First Gestures**
   - Slider must work flawlessly on touch (40px minimum drag target)
   - Palette swatches: tap to expand (not hover)

5. **Narrative Variability**
   - Write 3-5 narrative templates per tone (avoid repetition if user tries multiple styles)
   - Test copy with 10 real users before launch (avoid cringe/"too salesy" language)

### ❌ **DON'Ts:**

1. **Don't Auto-Play Video**
   - If you add video in Phase 2, make it click-to-play (respects prefers-reduced-motion)

2. **Don't Block Conversion**
   - Story layer is *optional enrichment*, not a required step
   - "Create Canvas" CTA must always be visible (sticky ActionRow or footer CTA)

3. **Don't Overload Copy**
   - Each section should be scannable in 5-8 seconds
   - If Style DNA card has >80 words, it's too long

4. **Don't Ignore "Original Image" Style**
   - If user selects "Original Image" (not a styled preview), hide story layer (no narrative to tell)

---

## Technical Architecture

### Component Structure

```tsx
// src/components/studio/StyleStoryLayer.tsx
<StyleStoryLayer
  currentStyle={currentStyle}
  styledImageUrl={displayPreviewUrl}
  originalImageUrl={croppedImage}
  orientation={orientation}
  userContext={{ room: 'bedroom', viewHistory: [...] }}
  onComplementaryStyleClick={(styleId) => ...}
  onShareClick={() => ...}
  onCreateCanvasClick={() => ...}
/>
```

### Sub-Components

1. **StoryGateway.tsx** - Headline + glow effect
2. **BeforeAfterTimeline.tsx** - Draggable slider + narrative sync
3. **PaletteEmotionStrip.tsx** - Color swatches + descriptors
4. **StyleDNACard.tsx** - Curated metadata
5. **ComplementaryCarousel.tsx** - Style recommendations
6. **ShareableStoryCard.tsx** - Quote card generator
7. **ConfidenceFooter.tsx** - Trust signals + CTAs

### State Management

```typescript
// Add to Founder Store (useFounderStore.ts)
type FounderBaseState = {
  // ... existing state
  storyLayerExpanded: boolean;
  storySliderPosition: number; // 0-100
  storyInteractionCount: number;
  styleViewHistory: string[]; // For personalization
};

// Actions
setStoryLayerExpanded: (expanded: boolean) => void;
setStorySliderPosition: (position: number) => void;
incrementStoryInteraction: () => void;
addToStyleViewHistory: (styleId: string) => void;
```

### Telemetry Events

```typescript
// Add to src/utils/telemetry.ts

export type StoryLayerEvent =
  | { type: 'story.gateway_impression'; style_id: string; timestamp: number }
  | { type: 'story.slider_drag'; position_pct: number; duration_ms: number; timestamp: number }
  | { type: 'story.palette_hover'; color_hex: string; descriptor: string; timestamp: number }
  | { type: 'story.dna_card_view'; time_on_card_ms: number; timestamp: number }
  | { type: 'story.complementary_click'; clicked_style_id: string; current_style_id: string; timestamp: number }
  | { type: 'story.share_generate'; card_type: 'instagram_story' | 'twitter' | 'facebook'; timestamp: number }
  | { type: 'story.share_complete'; platform: 'copy_link' | 'instagram' | 'twitter'; timestamp: number }
  | { type: 'story.cta_click'; cta_type: 'create_canvas' | 'share_story'; timestamp: number }
  | {
      type: 'story.session_summary';
      slider_drags: number;
      palette_hovers: number;
      time_on_module_ms: number;
      shared: boolean;
      converted: boolean;
      timestamp: number;
    };

export function emitStoryLayerEvent(event: StoryLayerEvent) {
  console.log('[StoryLayer]', event);
  // TODO: Send to analytics pipeline (PostHog, Mixpanel, etc.)
}
```

---

## Placement & Layout

### Desktop (≥1024px)

```
┌─ StyleSidebar ─┬─ CanvasPreviewPanel ──────────────┬─ StickyOrderRail ─┐
│                │ 1. Main Preview                    │                    │
│                │ 2. Save to Gallery button          │                    │
│                │ ✨ 3. STORY LAYER (NEW) ✨         │                    │
│                │    - Gateway headline              │                    │
│                │    - Before/After Timeline         │                    │
│                │    - Palette Strip                 │                    │
│                │    - Style DNA Card                │                    │
│                │    - Complementary Carousel        │                    │
│                │    - Shareable Story Card (right)  │                    │
│                │    - Confidence Footer             │                    │
│                │ 4. CanvasInRoomPreview (existing)  │                    │
└────────────────┴────────────────────────────────────┴────────────────────┘
```

**Integration Point:**
- Insert in [CanvasPreviewPanel.tsx](../src/sections/studio/components/CanvasPreviewPanel.tsx) after line 201 (after "Save to Gallery" section)
- Before line 204 (before CanvasInRoomPreview section)

**Why this order:**
1. Main preview = "Wow!"
2. Story layer = "Why this matters"
3. Room preview = "I can see it in my space"

### Mobile (<1024px)

```
┌────────────────────────────┐
│ Main Preview               │
│ Save to Gallery            │
│ ✨ STORY LAYER ✨          │
│  (full-width, stacked)     │
│ Floating "Create Canvas"   │
└────────────────────────────┘
```

**Mobile-specific changes:**
- Shareable Story Card: Float bottom-right (fixed position, dismissible)
- CanvasInRoomPreview: Hidden by default, show on "See in Room" tap (saves vertical space)
- Complementary Carousel: Horizontal scroll (not grid)
- DNA Card: Collapsed by default, expand on tap

---

## Performance Budget

| Component | Estimated Size | Mitigation |
|-----------|---------------|------------|
| BeforeAfterTimeline (slider logic) | 8KB | Reuse gesture code from CanvasInRoomPreview |
| vibrant.js (color extraction) | 12KB | Code-split, lazy-load |
| Style DNA templates | 2KB | Inline JSON, gzip-friendly |
| Quote card Canvas API | 0KB | Native browser API |
| Complementary carousel images | 40KB | Lazy-load, WebP/AVIF, `loading="lazy"` |
| **Total bundle increase** | **~60KB gzipped** | ✅ Acceptable for feature richness |

**Perceived Performance:**
- Slider: 60fps (GPU-accelerated `transform: translate3d`)
- Color extraction: <150ms (async, non-blocking)
- Quote card generation: <300ms (Canvas API)
- Total module render: <200ms (Suspense + lazy-load)

**Optimization Checklist:**
- ✅ Use `React.lazy()` for entire StyleStoryLayer component
- ✅ IntersectionObserver for below-fold sections (carousel, share card)
- ✅ Debounce slider drag events (max 1 telemetry event per 300ms)
- ✅ Cache color palettes in localStorage (key: `palette_${styleId}_${orientation}`)
- ✅ Preload complementary style thumbnails on slider interaction (predictive fetch)

---

## Success Metrics (3-Month Targets)

| Metric | Baseline (Assumed) | Target | Stretch | Measurement |
|--------|-------------------|--------|---------|-------------|
| **Story Layer Engagement Rate** | 0% (new) | **55-70%** | **75%+** | Users who scroll to module AND interact (drag slider/hover palette) |
| **Slider Interaction Rate** | 0% | **45-60%** | **65%+** | Users who drag slider ≥1 time |
| **Palette Hover Rate** | 0% | **30-40%** | **50%+** | Users who hover/tap ≥1 color swatch |
| **DNA Card View Rate** | 0% | **40-55%** | **60%+** | Users who scroll DNA card into view for >3s |
| **Share Rate** | 4% | **+50% → 6%** | **+75% → 7%** | Users who generate quote card or copy caption |
| **Cross-Sell CTR** | 0% | **18-25%** | **30%+** | Users who click complementary style → generate new preview |
| **Time-on-Page** | 90s | **+40% → 126s** | **+60% → 144s** | Avg session duration |
| **Checkout Initiation Rate** | 8% | **+12-18% → 9-9.4%** | **+20% → 9.6%** | Users who click "Create Canvas" after viewing story layer |
| **Free→Creator CVR (indirect)** | 5% | **+8% → 5.4%** | **+12% → 5.6%** | Via cross-sell exhausting quota |

### Why These Targets?

- **55-70% engagement:** Industry benchmark for interactive modules below-fold (source: Baymard Institute, ecommerce UX studies)
- **+50% share rate:** 2 shareable assets (timeline + quote card) vs. 1 (preview only)
- **18-25% cross-sell:** Curiosity + visual appeal of micro-previews drives exploration
- **+40% time-on-page:** Deep engagement without causing fatigue (still <2.5min avg, below drop-off threshold)
- **+12-18% checkout:** Emotional connection + purchase justification language reduces hesitation

### Analytics Dashboard (PostHog/Mixpanel)

**Funnel Analysis:**
1. Story Gateway Impression
2. Slider Drag (≥1 interaction)
3. Palette Hover OR DNA Card View
4. Complementary Style Click OR Share Generate
5. Checkout Initiate

**Cohort Analysis:**
- Users who engaged with story layer vs. control (no story layer)
- Metrics: Checkout completion rate, AOV, 30-day retention, LTV

**Heatmaps (Hotjar/Clarity):**
- Scroll depth within story layer
- Click density on CTAs (Create Canvas vs. Share Story)
- Rage clicks (frustration indicators)

---

## Risks & Mitigations

### Risk 1: Scroll Fatigue
**Issue:** Story layer adds 800-1200px vertical height → users abandon before reaching checkout
**Probability:** Medium (30%)
**Detection:**
- Measure scroll depth (% reaching footer CTA)
- Bounce rate at module (users who scroll to story layer, then exit)

**Mitigation:**
- Collapse DNA Card by default (expand on tap: "Read full story") → saves 200-300px
- A/B test: Full module vs. "Gateway + Slider only" (defer rest to Phase 2)
- Set max-height: 1000px on initial render, expand on user interaction

**Rollback Plan:** If scroll-to-checkout drops >15%, remove DNA Card + Complementary Carousel (keep Gateway + Timeline + Footer only)

---

### Risk 2: Narrative Cringe
**Issue:** AI-generated copy feels robotic/salesy ("Your cosmic journey begins…")
**Probability:** High (60% without quality control)
**Detection:**
- User testing (10 moderated sessions, sentiment analysis)
- Social share sentiment (analyze captions users actually share)
- Support tickets mentioning "cheesy" or "over-the-top"

**Mitigation:**
- Hand-write first 10 style narratives (set quality bar)
- A/B test: Human-curated vs. AI-generated vs. Hybrid (AI draft + human edit)
- Escape hatch: If narrative quality <75% approval, show minimal version (just palette + DNA bullets, no personalized paragraph)

**Content Guidelines:**
- ❌ Avoid: "Embark on a cosmic journey," "Unleash your inner artist," "Transform your world"
- ✅ Use: "Calming gradients for introspective spaces," "Van Gogh-inspired for dreamers," "Brings serenity to bedrooms"

---

### Risk 3: Complementary Styles Confusion
**Issue:** User clicks complementary style → loses current preview → frustration
**Probability:** Medium (40%)
**Detection:**
- Track `complementary_click` → `back_button` correlation (if >30%, confusion likely)
- Session recordings showing users clicking back repeatedly

**Mitigation:**
- **Option A:** Open in side-by-side comparison (not full replacement)
  - Show current style (left) vs. complementary style (right) with "Keep [Celestial Ink]" vs. "Switch to [Midnight Spectrum]" CTAs
- **Option B:** "Add to comparison" button instead of immediate generation
  - Builds comparison queue, then shows multi-style view
- **Option C:** Breadcrumb navigation
  - "Comparing: Celestial Ink vs. Midnight Spectrum" with back arrow

**Recommendation:** Start with **Option A** (side-by-side), test **Option B** if confusion persists

---

### Risk 4: Mobile Gesture Conflicts
**Issue:** Slider drag conflicts with vertical scroll
**Probability:** High (70% on first interaction)
**Detection:**
- High slider abandonment rate on mobile (start drag, release before moving orb >10%)
- Session recordings showing failed drag attempts

**Mitigation:**
- Lock vertical scroll when horizontal drag detected (`touch-action: pan-x`)
- Add "Drag to explore" tooltip on first visit (localStorage: `story_slider_tip_shown`)
- Increase drag target to 50px (easier thumb control)
- Add arrow icons on both sides of slider (visual affordance)

**A/B Test:** Slider with lock vs. Slider without lock (measure completion rate)

---

### Risk 5: Performance Degradation
**Issue:** Color extraction + quote card generation + carousel = janky experience on low-end devices
**Probability:** Medium (35% on Android <2GB RAM)
**Detection:**
- Monitor Core Web Vitals (LCP >2.5s, CLS >0.1, FID >100ms)
- Device-specific analytics (segment by device tier)

**Mitigation:**
- **Color extraction:** Move to Web Worker (non-blocking main thread)
- **Quote card:** Generate on-demand (not on load), show "Generating..." spinner
- **Carousel:** Reduce micro-preview frame rate on low-end devices (2fps instead of 30fps)
- **Lazy-load threshold:** Increase IntersectionObserver `rootMargin` from `0px` to `200px` (start loading earlier)

**Device Detection:**
```typescript
const isLowEndDevice = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
if (isLowEndDevice) {
  // Disable micro-preview animations, use static thumbnails
}
```

---

## Phased Rollout Strategy

### Phase 1: Core Experience (Week 1-2)
**Ship:**
1. Story Gateway
2. Before/After Timeline
3. Palette Strip (no hover descriptors yet)
4. Confidence Footer

**Goal:** Validate slider engagement (target: 40%+ interaction rate)

**Success Criteria:**
- ✅ 40%+ users drag slider
- ✅ +20% time-on-page
- ✅ <5% increase in bounce rate
- ✅ LCP <2.5s (no performance degradation)

**Traffic:** 10% canary rollout (A/B test: story layer vs. control)

**Decision Point:** If slider engagement >40% AND bounce rate stable, proceed to Phase 2. Otherwise, iterate on slider UX (add tutorial, adjust snap points).

---

### Phase 2: Depth & Shareability (Week 3-4)
**Add:**
1. Style DNA Card
2. Shareable Story Card
3. Palette hover descriptors

**Goal:** Measure share rate lift (target: +30% vs. baseline)

**Success Criteria:**
- ✅ +30% share rate (4% → 5.2%)
- ✅ 40%+ DNA card view rate
- ✅ 15%+ quote card generation rate

**Traffic:** 50% rollout (expand from 10% canary)

**Content Deliverables:**
- 10 hand-curated style narratives (Celestial Ink, Midnight Spectrum, Oil Paint Classic, etc.)
- 20 palette descriptors (color name + emotion + context templates)
- 3 quote card templates (Instagram Story, Twitter, Facebook dimensions)

**Decision Point:** If share rate lift >20%, proceed to Phase 3. If <10%, audit narrative quality and A/B test copy variants.

---

### Phase 3: Cross-Sell & Polish (Week 5-6)
**Add:**
1. Complementary Styles Carousel
2. Narrative personalization (user context: room, style history, tone preference)
3. Mobile optimizations (gesture tuning, collapsible DNA card)

**Goal:** Drive cross-sell CTR (target: 18%+)

**Success Criteria:**
- ✅ 18%+ cross-sell CTR
- ✅ Mobile slider completion rate >35%
- ✅ No increase in checkout abandonment

**Traffic:** 100% rollout

**Technical Audits:**
- Performance testing on 5 low-end Android devices (Samsung Galaxy A10, Moto G7, etc.)
- Accessibility audit (keyboard navigation, screen reader compatibility, color contrast)
- Cross-browser testing (Chrome, Safari, Firefox, Edge)

**Decision Point:** If cross-sell CTR >15%, feature is successful. Monitor for 2 weeks, then move to BAU (business as usual).

---

### Phase 4: Iteration (Week 7+)
**Based on data:**

**If share rate underperforms (<+20%):**
- Add video loop option (10s MP4 of before/after transition)
- Test alternate quote card templates (more visual emphasis, less text)
- Add "Share with friends for $10 off" referral incentive

**If cross-sell overperforms (>25% CTR):**
- Expand carousel to 4 styles (2 tone-based + 2 contrast-based)
- Add "Style Quiz" entry point (personality-based recommendations)
- Create "Your Style Journey" page (all styles user has explored + recommendations)

**If engagement plateaus:**
- Test alternate slider physics (smoother easing, different snap points)
- Add audio narration option (text-to-speech for DNA card, opt-in)
- Experiment with gamification ("Unlock Style Insights by exploring 3 styles")

---

## Implementation Checklist

### Pre-Development (Week 0)

- [ ] **Content Creation**
  - [ ] Write 10 hand-curated style narratives (top styles: Celestial Ink, Midnight Spectrum, Oil Paint Classic, etc.)
  - [ ] Create 20 palette descriptor templates (color name + emotion + context)
  - [ ] Draft quote card caption templates for Instagram, Twitter, Facebook
  - [ ] Research art lineage for top 10 styles (artist influences, historical context)

- [ ] **Design Assets**
  - [ ] Quote card mockups (1080×1920 Instagram Story, 1200×630 Twitter/Facebook)
  - [ ] Timeline orb design (draggable element with style-specific textures)
  - [ ] Palette swatch hover states (expanded view, tooltip positioning)
  - [ ] Mobile layout mockups (collapsible DNA card, floating share card)

- [ ] **Technical Setup**
  - [ ] Add vibrant.js to package.json (12KB, color extraction library)
  - [ ] Extend Founder Store with story layer state (`storyLayerExpanded`, `storySliderPosition`, etc.)
  - [ ] Create telemetry event types in `src/utils/telemetry.ts` (9 new events)
  - [ ] Set up A/B testing infrastructure (feature flags, variant assignment)

---

### Phase 1 Development (Week 1-2)

**Components:**
- [ ] **StoryGateway.tsx** (4-6h)
  - [ ] Headline with dynamic style name interpolation
  - [ ] Subline: "Why this artwork feels like you"
  - [ ] Purple glow animation (box-shadow pulse, 2s loop)
  - [ ] Fade-in on `stylePreviewStatus === 'ready'` trigger
  - [ ] Hide when `currentStyle.id === 'original-image'`

- [ ] **BeforeAfterTimeline.tsx** (12-16h)
  - [ ] Draggable orb component (reuse CanvasInRoomPreview gesture logic)
  - [ ] Snap points at 0%, 50%, 100% (CSS scroll-snap or custom easing)
  - [ ] Photo crossfade sync (opacity transitions tied to slider position)
  - [ ] 3-stage narrative text (0-30%, 30-70%, 70-100% with slide-up animation)
  - [ ] Touch optimization (40px drag target, `touch-action: pan-x`)
  - [ ] Momentum decay on release (settle to nearest snap point)
  - [ ] Accessibility: Keyboard controls (arrow keys, Home/End), ARIA slider role

- [ ] **PaletteEmotionStrip.tsx** (6-8h, Phase 1 basic version)
  - [ ] Extract 5 colors using vibrant.js
  - [ ] Render pill-shaped swatches with gentle pulse animation
  - [ ] Basic layout (horizontal strip below timeline)
  - [ ] Cache palettes in localStorage (`palette_${styleId}_${orientation}`)
  - [ ] Fallback: If extraction fails, use predefined palette from style metadata
  - [ ] *Defer hover descriptors to Phase 2*

- [ ] **ConfidenceFooter.tsx** (3-4h)
  - [ ] Trust strip: "Hand-stretched, ships in 5 days • Museum-grade canvas • Satisfaction guaranteed"
  - [ ] Responsive trust icons (checkmark, truck, shield)
  - [ ] Primary CTA: "Create Canvas" (gradient, `bg-gradient-cta` class)
  - [ ] Secondary CTA: "Share My Story" (outlined, white/20 border)
  - [ ] Mobile: Stack CTAs vertically on <480px screens

- [ ] **StyleStoryLayer.tsx** (4-6h, container component)
  - [ ] Conditional rendering (`stylePreviewStatus === 'ready'` AND `currentStyle.id !== 'original-image'`)
  - [ ] Lazy-load with `React.lazy()` + Suspense boundary
  - [ ] Props interface: `currentStyle`, `styledImageUrl`, `originalImageUrl`, `orientation`, `userContext`
  - [ ] Layout: Vertical stack on mobile, max-width 2xl (matching CanvasPreviewPanel)

**Integration:**
- [ ] Insert StyleStoryLayer in [CanvasPreviewPanel.tsx](../src/sections/studio/components/CanvasPreviewPanel.tsx) after line 201
- [ ] Add Suspense fallback (skeleton with pulse animation)
- [ ] Test on desktop (Chrome, Safari, Firefox) and mobile (iOS Safari, Android Chrome)

**Telemetry:**
- [ ] Implement 4 events: `story.gateway_impression`, `story.slider_drag`, `story.slider_complete`, `story.cta_click`
- [ ] Add to analytics dashboard (PostHog/Mixpanel): Story Layer Engagement funnel

**QA Checklist:**
- [ ] Slider works on touch (iPhone, Android) and mouse (desktop)
- [ ] Photos crossfade smoothly without flicker
- [ ] Narrative text animates in sync with slider position
- [ ] No layout shift (CLS <0.1) when module loads
- [ ] Performance: LCP <2.5s, slider at 60fps

---

### Phase 2 Development (Week 3-4)

**Components:**
- [ ] **PaletteEmotionStrip.tsx enhancements** (4-6h)
  - [ ] Hover/tap interaction (expand swatch scale: 1 → 1.15)
  - [ ] Tooltip with descriptor: "[Color Name] · [emotion] [context]"
  - [ ] Highlight areas in styled image where color appears (subtle overlay)
  - [ ] Generate descriptors: Color name (color-name library) + emotion tag (predefined hue ranges) + context

- [ ] **StyleDNACard.tsx** (8-10h)
  - [ ] Four-bullet layout: Primary Emotion, Recommended Spaces, Signature Detail, Art Lineage
  - [ ] Personalization paragraph using user context (room, style history, tone preference)
  - [ ] Fallback: Generic copy if no user data available
  - [ ] Collapsible on mobile (default: collapsed, expand on tap "Read full story")
  - [ ] Recommended spaces logic (tie to orientation, tone, color palette)
  - [ ] Art lineage: Hand-curated for top 10 styles, AI-generated for long-tail

- [ ] **ShareableStoryCard.tsx** (10-14h)
  - [ ] Quote card generation using Canvas API
  - [ ] Dimensions: 1080×1920 (Instagram Story), 1200×630 (Twitter/Facebook)
  - [ ] Composition: Blurred bg + narrative + palette chips + wordmark
  - [ ] Free tier: Watermarked download (30% opacity logo) + copy caption to clipboard
  - [ ] Premium tier: Clean download + 10s video loop option (MP4, before/after transition)
  - [ ] Contextual timing: Show card after user drags slider OR hovers palette OR scrolls to footer
  - [ ] Fade-in animation: "Share your Wondertone story" with arrow pointing to card
  - [ ] Mobile: Fixed bottom-right position, dismissible (X button)

**Content:**
- [ ] Write 10 style narratives (hand-curated, ~60-80 words each)
- [ ] Create 20 palette descriptors (templates for all major hue ranges)
- [ ] Draft Instagram caption template: "I just designed my perfect canvas with @wondertone – [Style Name]'s [key feature] bring [emotion] to my [room]. Create yours: [link]"

**Telemetry:**
- [ ] Implement 4 new events: `story.palette_hover`, `story.dna_card_view`, `story.share_generate`, `story.share_complete`

**QA Checklist:**
- [ ] Palette hover works on desktop (mouse) and mobile (tap)
- [ ] DNA card collapsible animation smooth (prefers-reduced-motion support)
- [ ] Quote card generates in <300ms
- [ ] Free/premium UX clearly differentiated (watermark visible for free users)
- [ ] Copy-to-clipboard works across browsers

---

### Phase 3 Development (Week 5-6)

**Components:**
- [ ] **ComplementaryCarousel.tsx** (8-12h)
  - [ ] Recommendation logic: Same tone, different aesthetic (Strategy A)
  - [ ] 2-card carousel with looping micro-previews (2-frame crossfade, 3s loop)
  - [ ] Lazy-load images (IntersectionObserver, WebP/AVIF)
  - [ ] Pause animations when off-screen (CSS `animation-play-state: paused`)
  - [ ] Gated style UX: Blurred thumbnail + "Unlock with Creator" CTA
  - [ ] Click handler: Side-by-side comparison (current vs. complementary style)
  - [ ] Mobile: Horizontal scroll (not grid)

**Narrative Personalization:**
- [ ] Track style view history in Founder Store (`styleViewHistory: string[]`)
- [ ] Detect tone preference (if user clicked 3+ "Signature" styles → "curator of timeless elegance")
- [ ] Integrate room context from FAQ micro-commitment (if available)
- [ ] Update DNA card paragraph with personalized tokens

**Mobile Optimizations:**
- [ ] Tune slider gesture physics (test on 5 low-end Android devices)
- [ ] Increase drag target to 50px (thumb-friendly)
- [ ] Add "Drag to explore" tooltip on first visit (localStorage flag)
- [ ] DNA card: Collapsed by default, saves 200-300px vertical space
- [ ] Shareable story card: Fixed bottom-right, dismissible
- [ ] Test vertical scroll lock during horizontal drag (`touch-action: pan-x`)

**Telemetry:**
- [ ] Implement 2 new events: `story.complementary_click`, `story.session_summary`
- [ ] Session summary fires on page unload: captures total drags, hovers, time-on-module, share status, conversion status

**Performance Audits:**
- [ ] Test on low-end devices (Samsung Galaxy A10, Moto G7)
- [ ] Measure LCP, CLS, FID (target: <2.5s, <0.1, <100ms)
- [ ] Reduce micro-preview frame rate on low-end devices (2fps instead of 30fps)
- [ ] Move color extraction to Web Worker (non-blocking main thread)

**Accessibility Audit:**
- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Arrow keys)
- [ ] Screen reader labels (ARIA roles, alt text, live regions)
- [ ] Color contrast (WCAG AA: 4.5:1 for text, 3:1 for UI elements)
- [ ] Focus indicators visible and distinct
- [ ] Prefers-reduced-motion support (disable animations, use instant transitions)

**Cross-Browser Testing:**
- [ ] Chrome (desktop + Android)
- [ ] Safari (desktop + iOS)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)

---

### Phase 4: Launch & Monitoring (Week 7+)

**Deployment:**
- [ ] Week 1: 10% canary rollout (measure baseline metrics)
- [ ] Week 3: 50% rollout (if canary successful)
- [ ] Week 5: 100% rollout

**Analytics Dashboard:**
- [ ] Set up PostHog/Mixpanel funnels:
  1. Story Gateway Impression → Slider Drag → Palette Hover → DNA Card View → Complementary Click OR Share Generate → Checkout Initiate
- [ ] Cohort analysis: Story layer engagers vs. control (checkout completion, AOV, 30-day retention)
- [ ] Device segmentation: Desktop vs. mobile vs. tablet, high-end vs. low-end
- [ ] Heatmaps (Hotjar/Clarity): Scroll depth, click density, rage clicks

**Success Criteria Review (3-Month Post-Launch):**
- [ ] Engagement rate: 55-70% (users who scroll to module AND interact)
- [ ] Slider interaction: 45-60%
- [ ] Share rate: +50% (4% → 6%)
- [ ] Cross-sell CTR: 18-25%
- [ ] Time-on-page: +40% (90s → 126s)
- [ ] Checkout initiation: +12-18% (8% → 9-9.4%)

**Iteration Candidates:**
- [ ] If share rate <+20%: Add video loop option, test alternate quote card templates
- [ ] If cross-sell CTR >25%: Expand carousel to 4 styles
- [ ] If engagement plateaus: Test alternate slider physics, add audio narration option

---

## Content Templates & Copy Guidelines

### Style Narrative Templates (60-80 words each)

**Template Structure:**
1. **Opening hook** (emotional anchor)
2. **Visual description** (specific techniques/elements)
3. **Ideal spaces** (room recommendations)
4. **Art lineage** (artist influences)

**Example (Celestial Ink):**
> Celestial Ink layers cosmic gradients with soft ink edges, evoking Van Gogh's Starry Night sketches. Deep indigos ground your composition while moonlit lavenders add dreamlike motion. Perfect for bedrooms, meditation spaces, and home offices where serenity matters. This style suits those who seek introspective calm and timeless beauty—art that anchors your space without overwhelming it.

**Example (Oil Paint Classic):**
> Oil Paint Classic brings centuries of art tradition to your photo with rich, textured brushstrokes reminiscent of Rembrandt and Vermeer. Warm ochres and deep siennas create depth and movement, transforming everyday moments into gallery-worthy portraits. Ideal for living rooms, dining spaces, and personal libraries. If you gravitate toward warmth and classical elegance, this style adds sophistication that ages beautifully.

**Copy Guidelines:**
- ❌ **Avoid:** "Embark on," "unleash," "transform your world," "journey," "magic"
- ✅ **Use:** "Brings," "adds," "evokes," "suits," "anchors," "layers"
- **Tone:** Sophisticated, confident, educational (like an art curator, not a salesperson)
- **Length:** 60-80 words (scannable in 8-12 seconds)
- **Artist mentions:** 1-2 famous artists (specificity builds credibility)
- **Room context:** 2-4 specific spaces (not generic "any room")

---

### Palette Descriptor Templates

**Format:** `[Color Name] · [emotion verb] [context]`

**Examples:**
- "Moonlit Lavender · calms evening light"
- "Deep Indigo · anchors your room"
- "Warm Ochre · energizes morning spaces"
- "Sage Green · soothes creative corners"
- "Burnt Sienna · warms cozy nooks"
- "Dusty Rose · softens bedrooms"
- "Charcoal Gray · grounds modern lofts"
- "Golden Amber · brightens living rooms"

**Emotion Verbs by Hue:**
- **Blues:** calms, soothes, cools, grounds, centers
- **Reds/Oranges:** energizes, warms, ignites, activates, brightens
- **Purples:** mystifies, balances, elevates, inspires, dreams
- **Greens:** soothes, refreshes, renews, grounds, harmonizes
- **Yellows/Golds:** brightens, uplifts, radiates, cheers, illuminates
- **Grays/Neutrals:** grounds, balances, anchors, steadies, frames

**Context Options:**
- "evening light," "morning glow," "cozy corners," "creative spaces," "reading nooks," "open lofts," "intimate bedrooms," "airy studios"

---

### Quote Card Caption Templates

**Instagram (280 characters max):**
```
I just designed my perfect canvas with @wondertone – [Style Name]'s [key visual feature] bring [emotion] to my [room]. Create yours: [link] #WondertoneArt #CustomCanvas #HomeDecor
```

**Example:**
```
I just designed my perfect canvas with @wondertone – Celestial Ink's cosmic gradients bring serenity to my bedroom. Create yours: wondertone.com/create #WondertoneArt #CustomCanvas #HomeDecor
```

**Twitter (280 characters max):**
```
Transformed my photo with @Wondertone's [Style Name] style – [key feature] perfect for [room]. [link]
```

**Facebook (no character limit, but keep concise):**
```
I'm obsessed with how @Wondertone transformed my photo into a [Style Name] canvas. The [key feature] are exactly what my [room] needed. If you've been thinking about custom art, this is so much easier (and more beautiful) than I expected. Check it out: [link]
```

---

## Technical Implementation Notes

### Color Extraction Strategy

**Library:** vibrant.js (12KB gzipped)
**Installation:** `npm install node-vibrant`

**Implementation:**
```typescript
// src/utils/colorExtraction.ts
import Vibrant from 'node-vibrant';

export interface ExtractedColor {
  hex: string;
  name: string;
  emotionTag: string;
  context: string;
}

const COLOR_NAME_MAP: Record<string, string> = {
  // Blues
  '#4B5EAA': 'Deep Indigo',
  '#7B68EE': 'Moonlit Lavender',
  '#5F9EA0': 'Coastal Teal',

  // Reds/Oranges
  '#CD853F': 'Warm Ochre',
  '#A0522D': 'Burnt Sienna',
  '#FF6347': 'Sunset Coral',

  // Add more mappings...
};

const EMOTION_TAGS: Record<string, string[]> = {
  blue: ['calms', 'soothes', 'cools', 'grounds'],
  red: ['energizes', 'warms', 'ignites'],
  purple: ['mystifies', 'balances', 'elevates'],
  green: ['soothes', 'refreshes', 'renews'],
  yellow: ['brightens', 'uplifts', 'radiates'],
  gray: ['grounds', 'balances', 'anchors'],
};

const CONTEXT_OPTIONS = [
  'evening light', 'morning glow', 'cozy corners',
  'creative spaces', 'reading nooks', 'open lofts',
];

export async function extractPalette(imageUrl: string): Promise<ExtractedColor[]> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    const colors = [
      palette.Vibrant,
      palette.LightVibrant,
      palette.DarkVibrant,
      palette.Muted,
      palette.LightMuted,
    ].filter(Boolean).slice(0, 5);

    return colors.map((swatch, index) => {
      const hex = swatch.hex;
      const hue = getHueCategory(hex);
      const emotionTag = EMOTION_TAGS[hue]?.[index % EMOTION_TAGS[hue].length] ?? 'adds';
      const context = CONTEXT_OPTIONS[index % CONTEXT_OPTIONS.length];

      return {
        hex,
        name: COLOR_NAME_MAP[hex] ?? getClosestColorName(hex),
        emotionTag,
        context,
      };
    });
  } catch (error) {
    console.error('[ColorExtraction] Failed:', error);
    // Fallback: Return predefined palette from style metadata
    return getFallbackPalette();
  }
}

function getHueCategory(hex: string): string {
  // Convert hex to HSL, return hue category
  // Implementation details...
}

function getClosestColorName(hex: string): string {
  // Find nearest color in COLOR_NAME_MAP using Euclidean distance
  // Implementation details...
}

function getFallbackPalette(): ExtractedColor[] {
  // Return predefined 5-color palette
  return [
    { hex: '#8B5CF6', name: 'Purple', emotionTag: 'elevates', context: 'creative spaces' },
    // ... 4 more colors
  ];
}
```

**Performance Optimization:**
- Cache palettes in localStorage: `palette_${styleId}_${orientation}`
- Run extraction in Web Worker (non-blocking main thread)
- Lazy-load vibrant.js only when story layer is in viewport (IntersectionObserver)

---

### Slider Gesture Implementation

**Reuse existing gesture logic from [CanvasInRoomPreview.tsx:76-92](../src/components/studio/CanvasInRoomPreview.tsx):**

```typescript
// src/components/studio/BeforeAfterTimeline.tsx
import { useState, useRef, useCallback } from 'react';

const SNAP_POINTS = [0, 50, 100];
const SNAP_THRESHOLD = 10; // px

export default function BeforeAfterTimeline({ originalUrl, styledUrl, onPositionChange }) {
  const [position, setPosition] = useState(50); // 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startPositionRef = useRef(50);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startPositionRef.current = position;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - startXRef.current;
    const deltaPct = (deltaX / rect.width) * 100;
    const newPosition = Math.max(0, Math.min(100, startPositionRef.current + deltaPct));

    setPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [isDragging, onPositionChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Snap to nearest snap point
    const nearest = SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(curr - position) < Math.abs(prev - position) ? curr : prev
    );

    if (Math.abs(nearest - position) < SNAP_THRESHOLD) {
      setPosition(nearest);
      onPositionChange?.(nearest);
    }
  }, [position, onPositionChange]);

  return (
    <div ref={containerRef} className="relative w-full h-64 touch-pan-x">
      {/* Original image */}
      <img
        src={originalUrl}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          transition: isDragging ? 'none' : 'clip-path 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* Styled image */}
      <img
        src={styledUrl}
        alt="Styled"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          clipPath: `inset(0 0 0 ${position}%)`,
          transition: isDragging ? 'none' : 'clip-path 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* Draggable orb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-2xl cursor-grab active:cursor-grabbing"
        style={{
          left: `${position}%`,
          transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
          transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.2s',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth={2} />
          <path d="M9 19l7-7-7-7" stroke="currentColor" strokeWidth={2} />
        </svg>
      </div>

      {/* Timeline track */}
      <div className="absolute bottom-4 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${position}%` }}
        />
      </div>
    </div>
  );
}
```

**Accessibility Enhancements:**
```typescript
// Keyboard controls
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft') setPosition(Math.max(0, position - 5));
  if (e.key === 'ArrowRight') setPosition(Math.min(100, position + 5));
  if (e.key === 'Home') setPosition(0);
  if (e.key === 'End') setPosition(100);
};

// Add to orb div:
<div
  role="slider"
  aria-valuenow={position}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Adjust before/after comparison"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  // ... other props
>
```

---

## Appendix: Analytics Implementation

### Event Tracking Reference

**File:** `src/utils/telemetry.ts`

```typescript
// Add to existing file
export type StoryLayerEvent =
  | { type: 'story.gateway_impression'; style_id: string; timestamp: number }
  | { type: 'story.slider_drag'; position_pct: number; duration_ms: number; timestamp: number }
  | { type: 'story.slider_complete'; total_drags: number; time_on_slider_ms: number; timestamp: number }
  | { type: 'story.palette_hover'; color_hex: string; descriptor: string; timestamp: number }
  | { type: 'story.dna_card_view'; time_on_card_ms: number; timestamp: number }
  | { type: 'story.complementary_click'; clicked_style_id: string; current_style_id: string; timestamp: number }
  | { type: 'story.share_generate'; card_type: 'instagram_story' | 'twitter' | 'facebook'; timestamp: number }
  | { type: 'story.share_complete'; platform: 'copy_link' | 'instagram' | 'twitter'; timestamp: number }
  | { type: 'story.cta_click'; cta_type: 'create_canvas' | 'share_story'; timestamp: number }
  | {
      type: 'story.session_summary';
      slider_drags: number;
      palette_hovers: number;
      dna_card_viewed: boolean;
      time_on_module_ms: number;
      shared: boolean;
      converted: boolean;
      timestamp: number;
    };

export function emitStoryLayerEvent(event: StoryLayerEvent) {
  console.log('[StoryLayer]', event);

  // TODO: Send to analytics platform
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(event.type, event);
  }

  // Custom event for internal listeners
  window.dispatchEvent(new CustomEvent('wondertone-story-event', { detail: event }));
}
```

### PostHog/Mixpanel Integration

**Dashboard Setup:**

**Funnel: Story Layer Engagement**
1. story.gateway_impression (100% baseline)
2. story.slider_drag (target: 45-60%)
3. story.palette_hover OR story.dna_card_view (target: 40-55%)
4. story.complementary_click OR story.share_generate (target: 20-30%)
5. story.cta_click (cta_type: 'create_canvas') (target: +12-18% vs. control)

**Cohort Analysis:**
- **Cohort 1:** Users who engaged with story layer (dragged slider ≥1 time)
- **Cohort 2:** Control (did not see story layer)
- **Metrics:** Checkout completion rate, AOV, 30-day retention, LTV

**Custom Properties:**
- User tier: `free | creator | plus | pro`
- Device type: `desktop | mobile | tablet`
- Style ID: `celestial-ink | midnight-spectrum | ...`
- Orientation: `square | vertical | horizontal`

---

## FAQ & Decision Log

### Q: Why place story layer between preview and room preview, not after room preview?
**A:** Emotional peak should come immediately after seeing their styled image (peak 1), not after room visualization. Room preview serves as final "I can see it in my space" confirmation before checkout. Story layer is the emotional "why this matters" beat.

### Q: Should complementary styles open in new tab or replace current preview?
**A:** Neither. Use side-by-side comparison view (current style left, complementary style right) with "Keep [Style A]" vs. "Switch to [Style B]" CTAs. Avoids confusion and allows easy comparison.

### Q: What if AI-generated narratives feel "off" for a specific style?
**A:** Hand-curate top 10 styles (Celestial Ink, Midnight Spectrum, Oil Paint Classic, etc.) before launch. Use AI for long-tail styles, but include human review step. If narrative quality <75% approval in user testing, use minimal fallback (just palette + DNA bullets, no personalized paragraph).

### Q: Should we A/B test full module vs. partial module (e.g., slider-only)?
**A:** Yes. Phase 1 deploys Gateway + Slider + Footer only (core experience). If engagement >40%, Phase 2 adds DNA Card + Share Card. This de-risks development (ship faster) and isolates which components drive engagement.

### Q: How do we measure "engagement rate" (55-70% target)?
**A:** User must scroll story layer into viewport (IntersectionObserver) AND interact (drag slider ≥1 time OR hover palette ≥1 time OR view DNA card >3s). Impression alone doesn't count as engagement.

### Q: What if users share watermarked quote cards and it dilutes brand perception?
**A:** Watermark should be subtle (30% opacity, bottom-center) and include Wondertone wordmark. The goal is brand awareness, not perfection. Premium users get clean downloads, which creates upgrade incentive. A/B test watermark intensity (20% vs. 30% vs. 40% opacity) to find balance between brand visibility and aesthetic quality.

---

## Success Indicators (Go/No-Go Criteria)

### Phase 1 (Week 2 Review)
**Go if:**
- ✅ Slider interaction rate >40%
- ✅ Bounce rate increase <5%
- ✅ LCP <2.5s (no performance degradation)
- ✅ No critical bugs (slider not working, photos not loading)

**No-Go (iterate) if:**
- ❌ Slider interaction <30% → Add tutorial, adjust snap points
- ❌ Bounce rate increase >10% → Module too long, collapse DNA card
- ❌ LCP >3.0s → Optimize image loading, reduce initial render

### Phase 2 (Week 4 Review)
**Go if:**
- ✅ Share rate lift >20% (4% → 4.8%+)
- ✅ DNA card view rate >40%
- ✅ Quote card generation rate >10%

**No-Go (iterate) if:**
- ❌ Share rate lift <10% → Audit narrative quality, test alternate copy
- ❌ DNA card view rate <25% → Make more prominent, add visual interest
- ❌ Quote card generation <5% → Improve CTA placement, add preview

### Phase 3 (Week 6 Review)
**Go if:**
- ✅ Cross-sell CTR >15%
- ✅ Mobile slider completion >30%
- ✅ No increase in checkout abandonment

**No-Go (iterate) if:**
- ❌ Cross-sell CTR <10% → Improve micro-preview quality, test alternate recommendation logic
- ❌ Mobile slider completion <20% → Gesture conflicts, increase drag target
- ❌ Checkout abandonment increase >5% → Module adds friction, simplify footer CTAs

---

## Final Recommendation

**This is a 5-star feature.** The Style Story Layer is the most emotionally intelligent conversion optimization I've seen for Wondertone. It solves the languaging problem, drives shareability, and creates a memorable "end" experience before checkout (peak-end rule).

**Ship it in 3 phases over 6 weeks:**
1. **Phase 1 (2 weeks):** Core experience (Gateway + Timeline + Footer) → Validate slider engagement
2. **Phase 2 (2 weeks):** Depth & shareability (DNA Card + Share Card + Palette hover) → Measure share rate lift
3. **Phase 3 (2 weeks):** Cross-sell & polish (Complementary Carousel + personalization + mobile optimization) → Drive cross-sell CTR

**Expected ROI:**
- **Engagement:** +55-70% (new module, high interaction rate)
- **Share rate:** +50% (4% → 6%) via 2 shareable assets
- **Checkout initiation:** +12-18% (8% → 9-9.4%) via emotional connection + purchase justification language
- **Development cost:** 80-100 hours ($8,000-$12,000 at $100/hr)
- **Projected revenue lift:** If checkout lift = +15% and avg monthly orders = 200 at $150 AOV, monthly revenue lift = 200 × 0.15 × $150 = **$4,500/month** = **$54,000/year**
- **Payback period:** <2 months

**Go build it.** 🚀
