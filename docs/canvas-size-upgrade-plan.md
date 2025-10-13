# Canvas Size Upgrade – Implementation Notes

## Offering Matrix

| Orientation | Nickname      | Dimensions | Price |
|-------------|---------------|------------|-------|
| **Landscape** | Extra Small   | 16″ × 12″  | $149 |
|             | Small          | 24″ × 18″  | $199 |
|             | Medium         | 36″ × 24″  | $249 |
|             | Large          | 40″ × 30″  | $319 |
|             | Extra Large    | 48″ × 32″  | $449 |
|             | XXL            | 60″ × 40″  | $599 |
| **Portrait** | Extra Small   | 12″ × 16″  | $149 |
|             | Small          | 18″ × 24″  | $199 |
|             | Medium         | 24″ × 36″  | $249 |
|             | Large          | 30″ × 40″  | $319 |
|             | Extra Large    | 32″ × 48″  | $449 |
|             | XXL            | 40″ × 60″  | $599 |
| **Square**   | Small         | 16″ × 16″  | $179 |
|             | Medium         | 24″ × 24″  | $219 |
|             | Large          | 32″ × 32″  | $349 |
|             | Extra Large    | 36″ × 36″  | $499 |

## Implementation Plan

1. **Centralize Option Data**
   - Create `src/utils/canvasSizes.ts` exporting:
     ```ts
     type CanvasSizeOption = {
       id: string;
       orientation: 'horizontal' | 'vertical' | 'square';
       label: string;
       nickname?: string;
       price: number;
     };
     ```
     - Provide `CANVAS_SIZE_OPTIONS: Record<Orientation, CanvasSizeOption[]>`.
     - Helper `getCanvasSizeOption(id: CanvasSizeKey)` returning option or `undefined`.

2. **Store Updates (`useFounderStore.ts`)**
   - Extend `CanvasSize` union with new IDs (e.g., `'landscape-16x12'`, `'portrait-40x60'`, `'square-36x36'`).
   - Set initial `selectedCanvasSize` to `'square-24x24'` (or chosen default).
   - Update `setOrientation` to validate the current size; if it no longer exists for the new orientation, switch to that orientation’s default (second item).
   - Update `computedTotal()` to derive price via `getCanvasSizeOption(selectedCanvasSize)?.price`.
   - Drop reliance on `basePrice` unless needed elsewhere.

3. **StickyOrderRail UI**
   - Import `CANVAS_SIZE_OPTIONS` and render `displaySizes = CANVAS_SIZE_OPTIONS[orientation]`.
   - Update button markup to show dimension + nickname + price in a compact flex layout.
   - Apply small fade animation when the list changes orientation.
   - Ensure order summary uses the helper to display the size and price.

4. **Orientation Switching**
   - After the cropper completes and `setOrientation` runs, confirm the selection reflects the default for the new orientation.
   - Optionally map size “tiers” (index-based) to keep users in equivalent pricing when toggling orientation—future enhancement.

5. **Telemetry**
   - If we log size selections, update emitted values to use the new IDs/nicknames for consistent analytics.

6. **QA Checklist**
   - Flip orientation pre/post crop and confirm size list + selection updates.
   - Validate price changes in order summary and totals.
   - Regenerate previews after size/orientation changes to ensure no regressions.
   - Snapshot UI for each orientation to verify hover/active styling remains premium.

## Notes

- Central map makes pricing updates trivial and avoids duplicated arrays.
- Nicknames give the e-commerce feel (XS–XXL) while the dimensions reassure artists.
- The 6-option lists still fit comfortably in the existing card; keep the purple active state for brand continuity.
