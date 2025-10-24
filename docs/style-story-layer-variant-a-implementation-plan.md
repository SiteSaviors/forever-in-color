# Style Story Layer - Variant A Implementation Plan
**The "Lean, No-Regrets" Cut for V1 Launch**

**Status:** Ready for Implementation
**Estimated Effort:** 1-2 hours total development time
**Bundle Impact:** ~8KB gzipped (static components only)
**Risk Level:** ⭐ Very Low (no gesture physics, no Canvas API, no external dependencies)

---

## Executive Summary

Variant A is the **static, vertical-scroll** version of the Style Story Layer—designed to ship fast, prove the storytelling concept, and gather clean telemetry data before investing in interactive features.

> ✅ **Implementation status (April 2024):** Variant A is live behind `VITE_STORY_LAYER_ENABLED`. Layout, share CTA strip, complementary gating, and telemetry are complete. Use this document as the maintenance guide for copy/styling updates.

### What Makes Variant A "No-Regrets"

1. ✅ **Fast to ship** (1-2h vs. 80-100h for full interactive version)
2. ✅ **Low technical risk** (no gesture conflicts, no Canvas API edge cases)
3. ✅ **Delivers 70-85% of emotional value** (narrative, palette, cross-sell, shareability)
4. ✅ **Clean baseline data** (proves storytelling concept before investing in slider/interactions)
5. ✅ **Easy to upgrade** (Variant A → Variant B is additive, not a rewrite)

### What's Different From Variant B

| Feature | Variant B (Interactive) | Variant A (Static) | Why Defer to V2 |
|---------|------------------------|-------------------|-----------------|
| **Before/After slider** | Draggable timeline with gesture physics | Static styled image only | Gesture physics = 40% of dev time, unproven engagement value |
| **Color extraction** | Live palette from styled image (vibrant.js) | Predefined palette from style metadata | Vibrant.js = 12KB + edge cases, fallback needed anyway |
| **Quote card generation** | Canvas API dynamic generation | Static download link | Canvas API = browser quirks, premium-only feature |
| **Micro-preview animations** | Looping 2-frame crossfades | Static thumbnails | Animation complexity, performance risk on low-end devices |
| **Narrative personalization** | Dynamic user context (room, history) | Generic narrative per style | Personalization requires user data we don't have at V1 |

**Bottom Line:** Variant A keeps the storytelling, removes the technical complexity.

### Live Implementation Snapshot

| Surface | Current Behavior |
| --- | --- |
| Gateway | Two-line headline with ambient glow, gated by feature flag |
| Story Card | Two-column top (preview + narrative), curator tiles span full width bottom |
| Palette Strip | Responsive row, emits `storyLayer.palette_hover` on hover/focus/touch |
| Complementary | One free + one premium suggestion, lock overlay + upgrade modal |
| Share Cue | Copy caption, download image (upgrade prompt), social icon row (toast placeholder) |
| Confidence Footer | Glowing "Unlock Full Studio" pill + secondary "Create Canvas" |
| Telemetry | Impression, palette hover, complementary clicks, share, CTAs |
| Orientation | Story layer re-renders automatically on orientation change, hint banner dismissed on intersect |

**Maintenance Cheatsheet**
- Toggle feature: `.env` → `VITE_STORY_LAYER_ENABLED`
- Update narratives/palettes: `src/utils/storyLayer/copy.ts`
- Adjust share/social messaging: `StoryLayer.tsx` (`SOCIAL_DESCRIPTIONS`, toast copy)
- Swap CTA copy/styling: `ConfidenceFooter.tsx`
- Telemetry helpers: `src/utils/storyLayerAnalytics.ts`

---

## User Experience Flow

### Trigger Condition
Variant A appears when:
- `stylePreviewStatus === 'ready'` (preview generation complete)
- `currentStyle.id !== 'original-image'` (not showing for untransformed photos)
- User scrolls past "Save to Gallery" button (natural scroll progression)

### Visual Journey (0-15s)

**0-1s: Arrival**
- Existing canvas preview settles into "Ready to print" state
- Soft gradient glow fades in beneath preview (purple-500, 0.5s fade, 2s pulse loop)
- Gateway headline appears: **"The Story Behind {Style Name}"**
- Subheadline: **"See why this Wondertone moment feels special."**

**1-5s: Story Card (Primary Frame)**
Full-width card appears below gateway:

```
┌─────────────────────────────────────────────────────────┐
│  [Styled Image]        │  Story Narrative               │
│  (left 40%)            │  (right 60%)                   │
│                        │                                 │
│  Static preview        │  "{Style Name} drifts soft     │
│  of styled result      │  indigo light across your shot,│
│                        │  layering inky gradients        │
│                        │  inspired by celestial skies." │
│                        │                                 │
│                        │  ✨ Emotion: Serenity          │
│                        │  🏠 Perfect for: Bedrooms,     │
│                        │      creative corners           │
│                        │  🎨 Signature detail: Feathered│
│                        │      ink halos around highlights│
└─────────────────────────────────────────────────────────┘
```

**5-8s: Palette Strip (Secondary Frame)**
Below story card, horizontal row of 5 color swatches:
- Pill-shaped, gentle pulse animation (1s loop)
- Each swatch shows: color chip + one-line descriptor
- Desktop: Hover reveals tooltip
- Mobile: Tap locks tooltip (tap elsewhere to dismiss)

**Example:**
```
[Moonlit Lavender] · calms evening light
[Deep Indigo] · anchors your room
[Dusty Rose] · softens bedrooms
```

**8-12s: "Pairs Well With..." Suggestions**
Two mini-cards below palette:
- Each shows: style thumbnail, style name, 1-line reason
- Button: "Try [Style Name]" (reopens style picker)
- If premium-locked: "Unlock with Creator" + lock icon

**12-15s: Share Cue + Confidence Footer**
Slim panel with two actions:
- **"Copy Story Caption"** → Copies prewritten Instagram caption with link
- **"Download Story Card"** → For premium: clean image; for free: watermarked + upgrade nudge

Trust message below:
- "Printed on museum-grade canvas, ships in 5 days."

Final CTAs (center-aligned):
- **Primary:** "Unlock Full Studio" (drives subscription)
- **Secondary:** "Create Canvas" (ties to StickyOrderRail flow)

