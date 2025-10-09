# Canvas In Room Preview – Phase 1 Alignment Plan

_Last updated: 2025-10-07_

## Objective
Guarantee the user’s artwork is rendered exactly inside the pre-measured canvas area for every room background (9 permutations), producing a photorealistic preview that matches the frame/framing assets supplied by design.

## Guiding Principles
- **Data driven**: A single manifest (`ROOM_ASSET_MANIFEST`) is the source of truth for image source and `artRectPct` measurements.
- **Pixel-accurate overlay**: Percent coordinates are converted to real pixels using the rendered background size so the art stays glued to the wall regardless of responsive scaling.
- **Minimal DOM**: One relative container, one background `<img>`, one absolutely positioned overlay `<img>`—no extra wrappers that skew positioning.
- **Future-friendly**: Keep hooks (`enableHoverEffect`, `showDimensions`) intact for later polish phases.

## Implementation Steps

1. **Manifest & Picker**
   - Define `RoomAsset`/`ArtRectPct` types and the nine-entry manifest provided by design.
   - Implement `pickRoomAsset(orientation, frame)` that maps the current store state (`orientation`, `selectedFrame`) to the correct room asset ID, falling back to portrait/unframed.

2. **Measure Rendered Background**
   - Attach a `ref` to the background `<img>`.
   - On load and whenever the image resizes, capture `clientWidth/clientHeight` via `ResizeObserver`.
   - Store these metrics in component state (`imageMetrics`).

3. **Convert Percentages → Pixels**
   - Use `imageMetrics` to translate `artRectPct.{top,left,width,height}` into pixel values (`artRectPx`).
   - Memoise the result so it updates only when metrics or asset changes.

4. **Absolute Overlay Rendering**
   - Render the user preview `<img>` only when we have both `previewUrl` and `artRectPx`.
   - Apply inline styles `top/left/width/height` in pixels and add `overflow-hidden` to the frame div to clip edges cleanly.
   - Keep `object-fit: cover` so artwork fills the canvas area.

5. **Diagnostics (Optional)**
   - Expose a data attribute or dev-only border (e.g., `data-debug-room`) to validate alignment quickly during QA without shipping it enabled.

6. **Verification**
   - Manually test all nine combinations (portrait/square/horizontal × unframed/black-framed/white-framed).
   - Confirm the preview remains aligned while resizing the viewport and when toggling styles/frames/orientations.

## Out of Scope (Phase 2/3)
- Transition/hover polish, dimension badges, analytics logging.
- Perspective warping for future quad support.

Following this plan will keep the implementation straightforward and ensure the first milestone—pixel-perfect placement—is fully met before layering on extras.

