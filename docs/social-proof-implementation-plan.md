# Social Proof Section Implementation Plan

**Project**: Wondertone Premium AI Art Studio
**Section**: Before/After Gallery Wall (Social Proof)
**Date**: 2025-11-03
**Status**: Ready for Implementation

---

## Executive Summary

This document outlines the complete implementation plan for Wondertone's **Social Proof Section** — a conversion-optimized Before/After Gallery Wall featuring:

- **Stats Band**: 3 animated pills showcasing social proof metrics (2.3M previews, 96% recommend, 12K canvases)
- **Testimonial Carousel**: 12 before/after cards (8 digital, 4 canvas) in a paginated 3-column grid
- **Canvas Footnote**: Soft upsell to premium canvas prints
- **Primary CTA**: "Start Free Preview" below the gallery

**Key Design Principles**:
- **Subscription-first**: 2:1 digital-to-canvas ratio (80% digital emphasis matches revenue split)
- **Trust before conversion**: CTA placed below gallery (users see proof first)
- **Performance-optimized**: Lazy loading, React.memo, carousel only renders visible cards
- **Accessible**: Keyboard navigation, reduced motion compliance, semantic HTML
- **Brand-consistent**: Gold borders, frosted glass overlays, purple spotlight background

**Implementation Scope**: 5 new files, 1 modification, <10KB gzipped bundle increase.

---

## 1. User Journey & Conversion Flow

### **Page Flow Context**
Users arrive at Studio Page and scroll through:

1. **Hero Section** → Upload CTA
2. **Style Inspiration Section** → 45 curated styles, "Try This Style" CTAs
3. **Social Proof Section** ← THIS SECTION (NEW)
   - See stats band → Build trust
   - Browse testimonials → Identify with use cases
   - Read canvas footnote → Understand premium option
   - Click "Start Free Preview" → Convert
4. **Upgrade/Subscriptions Section** (future)
5. **Canvas Quality/Shipping** (future)
6. **FAQ** (future)
7. **Footer**

### **Why CTA Below Gallery (Not Above)**
Decision rationale from user:
> "There will be a CTA right above in the Style Transformations section & it's overkill having them back to back like that."

**Strategic Benefits**:
- Avoids CTA fatigue (Style Inspiration already has conversion opportunities)
- Lets social proof "breathe" without feeling pushy
- Users who scroll this far are high-intent (qualified leads)
- Stats band builds credibility first, CTA converts second

---

## 2. Visual Structure & Layout

### **Desktop Layout (≥1024px)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION BACKGROUND: Purple radial spotlight (matches Style Inspiration)    │
│ bg-slate-950/95 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.22))]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HEADER (centered, max-w-[1800px])                                         │
│  ─────────────────────────────────────────────────────────────             │
│  HEADLINE: "Join 10,000+ Creators Transforming Photos in Seconds"          │
│            (font-poppins text-5xl md:text-6xl font-bold)                   │
│                                                                             │
│  SUBHEAD: "Watermark-free digital exports. Premium canvases when you       │
│            want something on the wall."                                     │
│            (text-lg text-white/70 max-w-2xl mx-auto)                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  STATS BAND (3 frosted glass pills, centered)                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐     │
│  │  2.3M+ Previews   │  │  96% Recommend    │  │  12K Canvases     │     │
│  │   Generated       │  │   Wondertone      │  │   Shipped         │     │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘     │
│  (Animated count-up when pills enter viewport)                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  TESTIMONIAL CAROUSEL (max-w-7xl centered, matches Style Inspiration)      │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │ Digital Card #1 │  │ Digital Card #2 │  │ Digital Card #3 │  ← Row 1  │
│  │                 │  │                 │  │                 │           │
│  │ ┌──────┬──────┐ │  │ ┌──────┬──────┐ │  │ ┌──────┬──────┐ │           │
│  │ │Before│After │ │  │ │Before│After │ │  │ │Before│After │ │           │
│  │ │(grey)│(gold)│ │  │ │(grey)│(gold)│ │  │ │(grey)│(gold)│ │           │
│  │ │border│border│ │  │ │border│border│ │  │ │border│border│ │           │
│  │ │      │ ⭐⭐⭐│ │  │ │      │ ⭐⭐⭐│ │  │ │      │ ⭐⭐⭐│ │           │
│  │ └──────┴──────┘ │  │ └──────┴──────┘ │  │ └──────┴──────┘ │           │
│  │                 │  │                 │  │                 │           │
│  │ "Boosted my     │  │ "Portfolio      │  │ "My Instagram   │           │
│  │  Instagram!"    │  │  looks pro!"    │  │  exploded 🔥"   │           │
│  │ — Sarah M.      │  │ — Alex T.       │  │ — Maria L.      │           │
│  │ 📱 Creator Pro  │  │ 📱 Creator Pro  │  │ 📱 Creator Pro  │           │
│  │ [Placeholder]   │  │ [Placeholder]   │  │ [Placeholder]   │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │ Digital Card #4 │  │ Digital Card #5 │  │ Canvas Card #1  │  ← Row 2  │
│  │                 │  │                 │  │                 │           │
│  │ ┌──────┬──────┐ │  │ ┌──────┬──────┐ │  │ ┌──────┬──────┐ │           │
│  │ │Before│After │ │  │ │Before│After │ │  │ │Before│After │ │           │
│  │ │(grey)│(gold)│ │  │ │(grey)│(gold)│ │  │ │(grey)│ (gold │ │           │
│  │ │border│border│ │  │ │border│border│ │  │ │border│+ glow)│ │           │
│  │ │      │ ⭐⭐⭐│ │  │ │      │ ⭐⭐⭐│ │  │ │      │ ⭐⭐⭐│ │           │
│  │ └──────┴──────┘ │  │ └──────┴──────┘ │  │ └──────┴──────┘ │           │
│  │                 │  │                 │  │                 │           │
│  │ "Feed is        │  │ "Client loved   │  │ "Museum-quality │           │
│  │  gorgeous now!" │  │  the exports!"  │  │  in my home!"   │           │
│  │ — Jordan P.     │  │ — Sam K.        │  │ — James K.      │           │
│  │ 📱 Creator Pro  │  │ 📱 Creator Pro  │  │ 🖼️ Canvas Print │           │
│  │ [Placeholder]   │  │ [Placeholder]   │  │ [Placeholder]   │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                             │
│                                                                             │
│  CAROUSEL CONTROLS (centered below grid)                                   │
│  ─────────────────────────────────────────────────────                     │
│     ⟨ Prev          [● ○]          Next ⟩                                  │
│   (frosted         (dots)        (frosted                                  │
│    glass)                          glass)                                  │
│                                                                             │
│  INTERACTION:                                                              │
│  - Click "Next" → Slides out Cards 1-6, slides in Cards 7-12 (Page 2)     │
│  - Click "Prev" → Slides back to Page 1                                    │
│  - Click dots → Jump to page                                               │
│  - Arrow keys → Navigate pages (keyboard accessibility)                    │
│  - Staggered fade-in: 0.1s delay per card when page changes               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  CANVAS FOOTNOTE (slim frosted pill, centered, max-w-3xl)                  │
│  ───────────────────────────────────────────────────────────               │
│  "Love your results? Upgrade to museum-quality canvas prints (ships in     │
│   5 days). See how canvases arrive →"                                      │
│  (Links to Canvas Quality section further down page)                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  PRIMARY CTA (centered, ~240px wide gold gradient button)                  │
│  ─────────────────────────────────────────────────────────                 │
│         ┌────────────────────────────────┐                                │
│         │  Start Free Preview            │                                │
│         └────────────────────────────────┘                                │
│  (bg-gradient-to-r from-amber-400 to-yellow-500)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Mobile Layout (<1024px)**

```
┌──────────────────────────────────┐
│ HEADER (centered)                │
│ HEADLINE (text-4xl)              │
│ SUBHEAD (text-base)              │
├──────────────────────────────────┤
│ STATS BAND (stacked vertically)  │
│ ┌──────────────────────────────┐ │
│ │ 2.3M+ Previews Generated     │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 96% Recommend Wondertone     │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 12K Canvases Shipped         │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ TESTIMONIAL CAROUSEL             │
│ (1 column × 2 cards per page)    │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Digital Card #1            │   │
│ │ ┌───────┬────────┐         │   │
│ │ │Before │ After  │         │   │
│ │ │(grey) │ (gold) │         │   │
│ │ │       │  ⭐⭐⭐ │         │   │
│ │ └───────┴────────┘         │   │
│ │ "Boosted my Instagram!"    │   │
│ │ — Sarah M.                 │   │
│ │ 📱 Creator Pro             │   │
│ └────────────────────────────┘   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Digital Card #2            │   │
│ │ ┌───────┬────────┐         │   │
│ │ │Before │ After  │         │   │
│ │ │(grey) │ (gold) │         │   │
│ │ │       │  ⭐⭐⭐ │         │   │
│ │ └───────┴────────┘         │   │
│ │ "Portfolio looks pro!"     │   │
│ │ — Alex T.                  │   │
│ │ 📱 Creator Pro             │   │
│ └────────────────────────────┘   │
│                                  │
│  ⟨      [● ○ ○ ○ ○ ○]      ⟩   │
│  (swipe gestures enabled)        │
│  (6 pages total: 2 cards each)   │
│                                  │
├──────────────────────────────────┤
│ CANVAS FOOTNOTE (text-sm)        │
│ "Love your results? Upgrade..."  │
├──────────────────────────────────┤
│ PRIMARY CTA (full-width on sm)   │
│ ┌──────────────────────────────┐ │
│ │  Start Free Preview          │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## 3. Component Architecture

### **File Structure**

```
src/
├── config/
│   └── socialProofTestimonials.ts          ← NEW (testimonial data config)
├── sections/
│   └── studio/
│       ├── components/
│       │   ├── StatsPill.tsx               ← NEW (animated counter pill)
│       │   ├── TestimonialCard.tsx         ← NEW (before/after card)
│       │   └── TestimonialCarousel.tsx     ← NEW (pagination + navigation)
│       └── SocialProofSection.tsx          ← NEW (main section orchestrator)
└── pages/
    └── StudioPage.tsx                       ← MODIFIED (add SocialProofSection)
