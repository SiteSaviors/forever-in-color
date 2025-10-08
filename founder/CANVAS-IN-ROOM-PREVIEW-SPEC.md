# Canvas In Room Preview - Technical Specification

_Created: 2025-10-07_
_Component: `CanvasInRoomPreview.tsx`_

---

## 🎯 Vision

A photorealistic, interactive preview showing the user's transformed artwork displayed on a canvas in a beautifully styled living room. This feature bridges the gap between digital preview and physical product, creating confidence and emotional connection at the critical purchase decision moment.

---

## 🏗️ Architecture Overview

### Component Hierarchy
```
StudioConfigurator.tsx
  └─ CanvasInRoomPreview.tsx (NEW)
       ├─ RoomBackground (layered image)
       ├─ CanvasFrame (composite layer with shadows)
       ├─ PreviewImage (user's art with crossfade)
       ├─ LoadingShimmer (skeleton state)
       └─ InteractionOverlay (hover effects)
```

### Props Interface
```typescript
interface CanvasInRoomPreviewProps {
  // Image state
  previewUrl: string | null;
  orientation: 'vertical' | 'square' | 'horizontal';
  canvasSize?: string; // e.g., "12×16", "16×20"

  // Loading state
  isLoading?: boolean;
  isGenerating?: boolean;

  // Optional customization
  roomStyle?: 'modern' | 'classic' | 'minimal';
  enableHoverEffect?: boolean;
  showDimensions?: boolean;
}
```

### State Management
```typescript
// Internal component state
const [imageLoaded, setImageLoaded] = useState(false);
const [isTransitioning, setIsTransitioning] = useState(false);
const [hoverActive, setHoverActive] = useState(false);
const [previousPreviewUrl, setPreviousPreviewUrl] = useState<string | null>(null);
```

---

## 🎨 Visual Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Living Room Background (full container)    │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │      [Wall with ambient lighting]     │  │
│  │                                       │  │
│  │         ┌───────────────┐            │  │
│  │         │               │            │  │
│  │         │  Canvas Frame │            │  │
│  │         │  ┌─────────┐  │            │  │
│  │         │  │ Preview │  │            │  │
│  │         │  │  Image  │  │            │  │
│  │         │  └─────────┘  │            │  │
│  │         │               │            │  │
│  │         └───────────────┘            │  │
│  │                                       │  │
│  │  [Furniture elements below]          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Responsive Sizing

- **Desktop (>1024px)**: Full living room scene, canvas at ~60% viewport height
- **Tablet (768px-1024px)**: Cropped room view focusing on wall area
- **Mobile (<768px)**: Tight crop on canvas with minimal room context

### Orientation-Specific Canvas Positioning

Each orientation requires precise positioning coordinates to align with the room's perspective:

#### Portrait (2:3 aspect ratio)
- Canvas dimensions: ~280px × 420px (scaled responsively)
- Position: Center-left wall, slightly above eye level
- Frame: Thin gallery-style black frame (~8px)
- Shadow: Soft, directional (top-left light source)

#### Square (1:1 aspect ratio)
- Canvas dimensions: ~350px × 350px
- Position: Center wall, eye level
- Frame: Classic wood-tone frame (~12px)
- Shadow: Ambient, subtle spread

#### Landscape (3:2 aspect ratio)
- Canvas dimensions: ~480px × 320px
- Position: Center wall, slightly above furniture line
- Frame: Modern thin frame (~6px)
- Shadow: Elongated horizontal cast

---

## ✨ "Magic" Features Implementation

### 1. Photorealistic Compositing

**CSS Shadow System** (multi-layer approach):
```css
.canvas-frame {
  /* Outer ambient shadow */
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 10px 20px rgba(0, 0, 0, 0.1);

  /* Inner frame depth */
  &::before {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}
```

**Lighting Integration**:
- Apply `filter: brightness(1.05)` to top edge (simulated ceiling light)
- Add subtle vignette `filter: brightness(0.95)` to bottom corners
- Use CSS `mix-blend-mode: multiply` on shadow layer for realistic blending

### 2. Fluid Transitions

**Crossfade Animation** (preview changes):
```typescript
// Sequence:
// 1. Detect previewUrl change
// 2. Trigger exit fade (200ms) → opacity: 0, scale: 0.98
// 3. Swap image source
// 4. Trigger enter fade (300ms) → opacity: 1, scale: 1
// Total: 500ms smooth transition
```

