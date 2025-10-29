# Gallery Quickview V1 – Codex Implementation Brief

Prepared to anchor implementation against Wondertone’s premium AI canvas mandate and the Launchflow → Studio north stars.

---

## 0. Mission Snapshot
- **Goal**: Ship a Gallery Quickview strip between the Studio preview and “See It In Your Space,” letting users revisit the latest 15 saved artworks and instantly restore their editing context.
- **Guardrails observed**: Preserve Launchflow → Studio sequencing, Step One telemetry (`emitStepOneEvent`), preview pipeline (`previewSlice.startStylePreview` / `startFounderPreviewGeneration`), and Supabase sharing layers (`AuthProvider`, entitlement slices).
- **Success signals**: Quickview shows cached thumbnails, swaps previews/orientation/original photo on click without triggering fresh generations, and all mandated npm checks (`lint`, `build`, `build:analyze`, `deps:check`) pass.

---

## 1. Research Findings

| Area | Insight | Source |
| --- | --- | --- |
| Content scope | Show **last 15** saved gallery items, newest → oldest; 5 rounded thumbnails visible without scroll. | Q&A with founder |
| Interaction | Thumbnail click must instantly swap Studio preview + in-room canvas and restore original upload + crop metadata. | Q&A; `docs/gallery-quickview-implementation-spec.md` |
| Data pointers | Extend `preview_logs` with `source_storage_path`, `source_display_url`, `crop_config` so saved items rehydrate the editor. | Spec §Preview Log Enhancements |
| Thumbnails | Generate ~200 px derivative during `save-to-gallery`, store under `thumbnails/<id>.jpg`, return `thumbnailUrl`. | Spec §Thumbnail Optimization |
| Telemetry | Fire `gallery_quickview_load`, `_thumbnail_click`, `_scroll` (debounced), `_animation_complete`, `_fetch_error`. | Spec §Telemetry |
| Failure mode | If fetch errors, hide the strip silently; empty state copy stays “Gallery Quickview / Save your favorite styles to see them here.” | Spec & founder Q&A |
| Accessibility | Thumbnails are focusable buttons with descriptive ARIA labels; horizontal scroll remains touch + keyboard friendly. | Spec §Accessibility |

---

## 2. UX, UI, & Copy Decisions

- **Placement**: Inline element between `CanvasPreviewPanel`’s ActionGrid block and the “See It In Your Space” section (desktop and mobile share positioning).
- **Layout**:
  - Horizontal carousel with snap scrolling (`scroll-snap-type: x mandatory`).
  - Desktop: 5×120 px cards; Tablet: 4×100 px; Mobile: 3–4×80 px (responsive Tailwind utilities).
  - Gradient fades and hidden scrollbar classes to signal overflow without visual noise.
- **Card anatomy**:
  1. Rounded thumbnail (background cover via `thumbnailUrl`).
  2. Style name below (two-line clamp).
  3. Orientation badge optional for V1 (metadata already available).
  4. Selected state ring + subtle glow.
- **Empty state copy**:
  ```
  Gallery Quickview
  Save your favorite styles to see them here.
  ```
- **Animation**: On successful “Save to Gallery,” portal/tween from preview viewport into strip with `framer-motion`, finishing at slot 0; emit `gallery_quickview_animation_complete`.

---

## 3. Data & State Strategy

### 3.1 Hook Contract
`src/store/hooks/studio/useGalleryQuickview.ts` *(new)*  
Returns `{ items, loading, error, refresh }`, backed by Zustand slice or `useFounderStore` selectors.  
- Fetch uses existing `get-gallery` edge function with `limit=15`.  
- Cache keyed by user ID + timestamp; invalidate after save animation or manual refresh.  
- Each item includes:
  ```ts
  {
    id: string;
    styleId: string;
    styleName: string;
    orientation: 'square' | 'horizontal' | 'vertical';
    thumbnailUrl: string;
    previewLogId: string | null;
    savedAt: string;
    sourceStoragePath?: string | null;   // from joined preview_logs
    sourceDisplayUrl?: string | null;
    cropConfig?: CropConfig | null;
  }
  ```