```

### **Component Hierarchy**

```
SocialProofSection
├── Header (headline + subhead)
├── StatsPill (3 instances: previews, recommend, canvases)
├── TestimonialCarousel
│   ├── Pagination logic (currentPage state)
│   ├── TestimonialCard (6 instances per page, 12 total)
│   │   ├── Before image (grey border)
│   │   ├── After image (gold border)
│   │   ├── Star rating
│   │   ├── Quote overlay (frosted glass)
│   │   ├── Product badge (Digital/Canvas)
│   │   └── Placeholder CTA
│   ├── Arrow buttons (Prev/Next, frosted glass circles)
│   └── Dot indicators (● ○)
├── Canvas footnote (frosted pill)
└── Primary CTA button ("Start Free Preview")
```

---

## 4. Detailed Component Specifications

### **4.1 Config: `src/config/socialProofTestimonials.ts`**

**Purpose**: Define all 12 testimonials in a type-safe, config-driven structure (similar to `inspirationBuckets.ts`).

**Type Definitions**:
```typescript
export type ProductType = 'digital' | 'canvas';

export type TestimonialConfig = {
  id: string;                    // Unique identifier (e.g., 'testimonial-1')
  beforeImage: string;           // Path to before image (e.g., '/testimonials/before-1.jpg')
  afterImage: string;            // Path to after image (e.g., '/testimonials/after-1.jpg')
  quote: string;                 // Customer quote (e.g., "Boosted my Instagram reach!")
  author: string;                // Name (e.g., "Sarah M.")
  productType: ProductType;      // 'digital' or 'canvas'
  rating: 5;                     // Always 5 stars (fixed for now)
  styleId?: string;              // Optional: Associated style (for future "Try This Style" linking)
};
```

**Data Structure**:
```typescript
export const SOCIAL_PROOF_TESTIMONIALS: readonly TestimonialConfig[] = [
  // PAGE 1: 5 digital + 1 canvas (digital-heavy first impression)
  {
    id: 'testimonial-1',
    beforeImage: '/testimonials/placeholder-before-1.jpg',
    afterImage: '/testimonials/placeholder-after-1.jpg',
    quote: 'Boosted my Instagram reach by 300%!',
    author: 'Sarah M.',
    productType: 'digital',
    rating: 5,
    styleId: 'neon-splash', // Future: deep-link to this style
  },
  {
    id: 'testimonial-2',
    beforeImage: '/testimonials/placeholder-before-2.jpg',
    afterImage: '/testimonials/placeholder-after-2.jpg',
    quote: 'My portfolio looks professionally edited now.',
    author: 'Alex T.',
    productType: 'digital',
    rating: 5,
    styleId: 'gallery-acrylic',
  },
  {
    id: 'testimonial-3',
    beforeImage: '/testimonials/placeholder-before-3.jpg',
    afterImage: '/testimonials/placeholder-after-3.jpg',
    quote: 'My Instagram feed exploded with engagement! 🔥',
    author: 'Maria L.',
    productType: 'digital',
    rating: 5,
    styleId: 'pop-art-bust',
  },
  {
    id: 'testimonial-4',
    beforeImage: '/testimonials/placeholder-before-4.jpg',
    afterImage: '/testimonials/placeholder-after-4.jpg',
    quote: 'Feed is gorgeous now. Thank you Wondertone!',
    author: 'Jordan P.',
    productType: 'digital',
    rating: 5,
    styleId: 'liquid-chrome',
  },
  {
    id: 'testimonial-5',
    beforeImage: '/testimonials/placeholder-before-5.jpg',
    afterImage: '/testimonials/placeholder-after-5.jpg',
    quote: 'My client loved the watermark-free exports.',
    author: 'Sam K.',
    productType: 'digital',
    rating: 5,
    styleId: 'classic-oil-painting',
  },
  {
    id: 'testimonial-6',
    beforeImage: '/testimonials/placeholder-before-6.jpg',
    afterImage: '/testimonials/placeholder-after-6.jpg',
    quote: 'Museum-quality canvas in my living room. Stunning!',
    author: 'James K.',
    productType: 'canvas',
    rating: 5,
    styleId: 'the-renaissance',
  },

  // PAGE 2: 3 digital + 3 canvas (introduce canvas as premium option)
  {
    id: 'testimonial-7',
    beforeImage: '/testimonials/placeholder-before-7.jpg',
    afterImage: '/testimonials/placeholder-after-7.jpg',
    quote: 'Perfect for Instagram Stories and Reels.',
    author: 'Emma R.',
    productType: 'digital',
    rating: 5,
    styleId: 'memphis-pop',
  },
  {
    id: 'testimonial-8',
    beforeImage: '/testimonials/placeholder-before-8.jpg',
    afterImage: '/testimonials/placeholder-after-8.jpg',
    quote: 'Turned my vacation photos into art for TikTok.',
    author: 'Chris D.',
    productType: 'digital',
    rating: 5,
    styleId: 'retro-synthwave',
  },
  {
    id: 'testimonial-9',
    beforeImage: '/testimonials/placeholder-before-9.jpg',
    afterImage: '/testimonials/placeholder-after-9.jpg',
    quote: 'My LinkedIn headshot has never looked better.',
    author: 'Taylor B.',
    productType: 'digital',
    rating: 5,
    styleId: 'watercolor-dreams',
  },
  {
    id: 'testimonial-10',
    beforeImage: '/testimonials/placeholder-before-10.jpg',
    afterImage: '/testimonials/placeholder-after-10.jpg',
    quote: 'Ordered 3 canvases for my office. Everyone asks!',
    author: 'Morgan L.',
    productType: 'canvas',
    rating: 5,
    styleId: 'deco-royale',
  },
  {
    id: 'testimonial-11',
    beforeImage: '/testimonials/placeholder-before-11.jpg',
    afterImage: '/testimonials/placeholder-after-11.jpg',
    quote: 'Best gift ever. My mom cried when she saw it!',
    author: 'Casey W.',
    productType: 'canvas',
    rating: 5,
    styleId: 'classic-oil-painting',
  },
  {
    id: 'testimonial-12',
    beforeImage: '/testimonials/placeholder-before-12.jpg',
    afterImage: '/testimonials/placeholder-after-12.jpg',
    quote: 'Canvas quality rivals $500 custom portraits.',
    author: 'Drew H.',
    productType: 'canvas',
    rating: 5,
    styleId: 'gallery-acrylic',
  },
] as const;
```

**Placeholder Images**:
- Create 12 placeholder before/after image pairs in `public/testimonials/`
- Use free stock photos from Unsplash (personal photos) + apply Wondertone styles
- Dimensions: 800×800px (square aspect ratio for consistent card layout)
- Format: AVIF primary, WebP fallback, JPG ultimate fallback
- Naming: `placeholder-before-1.jpg`, `placeholder-after-1.jpg`, etc.

**Future Enhancement Path**:
- Replace placeholder quotes with real customer testimonials
- Replace placeholder images with real user submissions (with permission)
- Add Supabase integration for CMS-style editing (marketing can update without code changes)

---

### **4.2 Component: `src/sections/studio/components/StatsPill.tsx`**

**Purpose**: Display a single stat with animated count-up effect when entering viewport.

**Props**:
```typescript
type StatsPillProps = {
  label: string;           // e.g., "Previews Generated"
  value: string | number;  // e.g., "2.3M+" or 2300000
  animationDuration?: number; // Optional: count-up duration in ms (default 2000)
};
```

**Visual Design**:
- **Container**: Frosted glass pill (`bg-white/[0.03] backdrop-blur-md`)
- **Border**: Subtle white border (`border border-white/10`)
- **Padding**: `px-6 py-4 lg:px-8 lg:py-5`
- **Rounding**: `rounded-full`
- **Layout**: Vertical stack (value on top, label below)
- **Value**: Large bold number (`text-3xl lg:text-4xl font-bold text-white`)
- **Label**: Small uppercase text (`text-xs lg:text-sm uppercase tracking-wide text-white/60`)

**Animation Behavior**:
1. **On mount**: Pill fades in with stagger (0.15s delay per pill, like Style Inspiration buckets)
2. **On scroll into view**: Count-up animation triggers
   - Uses `framer-motion`'s `useInView` hook to detect viewport entry
   - Uses `useMotionValue` + `animate` to count from 0 → target value
   - Easing: `easeOut` curve
   - Duration: 2 seconds
3. **Reduced motion**: If user prefers reduced motion, skip count-up (instant display)

**Example Usage**:
```tsx
<StatsPill label="Previews Generated" value="2.3M+" />
<StatsPill label="Recommend Wondertone" value="96%" />
<StatsPill label="Canvases Shipped" value="12K" />
```

**Performance Optimization**:
- `React.memo()` wrapper (prevents re-renders when parent updates)
- Count-up only triggers once per page load (doesn't re-animate on subsequent scrolls)
- Uses `useInView` with `once: true` option

**Accessibility**:
- Value has `aria-live="polite"` for screen readers to announce final number
- Label is descriptive (`"2.3 million previews generated"` vs just `"2.3M"`)

---

### **4.3 Component: `src/sections/studio/components/TestimonialCard.tsx`**

**Purpose**: Display a single before/after testimonial card.

**Props**:
```typescript
type TestimonialCardProps = {
  testimonial: TestimonialConfig;
  cardIndex: number; // For staggered animation delay
  prefersReducedMotion: boolean;
};
```

**Visual Design**:

```
┌─────────────────────────────────────┐
│  ┌────────────┬─────────────────┐   │
│  │  BEFORE    │     AFTER       │   │ ← Side-by-side layout
│  │  (grey     │    (gold        │   │
│  │   border)  │     border)     │   │
│  │            │     ⭐⭐⭐⭐⭐   │   │ ← Star rating (top-right of After)
│  └────────────┴─────────────────┘   │
│                                      │
│  ┌────────────────────────────────┐ │ ← Frosted glass quote overlay
│  │ "Boosted my Instagram reach!"  │ │
│  │ — Sarah M.                     │ │
│  │ 📱 Creator Pro                 │ │ ← Product badge
│  │ [Placeholder CTA Text]         │ │ ← Future: "Try This Style"
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Layout Details**:

