# Gallery Quickview V1 — Implementation Outline

## Goals
Surface a lightweight horizontal gallery of recently saved artworks between the style preview and the in-room canvas, helping users revisit saved pieces quickly while reinforcing the “save → print/download” flow.

---

## Data & Fetch Layer

1. **Hook:** `useGalleryQuickview` (`src/store/hooks/studio/useGalleryQuickview.ts`)
   - Fetch the latest **15** saved gallery items (descending by save timestamp).
   - Provide `{ items, loading, error, refresh }`, where `items` expose:
     ```ts
     {
       id: string;
       styleName: string;
       thumbnailUrl: string;
       orientation: 'square' | 'horizontal' | 'vertical';
       savedAt: string;
    }
    ```
   - Cache results via Zustand to avoid redundant requests; invalidate on successful saves.
   - If thumbnails are heavy, consider returning a pre-sized derivative via the gallery endpoint.
   - **Preview log link:** Each item already contains `previewLogId`. We will ensure preview logs include the original photo path and crop metadata (see below) so quickview can rehydrate the editor.

2. **Source:** Reuse the existing gallery read endpoint; apply `limit=15` and request thumbnail metadata only so the art remains recognizable in the strip. The endpoint will start returning a `thumbnailUrl` generated during save (see Post-save flow).

---

## Component Structure

```
StudioExperience
├── CenterStage
├── GalleryQuickview (new)
└── RightRail
```

- **`GalleryQuickview`** (`src/sections/studio/experience/GalleryQuickview.tsx`)
  - Uses `useGalleryQuickview`.
  - Renders loading skeleton, empty state, or the list based on hook state.
  - Accepts an `onSelect(item)` callback that hydrates the main preview + canvas preview.

- **`GalleryQuickviewList`**
  - Horizontal carousel (overflow-x-auto) showing **5** rounded thumbnails by default, scrollable up to the latest 15.
  - Each card: rounded thumbnail + style name label beneath; mark the currently loaded art.

- **`GalleryQuickviewEmpty`**
  - Headline: **Gallery Quickview**
  - Subtext: _Save your favorite styles to see them here._

---

## Interactions & Behavior

- **Thumbnail click**
  - Immediately swaps the Studio preview and in-room canvas to the selected saved art.
  - Restores the original source photo from Supabase so the user can iterate further (using the stored `sourceStoragePath` and `cropConfig` from the linked preview log).
  - Strip remains strictly saved items; unsaved generations appear only after “Save to Gallery.”

- **Post-save animation**
  - After `Save to Gallery` completes, play a micro animation where a ghost copy of the preview drops into the quickview bar.
  - Implementation: portal-based tween from the preview to the quickview position; call `refresh()` on completion.

- **Loading state**
  - While fetching thumbnails, display 5 shimmering placeholders.
  - On art swap, rely on existing preview loading indicators.

- **Error handling**
  - If the gallery fetch fails, hide the strip (no toast for V1).

---

## Preview Log Enhancements

- Extend `public.preview_logs` with:
  ```sql
  source_storage_path text,
  source_display_url text,
  crop_config jsonb
  ```
  to capture the original upload location plus crop metadata ({ x, y, width, height, orientation }).
- Update `generate-style-preview` so each log write persists the source photo path and crop settings.
- Modify the `save-to-gallery` flow to pass the `previewLogId`; gallery items can then hydrate the editor by reading these fields.

---

## Telemetry

1. `gallery_quickview_load` – emitted when the initial fetch succeeds (include `count`).
2. `gallery_quickview_thumbnail_click` – on selection; payload `{ artId, styleId, savedAt, position }`.
3. `gallery_quickview_scroll` – optional (debounced) when the user scrolls to a new segment.
4. `gallery_quickview_animation_complete` – when the post-save animation finishes.
5. `gallery_quickview_fetch_error` – when the fetch fails (log reason).

---

## Cross-Device & Accessibility

- Maintain the same strip layout on desktop, tablet, and mobile; shrink card dimensions as needed.
- Carousel remains horizontally scrollable with momentum scrolling on touch devices.
- Thumbnails are focusable buttons with ARIA labels (e.g., “Load saved art ‘Golden Hour, square orientation’”).

---

## Follow-up for V2

- Optional “Recents” tab to surface unsaved generations.
- Artwork renaming within the gallery so quickview captions respect user-defined titles.
- History drawer if we later want more than 15 items visible.

---

## Backend Thumbnail Generation

- When saving to the gallery, generate a ~200 px thumbnail variant and store it alongside the full preview.
- Return `thumbnailUrl` in the gallery response; quickview uses this instead of the full image.
- Implementation detail: reuse existing image processing utilities from the watermark service to resize the stored preview once and cache it in a `thumbnails/` path.
