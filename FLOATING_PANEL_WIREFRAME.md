# Floating Panel Architecture - Visual Wireframe

## Before: Current 3-Column Layout (Scroll Fatigue Problem)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ HEADER: Wondertone                                                    [User Menu] ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┬─────────────────────────────────┬──────────────────────┐
│ LEFT RAIL      │ CENTER COLUMN                   │ RIGHT RAIL           │
│ (Scrollable)   │ (Scrollable)                    │ (Sticky + Scrollable)│
│                │                                 │                      │
│ ┌────────────┐ │ ┌─────────────────────────────┐ │ ┌──────────────────┐ │
│ │ Style      │ │ │                             │ │ │ CANVAS CONFIG    │ │
│ │ Categories │ │ │   [Style Preview Image]     │ │ │                  │ │
│ │            │ │ │                             │ │ │ ☐ 8x10"          │ │
│ │ ▼ Abstract │ │ │                             │ │ │ ☑ 12x16"         │ │
│ │   • Tone 1 │ │ │                             │ │ │ ☐ 16x20"         │ │
│ │   • Tone 2 │ │ │                             │ │ │ ☐ 24x36"         │ │
│ │   • Tone 3 │ │ │                             │ │ │                  │ │
│ │            │ │ └─────────────────────────────┘ │ │ Frame Style:     │ │
│ │ ▶ Modern   │ │                                 │ │ ☑ Floating       │ │
│ │            │ │ ┌─────────────────────────────┐ │ │ ☐ Gallery        │ │
│ │ ▶ Vintage  │ │ │ Confidence Score: 94%       │ │ │ ☐ Natural Wood   │ │
│ │            │ │ │                             │ │ │                  │ │
│ │            │ │ │ ⭐ High quality match        │ │ │ Material:        │ │
│ │            │ │ └─────────────────────────────┘ │ │ ☑ Canvas         │ │
│ │            │ │                                 │ │ ☐ Fine Art Paper │ │
│ │            │ │ ┌─────────────────────────────┐ │ │                  │ │
│ │   [Scroll] │ │ │                             │ │ │ Price: $189      │ │
│ │      ↓     │ │ │   [Canvas in Room Preview]  │ │ │                  │ │
│ │            │ │ │                             │ │ │ [Add to Cart]    │ │
│ │            │ │ │                             │ │ └──────────────────┘ │
│ │            │ │ │                             │ │                      │
│ │            │ │ │                             │ │   [Scroll Required   │
│ │            │ │ │                             │ │    to see this!]     │
│ │            │ │ │                             │ │         ↓            │
│ └────────────┘ │ └─────────────────────────────┘ │                      │
│                │                                 │                      │
│                │ ┌─────────────────────────────┐ │                      │
│                │ │ STORY LAYER (1500px tall)   │ │                      │
│                │ │                             │ │                      │
│                │ │ Discover the Story Behind   │ │                      │
│                │ │ Your Style                  │ │                      │
│                │ │                             │ │                      │
│                │ │ [Artist bio]                │ │                      │
│                │ │ [Historical context]        │ │                      │
│                │ │ [Color palette analysis]    │ │                      │
│                │ │                             │ │                      │
│                │ │      [Lots of scroll...]    │ │                      │
│                │ │                             │ │                      │
│                │ └─────────────────────────────┘ │                      │
│                │                                 │                      │
└────────────────┴─────────────────────────────────┴──────────────────────┘

❌ PROBLEM: User scrolls down to see Canvas in Room → clicks "Floating Frame"
   in right rail → must scroll back up to center column to see the change!