1. **Container**:
   - Rounded corners: `rounded-2xl`
   - Overflow hidden: `overflow-hidden`
   - Background: `bg-slate-900/50`
   - Border: `border border-white/5`

2. **Image Container** (top half):
   - Grid layout: `grid grid-cols-2 gap-[2px]` (tight 2px gap between images)
   - Aspect ratio: `aspect-square` (forces square images)

3. **Before Image** (left):
   - Grey border: `border-2 border-slate-600`
   - Grayscale filter: `grayscale` (emphasizes "before" state)
   - Opacity: `opacity-70`
   - Label overlay: Small "BEFORE" text (top-left corner, `text-[8px] uppercase`)

4. **After Image** (right):
   - Gold gradient border: `p-[2px] bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-400`
   - Full color: No filters
   - Opacity: `opacity-100`
   - Label overlay: Small "AFTER" text (top-left corner, `text-[8px] uppercase`)
   - **Canvas cards only**: Subtle gold glow (`shadow-[0_0_20px_rgba(251,191,36,0.3)]`)

5. **Star Rating** (top-right of After image):
   - 5 gold stars: `text-amber-400`
   - Size: `w-3 h-3` per star (small, non-intrusive)
   - Position: `absolute top-2 right-2`
   - Background: `bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full` (readable on any image)

6. **Quote Overlay** (bottom half):
   - Background: `bg-black/70 backdrop-blur-md`
   - Padding: `px-4 py-3`
   - Border top: `border-t border-white/10`

7. **Quote Text**:
   - Font: `text-sm font-medium text-white`
   - Leading: `leading-relaxed`
   - Margin bottom: `mb-2`
   - Max lines: 2 (clamp with `line-clamp-2` if quote is long)

8. **Author Name**:
   - Font: `text-xs text-white/60`
   - Margin bottom: `mb-1.5`

9. **Product Badge**:
   - Digital: `📱 Creator Pro` (default text color)
   - Canvas: `🖼️ Canvas Print` (subtle gold tint: `text-amber-200/80`)
   - Font: `text-xs uppercase tracking-wide font-semibold`
   - Margin bottom: `mb-2`

10. **Placeholder CTA**:
    - Text: `[Placeholder CTA - Configure Later]`
    - Font: `text-xs text-white/40 italic`
    - Note: Future implementation will replace with "Try This Style" (digital) or "View Canvas Quality" (canvas)

**Animation Behavior**:
- Staggered fade-in: `opacity-0 → opacity-100` with `0.1s * cardIndex` delay
- Slide up: `translateY(20px) → translateY(0)`
- Duration: 0.5s
- Easing: `easeOut`
- Reduced motion: Instant display (no animation)

**Progressive Image Loading**:
```tsx
<picture>
  <source srcset={testimonial.afterImage.replace('.jpg', '.avif')} type="image/avif" />
  <source srcset={testimonial.afterImage.replace('.jpg', '.webp')} type="image/webp" />
  <img src={testimonial.afterImage} loading="lazy" alt="After transformation" />
</picture>
```

**Accessibility**:
- Semantic HTML: Card wrapped in `<article>` element
- Star rating: `aria-label="Rated 5 out of 5 stars"`
- Product badge: `aria-label="Digital Creator subscription"` or `"Canvas print product"`
- Quote: Proper `<blockquote>` + `<cite>` tags

**Performance**:
- `React.memo()` wrapper
- Lazy loading on images (`loading="lazy"`)
- Only render visible cards (carousel handles this)

---

### **4.4 Component: `src/sections/studio/components/TestimonialCarousel.tsx`**

**Purpose**: Manage pagination, navigation, and rendering of testimonial cards.

**Props**:
```typescript
type TestimonialCarouselProps = {
  testimonials: readonly TestimonialConfig[]; // All 12 testimonials
  cardsPerPage: number;                        // 6 on desktop, 2 on mobile
  prefersReducedMotion: boolean;
};
```

**State Management**:
```typescript
const [currentPage, setCurrentPage] = useState(0); // 0-indexed (0 = Page 1, 1 = Page 2)
const totalPages = Math.ceil(testimonials.length / cardsPerPage); // 2 on desktop, 6 on mobile
```

**Layout**:

1. **Grid Container** (desktop):
   - `grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8`
   - Max width: `max-w-7xl mx-auto` (centered, matches Style Inspiration)
   - Padding: `px-6`

2. **Grid Container** (mobile):
   - `grid grid-cols-1 gap-6`
   - 2 cards stacked vertically per page

3. **Pagination Logic**:
   ```typescript
   const startIndex = currentPage * cardsPerPage;
   const endIndex = startIndex + cardsPerPage;
   const visibleCards = testimonials.slice(startIndex, endIndex);
   ```

4. **Slide Animation**:
   - Use `framer-motion`'s `AnimatePresence` + `motion.div`
   - Variants:
     ```typescript
     const slideVariants = {
       enter: (direction: number) => ({
         x: direction > 0 ? 1000 : -1000,
         opacity: 0,
       }),
       center: {
         x: 0,
         opacity: 1,
       },
       exit: (direction: number) => ({
         x: direction < 0 ? 1000 : -1000,
         opacity: 0,
       }),
     };
     ```
   - Direction tracking: `const [direction, setDirection] = useState(0);`
     - `1` = next (slide left)
     - `-1` = prev (slide right)

5. **Arrow Buttons** (frosted glass circles):
   - **Position**: Absolute, vertically centered on left/right edges of grid
   - **Style**:
     - Background: `bg-white/[0.05] backdrop-blur-md`
     - Border: `border border-white/10`
     - Rounded: `rounded-full`
     - Size: `w-12 h-12 lg:w-14 lg:h-14`
     - Hover: `hover:bg-white/[0.1] hover:scale-110`
     - Transition: `transition-all duration-200`
   - **Icons**: Lucide React `ChevronLeft` / `ChevronRight`
   - **Disabled state**:
     - Prev disabled on page 0
     - Next disabled on last page
     - Opacity: `opacity-40 cursor-not-allowed` when disabled
   - **Click handler**:
     ```typescript
     const handleNext = () => {
       if (currentPage < totalPages - 1) {
         setDirection(1);
         setCurrentPage((prev) => prev + 1);
       }
     };
     ```

6. **Dot Indicators**:
   - **Position**: Centered below grid
   - **Layout**: Flex row with gap (`flex gap-2`)
   - **Style per dot**:
     - Active: `w-2.5 h-2.5 rounded-full bg-amber-400`
     - Inactive: `w-2 h-2 rounded-full bg-white/20`
     - Hover: `hover:bg-white/40`
     - Transition: `transition-all duration-200`
   - **Click handler**:
     ```typescript
     const handleDotClick = (pageIndex: number) => {
       setDirection(pageIndex > currentPage ? 1 : -1);
       setCurrentPage(pageIndex);
     };
     ```

7. **Keyboard Navigation**:
   - Listen for `ArrowLeft` / `ArrowRight` keypresses
   - Only trigger if carousel is in viewport (prevent hijacking global navigation)
   - Implementation:
     ```typescript
     useEffect(() => {
       const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'ArrowLeft') handlePrev();
         if (e.key === 'ArrowRight') handleNext();
       };

       if (isInView) { // useInView hook
         window.addEventListener('keydown', handleKeyDown);
         return () => window.removeEventListener('keydown', handleKeyDown);
       }
     }, [isInView, currentPage]);
     ```