### 3.2 Hydration Flow
1. User clicks thumbnail.  
2. Hook resolves item → preview log metadata.  
3. Mutations dispatched via `useFounderStore`:
   - `setUploadedImage`, `setCroppedImage`, `setOriginalImage`, `setOriginalImageDimensions`.  
   - `setSmartCropForOrientation` with stored `crop_config`.  
   - `setOrientation` (using official setter to trigger cache invalidation and Step One telemetry).  
   - `setPreviewState` / `cacheStylePreview` for current style to avoid fresh generation.  
4. Emit `emitStepOneEvent({ type: 'preview', styleId, status: 'complete' })` and `gallery_quickview_thumbnail_click`.

### 3.3 Store Additions
- Consider lightweight `gallerySlice` within `useFounderStore` for caching items + metadata (mirrors existing slice pattern).
- Ensure concurrency safety: dedupe in-flight fetches, abort on unmount.

---

## 4. Backend & Edge Function Updates

| File | Update |
| --- | --- |
| `supabase/migrations/<timestamp>_extend_preview_logs_for_quickview.sql` | Add `source_storage_path text`, `source_display_url text`, `crop_config jsonb`, comments, indexes if needed. |
| `supabase/functions/generate-style-preview/index.ts` | When inserting/updating preview logs, persist new columns using incoming request context (base image URL, normalized storage path, crop metadata). Return `previewLogId`, `storagePath`, `sourceStoragePath`, `cropConfig` in success payload so frontend can cache immediately. |
| `supabase/functions/save-to-gallery/index.ts` | Accept `previewLogId`, fetch preview asset, generate ~200 px thumbnail (reuse `WatermarkService`/`PreviewStorageClient` helpers), store under `preview-cache-thumbnails/<uuid>.jpg`, and return `thumbnailUrl`. |
| `supabase/functions/get-gallery/index.ts` | Join `preview_logs` to expose stored source metadata + new `thumbnail_url` column; enforce `limit=15` query param; skip strip when join fails. |

*Note*: Ensure thumbnail bucket is allowed in `_shared/storageUtils.ts` (add to `WT_ALLOWED_STORAGE_BUCKETS` if required).

---

## 5. Telemetry & Analytics

- Wire through `sendAnalyticsEvent` (PostHog/Mixpanel shim) with payloads:
  - `gallery_quickview_load` → `{ count }`
  - `gallery_quickview_thumbnail_click` → `{ artId, styleId, savedAt, position }`
  - `gallery_quickview_scroll` → `{ lastVisibleIndex }` (debounced via `requestAnimationFrame`)
  - `gallery_quickview_animation_complete` → `{ artId }`
  - `gallery_quickview_fetch_error` → `{ error, status? }`
- Step One telemetry: fire `emitStepOneEvent({ type: 'cta', value: 'continue-to-studio' })` equivalents as needed to maintain dashboards when swap occurs.

---

## 6. Accessibility, Performance, & Guardrails

- Buttons with `role="button"` (native `<button>`) and `aria-label="Load saved art ‘{styleName}, {orientationLabel}’"`.
- Ensure focus outline contrast meets AA; arrow key support optional post-V1 (tabbing suffices per spec).
- Use GPU-friendly transforms (`transform`, `opacity`) for animations; avoid non-composited filters.
- Debounce Supabase calls (reuse fetch on idle) to protect bundle size and backend quota.
- Keep Launchpad/Studio shared state synced via existing providers—no bypassing of `AuthProvider` listeners.

---

## 7. File Touch Matrix