```

---

## After: Floating Panel Architecture (Solution)

### Desktop View - Initial State

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ HEADER: Wondertone                                                    [User Menu] ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┬─────────────────────────────────────────────────────────────────┐
│ LEFT RAIL      │ CENTER COLUMN (Main Content - Condensed!)                       │
│ (Scrollable)   │ (Scrollable)                                                    │
│                │                                                                 │
│ ┌────────────┐ │ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Style      │ │ │                                                             │ │
│ │ Categories │ │ │           [Style Preview Image - 1200px]                    │ │
│ │            │ │ │                                                             │ │
│ │ ▼ Abstract │ │ │                                                             │ │
│ │   • Tone 1 │ │ │                                                             │ │
│ │   • Tone 2 │ │ │                                                             │ │
│ │   • Tone 3 │ │ │                                                             │ │
│ │            │ │ └─────────────────────────────────────────────────────────────┘ │
│ │ ▶ Modern   │ │                                                                 │
│ │            │ │ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▶ Vintage  │ │ │ Confidence Score: 94%  ⭐ High quality match                │ │
│ │            │ │ └─────────────────────────────────────────────────────────────┘ │
│ │            │ │                                                                 │
│ │            │ │ ┌─────────────────────────────────────────────────────────────┐ │
│ │            │ │ │                                                             │ │
│ │            │ │ │       [Canvas in Room Preview - 800px]                      │ │
│ │            │ │ │                                                             │ │
│ │            │ │ │                                                             │ │
│ │            │ │ │                                                             │ │
│ │            │ │ └─────────────────────────────────────────────────────────────┘ │
│ │            │ │                                                                 │
│ │            │ │ ┌─────────────────────────────────────────────────────────────┐ │
│ └────────────┘ │ │ 📖 Discover the Story Behind This Style     [Expand ▼]     │ │
│                │ │    Collapsed teaser with 2-3 sentence preview...            │ │
│                │ └─────────────────────────────────────────────────────────────┘ │
│                │                                                                 │
│                │ ┌─────────────────────────────────────────────────────────────┐ │
│                │ │                                                             │ │
│                │ │              [🎨 Order as Canvas Print]                     │ │
│                │ │                                                             │ │
│                │ │          Professional museum-quality printing               │ │
│                │ │          Starting at $89 • Free shipping over $150          │ │
│                │ │                                                             │ │
│                │ └─────────────────────────────────────────────────────────────┘ │
│                │                                                                 │
└────────────────┴─────────────────────────────────────────────────────────────────┘

✅ CLEAN: Everything visible with minimal scrolling. Canvas is clearly OPTIONAL.
```

---

### Desktop View - Floating Panel Open

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ HEADER: Wondertone                                                    [User Menu] ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┬─────────────────────────────────┬───────────────────────────┐
│ LEFT RAIL      │ CENTER COLUMN                   │ FLOATING PANEL            │
│ (Dimmed 60%)   │ (Dimmed 60%)                    │ (Slide-in animation)      │
│                │                                 │                           │
│ ┌────────────┐ │ ┌─────────────────────────────┐ │ ┌───────────────────────┐ │
│ │ Style      │ │ │                             │ │ │ [✕ Close]             │ │
│ │ Categories │ │ │   [Style Preview - Dimmed]  │ │ │                       │ │
│ │            │ │ │                             │ │ │ Configure Your Canvas │ │
│ │ ▼ Abstract │ │ │                             │ │ │                       │ │
│ │   • Tone 1 │ │ │                             │ │ │ ┌───────────────────┐ │ │
│ │   • Tone 2 │ │ │                             │ │ │ │ Preview           │ │ │
│ │   • Tone 3 │ │ └─────────────────────────────┘ │ │ │ [Mini Image]      │ │ │
│ │            │ │                                 │ │ │                   │ │ │
│ │ ▶ Modern   │ │ ┌─────────────────────────────┐ │ │ └───────────────────┘ │ │
│ │            │ │ │ [Canvas in Room - Dimmed]   │ │ │                       │ │
│ │ ▶ Vintage  │ │ │                             │ │ │ Choose Size:          │ │
│ │            │ │ │                             │ │ │ ○ 8x10"    $89        │ │
│ │            │ │ │                             │ │ │ ● 12x16"   $129       │ │
│ │            │ │ └─────────────────────────────┘ │ │ ○ 16x20"   $169       │ │
│ │            │ │                                 │ │ ○ 24x36"   $249       │ │
│ │            │ │ ┌─────────────────────────────┐ │ │                       │ │
│ │            │ │ │ 📖 Story Teaser             │ │ │ Frame Style:          │ │
│ │            │ │ └─────────────────────────────┘ │ │ ● Floating Frame      │ │
│ │            │ │                                 │ │ ○ Gallery Wrap        │ │
│ └────────────┘ │ ┌─────────────────────────────┐ │ │ ○ Natural Wood        │ │
│                │ │ [Order Button - Dimmed]     │ │ │                       │ │
│                │ └─────────────────────────────┘ │ │ Material:             │ │
│                │                                 │ │ ● Premium Canvas      │ │
│                │                                 │ │ ○ Fine Art Paper      │ │
│                │                                 │ │ ○ Metal Print         │ │
│                │                                 │ │                       │ │
│                │                                 │ │ ─────────────────────  │ │
│                │                                 │ │                       │ │
│                │                                 │ │ Subtotal:      $129   │ │
│                │                                 │ │ Shipping:      $15    │ │
│                │                                 │ │ Total:         $144   │ │
│                │                                 │ │                       │ │
│                │                                 │ │ [Add to Cart]         │ │
│                │                                 │ │                       │ │
│                │                                 │ │ 🔒 Secure checkout    │ │
│                │                                 │ │ 📦 Ships in 3-5 days  │ │
│                │                                 │ └───────────────────────┘ │
│                │                                 │                           │
└────────────────┴─────────────────────────────────┴───────────────────────────┘