8. **Touch Gestures** (mobile):
   - Use `framer-motion`'s `drag` + `dragConstraints`
   - Swipe left → next page
   - Swipe right → prev page
   - Threshold: 50px swipe distance
   - Implementation:
     ```typescript
     <motion.div
       drag="x"
       dragConstraints={{ left: 0, right: 0 }}
       onDragEnd={(e, { offset, velocity }) => {
         const swipe = swipePower(offset.x, velocity.x);
         if (swipe < -swipeConfidenceThreshold) handleNext();
         else if (swipe > swipeConfidenceThreshold) handlePrev();
       }}
     >
       {/* Cards */}
     </motion.div>
     ```

**Performance**:
- Only render current page's cards (don't mount all 12 at once)
- `React.memo()` wrapper
- Intersection Observer: Only initialize gestures when carousel is in viewport

**Accessibility**:
- Arrow buttons: `aria-label="Previous testimonials"` / `"Next testimonials"`
- Dot indicators: `aria-label="Go to page 1"`, `aria-current="true"` for active dot
- Keyboard navigation: Full arrow key support
- Screen readers: Announce page changes (`aria-live="polite"`)

**Responsive Behavior**:
- **Desktop** (≥1024px): 3 columns × 2 rows = 6 cards per page → 2 pages
- **Tablet** (768-1023px): 2 columns × 2 rows = 4 cards per page → 3 pages
- **Mobile** (<768px): 1 column × 2 rows = 2 cards per page → 6 pages

---

### **4.5 Component: `src/sections/studio/SocialProofSection.tsx`**

**Purpose**: Main orchestrator component that assembles all pieces into the final section.

**Structure**:

```tsx
const SocialProofSection = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Responsive cards per page
  const cardsPerPage = useMediaQuery('(min-width: 1024px)') ? 6 : 2;

  return (
    <LazyMotion features={domAnimation}>
      <section
        className="relative bg-slate-950/95 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.22),transparent_60%)] border-t border-white/5 text-white py-20 lg:py-24"
        data-section="social-proof"
      >
        <div className="mx-auto max-w-[1800px] px-6">

          {/* HEADER */}
          <header className="text-center mb-12 lg:mb-16">
            <h2 className="font-poppins text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Join 10,000+ Creators Transforming Photos in Seconds
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Watermark-free digital exports. Premium canvases when you want something on the wall.
            </p>
          </header>

          {/* STATS BAND */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-6 mb-16 lg:mb-20">
            <StatsPill label="Previews Generated" value="2.3M+" />
            <StatsPill label="Recommend Wondertone" value="96%" />
            <StatsPill label="Canvases Shipped" value="12K" />
          </div>

          {/* TESTIMONIAL CAROUSEL */}
          <TestimonialCarousel
            testimonials={SOCIAL_PROOF_TESTIMONIALS}
            cardsPerPage={cardsPerPage}
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* CANVAS FOOTNOTE */}
          <div className="mt-12 lg:mt-16 max-w-3xl mx-auto">
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-full px-6 py-4 text-center">
              <p className="text-sm text-white/70">
                Love your results?{' '}
                <a
                  href="#canvas-quality"
                  className="text-amber-400 hover:text-amber-300 underline transition-colors"
                >
                  Upgrade to museum-quality canvas prints
                </a>{' '}
                (ships in 5 days).{' '}
                <a
                  href="#canvas-quality"
                  className="text-white/60 hover:text-white/80 transition-colors"
                >
                  See how canvases arrive →
                </a>
              </p>
            </div>
          </div>

          {/* PRIMARY CTA */}
          <div className="mt-10 lg:mt-12 flex justify-center">
            <button
              onClick={() => {
                // Future: Navigate to /create or trigger upload flow
                console.log('Start Free Preview clicked');
              }}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-slate-900 font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-200"
            >
              Start Free Preview
            </button>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default memo(SocialProofSection);
```

**Key Features**:
- Purple radial spotlight background (matches Style Inspiration)
- Centered layout with `max-w-[1800px]` container
- Responsive stats band (stacks vertically on mobile)
- Carousel with dynamic `cardsPerPage` based on viewport
- Canvas footnote with smooth scroll links
- Primary CTA with gold gradient + hover effects

**Performance**:
- `LazyMotion` wrapper (reduces framer-motion bundle)
- `React.memo()` wrapper
- All animations respect `prefersReducedMotion`

**Accessibility**:
- Semantic HTML: `<section>`, `<header>`, `<nav>` for carousel controls
- Focus management: CTA button has clear focus ring
- Scroll links: `#canvas-quality` anchor (assumes Canvas Quality section has `id="canvas-quality"`)

---

### **4.6 Modification: `src/pages/StudioPage.tsx`**

**Change Required**:
Add `<SocialProofSection />` after `<StyleInspirationSection />`.

**Before**:
```tsx
<InstantBreadthStrip />
<StyleInspirationSection />
{/* Future: Social Proof, Subscriptions, Canvas Quality, FAQ, Footer */}
```

**After**:
```tsx
import SocialProofSection from '@/sections/studio/SocialProofSection';

// ... in return statement:
<InstantBreadthStrip />
<StyleInspirationSection />
<SocialProofSection />
{/* Future: Subscriptions, Canvas Quality, FAQ, Footer */}
```

**No other changes needed** — StudioPage already has Suspense boundaries and providers in place.

---

## 5. Asset Requirements

### **5.1 Placeholder Images**

**Location**: `public/testimonials/`

**Files Needed** (24 total: 12 before + 12 after):
```
public/testimonials/
├── placeholder-before-1.jpg   (+ .webp + .avif)
├── placeholder-after-1.jpg    (+ .webp + .avif)
├── placeholder-before-2.jpg   (+ .webp + .avif)
├── placeholder-after-2.jpg    (+ .webp + .avif)
... (repeat for testimonials 3-12)
```

**Specifications**:
- **Dimensions**: 800×800px (square aspect ratio)
- **Format**:
  - Primary: AVIF (best compression, ~30% smaller than WebP)
  - Fallback 1: WebP (broad support, good compression)
  - Fallback 2: JPG (universal support)
- **Quality**:
  - AVIF: 85 quality
  - WebP: 85 quality
  - JPG: 80 quality
- **Source**:
  - Use free stock photos from Unsplash (personal portraits)
  - Apply Wondertone styles via existing edge function (generate real before/after pairs)
  - Ensure photos are diverse (age, gender, ethnicity) for inclusive representation

**Asset Generation Script** (Optional):
- Extend existing `npm run thumbnails:generate` script to convert JPG → WebP + AVIF
- Or manually convert using:
  ```bash
  # WebP conversion
  cwebp -q 85 placeholder-before-1.jpg -o placeholder-before-1.webp

  # AVIF conversion
  avifenc --min 0 --max 63 -a end-usage=q -a cq-level=23 placeholder-before-1.jpg placeholder-before-1.avif
  ```

**Placeholder Content Strategy**:
- **Phase 1** (initial launch): Use AI-generated before/after pairs (real Wondertone output)
- **Phase 2** (post-launch): Replace with real customer submissions (with permission + waiver)
- **Phase 3** (CMS integration): Move to Supabase storage with admin upload interface

---

## 6. Animation Specifications

### **6.1 Entrance Animations**

**Stats Pills**:
- **Trigger**: On scroll into viewport (Intersection Observer)
- **Effect**: Fade in + slide up
- **Delay**: Staggered (0.15s per pill, like Style Inspiration buckets)
- **Duration**: 0.5s
- **Easing**: `easeOut`
- **Count-up**: 2s duration, starts when pills enter viewport

**Testimonial Cards**:
- **Trigger**: On page change (carousel navigation)
- **Effect**: Fade in + slide up
- **Delay**: Staggered (0.1s per card)
- **Duration**: 0.5s
- **Easing**: `easeOut`
- **Only animates on initial page load** (subsequent page changes use slide transitions)

**Carousel Page Transitions**:
- **Trigger**: Click Next/Prev, dot indicator, keyboard arrow, or swipe gesture
- **Effect**: Horizontal slide
  - Next: Current page slides left (exits), new page slides in from right
  - Prev: Current page slides right (exits), new page slides in from left
- **Duration**: 0.6s
- **Easing**: `easeInOut`
- **Overlap**: Exit + enter animations run simultaneously (smooth transition)

### **6.2 Hover Effects**

**Testimonial Cards**:
- **Trigger**: Mouse hover (desktop only)
- **Effect**: Subtle lift + shadow expansion
  - `scale(1.02)`
  - `shadow-lg → shadow-2xl`
- **Duration**: 0.2s
- **Easing**: `easeOut`

**Arrow Buttons**:
- **Trigger**: Mouse hover
- **Effect**: Background brighten + scale up
  - `bg-white/[0.05] → bg-white/[0.1]`
  - `scale(1.1)`
- **Duration**: 0.2s
- **Easing**: `easeOut`

**Dot Indicators**:
- **Trigger**: Mouse hover (inactive dots only)
- **Effect**: Opacity increase
  - `bg-white/20 → bg-white/40`
- **Duration**: 0.2s
- **Easing**: `easeOut`

