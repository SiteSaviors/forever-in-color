# Gallery Quickview V1 – Implementation Kickoff

This document briefs the incoming agent on the feature we’ve scoped and captures all decisions made so far.

---

## Mission Summary
Add a “Gallery Quickview” strip between the studio preview and in-room canvas so users can revisit the last 15 saved artworks, instantly swap them into the viewport, and continue iterating from the original photo.

---

## Key Requirements

1. **UI Placement**
   - Horizontal carousel tucked between `CanvasPreviewPanel` and `See It In Your Space`.
   - Desktop/tablet/mobile share the same pattern: 5 visible rounded thumbnails with horizontal scrolling (up to 15 items).
   - Empty state copy:
     - Headline: **Gallery Quickview**
     - Subtext: _Save your favorite styles to see them here._

2. **Interaction Flow**
   - Clicking a thumbnail instantly:
     - Swaps the displayed preview + in-room canvas image to that saved art.
     - Restores the original uploaded photo + crop settings so users can generate new styles from the same source.
   - Strip ONLY shows saved items. Unsaved previews do not appear.
   - Post “Save to Gallery,” animate the art dropping into the quickview and refresh the list.

3. **Data Fetch**
   - New hook `useGalleryQuickview` fetches the latest 15 saves (descending order).
   - Hook returns `{ items, loading, error, refresh }` (Zustand-backed cache).
   - Items include `thumbnailUrl`, `styleName`, `orientation`, `savedAt`, `previewLogId`, etc.
   - If fetch fails, hide the strip.

4. **Preview Log Enhancements (must be implemented)**  
   _Needed so quickview can rehydrate the editor properly._
   - Extend `preview_logs` table with:
     ```sql
     source_storage_path text,
     source_display_url text,
     crop_config jsonb
     ```
   - Update `generate-style-preview` to capture the original upload path and crop metadata on success.
   - Ensure `save-to-gallery` keeps linking `previewLogId`; the quickview can then follow the log to restore the original photo + crop.

5. **Thumbnail Optimization**
   - During gallery save, generate a ~200 px thumbnail and store it (e.g., `thumbnails/<id>.jpg`).
   - Include `thumbnailUrl` in gallery responses so quickview loads these light assets rather than full-size previews.

6. **Telemetry**
   - `gallery_quickview_load` (payload: `{ count }`)
   - `gallery_quickview_thumbnail_click` (payload: `{ artId, styleId, savedAt, position }`)
   - `gallery_quickview_scroll` (optional, debounced)
   - `gallery_quickview_animation_complete`
   - `gallery_quickview_fetch_error`

7. **Accessibility**
   - Thumbnails are focusable buttons with descriptive ARIA labels (`"Load saved art 'Golden Hour, square orientation'"`).
   - Carousel remains horizontally scrollable on touch; keyboard users can tab into each button.

---

## File Touch List (expected)
- `src/store/hooks/studio/useGalleryQuickview.ts` (new)
- `src/sections/studio/experience/GalleryQuickview.tsx` + subcomponents (new)
- `src/sections/studio/experience/StudioExperience.tsx` (add quickview + handlers import)
- Backend: `supabase/functions/generate-style-preview/index.ts`, `supabase/functions/save-to-gallery/index.ts`, relevant migrations to extend `preview_logs`
- Tests: unit tests for new hooks + interactions (Vitest)

_See_ `docs/gallery-quickview-v1-outline.md` _for detailed spec/deliverables._

---

## Outstanding Questions for Implementation
None – all product decisions (data model, animation, telemetry, default behaviour) have been resolved in the discovery phase.

---

## Deliverables Checklist
- [ ] Schema migration for `preview_logs`.
- [ ] Updated Supabase functions (`generate-style-preview`, `save-to-gallery`) to persist source/crop metadata and create thumbnails.
- [ ] Gallery quickview UI with animation, empty state, and thumbnail click behaviour.
- [ ] Zustand hook for fetching gallery items (+ cached data).
- [ ] Telemetry emission endpoints wired into CTA handlers.
- [ ] Vitest coverage for new hooks/components.
- [ ] Docs/update to `docs/gallery-quickview-v1-outline.md` if behaviour diverges.
