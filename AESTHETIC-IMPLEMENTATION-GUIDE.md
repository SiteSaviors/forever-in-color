# 🎨 Aesthetic Implementation Guide

**Philosophy**: "Each tone is a room in a gallery. Expanding a section is stepping through a doorway into a curated space. Selecting a style is commissioning your portrait from that artist."

**Status**: ✅ All features implemented and build verified (2025-10-17)

## **Implemented Features**

### 1. Tone-Specific Gradient Washes 🌈

**The Vision**: Each tone has its own ambient lighting that wraps the entire section.

**Color Palettes**:
```typescript
const TONE_GRADIENTS = {
  trending: {
    collapsed: 'from-rose-500/8 via-amber-500/6 to-transparent',
    expanded: 'from-rose-500/15 via-amber-500/12 to-orange-500/10',
    accent: '#f59e0b',
    description: 'Warm sunset - magenta to tangerine'
  },
  classic: {
    collapsed: 'from-amber-900/8 via-yellow-800/6 to-transparent',
    expanded: 'from-amber-900/15 via-yellow-800/12 to-amber-700/10',
    accent: '#d97706',
    description: 'Gallery lighting - sepia to cream'
  },
  modern: {
    collapsed: 'from-blue-500/8 via-purple-500/6 to-transparent',
    expanded: 'from-blue-500/15 via-purple-500/12 to-indigo-500/10',
    accent: '#8b5cf6',
    description: 'Contemporary - blue to purple'
  },
  stylized: {
    collapsed: 'from-pink-500/8 via-fuchsia-500/6 to-transparent',
    expanded: 'from-pink-500/15 via-fuchsia-500/12 to-purple-500/10',
    accent: '#d946ef',
    description: 'Pop art - pink to purple'
  },
  electric: {
    collapsed: 'from-cyan-500/8 via-blue-500/6 to-transparent',
    expanded: 'from-cyan-500/15 via-blue-500/12 to-violet-500/10',
    accent: '#06b6d4',
    description: 'Neon city - cyan to violet'
  },
  signature: {
    collapsed: 'from-purple-600/8 via-rose-500/6 to-transparent',
    expanded: 'from-purple-600/15 via-rose-500/12 to-pink-500/10',
    accent: '#9333ea',
    description: 'Aurora premium - purple to rose gold'
  }
};
```

**Implementation**: Wrapper div with gradient background + backdrop filter blur

---

### 2. Z-Lift Animation on Expand 🚀

**The Vision**: Section lifts off the sidebar like art being pulled forward.

**States**:
- Collapsed: `scale(1)`, no shadow
- Expanded: `scale(1.02)`, shadow `[0_8px_32px_rgba(0,0,0,0.3)]`

**Timing**: 250ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` (elastic easeOut)

---

### 3. Glass Overlay + Gold Border for Locked Styles 🔒

**The Vision**: Locked styles as Tiffany display case - aspirational, not forgotten.

**Overlay**:
- Translucent: `bg-slate-900/40 backdrop-blur-md`
- Gradient shimmer: `from-white/5 to-transparent`
- Thumbnail visible at 60% opacity

**Border**:
- Warm amber with metallic sheen
- Animated gradient border (3s loop)
- Lock icon with pulsing glow

---

### 4. Shimmer Animation on Badges ✨

**The Vision**: Badges shimmer periodically like light catching a jewel.

**Animation**:
- Gradient mask translated across badge
- Duration: 1.5s with 2s delay
- GPU-accelerated transform only

---

### 5. Ink Blot Ripple on Selection 🎨

**The Vision**: Burst of color (tone accent) like ink dropped in water.

**Mechanics**:
- Radial gradient ripple from center
- Scale 0 → 2, opacity 1 → 0
- Duration: 600ms
- Color: Tone's accent from gradient config

---

### 6. Skeleton Shimmer for Loading 💀

**The Vision**: Tone-colored shimmer skeletons during loading.

**Design**:
- Base: Tone's gradient at 60% opacity
- Shimmer: Brighter gradient moving left-to-right
- 2s infinite loop

---

### 7. Auto-Expand Trending + Tooltip 💡

**The Vision**: First-time users see Trending auto-open with friendly tooltip.

**Flow**:
1. Check localStorage: `hasSeenTrendingTip`
2. If false: expand Trending, show tooltip after 300ms
3. Tooltip: "👋 Start here - these styles are most popular this week"
4. Auto-dismiss after 5s or on interaction

---

## **Files to Create**

1. `/src/config/toneGradients.ts` - Color palettes + accent colors
2. `/src/sections/studio/components/ToneSkeletonCard.tsx` - Loading state component

## **Files to Modify**

1. `ToneSection.tsx` - Gradients, z-lift, tooltip container
2. `ToneStyleCard.tsx` - Glass overlay, shimmer badges, ink ripple
3. `StyleAccordion.tsx` - Tooltip state, first-visit logic
4. `tailwind.config.ts` - Custom animations
5. `src/styles/tailwind.css` - Keyframes

## **Order of Implementation**

1. ✅ Tone gradients (visual foundation)
2. ✅ Z-lift animation (section behavior)
3. ✅ Auto-expand + tooltip (UX flow)
4. ✅ Glass overlay for locked styles (card treatment)
5. ✅ Shimmer badges (micro-interaction)
6. ✅ Ink blot ripple (selection feedback)
7. ✅ Skeleton shimmer (loading states)

## **Performance Safeguards** ⚡

- All animations use `transform` and `opacity` only
- No `box-shadow` animations (use pseudo-elements)
- `will-change: transform` on expanding sections
- Prefers-reduced-motion respected

## **Testing Checklist**

- [ ] Gradients transition smoothly on expand/collapse
- [ ] Z-lift doesn't cause scrollbar jank
- [ ] Tooltip shows once, dismisses properly
- [ ] Glass overlay doesn't obscure locked style thumbnails
- [ ] Shimmer doesn't cause CPU spike
- [ ] Ripple fires only once per selection
- [ ] Skeleton matches tone color accurately