**Primary CTA Button**:
- **Trigger**: Mouse hover
- **Effect**: Scale up + glow expansion
  - `scale(1.05)`
  - `shadow-[0_0_30px_rgba(251,191,36,0.4)]`
- **Duration**: 0.2s
- **Easing**: `easeOut`

### **6.3 Reduced Motion Compliance**

**When `prefersReducedMotion` is true**:
- **Stats pills**: Instant display (no fade-in, no count-up animation)
- **Testimonial cards**: Instant display (no fade-in, no stagger)
- **Carousel transitions**: Crossfade only (no slide, `opacity` transition only)
- **Hover effects**: Still enabled (non-disruptive, user-initiated)

**Implementation**:
```typescript
const prefersReducedMotion = usePrefersReducedMotion();

const cardVariants = prefersReducedMotion
  ? { visible: { opacity: 1 } } // Instant
  : {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };
```

---

## 7. Performance Budget & Optimization

### **7.1 Bundle Size Target**

**Current Bundle** (after Style Inspiration):
- Main bundle: ~280KB gzipped
- React vendors: ~140KB
- Motion vendors: ~30KB (LazyMotion optimized)

**Target Increase for Social Proof Section**:
- **<10KB gzipped** (conservative estimate: 8KB)

**Breakdown**:
- `StatsPill.tsx`: ~1KB (small component, minimal logic)
- `TestimonialCard.tsx`: ~2KB (mostly JSX, progressive image loading)
- `TestimonialCarousel.tsx`: ~3KB (pagination logic, gesture handling)
- `SocialProofSection.tsx`: ~1KB (orchestrator, minimal logic)
- `socialProofTestimonials.ts`: ~1KB (12 config objects, gzips well)

**Total**: ~8KB gzipped (within budget)

**Images NOT counted** (lazy loaded, separate requests):
- 24 images (before/after pairs) load on-demand
- Progressive loading reduces initial payload
- AVIF compression: ~40KB per image (vs ~120KB for JPG)

### **7.2 Optimization Strategies**

**Code Splitting**:
- Social Proof section is NOT lazy-loaded (part of Studio page bundle)
- Rationale: Section is above-the-fold-adjacent (high priority)
- Alternative: Could lazy-load carousel component if bundle exceeds budget

**React Optimization**:
- `React.memo()` on ALL components (StatsPill, TestimonialCard, TestimonialCarousel, SocialProofSection)
- `useMemo()` for expensive computations (pagination logic, filtered testimonials)
- Avoid unnecessary re-renders (proper dependency arrays in hooks)

**Image Optimization**:
- **Progressive loading**: AVIF → WebP → JPG fallback
- **Lazy loading**: `loading="lazy"` on all images
- **Responsive images**: Consider `srcset` for different viewport sizes (future enhancement)
- **Preload first page images** (optional): Add `<link rel="preload">` for first 6 images to speed up initial render

**Animation Optimization**:
- **GPU-accelerated properties only**: `transform`, `opacity` (no `width`, `height`, `background-color`)
- **LazyMotion**: Reduces framer-motion bundle by ~40KB
- **Intersection Observer**: Animations only trigger when in viewport (no wasted renders above fold)

**Carousel Optimization**:
- **Render only visible cards**: Don't mount all 12 cards at once (mount current page + preload adjacent page)
- **Debounce gesture handlers**: Prevent excessive state updates during swipe
- **Conditional event listeners**: Only attach keyboard/touch listeners when carousel is in viewport

**Network Optimization**:
- **HTTP/2 multiplexing**: Browser handles parallel image requests efficiently
- **CDN delivery** (if images hosted on Supabase Storage): Edge caching reduces latency
- **Preconnect to image domain**: Add `<link rel="preconnect">` to speed up first image request

### **7.3 Performance Monitoring**

**Metrics to Track**:
- **Bundle size**: Run `npm run build:analyze` to verify <10KB increase
- **Lighthouse score**: Target 90+ on Performance, 100 on Accessibility
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s (ensure first testimonial card loads fast)
  - CLS (Cumulative Layout Shift): <0.1 (reserve space for images with `aspect-ratio`)
  - INP (Interaction to Next Paint): <200ms (ensure carousel transitions are snappy)

**Testing Checklist** (post-implementation):
- [ ] Bundle size <10KB increase (verify with `build:analyze`)
- [ ] Lighthouse Performance score ≥90
- [ ] No layout shift when images load (proper `aspect-ratio` on containers)
- [ ] Carousel transitions feel smooth (60fps on desktop, 30fps on mobile acceptable)
- [ ] Images lazy-load correctly (check Network tab: only visible images load)
- [ ] Reduced motion respected (test with OS setting enabled)

---

## 8. Accessibility Requirements

### **8.1 Semantic HTML**

**Section Structure**:
```html
<section data-section="social-proof" aria-labelledby="social-proof-heading">
  <header>
    <h2 id="social-proof-heading">Join 10,000+ Creators...</h2>
  </header>

  <div role="region" aria-label="Customer statistics">
    <!-- Stats pills -->
  </div>

  <div role="region" aria-label="Customer testimonials">
    <!-- Carousel -->
  </div>

  <nav aria-label="Testimonial navigation">
    <!-- Arrow buttons + dots -->
  </nav>
</section>
```

**Testimonial Cards**:
```html
<article aria-labelledby="testimonial-1-author">
  <figure>
    <img src="before.jpg" alt="Original photo of Sarah" />
    <img src="after.jpg" alt="Transformed artwork in Neon Splash style" />
    <figcaption>
      <blockquote>Boosted my Instagram reach by 300%!</blockquote>
      <cite id="testimonial-1-author">Sarah M.</cite>
    </figcaption>
  </figure>
</article>
```

### **8.2 ARIA Labels**

**Stats Pills**:
- Value: `aria-live="polite"` (announces final count to screen readers)
- Label: Descriptive text (e.g., "2.3 million previews generated" vs just "2.3M")

**Carousel Navigation**:
- Prev button: `aria-label="View previous testimonials"`
- Next button: `aria-label="View next testimonials"`
- Disabled state: `aria-disabled="true"` (when on first/last page)

**Dot Indicators**:
- Each dot: `aria-label="Go to page 1"`, `aria-label="Go to page 2"`, etc.
- Active dot: `aria-current="true"`
- Container: `role="tablist"` with dots as `role="tab"`

**Star Ratings**:
- `aria-label="Rated 5 out of 5 stars"` (for screen readers)
- Visual stars are decorative (presentational)

**Product Badges**:
- Digital: `aria-label="Digital Creator subscription"`
- Canvas: `aria-label="Canvas print product"`

### **8.3 Keyboard Navigation**

**Focusable Elements**:
1. Stats pills (not focusable, informational only)
2. Testimonial cards (not focusable if no CTA, future: make CTA focusable)
3. Prev/Next buttons (focusable, `tabindex="0"`)
4. Dot indicators (focusable, `tabindex="0"`)
5. Canvas footnote links (focusable, native `<a>` elements)
6. Primary CTA button (focusable, native `<button>`)

**Keyboard Shortcuts**:
- `Tab` / `Shift+Tab`: Navigate between focusable elements
- `Arrow Left`: Previous page (when carousel controls focused)
- `Arrow Right`: Next page (when carousel controls focused)
- `Enter` / `Space`: Activate focused button/link

**Focus Management**:
- Clear focus rings on all interactive elements (`ring-2 ring-amber-400`)
- Focus trap NOT needed (carousel is not a modal)
- Focus should NOT move on page change (keep on navigation control)

### **8.4 Screen Reader Support**

**Page Change Announcements**:
- Use `aria-live="polite"` region to announce page changes
- Example: "Page 2 of 2" announced when user clicks Next

**Image Alt Text**:
- Before: `alt="Original photo of [subject]"` (descriptive of content)
- After: `alt="Transformed artwork in [Style Name] style"` (descriptive of transformation)
- Avoid generic alts like "before image" or "after image"

**Quote Attribution**:
- Use `<blockquote>` for quote text
- Use `<cite>` for author name
- Screen readers will announce "Quote: [text], Citation: [name]"

### **8.5 Color Contrast**

**WCAG AA Compliance** (4.5:1 minimum):
- White text on slate-950 background: ✅ Pass (contrast ratio ~16:1)
- White/70 text on slate-950: ✅ Pass (contrast ratio ~11:1)
- Amber-400 CTA text on slate-900 background: ✅ Pass (contrast ratio ~8:1)
- Star rating gold on dark background: ✅ Pass (contrast ratio ~6:1)

**Focus Indicators**:
- Amber-400 focus ring: 2px solid (highly visible on dark background)
- Contrast ratio: ✅ Pass (meets 3:1 minimum for UI components)

### **8.6 Reduced Motion**

**Respect `prefers-reduced-motion`**:
- Disable all non-essential animations (entrance fades, count-ups, carousel slides)
- Preserve essential feedback (hover effects, focus rings)
- Use instant state changes instead of transitions

**Implementation**:
```typescript
const prefersReducedMotion = usePrefersReducedMotion();

// In framer-motion config:
<motion.div
  initial={prefersReducedMotion ? false : "hidden"}
  animate={prefersReducedMotion ? false : "visible"}
  variants={prefersReducedMotion ? {} : cardVariants}
>
```

