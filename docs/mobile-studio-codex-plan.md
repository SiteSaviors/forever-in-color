# Wondertone Studio Mobile Revamp — Codex Plan

**Author:** Codex  
**Date:** 2025‑10‑14  
**Scope:** Mobile & small-tablet (`< 1024px`) experience for `/create` Studio flow  
**Objective:** Restore the core “choose a style → preview → configure → convert” loop for mobile users without disturbing the high-performing desktop design.

---

## 1. Current Mobile Audit

### 1.1 Layout Failures
- The Studio root container is a fixed three-column `flex` row (`Style Rail · Preview · Config Rail`). No breakpoint adjustments means that on screens ≤ 768 px, the 320 px style rail and 420 px config rail squeeze the preview off-canvas; browsers collapse columns inconsistently, often hiding the style rail entirely.
- The left style rail is still rendered (with `position: sticky; height: 100vh`) but effectively unreachable on mobile because the flex container overflows horizontally with no scroll affordance.
- The preview header displays the selected style name, but there’s no call-to-action that indicates styles are missing—users hit a dead end after upload.

### 1.2 Interaction Gaps
- No touch-first pattern for browsing styles: thumbnails assume pointer hover, microtype < 12 px, and buttons are 36 px tall (below WCAG’s 44 px minimum).
- Scroll friction: the center preview is full height, while orientation/canvas controls are stacked right. On mobile the layout becomes miles long, without anchors or sticky CTAs.
- Token telemetry (generations remaining, upgrade CTA) still references desktop copy; not surfaced in context near the preview actions where it matters.

### 1.3 Technical Observations
- The style list is rendered inline in `StudioConfigurator.tsx` (`styles.map(...)` call). Selection is already encapsulated via `handleStyleClick(styleId)` → `useFounderStore.startStylePreview`. We can reuse this logic wholesale.
- `StickyOrderRail` already downgrades to a linear stack under `md`. We can piggyback on this pattern.
- Preview overlays, progress HUD (`StyleForgeOverlay`), and gating logic are responsive by design—only the style picker is missing.

---

## 2. Experience Principles
1. **Speed to first style** — Users should see tappable style options immediately after upload, with minimal scrolling.
2. **Mobility-first ergonomics** — Large, thumb-friendly controls anchored near the content of interest (preview + style rail).
3. **Progressive disclosure** — Offer a quick carousel for rapid switching and a deeper catalog for inspiration, with identical state management.
4. **Conversion awareness** — Surface token usage, upgrade CTAs, and download gating at the right moments, not hidden in side panels.
5. **Zero desktop regression** — All structural changes are guarded behind `lg:` breakpoints; desktop layout remains untouched.

---

## 3. Proposed Mobile Layout (Codex Vision)

### 3.1 Layout Overview (`< 1024px`)
```
Header (existing)
Token Banner (existing)
Preview Card
└─ Mobile Style Dock (sticky)
Orientation / Canvas Size / Enhancements (stacked accordions)
Primary Actions (Download / Save / Order)
```

- Switch root container to `flex-col lg:flex-row`. Left rail becomes hidden under `lg`. Main content flows vertically with generous spacing.
- Introduce a **Mobile Style Dock**: a sticky card below the preview containing a quick-switch carousel plus a “Browse styles” drawer trigger.

### 3.2 Style Selection Pattern
**Two-tier approach:**
1. **Quick Style Rail (horizontal carousel)**  
   - Renders top 6 styles (current + trending).  
   - Uses `overflow-x-auto snap-x snap-mandatory px-4 py-3` with gradient fade edges to signal more content.  
   - Cards: `min-w-[120px] h-[152px]`, 48 px+ tap targets, selected state is a glowing border.  
   - Tapping calls existing `handleStyleClick`. Carousel tracks current style via `selectedStyleId`.

2. **Full Catalog Drawer (bottom sheet)**  
   - Trigger: `Browse all styles` button within the dock.  
   - Drawer slides from bottom (`position: fixed; inset: auto 0 0 0; height: min(75vh, 600px); border-radius: 28px 28px 0 0;`) with blurred glass backdrop.  
   - Grid layout: `grid grid-cols-2 sm:grid-cols-3 gap-4` with vertical scroll and safe-area padding.  
   - Each tile reuses existing style card markup (thumbnail, name, cached badge).  
   - Includes search/filter stubs for future personalization (optional toggles).  
   - Close button + drag handle for familiarity. Focus trap & aria roles for accessibility.

### 3.3 Preview & Controls
- Preview retains aspect ratio logic but adds a max height clamp (`max-h-[70vh]`) to avoid pushing the style dock off-screen.
- Orientation cards replaced with horizontal segmented control on mobile (similar to Tab buttons) to reduce vertical bloat.
- Canvas Size, Enhancements, Order Summary collapsed into accordions (`Disclosure` pattern) by default to keep the page scannable.
- Primary actions (Download HD, Save to Gallery, Add to Cart) grouped in a sticky footer (`fixed bottom-0` with safe-area insets) once a preview is ready. Desktop retains existing inline layout.

