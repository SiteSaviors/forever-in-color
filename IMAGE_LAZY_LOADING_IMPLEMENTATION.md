# Image Lazy Loading Implementation Log

## Phase Overview
1. **Phase 1 – Audit & Classification** ✅ *completed*
2. **Phase 2 – Attribute + IntersectionObserver rollout** ✅ *completed*
3. **Phase 3 – Extended surfaces (style/frame thumbnails, gallery cards)** 🔄 *in progress*
4. **Phase 4 – Validation + Metrics snapshot** *(pending)*

## Phase 1 Findings (Studio / Checkout Surfaces)
| Component / File | Image(s) | Approx Size | Current Behavior | Classification | Notes |
| --- | --- | --- | --- | --- | --- |
| `CanvasQualityAssurance.tsx` | `/images/quality/canvas-texture.webp`, `hand-stretching.webp`, `back-hardware.webp` | 46 kB, 103 kB, 128 kB | Render immediately when checkout modal opens; no `loading`/`decoding`. | **Safe to lazy-load** | QA section sits below the fold in the preview column. Ideal candidate for IntersectionObserver gating + `loading="lazy" decoding="async" width/height`. |
| `StaticTestimonial.tsx` (used 3× in `CanvasCheckoutModal.tsx`) | `/images/checkout/checkout-testimonial-{1,2}.webp`, `{3}.jpg` | 221 kB, 202 kB, 455 kB | All three testimonials render the moment the modal loads. No lazy attrs. | **Safe to lazy-load** | Heavy imagery (~900 kB total). Plan: wrap testimonial block in an in-view hook so it only mounts when the user scrolls down, plus standard lazy attrs. |
| `CanvasTestimonialGrid.tsx` | Up to 4 supplied URLs | Varies (typically 150–300 kB each) | Grid mounts immediately wherever it’s used (Insights rail / marketing). | **Safe to lazy-load** | When embedded in Studio sidebar, we can lazy images by default since the grid is below the fold. |
| `CanvasCheckoutPreviewColumn.tsx` (style thumbnail) | `currentStyle.thumbnail` | <50 kB | Displays next to “Current Style” header, immediately visible. | **Keep eager** | Small asset; part of the hero content when modal opens. |
| `CanvasInRoomPreview.tsx` – room backgrounds (`roomAssetSrc`) | `/room-backgrounds/{orientation}-{frame}.jpg` | 100–512 kB each | Always loads as soon as preview renders. | **Keep eager** | This is the primary hero image inside the modal. Lazy-loading would delay perceived LCP within checkout. |
| `CanvasInRoomPreview.tsx` – canvas preview (`displayImage`) | Dynamic (Supabase / uploads) | 100–400 kB | Always eagerly rendered. | **Keep eager** | Critical to the experience; should not be deferred. |
| `CanvasFrameSelector.tsx` | `/frame-swatches/*.webp` | 38–60 kB each | Loaded even when selector is off-screen on mobile. | **Safe to lazy-load** | These tiny swatches can use `loading="lazy"`; also add `width/height` to prevent layout shift. |
| `CanvasCheckoutPreviewColumn.tsx` → `CanvasQualityAssurance` + `StaticTestimonial` | (see above) | (see above) | Entire sections mount once `showStaticTestimonials` is true. | **Lazy via IntersectionObserver** | Hook can live in preview column so entire sections unmount until visible. |
| `InsightsRail/OriginalComparisonModule.tsx` | `croppedImage`, `styledPreviewUrl` | Dynamic | Already uses `loading="lazy" decoding="async"`. | **No change (already lazy)** | Verified both images include lazy attributes. |
| `InsightsRail/ShareBadges.tsx` | `previewImage` | ~30–60 kB | Thumbnail shown in social share card. | **Safe to lazy-load** | Card appears midway in Insights rail; add lazy attrs when we tackle Phase 3. |
| `InsightsRail/CuratedStylesModule.tsx` | `card.resultImage` | ~120 kB each | Renders 3–4 style cards eagerly. | **Safe to lazy-load** | Not part of the checkout modal but still in Studio side rail; include in Phase 3 sweep. |
| Other style thumbnails (Gallery/StyleSidebar) | various | varies | No lazy attributes today. | **Safe to lazy-load** | Capture in Phase 3 once checkout images are addressed. |

### Key Takeaways
- Roughly **900 kB** of imagery (QA + testimonials) loads the instant the checkout modal opens—these are the highest-priority lazy-loading targets.
- Hero imagery (room background + canvas preview) should remain eager to preserve LCP inside the modal.
- Numerous small thumbnails (frame swatches, style cards, share previews) can adopt lazy attributes with minimal effort in later phases.
- `OriginalComparisonModule` already follows best practices (lazy, decoding async). No changes needed there.

### Phase 2 Progress
- Introduced a reusable `useInView` hook (`src/hooks/useInView.ts`) that handles IntersectionObserver setup, teardown, modal reopen resets, and configurable root margins.
- `CanvasQualityAssurance.tsx`
  - Section now defers rendering until its placeholder enters view (15% root margin) to avoid unnecessary DOM/paint work when the preview column first loads.
  - Production process images explicitly set `loading="lazy"`, `decoding="async"`, `width`/`height`, and meaningful `alt` text to eliminate layout shifts and improve a11y.
- `StaticTestimonial.tsx`
  - Each testimonial card uses the same `useInView` guard so the heavy artwork only mounts once scrolled into view.
  - Added lazy attributes, decoding hints, and intrinsic dimensions for horizontal (192 × 192) and vertical (400 × 400) canvases.

### Phase 3 Progress (Below-Fold + Ancillary Surfaces)
- **CanvasFrameSelector.tsx** · Frame swatch thumbnails now use `loading="lazy"`, `decoding="async"`, and intrinsic `48×48` sizing so the first row of buttons doesn’t download swatches until needed.
- **CanvasCheckoutPreviewColumn.tsx** · The “Current Style” thumbnail applies the same lazy/decoding hints with `48×48` dimensions to avoid layout shift when the modal header animates in.
- **CanvasInRoomPreview.tsx** · Room background + canvas artwork now include lazy attributes and orientation-specific intrinsic dimensions (e.g., 1600×1200 for horizontal scenes). This keeps the preview responsive while preventing oversized eager downloads when the modal mounts.
- **OriginalImageCard.tsx** · User-upload thumbnail in the sidebar now lazily loads with explicit `56×56` sizing, matching the card’s square shell.
- **InsightsRail/ShareBadges.tsx** · Social-share preview image ships with lazy-loading, `48×48` dimensions, and async decoding inside the rail card.
- **InsightsRail/CuratedStylesModule.tsx** · Curated style previews receive lazy attributes, async decoding, and 576×288 intrinsic sizing to stabilize the grid.
- **LivingCanvasModal.tsx** · Marketing preview image lazily loads at `900×1200`, keeping the enhancement modal lightweight until opened.

Next up for Phase 3: expand the lazy attribute sweep to gallery/spotlight cards plus any remaining `<img>` tags rendered below the fold (e.g., `LivingCanvas` entry states, mobile drawers), then validate cross-browser behavior before Phase 4 metrics. EOF