---

## 9. Responsive Design Specifications

### **9.1 Breakpoint Strategy**

**Tailwind Breakpoints** (already defined in project):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Component-Specific Breakpoints**:

| Element | Mobile (<768px) | Tablet (768-1023px) | Desktop (≥1024px) |
|---------|-----------------|---------------------|-------------------|
| Headline | `text-4xl` | `text-5xl` | `text-6xl` |
| Subhead | `text-base` | `text-lg` | `text-lg` |
| Stats Pills | Stacked (1 col) | Row (3 cols) | Row (3 cols) |
| Testimonial Grid | 1 col × 2 rows | 2 cols × 2 rows | 3 cols × 2 rows |
| Cards Per Page | 2 | 4 | 6 |
| Total Pages | 6 | 3 | 2 |
| Arrow Buttons | `w-10 h-10` | `w-12 h-12` | `w-14 h-14` |
| Dot Size | `w-2 h-2` | `w-2 h-2` | `w-2.5 h-2.5` |
| Section Padding | `py-16 px-4` | `py-20 px-6` | `py-24 px-6` |

### **9.2 Mobile-Specific Optimizations**

**Touch Gestures**:
- Swipe left → next page
- Swipe right → prev page
- Minimum swipe distance: 50px (prevent accidental triggers)
- Velocity threshold: 0.5 (accounts for slow swipes)

**Image Loading**:
- Smaller image sizes on mobile (future: use `srcset` for 400×400px variants)
- Lazy load more aggressively (only load current page, not adjacent)

**Layout Adjustments**:
- Stats pills stack vertically with full width (easier to read)
- Canvas footnote uses smaller text (`text-xs` vs `text-sm`)
- Primary CTA button fills width on mobile (`w-full sm:w-auto`)

**Performance**:
- Reduce animation complexity on mobile (simpler transitions, shorter durations)
- Disable parallax/complex effects on low-end devices (detect via `navigator.hardwareConcurrency`)

### **9.3 Tablet Considerations**

**Hybrid Approach**:
- 2-column grid (compromise between mobile/desktop)
- Keep arrow buttons (better than swipe-only for precision)
- Horizontal layout for stats pills (if space allows)

**Orientation Handling**:
- Portrait: 1-column grid (like mobile)
- Landscape: 2-column grid (like tablet default)

---

## 10. Future Enhancements (Post-MVP)

### **10.1 CTA Functionality**

**Current**: Placeholder text `[Placeholder CTA - Configure Later]`

**Phase 1** (basic):
- Digital cards: Link to `/create` (generic upload flow)
- Canvas cards: Link to `#canvas-quality` (scroll to Canvas Quality section)

**Phase 2** (entitlement-aware):
- Check user entitlement via `useFounderStore`
- If free user: Link to `/create?style={styleId}` with paywall modal
- If Creator Pro: Link to `/create?style={styleId}` with pre-selected style
- If Canvas customer: Show "Reorder Canvas" CTA instead of "Try This Style"

**Phase 3** (deep-linking):
- Pass full context to configurator: `style`, `orientation`, `canvas size`
- Example: `/create?style=neon-splash&orientation=portrait&size=16x20`
- Pre-populate entire configurator based on testimonial card

### **10.2 Real Testimonial Content**

**Current**: Placeholder quotes + stock photos

**Phase 1** (customer outreach):
- Email campaign to existing customers requesting testimonials
- Offer incentive: Free canvas print or 3 months Creator Pro
- Legal: Testimonial release form (permission to use photo + quote)

**Phase 2** (submission form):
- Create `/testimonials/submit` page with form:
  - Upload before/after images
  - Write quote (max 100 characters)
  - Select product type (Digital/Canvas)
  - Provide name (first name + last initial auto-generated)
- Auto-moderation: Flag inappropriate content for review

**Phase 3** (CMS integration):
- Supabase table: `testimonials` (id, before_image_url, after_image_url, quote, author, product_type, rating, style_id, approved, created_at)
- Admin dashboard: Approve/reject submissions
- Frontend: Fetch from Supabase instead of config file
- Auto-refresh: Testimonials rotate monthly (keep content fresh)

### **10.3 Video Testimonials**

**Concept**: Replace static images with short video clips (10-15 seconds)
- Before/after comparison shown as video scrub (drag slider to reveal)
- Customer voiceover explaining use case
- Autoplay on hover (muted), full audio on click

**Implementation**:
- Use `<video>` element with poster frame (before image)
- Lazy load video files (only load when card enters viewport)
- Fallback to static images on slow connections (detect via `navigator.connection.effectiveType`)

**Performance Considerations**:
- Video files: ~500KB per testimonial (vs ~80KB for images)
- Only load first page videos initially, lazy-load others
- Disable autoplay on mobile (data usage concerns)

### **10.4 A/B Testing**

**Variants to Test**:

**Headline Copy**:
- A: "Join 10,000+ Creators Transforming Photos in Seconds" (current)
- B: "Trusted by 10,000+ Creators Worldwide"
- C: "See Why 10,000+ Creators Love Wondertone"

**CTA Text**:
- A: "Start Free Preview" (current)
- B: "Try Wondertone Free"
- C: "Create Your First Masterpiece"

**Stats Emphasis**:
- A: 3 pills (current)
- B: 1 large stat (focus on "96% recommend")
- C: No stats, more testimonials instead (trust via stories)

**Carousel vs. Infinite Scroll**:
- A: Paginated carousel (current)
- B: Infinite vertical scroll (like Instagram feed)
- C: Masonry grid (no pagination, all 12 visible)

**Implementation**:
- Use Supabase Edge Functions + `split_variant` cookie
- Track conversions: "Start Free Preview" clicks per variant
- Duration: 2 weeks per test, 5% significance threshold

### **10.5 Analytics Integration**

**Events to Track**:
1. **Section Viewed**: User scrolls Social Proof section into view
2. **Stat Pill Animated**: Count-up animation completes
3. **Testimonial Card Viewed**: Individual card enters viewport
4. **Carousel Page Changed**: User navigates to different page (via arrow/dot/swipe)
5. **CTA Clicked**: "Start Free Preview" button clicked
6. **Footnote Link Clicked**: "See how canvases arrive" link clicked

**Implementation**:
- Use existing `previewAnalytics.ts` pattern
- Add `emitSocialProofEvent(eventName, metadata)` function
- Metadata: `{ page: number, cardId: string, productType: 'digital' | 'canvas' }`

**Insights to Track**:
- Conversion rate: Views → CTA clicks
- Engagement rate: Page 1 views → Page 2 views (are users exploring?)
- Product interest: Digital vs. Canvas card click-through rate
- Drop-off points: Where do users stop scrolling?

### **10.6 Internationalization (i18n)**

**Text to Translate**:
- Headline, subhead
- Stats labels ("Previews Generated" → "Vistas previas generadas")
- Testimonial quotes (manual translation or user-submitted in multiple languages)
- CTA text ("Start Free Preview" → "Iniciar vista previa gratuita")

**Implementation**:
- Use `react-i18next` library
- Move all hardcoded strings to `locales/en.json`, `locales/es.json`, etc.
- Detect user language via `navigator.language` or user preference

**Challenges**:
- Testimonial quotes may not translate well (cultural context, idioms)
- Solution: Collect separate testimonials per language region

---

## 11. Implementation Checklist

### **Phase 1: Configuration & Assets** (Estimated: 2 hours)

- [ ] Create `src/config/socialProofTestimonials.ts`
  - [ ] Define `ProductType` and `TestimonialConfig` types
  - [ ] Create 12 testimonial objects (8 digital, 4 canvas)
  - [ ] Use placeholder quotes + placeholder image paths
  - [ ] Export as `SOCIAL_PROOF_TESTIMONIALS` constant

- [ ] Generate placeholder images
  - [ ] Source 12 diverse stock photos from Unsplash
  - [ ] Generate before/after pairs using existing Wondertone styles
  - [ ] Convert to AVIF + WebP + JPG (3 formats × 24 images = 72 files)
  - [ ] Place in `public/testimonials/` directory
  - [ ] Verify images load correctly in browser

### **Phase 2: Base Components** (Estimated: 3 hours)

- [ ] Create `src/sections/studio/components/StatsPill.tsx`
  - [ ] Implement component with `label` and `value` props
  - [ ] Add frosted glass styling (matches Style Inspiration aesthetic)
  - [ ] Implement count-up animation with `useMotionValue` + `animate`
  - [ ] Add `useInView` hook to trigger animation on scroll
  - [ ] Respect `prefersReducedMotion` (instant display if true)
  - [ ] Wrap in `React.memo()`
  - [ ] Test: Verify count-up animates smoothly, respects reduced motion

- [ ] Create `src/sections/studio/components/TestimonialCard.tsx`
  - [ ] Implement side-by-side Before/After layout
  - [ ] Add grey border to Before image, gold gradient to After
  - [ ] Add star rating (5 stars, top-right of After image)
  - [ ] Add frosted glass quote overlay (bottom of card)
  - [ ] Add product badge (📱 Digital or 🖼️ Canvas)
  - [ ] Add placeholder CTA text (configurable per card)
  - [ ] Implement progressive image loading (AVIF → WebP → JPG)
  - [ ] Add staggered fade-in animation (0.1s delay per card)
  - [ ] Add Canvas-only gold glow effect
  - [ ] Wrap in `React.memo()`
  - [ ] Test: Verify card renders correctly, images load progressively