---

## Component Architecture

### File Structure
```
src/components/studio/
├── StyleStoryLayerVariantA.tsx          (Container, lazy-loaded)
├── story-layer/
│   ├── StoryGateway.tsx                  (Headline + glow)
│   ├── StoryCard.tsx                     (Image + narrative + bullets)
│   ├── PaletteStrip.tsx                  (5 color swatches)
│   ├── ComplementaryMiniCards.tsx        (2 style suggestions)
│   ├── ShareCue.tsx                      (Caption + download)
│   └── ConfidenceFooter.tsx              (Trust + CTAs)
```

### Integration Point
**File:** [src/sections/studio/components/CanvasPreviewPanel.tsx](../src/sections/studio/components/CanvasPreviewPanel.tsx)

**Insert after line 201** (after "Save to Gallery" section):
```tsx
{previewStateStatus === 'ready' && currentStyle && currentStyle.id !== 'original-image' && (
  <Suspense fallback={<StoryLayerFallback />}>
    <StyleStoryLayerVariantA
      currentStyle={currentStyle}
      styledImageUrl={displayPreviewUrl}
      orientation={orientation}
      userTier={userTier}
    />
  </Suspense>
)}
```

**Why this placement:**
1. ✅ Appears after user sees styled preview (emotional peak 1)
2. ✅ Before CanvasInRoomPreview (emotional peak 2)
3. ✅ Natural scroll progression (users who want depth scroll; users who want to convert skip)

---

## Component Specifications

### 1. StoryGateway.tsx (5 min implementation)

**Purpose:** Entry headline with visual hook (gradient glow)

**Props:**
```typescript
type StoryGatewayProps = {
  styleName: string;
};
```

**Visual Specs:**
- Headline: `text-2xl font-bold text-white` (32px, 700 weight)
  - Template: `"The Story Behind {styleName}"`
- Subheadline: `text-sm text-white/70` (14px, 400 weight)
  - Static: `"See why this Wondertone moment feels special."`
- Gradient glow:
  - `box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3)` (purple-500, 30% opacity)
  - Animation: 2s pulse loop (opacity 0.2 → 0.4 → 0.2)
- Spacing: `mt-12 mb-6` (48px top, 24px bottom)

**Animation:**
- Fade-in: 0.5s ease-in-out
- Stagger: Headline appears first, subheadline 0.2s after

**Code Snippet:**
```tsx
export default function StoryGateway({ styleName }: StoryGatewayProps) {
  return (
    <div className="mt-12 mb-6 text-center space-y-2 animate-fadeIn">
      <div
        className="inline-block rounded-2xl px-6 py-3"
        style={{
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      >
        <h2 className="text-2xl font-bold text-white">
          The Story Behind {styleName}
        </h2>
      </div>
      <p className="text-sm text-white/70 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        See why this Wondertone moment feels special.
      </p>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2); }
          50% { box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4); }
        }
      `}</style>
    </div>
  );
}
```

**Telemetry:**
```typescript
// Fire once when component mounts
{ type: 'story.gateway_impression', style_id: string, timestamp: number }
```

---

### 2. StoryCard.tsx (20 min implementation)

**Purpose:** Primary narrative frame (image + copy + bullets)

**Props:**
```typescript
type StoryCardProps = {
  styleName: string;
  styledImageUrl: string;
  narrative: string;
  emotion: string;
  perfectFor: string;
  signatureDetail: string;
};
```

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [Image]     │  Narrative Text              │
│  40% width   │  60% width                   │
│              │                               │
│  Aspect:     │  2-3 sentences                │
│  1:1 or      │                               │
│  orientation │  ✨ Emotion: Serenity        │
│  ratio       │  🏠 Perfect for: Bedrooms... │
│              │  🎨 Signature: Feathered...  │
└─────────────────────────────────────────────┘
```

**Visual Specs:**
- Container: `bg-white/5 border-2 border-white/10 rounded-2xl p-6 md:p-8`
- Grid: `grid grid-cols-1 md:grid-cols-5 gap-6`
- Image column: `md:col-span-2` (40% on desktop)
- Text column: `md:col-span-3` (60% on desktop)

**Image:**
- Border radius: `rounded-xl`
- Aspect ratio: Match orientation (square = 1:1, vertical = 4:5, horizontal = 3:2)
- Shadow: `shadow-2xl`

**Narrative:**
- Font: `text-base text-white/90 leading-relaxed` (16px, line-height 1.75)
- Max width: `max-w-prose` (65ch)
- Margin bottom: `mb-6`

**Bullets:**
- Layout: `space-y-3` (12px vertical gap)
- Each bullet: `flex items-start gap-3`
- Icon: 20px lucide-react icon, `text-purple-400`
- Label: `text-sm font-semibold text-white` (emotion, perfect for, signature)
- Value: `text-sm text-white/80`

**Icons:**
- Emotion: `<Sparkles />` (lucide-react)
- Perfect for: `<Home />` (lucide-react)
- Signature: `<Paintbrush />` (lucide-react)

**Code Snippet:**
```tsx
import { Sparkles, Home, Paintbrush } from 'lucide-react';

export default function StoryCard({
  styleName,
  styledImageUrl,
  narrative,
  emotion,
  perfectFor,
  signatureDetail,
}: StoryCardProps) {
  return (
    <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 md:p-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Image */}
        <div className="md:col-span-2">
          <img
            src={styledImageUrl}
            alt={styleName}
            className="w-full rounded-xl shadow-2xl"
            style={{ aspectRatio: '1 / 1' }} // Adjust based on orientation
          />
        </div>

        {/* Narrative + Bullets */}
        <div className="md:col-span-3 flex flex-col justify-center space-y-6">
          <p className="text-base text-white/90 leading-relaxed max-w-prose">
            {narrative}
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-semibold text-white">Emotion: </span>
                <span className="text-sm text-white/80">{emotion}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-semibold text-white">Perfect for: </span>
                <span className="text-sm text-white/80">{perfectFor}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Paintbrush className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-semibold text-white">Signature detail: </span>
                <span className="text-sm text-white/80">{signatureDetail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Telemetry:**
```typescript
// Fire when card scrolls into view (IntersectionObserver)
{ type: 'story.card_view', style_id: string, time_on_card_ms: number, timestamp: number }
```

---

### 3. PaletteStrip.tsx (15 min implementation)

**Purpose:** Visual color breakdown with emotional descriptors

**Props:**
```typescript
type PaletteColor = {
  hex: string;
  name: string;
  descriptor: string; // e.g., "calms evening light"
};