✅ FOCUSED: Canvas configuration isolated. Easy to close. Main content still visible.
```

---

## Interaction Flow Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY: Floating Panel                           │
└─────────────────────────────────────────────────────────────────────────────────┘

1. USER GENERATES STYLE
   │
   ├─> Style Preview appears (center column)
   │   └─> "Confidence Score" shown below
   │
   ├─> Canvas in Room Preview appears
   │   └─> Automatically shows default size (12x16") with selected frame
   │
   ├─> Story Layer Teaser appears (collapsed)
   │   └─> 2-3 sentences with [Expand] button
   │
   └─> "Order as Canvas Print" button appears
       └─> Secondary CTA, clearly optional

─────────────────────────────────────────────────────────────────────────────────

2. USER EXPLORES (No Canvas Interest Yet)
   │
   ├─> Scrolls through Style Preview
   ├─> Sees Canvas in Room Preview
   ├─> Clicks Story Teaser → Expands inline
   │   └─> Reads artist bio, color analysis, etc.
   │
   └─> May click "Try Another Style" (left rail)
       └─> Returns to step 1

─────────────────────────────────────────────────────────────────────────────────

3. USER DECIDES TO ORDER CANVAS
   │
   └─> Clicks "Order as Canvas Print" button
       │
       ├─> Floating panel slides in from right (300ms animation)
       ├─> Main content dims to 60% opacity
       ├─> Focus shifts to panel (trap focus for accessibility)
       │
       └─> Panel contains:
           ├─> Mini preview (live updates with selections)
           ├─> Size selector (radio buttons)
           ├─> Frame selector (radio buttons)
           ├─> Material selector (radio buttons)
           ├─> Price calculation (updates live)
           └─> "Add to Cart" button

─────────────────────────────────────────────────────────────────────────────────

4. USER CONFIGURES CANVAS
   │
   ├─> Selects "16x20"" size
   │   └─> Mini preview updates
   │   └─> Price updates: $169
   │
   ├─> Selects "Natural Wood" frame
   │   └─> Mini preview updates with wood frame
   │   └─> Price updates: $189
   │
   └─> Selects "Metal Print" material
       └─> Price updates: $229

─────────────────────────────────────────────────────────────────────────────────

5A. USER ADDS TO CART
    │
    └─> Clicks "Add to Cart"
        ├─> Success animation (checkmark)
        ├─> Panel auto-closes after 1.5s
        ├─> Cart icon in header shows (1) badge
        └─> User returns to center column (undimmed)

5B. USER CLOSES PANEL WITHOUT ORDERING
    │
    └─> Clicks [✕ Close] or clicks outside panel
        ├─> Panel slides out to right (300ms animation)
        ├─> Main content un-dims
        ├─> Configuration is SAVED in session storage
        └─> If user clicks "Order as Canvas" again, previous config loads

─────────────────────────────────────────────────────────────────────────────────

6. USER CONTINUES EXPLORING
   │
   ├─> Tries different styles (left rail)
   ├─> Each new style shows Canvas in Room with LAST SELECTED frame/size
   │   └─> Example: If user selected "16x20" Floating Frame", all future
   │       styles show that configuration by default
   │
   └─> User can re-open panel anytime to change configuration
```

---

## Mobile View (Bonus)