### **Phase 3: Carousel Component** (Estimated: 4 hours)

- [ ] Create `src/sections/studio/components/TestimonialCarousel.tsx`
  - [ ] Implement pagination state (`currentPage`, `totalPages`)
  - [ ] Calculate `cardsPerPage` based on viewport (6 desktop, 2 mobile)
  - [ ] Implement `handleNext` / `handlePrev` functions
  - [ ] Add frosted glass arrow buttons (ChevronLeft/Right icons)
  - [ ] Add dot indicators (clickable, active state)
  - [ ] Implement slide transition animations (framer-motion `AnimatePresence`)
  - [ ] Add keyboard navigation (ArrowLeft/Right)
  - [ ] Add touch gesture support (swipe left/right)
  - [ ] Only render visible cards (current page + preload adjacent)
  - [ ] Respect `prefersReducedMotion` (crossfade instead of slide)
  - [ ] Wrap in `React.memo()`
  - [ ] Test: Verify pagination works via arrows, dots, keyboard, swipe

### **Phase 4: Main Section** (Estimated: 2 hours)

- [ ] Create `src/sections/studio/SocialProofSection.tsx`
  - [ ] Add purple radial spotlight background (matches Style Inspiration)
  - [ ] Add headline + subhead
  - [ ] Add stats band (3 `<StatsPill>` components)
  - [ ] Add `<TestimonialCarousel>` component
  - [ ] Add canvas footnote (frosted pill with scroll links)
  - [ ] Add primary CTA button ("Start Free Preview")
  - [ ] Implement responsive layout (stacked on mobile, row on desktop)
  - [ ] Wrap in `LazyMotion` for bundle optimization
  - [ ] Wrap in `React.memo()`
  - [ ] Test: Verify full section renders correctly, all interactions work

### **Phase 5: Integration** (Estimated: 1 hour)

- [ ] Modify `src/pages/StudioPage.tsx`
  - [ ] Import `SocialProofSection`
  - [ ] Add component after `<StyleInspirationSection />`
  - [ ] Verify page still renders correctly
  - [ ] Test: Navigate to Studio page, verify section appears in correct position

### **Phase 6: Testing & Optimization** (Estimated: 3 hours)

- [ ] **Functionality Testing**
  - [ ] Carousel navigation works (arrows, dots, keyboard, swipe)
  - [ ] Stats count-up animation triggers correctly
  - [ ] Images load progressively (check Network tab)
  - [ ] CTA button click logs to console (placeholder behavior)
  - [ ] Canvas footnote links scroll correctly (once Canvas Quality section exists)

- [ ] **Responsive Testing**
  - [ ] Desktop (≥1024px): 3-column grid, 6 cards per page
  - [ ] Tablet (768-1023px): 2-column grid, 4 cards per page
  - [ ] Mobile (<768px): 1-column grid, 2 cards per page
  - [ ] Stats pills stack vertically on mobile
  - [ ] Touch gestures work on mobile/tablet

- [ ] **Accessibility Testing**
  - [ ] Keyboard navigation: Tab through all focusable elements
  - [ ] Screen reader: Test with VoiceOver (Mac) or NVDA (Windows)
  - [ ] Focus rings visible on all interactive elements
  - [ ] Color contrast meets WCAG AA (use browser DevTools)
  - [ ] Reduced motion: Enable OS setting, verify animations disabled

- [ ] **Performance Testing**
  - [ ] Run `npm run build:analyze`, verify bundle increase <10KB
  - [ ] Run Lighthouse audit, verify Performance ≥90, Accessibility 100
  - [ ] Check Network tab: Images lazy-load correctly
  - [ ] Verify no layout shift (CLS <0.1)
  - [ ] Test on low-end device (throttle CPU in DevTools)

- [ ] **Cross-Browser Testing**
  - [ ] Chrome (primary target)
  - [ ] Safari (important for iOS)
  - [ ] Firefox (alternative engine)
  - [ ] Edge (Chromium-based, should match Chrome)

### **Phase 7: Documentation & Handoff** (Estimated: 1 hour)

- [ ] Update `CLAUDE.md` with Social Proof section details
  - [ ] Add file paths to architecture section
  - [ ] Document state management (if any new store slices)
  - [ ] Add to "Common Patterns" section

- [ ] Create `/docs/social-proof-content-update-guide.md`
  - [ ] Instructions for updating testimonials (edit config file)
  - [ ] Instructions for replacing placeholder images
  - [ ] Instructions for updating stats (edit pills in SocialProofSection.tsx)

- [ ] Add comments to code
  - [ ] Document magic numbers (0.1s stagger, 2s count-up, etc.)
  - [ ] Explain why carousel renders only visible cards (performance)
  - [ ] Note future enhancement opportunities (CTA linking, video testimonials)

---

## 12. Risk Assessment & Mitigation

### **Risk 1: Bundle Size Exceeds Budget**

**Likelihood**: Low (estimated 8KB, budget is 10KB)
**Impact**: Medium (slower page load, worse Lighthouse score)

**Mitigation**:
- Monitor bundle during development (`npm run build:analyze` after each component)
- If carousel component is too large, consider lazy-loading it (load only when section enters viewport)
- Simplify animations if needed (fewer framer-motion features = smaller bundle)

**Fallback**:
- Remove carousel, show static 6-card grid with "Load More" button
- Reduces complexity, eliminates pagination logic (~2KB savings)

---

### **Risk 2: Placeholder Images Look Low-Quality**

**Likelihood**: Medium (stock photos + AI transformations may not match real user results)
**Impact**: Medium (hurts credibility, reduces conversion)

**Mitigation**:
- Use HIGH-QUALITY stock photos (Unsplash Plus or paid stock)
- Run stock photos through Wondertone's best styles (Classic Oil Painting, Gallery Acrylic, Neon Splash)
- Get user feedback during staging: "Do these transformations look realistic?"

**Fallback**:
- Partner with early beta users to get real before/after submissions (offer free Canvas prints as incentive)
- Use REAL customer photos from day one (even if only 6 testimonials instead of 12)

---

### **Risk 3: Carousel Gestures Feel Janky on Mobile**

**Likelihood**: Medium (touch gestures are tricky to implement smoothly)
**Impact**: High (poor UX = users abandon section)

**Mitigation**:
- Use framer-motion's built-in `drag` + `dragConstraints` (battle-tested library)
- Test on REAL devices (not just Chrome DevTools mobile emulation)
- Adjust swipe threshold + velocity based on user testing

**Fallback**:
- Disable gestures on mobile, use arrow buttons only
- Show "Swipe to see more" hint (educate users)
- Add "Load All" button (skip pagination entirely on mobile)

---

### **Risk 4: Stats Are Inaccurate/Outdated**