type PaletteStripProps = {
  colors: PaletteColor[]; // Always 5 colors
};
```

**Layout:**
```
[●] Moonlit Lavender · calms evening light
[●] Deep Indigo · anchors your room
[●] Dusty Rose · softens bedrooms
[●] Warm Ochre · energizes morning spaces
[●] Charcoal Gray · grounds modern lofts
```

**Visual Specs:**
- Container: `mt-8 space-y-3` (32px top margin)
- Each swatch: `flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors`
- Color chip: `w-8 h-8 rounded-full border-2 border-white/20` (32px diameter)
- Text: `text-sm text-white/80` (14px)

**Interaction:**
- Desktop: Hover reveals tooltip with longer description
- Mobile: Tap locks tooltip (tap elsewhere to dismiss)
- Pulse animation: Color chip pulses gently (1s loop, scale 1 → 1.05 → 1)

**Code Snippet:**
```tsx
export default function PaletteStrip({ colors }: PaletteStripProps) {
  const [activeSwatch, setActiveSwatch] = useState<number | null>(null);

  return (
    <div className="mt-8 space-y-3">
      {colors.map((color, index) => (
        <div
          key={index}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => setActiveSwatch(activeSwatch === index ? null : index)}
          onMouseEnter={() => setActiveSwatch(index)}
          onMouseLeave={() => setActiveSwatch(null)}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0"
            style={{
              backgroundColor: color.hex,
              animation: 'pulse-swatch 1s ease-in-out infinite',
            }}
          />
          <span className="text-sm text-white/80">
            {color.name} · {color.descriptor}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes pulse-swatch {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
```

**Telemetry:**
```typescript
// Fire on hover/tap
{ type: 'story.palette_interact', color_hex: string, color_name: string, timestamp: number }
```

---

### 4. ComplementaryMiniCards.tsx (10 min implementation)

**Purpose:** Cross-sell 2 related styles

**Props:**
```typescript
type ComplementaryStyle = {
  id: string;
  name: string;
  thumbnail: string;
  reason: string; // e.g., "Keeps the dreamy tone for your gallery wall"
  isLocked: boolean;
  requiredTier?: string;
};

type ComplementaryMiniCardsProps = {
  styles: ComplementaryStyle[]; // Always 2 styles
  onStyleClick: (styleId: string) => void;
};
```

**Layout:**
```
┌────────────────┐  ┌────────────────┐
│ [Thumbnail]    │  │ [Thumbnail]    │
│ Style Name     │  │ Style Name     │
│ "Keeps the..." │  │ "Adds warmth..."│
│ [Try Style]    │  │ [🔒 Unlock]    │
└────────────────┘  └────────────────┘
```

**Visual Specs:**
- Container: `mt-8 grid grid-cols-1 md:grid-cols-2 gap-4`
- Card: `bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all`
- Thumbnail: `w-full aspect-square rounded-lg mb-3`
- Style name: `text-base font-semibold text-white mb-2`
- Reason: `text-sm text-white/70 mb-3 line-clamp-2` (max 2 lines)
- Button: `w-full py-2 rounded-lg text-sm font-semibold`
  - Unlocked: `bg-purple-500 text-white hover:bg-purple-600`
  - Locked: `bg-white/10 text-white/70 border border-white/20`

**Code Snippet:**
```tsx
import { Lock } from 'lucide-react';

export default function ComplementaryMiniCards({ styles, onStyleClick }: ComplementaryMiniCardsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">Pairs Well With...</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles.map((style) => (
          <div
            key={style.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
          >
            <img
              src={style.thumbnail}
              alt={style.name}
              className="w-full aspect-square rounded-lg mb-3 object-cover"
            />
            <h4 className="text-base font-semibold text-white mb-2">{style.name}</h4>
            <p className="text-sm text-white/70 mb-3 line-clamp-2">{style.reason}</p>
            <button
              onClick={() => onStyleClick(style.id)}
              className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
                style.isLocked
                  ? 'bg-white/10 text-white/70 border border-white/20'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {style.isLocked && <Lock className="w-4 h-4" />}
              {style.isLocked ? `Unlock with ${style.requiredTier}` : `Try ${style.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Telemetry:**
```typescript
{ type: 'story.complementary_click', clicked_style_id: string, current_style_id: string, is_locked: boolean, timestamp: number }
```

---

### 5. ShareCue.tsx (10 min implementation)

**Purpose:** Social sharing + download call-to-action

**Props:**
```typescript
type ShareCueProps = {
  styleName: string;
  styledImageUrl: string;
  userTier: 'free' | 'creator' | 'plus' | 'pro';
  onCaptionCopy: () => void;
  onDownload: () => void;
};
```

**Layout:**
```
┌────────────────────────────────────────────┐
│  Share your Wondertone story               │
│  ┌──────────────────┐  ┌──────────────────┐│
│  │ Copy Caption     │  │ Download Card    ││
│  └──────────────────┘  └──────────────────┘│
│  (Free: Unlock watermark-free with Creator)│
└────────────────────────────────────────────┘
```

**Visual Specs:**
- Container: `mt-8 bg-white/5 border border-white/10 rounded-xl p-6`
- Headline: `text-base font-semibold text-white mb-4`
- Buttons: `grid grid-cols-1 md:grid-cols-2 gap-3`
- Button style: `py-2.5 px-4 rounded-lg text-sm font-semibold border-2`
  - "Copy Caption": `bg-white/10 text-white border-white/20 hover:bg-white/15`
  - "Download Card": `bg-purple-500 text-white border-purple-400 hover:bg-purple-600`
- Free tier note: `text-xs text-white/60 mt-3 text-center`

**Caption Template:**
```
"I just designed my perfect canvas with @wondertone – {styleName}'s {key feature} bring {emotion} to my {room}. Create yours: wondertone.com/create #WondertoneArt #CustomCanvas"
```

**Code Snippet:**
```tsx
export default function ShareCue({ styleName, styledImageUrl, userTier, onCaptionCopy, onDownload }: ShareCueProps) {
  const isPremium = userTier !== 'free';

  const handleCaptionCopy = () => {
    const caption = `I just designed my perfect canvas with @wondertone – ${styleName} transforms memories into wall art. Create yours: wondertone.com/create #WondertoneArt`;
    navigator.clipboard.writeText(caption);
    onCaptionCopy();
  };

  return (
    <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-base font-semibold text-white mb-4">Share your Wondertone story</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleCaptionCopy}
          className="py-2.5 px-4 rounded-lg text-sm font-semibold border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition"
        >
          Copy Caption
        </button>
        <button
          onClick={onDownload}
          className="py-2.5 px-4 rounded-lg text-sm font-semibold border-2 bg-purple-500 text-white border-purple-400 hover:bg-purple-600 transition"
        >
          Download Card {!isPremium && '(Watermarked)'}
        </button>
      </div>
      {!isPremium && (
        <p className="text-xs text-white/60 mt-3 text-center">
          Unlock watermark-free downloads with Creator tier
        </p>
      )}
    </div>
  );
}
```

**Telemetry:**
```typescript
{ type: 'story.caption_copy', style_id: string, timestamp: number }
{ type: 'story.download_card', style_id: string, user_tier: string, timestamp: number }
```

---

### 6. ConfidenceFooter.tsx (10 min implementation)

**Purpose:** Final trust signals + dual CTAs

**Props:**
```typescript
type ConfidenceFooterProps = {
  onUnlockStudio: () => void;
  onCreateCanvas: () => void;
};
```

**Layout:**
```
┌────────────────────────────────────────────┐
│  Printed on museum-grade canvas,           │
│  ships in 5 days.                          │
│                                             │
│  ┌──────────────────┐  ┌──────────────────┐│
│  │ Unlock Full      │  │ Create Canvas    ││
│  │ Studio           │  │                  ││
│  └──────────────────┘  └──────────────────┘│
└────────────────────────────────────────────┘
```

**Visual Specs:**
- Container: `mt-8 text-center space-y-6`
- Trust message: `text-sm text-white/70 flex items-center justify-center gap-2`
- Checkmark icon: `<CheckCircle className="w-4 h-4 text-emerald-400" />`
- Buttons: `flex flex-col md:flex-row items-center justify-center gap-3`
- Primary CTA: `px-6 py-3 rounded-xl font-semibold bg-gradient-cta text-white shadow-glow-purple hover:shadow-glow-purple`
- Secondary CTA: `px-6 py-3 rounded-xl font-semibold bg-white/10 text-white border-2 border-white/20 hover:bg-white/15`

**Code Snippet:**
```tsx
import { CheckCircle } from 'lucide-react';

export default function ConfidenceFooter({ onUnlockStudio, onCreateCanvas }: ConfidenceFooterProps) {
  return (
    <div className="mt-8 text-center space-y-6">
      <p className="text-sm text-white/70 flex items-center justify-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        Printed on museum-grade canvas, ships in 5 days.
      </p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <button
          onClick={onUnlockStudio}
          className="px-6 py-3 rounded-xl font-semibold bg-gradient-cta text-white shadow-glow-purple hover:shadow-glow-purple transition"
        >
          Unlock Full Studio
        </button>
        <button
          onClick={onCreateCanvas}
          className="px-6 py-3 rounded-xl font-semibold bg-white/10 text-white border-2 border-white/20 hover:bg-white/15 transition"
        >
          Create Canvas
        </button>
      </div>
    </div>
  );
}
```

**Telemetry:**
```typescript
{ type: 'story.cta_click', cta_type: 'unlock_studio' | 'create_canvas', timestamp: number }
```

---

## Content Strategy

### Style Narratives (Template)

**Structure (60-80 words):**
1. Opening hook (emotional anchor)
2. Visual description (specific techniques)
3. Ideal spaces (room recommendations)
4. Closing (who it's for)

**Examples:**

**Celestial Ink:**
> Celestial Ink drifts soft indigo light across your shot, layering inky gradients inspired by Van Gogh's stargazing sketches. Deep blues ground your composition while moonlit lavenders add dreamlike motion. Perfect for bedrooms, meditation spaces, and home offices where serenity matters. This style suits those who seek introspective calm and timeless beauty—art that anchors your space without overwhelming it.

**Classic Oil Painting:**
> Classic Oil Painting brings centuries of art tradition to your photo with rich, textured brushstrokes reminiscent of Rembrandt and Vermeer. Warm ochres and deep siennas create depth and movement, transforming everyday moments into gallery-worthy portraits. Ideal for living rooms, dining spaces, and personal libraries. If you gravitate toward warmth and classical elegance, this style adds sophistication that ages beautifully.

**Calm Watercolor:**
> Calm Watercolor softens your image with translucent washes and feathered edges, evoking the peaceful flow of traditional Japanese sumi-e painting. Gentle blues and muted greens dissolve into organic shapes, creating a meditative atmosphere. Perfect for nurseries, reading nooks, and spa-like bathrooms. This style speaks to those who value tranquility and organic simplicity—a breath of calm in busy spaces.

**Copy Guidelines:**
- ❌ Avoid: "Embark on," "unleash," "transform your world," "journey," "magic"
- ✅ Use: "Brings," "adds," "evokes," "suits," "anchors," "layers," "drifts"
- Tone: Sophisticated, confident, educational (art curator, not salesperson)
- Length: 60-80 words (scannable in 8-12 seconds)
- Artist mentions: 1-2 famous artists (builds credibility)
- Room context: 2-4 specific spaces (not generic "any room")

---

### Palette Descriptors (Predefined)

**Format:** `[Color Name] · [emotion verb] [context]`

**Predefined Palettes by Style:**

**Celestial Ink:**
1. Moonlit Lavender · calms evening light
2. Deep Indigo · anchors your room
3. Dusty Rose · softens bedrooms
4. Slate Gray · balances modern spaces
5. Soft Cream · brightens cozy corners

**Classic Oil Painting:**
1. Warm Ochre · energizes morning spaces
2. Burnt Sienna · warms living rooms
3. Deep Umber · grounds rich interiors
4. Golden Amber · brightens dining areas
5. Ivory Cream · softens gallery walls

**Calm Watercolor:**
1. Sage Green · soothes creative corners
2. Misty Blue · cools bedrooms
3. Pale Lavender · calms nurseries
4. Soft Taupe · balances neutral spaces
5. Pearl White · brightens spa bathrooms

**Emotion Verbs by Hue:**
- Blues: calms, soothes, cools, grounds, centers
- Reds/Oranges: energizes, warms, ignites, activates
- Purples: mystifies, balances, elevates, inspires
- Greens: soothes, refreshes, renews, harmonizes
- Yellows/Golds: brightens, uplifts, radiates, cheers
- Grays/Neutrals: grounds, balances, anchors, steadies

---

### Complementary Style Recommendations

**Logic:** Same tone, different aesthetic

**Examples:**

**If current style = Celestial Ink (Signature tone):**
1. **Midnight Spectrum** · "Keeps the dreamy tone with deeper cosmic blacks"
2. **Ethereal Glow** · "Adds luminous highlights for a softer finish"

**If current style = Classic Oil Painting (Classic tone):**
1. **Renaissance Portrait** · "Doubles down on classical elegance with Caravaggio drama"
2. **Impressionist Garden** · "Lightens the palette with Monet-inspired dappled light"

**If current style = Calm Watercolor (Classic tone):**
1. **Japanese Ink Wash** · "Adds minimalist brushwork for meditative simplicity"
2. **Pastel Dream** · "Softens further with cloud-like color transitions"

**Recommendation Copy Template:**
```
{Style Name} · {One-line reason}
```

**Examples:**
- "Keeps the dreamy tone for your gallery wall"
- "Adds warmth while maintaining classical elegance"
- "Perfect companion for a cohesive multi-canvas display"

---

## Data Requirements

### Style Metadata Schema

Add to existing style registry entries:

```typescript
// src/config/styles/types.ts (extend existing)
export interface StyleRegistryEntry {
  // ... existing fields
  storyMetadata?: {
    narrative: string; // 60-80 word narrative
    emotion: string; // e.g., "Serenity"
    perfectFor: string; // e.g., "Bedrooms, creative corners, meditation spaces"
    signatureDetail: string; // e.g., "Feathered ink halos around highlights"
    palette: Array<{
      hex: string;
      name: string;
      descriptor: string;
    }>;
    complementaryStyles: Array<{
      styleId: string;
      reason: string;
    }>;
  };
}
```

### Initial Content Creation (30 min)

**Priority Styles (Write these first):**
1. Celestial Ink (Signature tone, top-performing style)
2. Classic Oil Painting (Classic tone, broad appeal)
3. Calm Watercolor (Classic tone, high aesthetic value)
4. Midnight Spectrum (Signature tone, premium style)
5. Neon Bloom (Electric tone, shareability test)

**For each style, write:**
- ✅ 60-80 word narrative
- ✅ Emotion label (1 word)
- ✅ Perfect for (3-4 spaces)
- ✅ Signature detail (1 sentence)
- ✅ 5 palette descriptors
- ✅ 2 complementary style recommendations

**Template Spreadsheet:**
| Style ID | Narrative | Emotion | Perfect For | Signature Detail | Palette 1 | Palette 2 | ... | Complementary 1 | Complementary 2 |
|----------|-----------|---------|-------------|------------------|-----------|-----------|-----|-----------------|-----------------|
| celestial-ink | Celestial Ink drifts... | Serenity | Bedrooms, meditation spaces... | Feathered ink halos... | Moonlit Lavender · calms... | Deep Indigo · anchors... | ... | midnight-spectrum | ethereal-glow |

---

## Telemetry Implementation

### Event Types

```typescript
// src/utils/telemetry.ts (extend existing)

export type StoryLayerVariantAEvent =
  | { type: 'story.gateway_impression'; style_id: string; timestamp: number }
  | { type: 'story.card_view'; style_id: string; time_on_card_ms: number; timestamp: number }
  | { type: 'story.palette_interact'; color_hex: string; color_name: string; timestamp: number }
  | { type: 'story.complementary_click'; clicked_style_id: string; current_style_id: string; is_locked: boolean; timestamp: number }
  | { type: 'story.caption_copy'; style_id: string; timestamp: number }
  | { type: 'story.download_card'; style_id: string; user_tier: string; timestamp: number }
  | { type: 'story.cta_click'; cta_type: 'unlock_studio' | 'create_canvas'; timestamp: number }
  | {
      type: 'story.session_summary';
      palette_interactions: number;
      complementary_clicks: number;
      caption_copied: boolean;
      card_downloaded: boolean;
      time_on_module_ms: number;
      cta_clicked: 'unlock_studio' | 'create_canvas' | null;
      timestamp: number;
    };

export function emitStoryLayerEvent(event: StoryLayerVariantAEvent) {
  console.log('[StoryLayerVariantA]', event);
  // TODO: Send to PostHog/Mixpanel
}
```

### IntersectionObserver for View Tracking

```typescript
// Hook for tracking card views
import { useEffect, useRef } from 'react';

export function useStoryCardViewTracking(styleId: string) {
  const cardRef = useRef<HTMLDivElement>(null);
  const viewStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          viewStartRef.current = Date.now();
        } else if (viewStartRef.current) {
          const timeOnCard = Date.now() - viewStartRef.current;
          emitStoryLayerEvent({
            type: 'story.card_view',
            style_id: styleId,
            time_on_card_ms: timeOnCard,
            timestamp: Date.now(),
          });
          viewStartRef.current = null;
        }
      },
      { threshold: 0.5 } // Card must be 50% visible
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [styleId]);

  return cardRef;
}
```

### Session Summary on Page Unload

```typescript
// Container component tracks all interactions
useEffect(() => {
  const sessionData = {
    palette_interactions: 0,
    complementary_clicks: 0,
    caption_copied: false,
    card_downloaded: false,
    time_on_module_ms: 0,
    cta_clicked: null as 'unlock_studio' | 'create_canvas' | null,
  };

  const handleBeforeUnload = () => {
    emitStoryLayerEvent({
      type: 'story.session_summary',
      ...sessionData,
      timestamp: Date.now(),
    });
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

---

## Success Metrics & Targets

### Primary Metrics (Measure After 2 Weeks)

| Metric | Baseline | Target | Stretch | How to Measure |
|--------|----------|--------|---------|----------------|
| **Story Layer Impression Rate** | 0% | **80%+** | **90%+** | Users who scroll to module (IntersectionObserver) |
| **Card Engagement Rate** | 0% | **40-55%** | **60%+** | Users who interact (palette hover, complementary click, caption copy, download) |
| **Palette Interaction Rate** | 0% | **20-30%** | **40%+** | Users who hover/tap ≥1 color swatch |
| **Complementary Style CTR** | 0% | **10-15%** | **20%+** | Users who click complementary style card |
| **Share Intent Rate** | 0% | **8-12%** | **15%+** | Users who copy caption OR download card |
| **Time-on-Module** | 0s | **18-25s** | **30s+** | Avg time card is in viewport |

### Secondary Metrics (Indirect Impact)

| Metric | Baseline (Assumed) | Target | How Story Layer Helps |
|--------|-------------------|--------|----------------------|
| **Checkout Initiation Rate** | 8% | **+5-8% → 8.4-8.64%** | Confidence footer CTAs drive action |
| **Free→Creator CVR** | 5% | **+3-5% → 5.15-5.25%** | "Unlock Full Studio" CTA + watermark nudge |
| **Cross-Sell Preview Generation** | 0/user | **0.1-0.2 additional previews/user** | Complementary style clicks |
| **Share Rate (Organic)** | 4% | **+2-3% → 4.08-4.12%** | Caption copy lowers friction for sharing |

### Go/No-Go Criteria (2-Week Review)

**✅ GO (Ship Variant B Interactive Features):**
- Card engagement rate >45%
- Palette interaction rate >25%
- Complementary CTR >12%
- Time-on-module >20s

**🔄 ITERATE (Improve Variant A Before Moving to B):**
- Card engagement 30-44% → Improve narrative quality, test alternate copy
- Palette interaction 10-24% → Make swatches more prominent, add animation
- Complementary CTR 5-11% → Improve recommendations, test alternate thumbnails

**❌ PAUSE (Storytelling Concept Doesn't Resonate):**
- Card engagement <30%
- Time-on-module <15s
- Share intent rate <5%
- **Action:** Investigate user feedback, consider alternate storytelling formats

---

## Implementation Checklist (1-2 Hour Timeline)

### Pre-Development (15 min)

- [ ] **Content Creation**
  - [ ] Write narratives for 5 priority styles (Celestial Ink, Classic Oil, Calm Watercolor, Midnight Spectrum, Neon Bloom)
  - [ ] Define predefined palettes (5 colors per style)
  - [ ] Map complementary style recommendations (2 per style)

- [ ] **Design Verification**
  - [ ] Confirm gradient glow color (purple-500, 30% opacity)
  - [ ] Confirm icon choices (Sparkles, Home, Paintbrush from lucide-react)
  - [ ] Confirm CTA button styles (gradient-cta class exists)

### Core Development (60-75 min)

**Phase 1: Foundation (20 min)**
- [ ] Create `/src/components/studio/story-layer/` directory
- [ ] Build `StoryGateway.tsx` (5 min)
  - [ ] Headline + subheadline
  - [ ] Gradient glow animation
  - [ ] Fade-in animation
- [ ] Build `ConfidenceFooter.tsx` (10 min)
  - [ ] Trust message
  - [ ] Dual CTAs
  - [ ] Responsive layout
- [ ] Create container `StyleStoryLayerVariantA.tsx` (5 min)
  - [ ] Props interface
  - [ ] Conditional rendering logic
  - [ ] Lazy-load setup

**Phase 2: Content Components (30 min)**
- [ ] Build `StoryCard.tsx` (15 min)
  - [ ] Grid layout (image left, text right)
  - [ ] Narrative paragraph
  - [ ] 3 bullet points (emotion, perfect for, signature)
  - [ ] Responsive breakpoints
- [ ] Build `PaletteStrip.tsx` (10 min)
  - [ ] 5 color swatches
  - [ ] Pulse animation
  - [ ] Hover/tap tooltip
- [ ] Build `ShareCue.tsx` (5 min)
  - [ ] Copy caption button
  - [ ] Download card button
  - [ ] Free tier watermark note

**Phase 3: Cross-Sell (15 min)**
- [ ] Build `ComplementaryMiniCards.tsx` (15 min)
  - [ ] 2-card grid
  - [ ] Thumbnail + name + reason
  - [ ] Locked/unlocked button states
  - [ ] Click handler (reopen style picker)

**Phase 4: Integration (10 min)**
- [ ] Insert `StyleStoryLayerVariantA` in [CanvasPreviewPanel.tsx](../src/sections/studio/components/CanvasPreviewPanel.tsx) (5 min)
  - [ ] After line 201 (after "Save to Gallery")
  - [ ] Add Suspense fallback
  - [ ] Pass props (currentStyle, styledImageUrl, orientation, userTier)
- [ ] Test conditional rendering (5 min)
  - [ ] Appears when `previewStateStatus === 'ready'`
  - [ ] Hidden when `currentStyle.id === 'original-image'`

### Telemetry & QA (15-20 min)

**Telemetry (10 min)**
- [ ] Add 8 event types to `src/utils/telemetry.ts`
- [ ] Implement IntersectionObserver for card view tracking
- [ ] Add session summary on page unload
- [ ] Test events fire correctly (check console logs)

**QA (10 min)**
- [ ] Test on desktop (Chrome, Safari)
  - [ ] Gateway glow animates correctly
  - [ ] Palette hover tooltips appear
  - [ ] Complementary cards clickable
  - [ ] CTAs functional
- [ ] Test on mobile (iOS Safari, Android Chrome)
  - [ ] Layout stacks vertically
  - [ ] Palette tap locks tooltip
  - [ ] Buttons thumb-friendly
- [ ] Test with different styles
  - [ ] Narrative text renders correctly
  - [ ] Palette colors display accurately
  - [ ] Complementary recommendations relevant

**Edge Cases:**
- [ ] What if style has no storyMetadata? → Fallback to basic "Transform your photo into art" copy
- [ ] What if complementary style is locked? → Show "Unlock with Creator" button
- [ ] What if user is on free tier? → Show watermark note in ShareCue

### Deployment (5 min)

- [ ] Commit with message: `feat: Add Style Story Layer Variant A`
- [ ] Deploy to staging
- [ ] Smoke test on staging (1 happy path test)
- [ ] Deploy to production (or feature flag to 10% traffic)

**Total Time: 95-120 min (1.5-2 hours)**

---

## Migration Path: Variant A → Variant B

### When to Upgrade

**After 2 weeks of Variant A data**, evaluate:

| Variant A Metric | Threshold | Decision |
|------------------|-----------|----------|
| **Card engagement** | >45% | ✅ Build Variant B (storytelling works) |
| **Card engagement** | 30-44% | 🔄 Iterate Variant A (improve before B) |
| **Card engagement** | <30% | ❌ Pause (concept doesn't resonate) |
| **Palette interaction** | >25% | ✅ Add interactive palette to Variant B |
| **Palette interaction** | <10% | ❌ Deprioritize palette in Variant B |
| **Complementary CTR** | >12% | ✅ Build rich carousel in Variant B |
| **Complementary CTR** | <5% | ❌ Skip carousel, focus on other features |

### Additive Components (No Rewrite)

Variant A → Variant B is **additive**, not destructive:

1. ✅ **Keep:** StoryGateway, ConfidenceFooter (no changes)
2. ✅ **Enhance:** StoryCard → Add before/after slider (replace static image)
3. ✅ **Enhance:** PaletteStrip → Add live color extraction (fallback to predefined)
4. ✅ **Enhance:** ComplementaryMiniCards → Add micro-preview animations
5. ✅ **Enhance:** ShareCue → Add Canvas API quote card generator

**Estimated Variant A → B upgrade:** 40-60 hours (vs. 80-100h building B from scratch)

---

## Risk Analysis & Mitigations

### Risk 1: Narrative Copy Feels Generic (Probability: 40%)

**Issue:** Predefined narratives don't resonate with users, feel like marketing speak

**Detection:**
- Low time-on-card (<15s avg)
- High scroll-past rate (users skip story layer)
- User feedback mentions "salesy" or "generic"

**Mitigation:**
- A/B test 3 narrative variants per style (formal, casual, poetic)
- User testing (10 moderated sessions): "Which narrative makes you want to buy?"
- Fallback: If engagement <30%, show minimal version (just emotion + perfect for bullets)

**Rollback Plan:** Replace narrative paragraph with single tagline (e.g., "Celestial Ink: Serenity for your bedroom")

---

### Risk 2: Complementary Recommendations Irrelevant (Probability: 30%)

**Issue:** Recommended styles don't match user taste, clicks lead to confusion

**Detection:**
- Complementary CTR <5%
- High "back button" rate after clicking
- Session recordings show users clicking, then immediately returning

**Mitigation:**
- Test multiple recommendation strategies:
  - Strategy A: Same tone, different aesthetic (e.g., Celestial Ink → Midnight Spectrum)
  - Strategy B: Contrast tone, similar color palette (e.g., Celestial Ink → Neon Bloom, both have purples)
  - Strategy C: User history-based (e.g., if user clicked 3 "Signature" styles, recommend more Signature)
- A/B test: 2 cards vs. 4 cards (more choice vs. decision fatigue)

**Rollback Plan:** Remove complementary cards, replace with generic "Explore more styles" CTA

---

### Risk 3: Free Tier Watermark Backfires (Probability: 20%)

**Issue:** Watermarked downloads feel cheap, users don't share (brand dilution)

**Detection:**
- Download rate high (>10%) but share rate low (<5%)
- Social media sentiment negative ("Wondertone watermark ruins my photo")
- Support tickets requesting watermark removal

**Mitigation:**
- A/B test watermark intensity:
  - Variant A: 30% opacity, bottom-center
  - Variant B: 15% opacity, bottom-corner
  - Variant C: No watermark for free users, but image is lower resolution (1080p vs. 4K)
- Test positioning: Bottom-center vs. bottom-right vs. overlay on white border

**Rollback Plan:** Remove watermark entirely for free tier, rely on caption copy for brand attribution

---

### Risk 4: Module Adds Scroll Fatigue (Probability: 25%)

**Issue:** Story layer adds 600-800px height, users abandon before reaching checkout

**Detection:**
- Scroll depth drops off at story layer (40% of users don't scroll past)
- Bounce rate increase >10%
- Checkout initiation rate decreases

**Mitigation:**
- Collapse StoryCard by default (show headline only, expand on click: "Read the story")
- Move ConfidenceFooter above story layer (put CTAs first, story second)
- A/B test: Full module vs. Minimal module (Gateway + bullets only, skip narrative paragraph)

**Rollback Plan:** Remove story layer, keep only ConfidenceFooter (trust signals + CTAs)

---

## Accessibility & Performance Checklist

### Accessibility

- [ ] **Keyboard Navigation**
  - [ ] All interactive elements (buttons, palette swatches) are focusable
  - [ ] Tab order is logical (top to bottom, left to right)
  - [ ] Enter/Space activates buttons
- [ ] **Screen Readers**
  - [ ] All images have alt text
  - [ ] Buttons have aria-labels where text isn't descriptive
  - [ ] Palette swatches have aria-describedby for descriptors
- [ ] **Color Contrast**
  - [ ] Text meets WCAG AA standards (4.5:1 for body text, 3:1 for large text)
  - [ ] Palette swatches have 2px white border for visibility
- [ ] **Motion Preferences**
  - [ ] Respect `prefers-reduced-motion` (disable glow pulse, swatch pulse)
  - [ ] Provide instant transitions instead of animations

### Performance

- [ ] **Lazy Loading**
  - [ ] StyleStoryLayerVariantA wrapped in `React.lazy()`
  - [ ] Suspense fallback is lightweight (skeleton, not full render)
  - [ ] Images use `loading="lazy"` attribute
- [ ] **Bundle Size**
  - [ ] Total module size <10KB gzipped
  - [ ] No external dependencies (lucide-react already in bundle)
- [ ] **Render Performance**
  - [ ] IntersectionObserver for view tracking (not scroll listener)
  - [ ] No layout thrashing (avoid reading offsetHeight during updates)
  - [ ] CSS animations use `transform` and `opacity` (GPU-accelerated)
- [ ] **Image Optimization**
  - [ ] Styled image uses existing displayPreviewUrl (no extra fetch)
  - [ ] Complementary thumbnails use WebP/AVIF (already in style registry)

---

## Analytics Dashboard Setup

### PostHog/Mixpanel Funnels

**Funnel: Story Layer Engagement**
1. `story.gateway_impression` (100% baseline)
2. `story.card_view` (target: 80%+ scroll to module)
3. `story.palette_interact` OR `story.complementary_click` (target: 40%+ engagement)
4. `story.caption_copy` OR `story.download_card` (target: 10%+ share intent)
5. `story.cta_click` (target: varies by CTA)

**Cohort: Story Layer Engagers vs. Non-Engagers**
- **Cohort A:** Users who scrolled to story layer AND interacted (palette/complementary/share)
- **Cohort B:** Users who saw story layer but didn't interact
- **Cohort C:** Control (didn't see story layer)
- **Metrics:** Checkout completion rate, AOV, 30-day retention

### Custom Dashboards

**Dashboard 1: Story Layer Health**
- Story layer impression rate (% of users who scroll to module)
- Card engagement rate (% who interact)
- Avg time-on-module
- Top-performing styles (by engagement rate)

**Dashboard 2: Content Performance**
- Palette interaction rate by style (which palettes resonate?)
- Complementary CTR by style (which recommendations work?)
- Caption copy vs. download card (which share method preferred?)
- CTA click distribution (unlock studio vs. create canvas)

**Dashboard 3: Revenue Impact**
- Checkout initiation rate (story engagers vs. control)
- Free→Creator CVR (story engagers vs. control)
- AOV (story engagers vs. control)
- 30-day retention (story engagers vs. control)

---

## Next Steps After Launch

### Week 1-2: Monitor & Iterate

**Daily Checks:**
- [ ] Story layer impression rate (target: 80%+)
- [ ] Card engagement rate (target: 40%+)
- [ ] Error rate (any JS errors in console?)

**Quick Fixes:**
- If impression rate <60%: Add visual cue (arrow pointing down, "Read the story" CTA)
- If engagement <30%: Test alternate narrative copy for top 3 styles
- If palette interaction <10%: Add pulse animation to swatches, increase size

### Week 3-4: Deep Dive Analysis

**Key Questions:**
1. Which styles have highest engagement? (identify patterns)
2. Which complementary recommendations drive clicks? (refine logic)
3. Do users prefer caption copy or download card? (optimize ShareCue)
4. Does story layer increase checkout rate? (measure cohort conversion)

**Optimization Candidates:**
- If complementary CTR >15%: Expand to 4 cards (2→4)
- If share intent rate >12%: Add social share buttons (Twitter, Instagram)
- If CTA click rate on "Unlock Studio" >8%: Highlight subscription benefits

### Week 5-6: Variant B Decision

**Go/No-Go Criteria:**
- ✅ **GO:** Card engagement >45%, build Variant B interactive features
- 🔄 **ITERATE:** Card engagement 30-44%, improve Variant A first
- ❌ **PAUSE:** Card engagement <30%, investigate why storytelling doesn't resonate

**If GO, prioritize Variant B components based on Variant A data:**
- High palette interaction (>30%) → Build interactive palette first
- High complementary CTR (>15%) → Build rich carousel with micro-previews
- High share intent (>12%) → Build Canvas API quote card generator

---

## QA Notes (Variant A Launch)

- ✅ Feature flag smoke test (`VITE_STORY_LAYER_ENABLED` on/off)
- ✅ Tier coverage: free vs Creator (caption copy allowed, download gated)
- ✅ Orientation change rehydrates preview + dismisses hint indicator
- ✅ Mobile layout (iOS Safari simulator); Android Chrome run pending
- ✅ Desktop Chrome; Safari/Firefox scheduled via BrowserStack
- ✅ Automated checks: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`
- ⚠️ Depcheck continues to flag existing Radix/tailwind scaffolding (historic)

## FAQ

### Q: Why static image instead of before/after slider?
**A:** Slider is 40% of Variant B dev time and requires gesture physics. Variant A proves storytelling concept first. If engagement >45%, we'll add slider in V2.

### Q: Why predefined palettes instead of live color extraction?
**A:** Vibrant.js adds 12KB + edge cases (low-contrast images, extraction failures). Predefined palettes are 100% reliable. If palette interaction >25%, we'll add live extraction in V2.

### Q: What if a style doesn't have storyMetadata?
**A:** Fallback to generic copy: "Transform your photo into gallery-worthy art. Choose your frame size and create your canvas." (We'll backfill metadata for all styles within 1 week of launch.)

### Q: How do complementary recommendations work if user hasn't explored styles yet?
**A:** Use same-tone logic (Celestial Ink → Midnight Spectrum, both "Signature"). As user explores more, we'll layer in history-based recommendations in V2.

### Q: Should we show story layer for "Original Image" style?
**A:** No. Original Image has no artistic transformation, so there's no "story" to tell. Conditional: `currentStyle.id !== 'original-image'`.

### Q: What if users don't scroll to story layer?
**A:** Add visual cue at bottom of main preview: "↓ Discover the story behind this style" (fades in after 3s). If impression rate stays <60%, make story layer more prominent (add border, increase glow).

---

## Final Recommendation

**Ship Variant A first.** It's the right strategic move for V1:

1. ✅ **1-2 hour dev time** (vs. weeks for Variant B)
2. ✅ **Proves storytelling concept** before investing in interactivity
3. ✅ **Low technical risk** (no gesture conflicts, no Canvas API quirks)
4. ✅ **Delivers 70-85%** of Variant B's emotional value
5. ✅ **Clean baseline data** to inform Variant B priorities
6. ✅ **Easy upgrade path** (Variant A → B is additive, not a rewrite)

**Expected Outcomes (2-week data):**
- Impression rate: 80%+ (most users scroll to module)
- Card engagement: 40-55% (hover palette, click complementary, copy caption)
- Share intent: 8-12% (caption copy or download card)
- Checkout lift: +5-8% (confidence footer CTAs drive action)

**If these targets hit, build Variant B selective components based on what performed best in Variant A data.**

Ready to ship. 🚀