### 3.4 Token & Upgrade Messaging
- Generations remaining chip integrated into the style dock, adjacent to the quick rail (e.g., `✨ 3 previews left — Upgrade`), ensuring users see limits before hitting a paywall.
- Upgrade CTA inside the drawer for contextual upsell after exploring styles.

---

## 4. Implementation Blueprint

### 4.1 Component Changes
- **`StudioConfigurator.tsx`**
  - Wrap root container with `className="flex flex-col lg:flex-row"`; apply `lg:w-80` to desktop style sidebar and `hidden lg:block` to maintain desktop behavior.
  - Introduce new subcomponents:
    - `<MobileStyleDock ... />` — houses carousel + drawer trigger (only render `<lg`).  
    - `<MobileStyleDrawer ... />` — bottom sheet portal using state from `useState`.  
  - Reorder download/save CTA into a separate `<MobileActionBar />` with `fixed bottom-0` for mobile.
  - Guard `StickyOrderRail` with `hidden lg:block`; replicate essential options via accordions for mobile (or reuse the same component with `collapse` prop).

- **New files** (all under `src/components/studio/mobile/`):
  - `MobileStyleDock.tsx` — uses `useFounderStore` to read styles, selected style, `handleStyleClick`.
  - `MobileStyleDrawer.tsx` — portal with `Dialog`/`BottomSheet` logic, applying existing style button markup.
  - `MobileActionBar.tsx` — sticky footer actions.
  - `MobileAccordion.tsx` (optional) — wrapper around orientation, size, enhancements.

- **State additions** (local to Studio): `const [isDrawerOpen, setDrawerOpen] = useState(false);`

### 4.2 Styling
- Extend Tailwind if needed with utility classes:
  - `safe-top` / `safe-bottom` CSS vars referencing `env(safe-area-inset-*)`.
  - `.mobile-style-gradient::after` to add fade overlay at carousel edges.
- Include `@media (max-width: 1023px)` block in a dedicated `studio-mobile.css` (imported in Studio) to handle bottom sheet specifics (backdrop blur, animation keyframes).

### 4.3 Accessibility
- Drawer uses `role="dialog"` with `aria-modal="true"`, focus trap, `aria-labelledby` referencing sheet title.
- Style tiles become `button` elements with `aria-pressed` reflecting selection; ensure screen readers announce “Selected” state.
- Sticky action bar uses `nav` role with descriptive labels (“Download HD (Premium) button” etc.).
- Support keyboard navigation by ensuring `tabIndex` order remains logical even when the drawer is open.

### 4.4 Performance
- Lazy-load drawer content (`React.lazy`) to avoid penalizing initial paint; quick carousel data loads immediately.
- Reuse existing thumbnails and cached preview status; no additional network calls.
- Use `prefers-reduced-motion` media query to disable slide-up animation for motion-sensitive users.

---

## 5. Migration & Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Drawer overlap with iOS navigation bar | High | Use safe-area inset padding and `height: min(75vh, calc(100vh - env(safe-area-inset-top)))`. |
| Sticky elements conflicting (`TokenWarningBanner`, header) | Medium | Layer with z-index tokens (`z-40` for header, `z-30` for dock, `z-50` for drawer). |
| Orientation change while drawer open | Medium | Listen for `resize` and close drawer gracefully, maintaining selected style. |
| Scroll locking on Android | Medium | Apply `overflow: hidden` to body with fallback `touch-action: none`; test TalkBack gestures. |
| Regression on tablets (~800–1023px) | Medium | Treat `lg` breakpoint as canonical desktop; adjust `md` widths to adopt mobile stack until 1024px. |

---

## 6. QA & Launch Checklist
1. **Functional**
   - Upload → select from carousel → verify preview updates instantly.
   - Open drawer → select different style → preview + carousel indicator update; drawer closes.
   - Cached styles show “Cached” badge in both UI contexts.
   - Quota exhausted state: drawer buttons disabled with tooltip messaging.
2. **Device Matrix**
   - iPhone 13/14/15 Safari (portrait & landscape).
   - iPhone SE (320 px width) to verify touch targets and layout collapse.
   - Pixel 7 / Samsung S22 Chrome.
   - iPad Mini (768 px) to confirm transitional behavior.
3. **Accessibility**
   - VoiceOver/TalkBack announcements for drawer, buttons, and carousel items.
   - Keyboard navigation with Bluetooth keyboard.
   - Color contrast for active/inactive states.
4. **Analytics**
   - New event hooks: `style_select_mobile_quick`, `style_select_mobile_drawer`, `drawer_open_mobile`.
   - Monitor conversion funnel: upload → style select → add to cart/order.
5. **Performance**
   - Lighthouse performance run on mobile to verify no regression in TTI.
   - Ensure no new warnings in bundler (tree shaking maintained).

---

## 7. Next Steps
1. Implement layout scaffolding & responsive guards.  
2. Build mobile style dock + drawer components with shared styling tokens.  
3. Layer UX polish (animations, gradients, safe-area handling).  
4. Run QA matrix & collect feedback.  
5. Roll out behind feature flag (`WT_FLAG_STUDIO_MOBILE_V2`) for staged testing.

This plan restores parity between mobile and desktop journeys, optimizes the path to “Wow” moments, and positions Wondertone’s Studio for higher mobile conversion while keeping the beloved desktop experience intact.