**Likelihood**: High (hardcoded stats don't auto-update)
**Impact**: Low (slightly hurts credibility if stats are stale)

**Mitigation**:
- Pull stats from Supabase analytics (future enhancement)
- Set calendar reminder to update stats quarterly (manual update in SocialProofSection.tsx)
- Use "rounded" numbers (2.3M+ instead of 2,347,592) to avoid appearing too precise (and outdated)

**Fallback**:
- Replace specific numbers with qualitative statements ("Thousands of creators", "Loved by professionals")
- Focus on percentage-based stats (96% recommend) which change slowly

---

### **Risk 5: Canvas Footnote Links to Non-Existent Section**

**Likelihood**: High (Canvas Quality section doesn't exist yet)
**Impact**: Low (broken anchor link, but not critical)

**Mitigation**:
- Use `#canvas-quality` anchor (safe to implement even if target doesn't exist yet)
- When Canvas Quality section is built, add `id="canvas-quality"` to section element
- Smooth scroll behavior already implemented (CSS `scroll-behavior: smooth`)

**Fallback**:
- Link to `/canvas` page (if dedicated canvas product page exists)
- Link to Stripe canvas product page (external, but functional)
- Remove link entirely, keep as plain text ("ships in 5 days")

---

### **Risk 6: CTA Click Behavior Undefined**

**Likelihood**: High (placeholder behavior only logs to console)
**Impact**: Medium (users click, nothing happens, frustration)

**Mitigation**:
- Phase 1: Link to `/create` (generic upload flow, always works)
- Phase 2: Implement entitlement-aware routing (per Future Enhancements section)
- Show clear "Coming Soon" modal if CTA isn't ready yet

**Fallback**:
- Disable CTA button (opacity-50, cursor-not-allowed) until routing is implemented
- Replace with "Join Waitlist" CTA (collect emails instead of direct conversion)

---

## 13. Success Metrics (Post-Launch)

### **Primary Metrics**

**Conversion Rate**:
- **Definition**: (Social Proof section views with CTA click) / (Social Proof section views)
- **Target**: 8-12% (industry benchmark for testimonial sections)
- **Tracking**: GA4 event: `social_proof_cta_clicked`

**Engagement Rate**:
- **Definition**: (Users who navigate to Page 2) / (Users who view Page 1)
- **Target**: 30-40% (indicates testimonials are compelling enough to explore)
- **Tracking**: GA4 event: `carousel_page_changed` with `page: 2` metadata

### **Secondary Metrics**

**Time on Section**:
- **Definition**: Average time users spend with Social Proof section in viewport
- **Target**: 15-25 seconds (enough to read 2-3 testimonials)
- **Tracking**: Intersection Observer duration tracking

**Product Interest**:
- **Definition**: (Canvas card clicks) / (Digital card clicks)
- **Target**: 10-15% (mirrors 80/20 revenue split, validates canvas as aspirational)
- **Tracking**: GA4 event: `testimonial_card_clicked` with `productType` metadata

**Scroll Depth**:
- **Definition**: % of users who scroll past Social Proof section to next section
- **Target**: 70-80% (section should NOT be a dead-end)
- **Tracking**: Intersection Observer on section exit

### **Performance Metrics**

**Bundle Impact**:
- **Target**: <10KB gzipped increase
- **Measurement**: Compare `npm run build:analyze` before/after

**Lighthouse Score**:
- **Target**: Performance ≥90, Accessibility 100
- **Measurement**: Run Lighthouse audit on `/studio` page

**Image Load Time**:
- **Target**: First testimonial image LCP <2.5s
- **Measurement**: Chrome DevTools Performance tab

### **Qualitative Feedback**

**User Surveys**:
- Question: "Did the customer testimonials influence your decision to try Wondertone?" (Yes/No/Unsure)
- Target: 60%+ say "Yes"

**A/B Test Results** (future):
- Compare conversion rates between variants (headline copy, CTA text, carousel vs. grid)

---

## 14. Conversation Summary & Key Decisions

### **User Requests Chronology**

1. **Initial Request**: Implement Before/After Gallery Wall (Concept 1 from social proof brainstorming)
2. **Carousel Decision**: 3-column grid with pagination (6 cards per page on desktop)
3. **Navigation Style**: Frosted glass arrow buttons + dot indicators (Instagram-style)
4. **Mobile Behavior**: 1 column × 2 cards per page (6 pages total, swipe gestures)
5. **Keyboard Navigation**: Arrow keys navigate pages (accessibility)
6. **CTA Placement**: Below gallery only (Style Inspiration section already has CTA above)
7. **Stats**: "2.3M Previews Generated", "96% Recommend Wondertone", "12K Canvases Shipped"
8. **Content**: Placeholder quotes + images (replace with real content later)
9. **CTA Text**: Placeholder for now (entitlements need to be figured out first)

### **Critical Decisions Made**

**Conversion Strategy**:
- **2:1 digital-to-canvas ratio** (Option B) to match 80% subscription revenue
- **CTA below gallery** (not above) to avoid fatigue from Style Inspiration CTAs
- **Canvas as aspirational upsell** (footnote + subtle visual emphasis, not competing for attention)

**Interaction Design**:
- **Paginated carousel** (not infinite scroll or static grid) for engagement + performance
- **User-controlled navigation** (no autoplay) to respect best practices
- **Frosted glass aesthetic** (matches InstantBreadthStrip + Style Inspiration)

**Performance Priorities**:
- **<10KB bundle increase** (conservative target)
- **LazyMotion + React.memo** on all components
- **Progressive image loading** (AVIF → WebP → JPG)
- **Render only visible cards** (carousel optimization)

**Accessibility Commitments**:
- **Keyboard navigation** (arrow keys)
- **Screen reader support** (semantic HTML, ARIA labels)
- **Reduced motion compliance** (crossfade instead of slide)
- **WCAG AA color contrast** (verified)

### **Deferred Decisions (Future)**

- **CTA linking behavior** (wait for entitlement strategy)
- **Real testimonial content** (placeholder for MVP, replace post-launch)
- **A/B testing variants** (headline copy, stats emphasis, carousel vs. grid)
- **Video testimonials** (explore after static version proves successful)

### **User Preferences Captured**

- **Visual style**: Premium, high-end, gallery aesthetic (gold borders, frosted glass, purple spotlight)
- **Conversion philosophy**: Trust-building first, conversion second (proof → CTA flow)
- **Performance discipline**: Every KB matters, bundle size is sacred
- **Accessibility mindset**: Keyboard navigation + reduced motion are table-stakes

---

## 15. Final Implementation Notes

### **Pre-Implementation Checklist**

Before writing any code:
- [ ] Review this plan with stakeholders (marketing, product, design)
- [ ] Confirm stats are accurate (2.3M, 96%, 12K)
- [ ] Source placeholder images (12 high-quality stock photos)
- [ ] Set up analytics events (social_proof_cta_clicked, carousel_page_changed)
- [ ] Create feature branch: `feature/social-proof-section`

### **Development Order**

1. **Assets first** (images don't block code development)
2. **Base components** (StatsPill, TestimonialCard) → easier to test in isolation
3. **Carousel component** (most complex, requires base components working)
4. **Main section** (orchestrates everything)
5. **Integration** (add to StudioPage)
6. **Testing & optimization** (final phase)

### **Code Review Focus Areas**

- **Performance**: Bundle size, lazy loading, React.memo usage
- **Accessibility**: Keyboard nav, ARIA labels, semantic HTML
- **Responsiveness**: Test on real devices (not just DevTools)
- **Animation quality**: Smooth 60fps, respects reduced motion
- **Code quality**: TypeScript strict mode, no `any` types, proper error handling

### **Post-Implementation Tasks**

- [ ] Update CLAUDE.md with new section details
- [ ] Create content update guide for marketing team
- [ ] Set up analytics dashboard to track success metrics
- [ ] Schedule quarterly stats update reminder
- [ ] Plan real testimonial collection campaign

---

## Appendix A: Component Props Reference

### **StatsPill.tsx**
```typescript
type StatsPillProps = {
  label: string;           // e.g., "Previews Generated"
  value: string | number;  // e.g., "2.3M+" or 2300000
  animationDuration?: number; // Optional: count-up duration in ms (default 2000)
};
```

### **TestimonialCard.tsx**
```typescript
type TestimonialCardProps = {
  testimonial: TestimonialConfig;
  cardIndex: number; // For staggered animation delay
  prefersReducedMotion: boolean;
};
```

### **TestimonialCarousel.tsx**
```typescript
type TestimonialCarouselProps = {
  testimonials: readonly TestimonialConfig[]; // All 12 testimonials
  cardsPerPage: number;                        // 6 on desktop, 2 on mobile
  prefersReducedMotion: boolean;
};
```

### **SocialProofSection.tsx**
```typescript
// No props (self-contained section)
```

---

## Appendix B: Placeholder Content Examples

### **Testimonial Quotes (8 Digital, 4 Canvas)**

**Digital (8)**:
1. "Boosted my Instagram reach by 300%!" — Sarah M.
2. "My portfolio looks professionally edited now." — Alex T.
3. "My Instagram feed exploded with engagement! 🔥" — Maria L.
4. "Feed is gorgeous now. Thank you Wondertone!" — Jordan P.
5. "My client loved the watermark-free exports." — Sam K.
6. "Perfect for Instagram Stories and Reels." — Emma R.
7. "Turned my vacation photos into art for TikTok." — Chris D.
8. "My LinkedIn headshot has never looked better." — Taylor B.

**Canvas (4)**:
1. "Museum-quality canvas in my living room. Stunning!" — James K.
2. "Ordered 3 canvases for my office. Everyone asks!" — Morgan L.
3. "Best gift ever. My mom cried when she saw it!" — Casey W.
4. "Canvas quality rivals $500 custom portraits." — Drew H.

---

## Appendix C: Animation Timing Reference

| Element | Effect | Delay | Duration | Easing |
|---------|--------|-------|----------|--------|
| Stats Pills (entrance) | Fade + slide up | 0.15s stagger | 0.5s | easeOut |
| Stats Pills (count-up) | Number animation | On viewport enter | 2s | easeOut |
| Testimonial Cards (page 1) | Fade + slide up | 0.1s stagger | 0.5s | easeOut |
| Carousel Page Transition | Horizontal slide | Immediate | 0.6s | easeInOut |
| Arrow Buttons (hover) | Scale + brighten | Immediate | 0.2s | easeOut |
| Testimonial Card (hover) | Lift + shadow | Immediate | 0.2s | easeOut |
| CTA Button (hover) | Scale + glow | Immediate | 0.2s | easeOut |

---

## Appendix D: File Size Estimates

| File | Lines of Code | Estimated Gzipped Size |
|------|---------------|------------------------|
| `socialProofTestimonials.ts` | ~150 | 1KB |
| `StatsPill.tsx` | ~80 | 1KB |
| `TestimonialCard.tsx` | ~120 | 2KB |
| `TestimonialCarousel.tsx` | ~200 | 3KB |
| `SocialProofSection.tsx` | ~100 | 1KB |
| **Total** | **~650** | **8KB** |

**Note**: Excludes images (loaded separately via lazy loading).

---

**END OF IMPLEMENTATION PLAN**

---

**Next Steps**:
1. Review this plan for any gaps or questions
2. Approve for implementation
3. Create feature branch: `feature/social-proof-section`
4. Begin Phase 1 (Configuration & Assets)

**Questions or concerns?** Please review this plan and provide feedback before implementation begins.
