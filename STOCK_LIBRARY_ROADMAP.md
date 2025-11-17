# Wondertone Stock Library Roadmap

## Purpose
Equip Studio visitors with a premium “Browse Wondertone Library” lightbox when they have not uploaded a photo yet. The modal must feel like a creative springboard, not a stock database: dead-simple to scan, fast to load, and tightly integrated with the existing preview + telemetry flows.

---

## Experience Pillars
- **Instant inspiration:** Category-first browsing with rich thumbnails, no metadata clutter. “Try” actions are one tap.
- **Zero performance drag:** Modal fetches lightweight metadata first, images lazy-load in small batches, and we reuse the preview pipeline for final selection.
- **Guided conversion:** Every interaction nudges users toward either applying a stock image or uploading their own photo once they find a vibe they love.

---

## Feature Stack (V1 → Future)

| Layer | V1 (ship) | Deferred (Phase 2+) |
| --- | --- | --- |
| **Categories** | 8 broad buckets (Nature & Landscapes, City & Architecture, Animals & Wildlife, People & Portraits, Botanicals, Abstract & Texture, Objects & Still Life, Classic & Vintage). Sticky pill row with “All” default. | Smart folders (Favorites, Recent), seasonal/limited drops. |
| **Search & Sort** | Search icon that expands to a debounced text field; simple Recommendation/Popular sort toggle. | Palette match, style-match biasing, advanced filters (aspect, faces). |
| **Grid & Layout** | 80% viewport modal, 3–4 column Masonry on desktop, 2 column mobile. Lazy-loaded, infinite scroll, skeleton placeholders. | Virtualized grid + mini preview panel on hover, drag-to-apply interactions. |
| **Selection Flow** | Click thumbnail → immediate “Applied ✓” state in grid, previews load in Studio canvas behind modal. Sticky footer CTA “Continue with this image” + secondary “Upload my own photo.” | Multi-select mood boards, compare view, dragging onto canvas. |
| **Styling** | Glassmorphism overlay, rounded 24px corners, subtle drop shadows. Hover scale (1.02) + accent border for selected tile. | Style preview badges on hover, color-matched gradients. |
| **Telemetry & Tracking** | stock_modal_opened, stock_category_clicked, stock_image_applied, stock_modal_closed (duration/images viewed). | Search analytics, palette-match clicks, favorites usage. |

---

## Implementation Phases

### Phase 1 – Data & Infrastructure
1. **Metadata Schema**  
   - Table/store containing: `id`, `category`, `title`, `tags`, `thumbnailUrl`, `fullUrl`, `aspect`, `orientation`, `toneHints`.  
   - Include optional `colorPalette` for future palette matching.
2. **Asset Pipeline**  
   - Pre-generate 320 px WebP/AVIF thumbnails + original print-ready files.  
   - Store in Supabase Storage with aggressive CDN caching (immutable, 1 year TTL).
3. **API / Fetch Hook**  
   - Client hook `useStockLibrary` with pagination (limit 24).  
   - Support filters: category (required), search term, sort flag.  
   - Return `cursor` for infinite scroll.

### Phase 2 – Modal Shell & Grid
1. **Radix Dialog** with 80% viewport sizing, dark blur overlay, keyboard traps, ESC close.  
2. **Header Row**: Title, category pills (h-scroll), search icon → expands to field, close button.  
3. **Content Grid**: Responsive CSS grid, skeleton placeholders (shimmer). IntersectionObserver loads next page when bottom sentinel visible.  
4. **Footer CTA**: Primary “Continue with this image” (disabled until one is applied), secondary text button linking back to upload flow.

### Phase 3 – Interactions & Preview Glue
1. **Apply Image Handler**  
   - Selecting a tile sends the full-res URL to existing preview pipeline (`startFounderPreviewGeneration`) as if the user uploaded a file.  
   - Show toast/inline state while preview generates; keep modal open so users can switch instantly.  
2. **Applied State Feedback**  
   - Tile gets accent border + checkmark badge; grid scrolls to keep selection visible.  
   - Sticky sub-banner confirms “Applied to canvas · View changes” (focusable).  
3. **Telemetry Hooks**  
   - Fire `stock_image_applied` with `{imageId, category, step}`; include modal duration on close.

### Phase 4 – Polish & Future Enhancements (post-V1)
- Hover micro-previews showing recommended Wondertone styles.  
- “Match palette” toggle that biases results toward the current style’s colorway.  
- Favorites / Recently Tried smart folders persisted per session.  
- Palette/people filters for power users.  
- Drag-and-drop application onto the preview canvas area.

---

## Performance & Accessibility Guardrails
- **Lazy everything:** Only fetch metadata for visible pages; images use `loading="lazy"`, `decoding="async"`, intrinsic width/height to prevent CLS.  
- **Virtualization-ready:** Grid component abstracted so we can drop in react-window later without refactoring layout.  
- **Reduced motion:** Respect `prefers-reduced-motion` for hover scalers and modal transitions.  
- **Keyboard support:** Tab order (category pills → search → grid → footer). Arrow keys move selection; `Enter` applies. Screen reader announcements for result counts and applied states.

---

## Success Metrics
- Stock modal open rate vs. “Upload photo” conversions.  
- % of sessions where a stock image is applied.  
- Drop-off rate after browsing (modal closes without action).  
- Average time to first applied image.  
- Downstream: checkout completion rate for sessions that start with stock vs. personal uploads.

---

## Open Questions / Next Decisions
1. Do we auto-close the modal after a user clicks “Continue,” or leave it open for multi-try experimentation?  
2. Licensing note placement: footer vs. tooltip?  
3. Should the very first open default to “All” or pre-select a category based on the user’s current style tone?  
4. What’s the minimum asset count per category we’re comfortable launching with (12, 24, 36)?  
5. Do we allow stock usage for paid prints in perpetuity, or limit to preview unless on Creator tier?

Document owner: Codex. Update cadence: after each implementation milestone or major UX decision.