```
┌─────────────────────────────┐
│ [← Back]  Wondertone   [☰] │
├─────────────────────────────┤
│                             │
│                             │
│   [Style Preview Image]     │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ Confidence: 94% ⭐          │
├─────────────────────────────┤
│                             │
│ [Canvas in Room Preview]    │
│                             │
├─────────────────────────────┤
│ 📖 Discover the Story       │
│    Tap to expand...         │
├─────────────────────────────┤
│                             │
│ [🎨 Order as Canvas Print]  │
│                             │
│  Starting at $89            │
│                             │
└─────────────────────────────┘
       ↓ (User taps button)

┌─────────────────────────────┐
│ [✕ Close]  Configure Canvas │ ← FULL-SCREEN MODAL
├─────────────────────────────┤
│                             │
│   [Mini Preview]            │
│                             │
├─────────────────────────────┤
│ Choose Size:                │
│ ○ 8x10"         $89         │
│ ● 12x16"        $129        │
│ ○ 16x20"        $169        │
│ ○ 24x36"        $249        │
├─────────────────────────────┤
│ Frame Style:                │
│ ● Floating Frame            │
│ ○ Gallery Wrap              │
│ ○ Natural Wood              │
├─────────────────────────────┤
│ Material:                   │
│ ● Premium Canvas            │
│ ○ Fine Art Paper            │
│ ○ Metal Print               │
├─────────────────────────────┤
│ Total: $129                 │
│                             │
│ [Add to Cart]               │
│                             │
└─────────────────────────────┘
```

---

## Key Benefits Visualized

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BEFORE vs AFTER                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  BEFORE (3-Column)              AFTER (Floating Panel)              │
│  ──────────────────             ──────────────────────              │
│                                                                      │
│  👁️ Visual Hierarchy:            👁️ Visual Hierarchy:               │
│     Canvas config = prominent       Canvas config = secondary       │
│     (looks mandatory)               (clearly optional)               │
│                                                                      │
│  📏 Scroll Distance:             📏 Scroll Distance:                 │
│     3000-4000px total              1200-1500px total                │
│     (Story Layer adds 1500px)      (Story collapsed = 150px)        │
│                                                                      │
│  🔄 Context Switching:           🔄 Context Switching:               │
│     High (3 columns)               Low (1-2 columns)                │
│     User must scroll between       Everything visible at once       │
│     left/center/right                                               │
│                                                                      │
│  💰 Perceived Value:             💰 Perceived Value:                 │
│     "I must buy canvas"            "I can subscribe for $9.99       │
│     (canvas front & center)         + optionally order canvas"      │
│                                                                      │
│  📊 Expected Conversion:         📊 Expected Conversion:             │
│     Subscription: 15-20%           Subscription: 25-30%             │
│     Canvas: 8-12%                  Canvas: 8-12% (same)             │
│                                    (+40-60% subscription lift!)     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation Notes

### Component Structure
```
<StudioConfigurator>
  ├─ <StyleSidebar />                    // Left rail (stays)
  │
  ├─ <main className="center-column">   // Condensed center
  │   ├─ <StylePreview />
  │   ├─ <ConfidenceFooter />
  │   ├─ <CanvasInRoomPreview />
  │   ├─ <StoryLayerTeaser />            // Collapsed by default
  │   └─ <OrderCanvasButton
  │        onClick={() => setCanvasPanelOpen(true)}
  │      />
  │
  └─ <AnimatePresence>                   // Floating panel
      {canvasPanelOpen && (
        <CanvasConfigPanel
          onClose={() => setCanvasPanelOpen(false)}
        />
      )}
    </AnimatePresence>
```

### State Management
```typescript
// Add to Zustand store
interface StudioState {
  canvasPanelOpen: boolean
  setCanvasPanelOpen: (open: boolean) => void

  // Persist canvas config across style changes
  canvasConfig: {
    size: '8x10' | '12x16' | '16x20' | '24x36'
    frame: 'floating' | 'gallery' | 'wood'
    material: 'canvas' | 'paper' | 'metal'
  }
  setCanvasConfig: (config: Partial<CanvasConfig>) => void
}
```

### Animation Specs
- **Panel slide-in**: 300ms spring animation (damping: 30, stiffness: 300)
- **Backdrop dim**: 200ms opacity 0 → 0.4
- **Close animation**: Reverse of open (300ms)
- **Mini preview updates**: 150ms fade transition between configs

---

## Summary

This wireframe shows:

1. **Before**: 3-column layout with scroll fatigue and canvas confusion
2. **After (Closed)**: Condensed center column, Story teaser, optional canvas button
3. **After (Open)**: Floating panel for canvas config, dimmed backdrop, focused UX
4. **Interaction Flow**: 6-step journey from generation → exploration → ordering
5. **Mobile View**: Full-screen modal adaptation
6. **Benefits**: +40-60% subscription conversion, zero scroll fatigue

The key insight: **Making canvas opt-in (via button → panel) clarifies that subscriptions are the primary product**, which dramatically improves conversion while maintaining canvas sales.