**Orientation Change** (geometry shift):
```typescript
// Sequence:
// 1. Freeze current preview as overlay
// 2. Morph canvas container (400ms) → new aspect ratio
// 3. Crossfade to new preview (300ms)
// 4. Remove overlay
// Total: 700ms choreographed transition
```

**Hardware Acceleration**:
```css
.preview-image {
  transform: translateZ(0); /* Force GPU layer */
  will-change: transform, opacity;
  backface-visibility: hidden;
}
```

### 3. The Reveal Effect

**Shimmer Glint** (on load complete):
```typescript
// When imageLoaded becomes true:
// 1. Play shimmer animation (800ms)
// 2. Gradient sweeps left-to-right across canvas
// 3. Subtle scale pulse: 1 → 1.02 → 1 (spring physics)
```

**CSS Implementation**:
```css
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.shimmer-overlay {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 0.8s ease-out;
}
```

### 4. Interactive Hover Effect

**3D Perspective Shift**:
```typescript
// On mouse move within container:
// Calculate mouse position relative to center
// Apply subtle 3D transform to canvas

const handleMouseMove = (e: MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  // Max rotation: 3 degrees
  const rotateY = x * 3;
  const rotateX = -y * 3;

  setCanvasTransform({
    rotateX: `${rotateX}deg`,
    rotateY: `${rotateY}deg`
  });
};
```

**Hover Enhancements**:
- Slight scale: `1.02` (barely perceptible)
- Enhanced shadow: Increase blur radius +5px
- Brightness boost: `filter: brightness(1.08)`
- Smooth spring transition: `transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`

### 5. Loading State Elegance

**Skeleton Loader**:
- Matches exact canvas dimensions and position
- Animated shimmer pulse (slower, 2s cycle)
- Frame outline visible but dimmed
- Subtle breathing animation: opacity 0.4 ↔ 0.7

**Progressive Enhancement**:
```typescript
// Loading states:
// 1. isGenerating: "Creating your masterpiece..." text + shimmer
// 2. Image downloading: Skeleton with progress hint
// 3. Image rendering: Quick fade-in
// 4. Shimmer reveal: Magic moment
```

---

## 🎭 Animation Timing System

### Master Timing Constants
```typescript
const TRANSITIONS = {
  PREVIEW_FADE_OUT: 200,     // Exit animation
  PREVIEW_FADE_IN: 300,      // Enter animation
  ORIENTATION_MORPH: 400,    // Aspect ratio change
  SHIMMER_DURATION: 800,     // Reveal glint
  HOVER_RESPONSE: 300,       // Interactive feedback
  SKELETON_PULSE: 2000,      // Loading breathe
} as const;

const EASINGS = {
  SMOOTH: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;
```

---

## 🖼️ Asset Requirements

### Living Room Backgrounds

**File Structure**:
```
/founder/public/room-backgrounds/
  ├── modern-portrait.jpg      (2:3 optimized view)
  ├── modern-square.jpg         (1:1 optimized view)
  ├── modern-landscape.jpg      (3:2 optimized view)
  └── [future: classic-*, minimal-* variants]
```

**Image Specs**:
- Resolution: 1920×1080 minimum (high DPI)
- Format: Progressive JPEG (quality 85)
- Optimization: WebP with JPEG fallback
- File size target: <150KB per image
- Color profile: sRGB
- Perspective: Slight upward angle (viewer eye level ~5.5ft)

**Composition Guidelines**:
- Canvas area occupies 30-40% of frame
- Warm, inviting lighting (2700-3000K)
- Minimal distractions (neutral furniture)
- Professional staging quality
- Consistent wall texture across orientations

### Frame Overlays (Optional Enhancement)

If we composite frames separately:
```
/founder/public/frame-overlays/
  ├── frame-portrait-black.png    (Transparent PNG with shadow)
  ├── frame-square-wood.png
  └── frame-landscape-thin.png
```

---

## 📱 Responsive Behavior

### Breakpoints
```typescript
const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;
```

### Adaptive Strategies

**Mobile (<640px)**:
- Crop room background to focus on canvas
- Reduce shadow complexity (performance)
- Disable hover effects (no mouse)
- Simplify shimmer (reduce GPU load)
- Stack vertically if space constrained

**Tablet (640-1024px)**:
- Medium room context
- Simplified hover (single transform)
- Standard shadow rendering

**Desktop (>1024px)**:
- Full experience enabled
- All micro-interactions active
- Maximum quality assets

---

## 🔌 Integration Points

### StudioConfigurator.tsx Changes