| Area | Files (new/modified) | Purpose |
| --- | --- | --- |
| Hook & slice | `src/store/hooks/studio/useGalleryQuickview.ts` (new), `src/store/useFounderStore.ts`, `src/store/founder/gallerySlice.ts` (new) | Fetch/cache quickview data, expose hydration actions. |
| UI | `src/sections/studio/experience/GalleryQuickview.tsx` (new), `GalleryQuickviewItem.tsx`, `GalleryQuickviewEmpty.tsx` (optional), CSS module or Tailwind utilities | Render carousel, empty state, animation. |
| Integration | `src/sections/studio/components/CanvasPreviewPanel.tsx`, `src/sections/studio/experience/CenterStage.tsx` | Insert quickview component, pass handlers. |
| Utilities | `src/utils/galleryApi.ts`, `src/hooks/studio/useGalleryHandlers.ts` | Handle thumbnail URL, pass previewLogId, share refresh callback post-save. |
| Telemetry | `src/utils/galleryQuickviewTelemetry.ts` (new) | Encapsulate analytics event emission. |
| Tests | `tests/hooks/useGalleryQuickview.spec.ts`, `tests/components/GalleryQuickview.spec.tsx`, `tests/store/gallerySlice.spec.ts` | Cover fetch/invalidation, rendering, hydration calls. |
| Backend | Migrations + edge functions listed in §4 | Persist metadata and thumbnails. |
| Docs | This file + update `docs/gallery-quickview-v1-outline.md` if behavior diverges. |

---

## 8. Six-Phase Implementation Plan

### Phase 1 – Schema & Contract Prep
- Draft migration for `preview_logs` columns (SQL + comments).
- Update TS types (`PreviewResult`, API responses) to carry new fields.
- **Exit**: Migration reviewed; type updates compile.

### Phase 2 – Edge Function Enhancements
- Update `generate-style-preview` to persist source metadata.
- Enhance `save-to-gallery` with thumbnail generation + `previewLogId`.
- Adjust `get-gallery` response to include joins + `thumbnailUrl`.
- **Exit**: Supabase functions run locally (deno test) and return expected payload.

### Phase 3 – Frontend Data Layer
- Implement `gallerySlice` + `useGalleryQuickview` hook.
- Extend `galleryApi.fetchGalleryItems` and save handler to handle thumbnails + preview metadata.
- Write unit tests for slice/hook behavior (Vitest).
- **Exit**: Hook returns expected shape with mocked fetch; tests pass.

### Phase 4 – UI & Interaction
- Build `GalleryQuickview` components, responsive carousel, empty state.
- Integrate into `CanvasPreviewPanel` / `CenterStage`.
- Implement animation + ARIA labels, handle loading/hidden states.
- **Exit**: Visual regression in Storybook/Chromatic or manual per guidelines; telemetry stubs fire.

1

### Phase 6 – Validation & Documentation
- Run mandated commands: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.
- Add/adjust docs (`gallery-quickview-v1-outline.md`) if implementation deviates.
- Prepare PR narrative including risk log, testing summary, perf notes.
- **Exit**: All checks green; documentation up to date; ready for review.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Missing preview log metadata for legacy entries | Quickview can’t rehydrate older saves | Fallback: disable hydration for items lacking metadata, show toast encouraging regeneration; optionally run backfill script later. |
| Thumbnail generation latency | Save-to-gallery feels slower | Generate thumbnail asynchronously (queue or Promise.all) but respond once stored; show animation after API success. |
| Carousel jank on mobile | Poor UX | Use `requestAnimationFrame`-based scroll tracking + passive listeners; ensure transforms are GPU-accelerated. |
| Telemetry overload | Noisy analytics | Debounce scroll, limit load event to first successful fetch per session. |

---

## 10. Open Questions / Follow-Ups

1. **Backfill strategy**: Are we backfilling `preview_logs` for existing gallery items, or is V1 forward-only?  
2. **Thumbnail storage bucket naming**: Confirm with infra whether thumbnails live alongside preview cache (`preview-cache-public`) or require a dedicated `preview-thumbnails` bucket.  
3. **Animation timing**: Any alignment needed with existing Studio animations (e.g., chime duration) to avoid overlapping motion cues?  
4. **Future-ready**: V2 features (rename, hover actions) will require additional metadata; note schema to remain flexible.

---

Prepared by Codex (GPT-5) — ready to execute once implementation phases commence.