```typescript
// After main canvas preview (line ~220):
<CanvasInRoomPreview
  previewUrl={preview?.data?.previewUrl ?? null}
  orientation={orientation}
  canvasSize="12×16" // From StickyOrderRail selected size
  isLoading={preview?.status === 'loading'}
  isGenerating={orientationChanging}
  enableHoverEffect={true}
  showDimensions={true}
/>
```

### State Dependencies

Already available in StudioConfigurator scope:
- ✅ `preview?.data?.previewUrl` - Art preview URL
- ✅ `orientation` - Current orientation
- ✅ `preview?.status` - Loading state
- ✅ `orientationChanging` - Orientation transition flag

Needs new connection:
- 📌 Canvas size from `StickyOrderRail` → Pass via props or Zustand

---

## 🧪 Performance Optimization

### Image Loading Strategy
```typescript
// Preload next likely orientations
useEffect(() => {
  if (previewUrl && orientation === 'vertical') {
    // Speculatively preload square room background
    const img = new Image();
    img.src = '/room-backgrounds/modern-square.jpg';
  }
}, [orientation, previewUrl]);
```

### GPU Acceleration Checklist
- ✅ Use `transform` instead of `top/left`
- ✅ Use `opacity` for fading
- ✅ Add `will-change` for animated properties
- ✅ Avoid `box-shadow` animation (pre-render states)
- ✅ Use `translateZ(0)` to force layer creation

### Layout Shift Prevention
```typescript
// Reserve space immediately
<div
  className="canvas-in-room-container"
  style={{
    aspectRatio: '16/9', // Fixed container ratio
    minHeight: '400px',
  }}
>
  {/* Content */}
</div>
```

---

## 🎬 Implementation Phases

### Phase 1: Core Structure (This Session)
- [x] Specification document ← YOU ARE HERE
- [ ] Component boilerplate
- [ ] Basic layout with static room background
- [ ] Canvas positioning for all orientations
- [ ] Preview image rendering

### Phase 2: Visual Polish
- [ ] Shadow system implementation
- [ ] Frame overlay compositing
- [ ] Shimmer reveal animation
- [ ] Loading skeleton
- [ ] Responsive breakpoints

### Phase 3: Interactions
- [ ] Crossfade transitions
- [ ] Orientation morphing
- [ ] Hover 3D effect
- [ ] Touch gestures (mobile)

### Phase 4: Integration & Testing
- [ ] Wire to StudioConfigurator
- [ ] Test all orientation switches
- [ ] Performance profiling
- [ ] Cross-browser validation
- [ ] Mobile device testing

---

## 🚀 Success Metrics

**Technical Performance**:
- First paint: <100ms
- Transition smoothness: 60fps maintained
- Image load time: <500ms (cached backgrounds)
- Total bundle impact: <20KB

**User Experience**:
- Perceived load time: "Instant"
- Transition feel: "Buttery smooth"
- Visual quality: "Magazine-worthy"
- Emotional response: "I can see this in my home"

---

## 💡 Future Enhancements (Post-MVP)

1. **Room Style Selector**: Toggle between Modern/Classic/Minimal rooms
2. **Custom Backgrounds**: User uploads their own room photo
3. **AR Preview**: Mobile camera-based room placement
4. **Size Comparison**: Overlay furniture for scale reference
5. **Lighting Controls**: Adjust room ambiance (day/night/dramatic)
6. **Social Sharing**: Export room preview as shareable image
7. **Print Preview Mode**: Side-by-side with actual print mockup

---

## 📋 Component Props - Final Contract

```typescript
export interface CanvasInRoomPreviewProps {
  /**
   * URL of the transformed art preview
   * null = show skeleton loader
   */
  previewUrl: string | null;

  /**
   * Canvas orientation (drives aspect ratio and positioning)
   */
  orientation: 'vertical' | 'square' | 'horizontal';

  /**
   * Selected canvas size (e.g., "12×16")
   * Used for display label, future: scale accuracy
   */
  canvasSize?: string;

  /**
   * Preview generation in progress (AI creating art)
   */
  isGenerating?: boolean;

  /**
   * Image currently loading from URL
   */
  isLoading?: boolean;

  /**
   * Room background aesthetic
   * @default 'modern'
   */
  roomStyle?: 'modern' | 'classic' | 'minimal';

  /**
   * Enable 3D hover effect (desktop only)
   * @default true
   */
  enableHoverEffect?: boolean;

  /**
   * Show canvas dimensions badge
   * @default false
   */
  showDimensions?: boolean;

  /**
   * Optional CSS class name for container
   */
  className?: string;
}
```

---

**Status**: Ready for implementation ✅
**Next Step**: Generate boilerplate component structure
