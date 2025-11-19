# Stock Library Slice Refactor – Research Plan

## Phase 0 – Responsibilities & Surfaces Mapping *(✅ Complete)*
- **Owned concerns**
  - Modal lifecycle: `stockLibraryModalOpen`, `currentView`, timestamps, `open/close` helpers.
  - Filters/search/sort: category, query, sort mode, access/orientation toggles, `localStorage` persistence (key `stock_library_filters`).
  - Pagination cache: `stockImages`, `hasNextPage`, cursors, `stockStatus`/`stockError`, append/reset helpers.
  - Applied-image pipeline: selected stock image data, download → Supabase persist → preview log creation → preview regeneration and store setters (`setOriginalImage`, `setOrientation`, etc.).
  - Telemetry hooks: `trackStockModalClosed`, `trackStockSearchPerformed`, `trackStockScrolled`, `markImageViewed`.
- **UI surfaces consuming the slice**
  - Studio overlay + modal (`StudioOverlays.tsx`, `StockLibraryModal.tsx`) for open/close/view switching.
  - Stock grids and filter popovers (`StockGridBrowser.tsx`, `StockFilterPopover.tsx`) reading filters, pagination, actions.
  - Launchpad/Upload entry points that call `openStockLibrary` and rely on the same selectors.
- **External dependencies**
  - Telemetry (`stockLibraryTelemetry`), API (`stockLibraryApi`), upload persistence (`sourceUploadApi`, `previewLogApi`), core founder store setters, browser APIs (`localStorage`, `fetch`, `FileReader`).

## Phase 1 – State & Selector Inventory *(🔜)*
- Inventory every field (purpose, default, persistence, consumers).
- Identify derived selectors/helpers and potential memoized hooks needed post-split.

| Field | Purpose | Default / Source | Persistence | Primary Consumers / Notes |
| --- | --- | --- | --- | --- |
| `stockLibraryModalOpen` | Controls Radix dialog visibility for the stock modal. | `false` | In-memory | `StockLibraryModal`, `StudioOverlays` gate mounting and ESC/backdrop handling. |
| `currentView` | Tracks which screen is active (`category-selector` vs `grid-browser`). | `'category-selector'` | In-memory | `StockLibraryModal` toggles layout; `setView` invoked by back button and category tiles. |
| `selectedCategory` | Currently selected stock category id. | `'all'` | In-memory | `StockCategorySelector` (highlight), `StockGridBrowser` (API params, hero copy), telemetry payloads. |
| `searchQuery` | Debounced freeform search text. | `''` | In-memory | `StockSearchField` (input binding), `StockGridBrowser` (fetch dependencies). |
| `sortMode` | Sort option for API (`recommended` / `popular`). | `'recommended'` | In-memory | Passed only to `fetchStockImages*`; future UI can hook into the same action without touching pagination code. |
| `accessFilters` | Free/Premium toggles for gating results. | From `localStorage` (`stock_library_filters`) or `{ free: true, premium: true }`. | LocalStorage (read/write via `persistFilters`). | `StockFilterPopover` UI, `StockGridBrowser` (fetch dependencies). |
| `orientationFilters` | Portrait/Landscape/Square toggles. | From `localStorage` or `{ horizontal: true, vertical: true, square: true }`. | LocalStorage. | Same surfaces as `accessFilters`. |
| `stockImages` | Current page(s) of fetched images. | `[]` | In-memory | `StockGridBrowser` renders grid; `StockImageCard` receives data via props. |
| `hasNextPage` | Whether infinite scroll should fetch again. | `false` | In-memory | `StockGridBrowser` IntersectionObserver guard. |
| `nextCursor` | Cursor token from the API. | `null` | In-memory | `fetchNextPage` payload. |
| `currentPage` | Client-side page counter (for telemetry + UI). | `0` | In-memory | `trackStockScrolled`, debugging/analytics. |
| `stockStatus` | `'idle' | 'loading' | 'ready' | 'error'`. Drives skeleton/error UI. | `'idle'` | In-memory | `StockLibraryModal` chooses skeleton for category view, `StockGridBrowser` shows loaders/errors, fetch guards check status. |
| `stockError` | User-facing error text when API fails. | `null` | In-memory | `StockGridBrowser` displays alert + retry CTA. |
| `appliedStockImageId` | ID of image currently applied/previewed. | `null` | In-memory | Enables CTA in modal footer, highlights cards in `StockGridBrowser`. |
| `appliedStockImage` | Full image payload used when persisting/uploading. | `null` | In-memory | `applyStockImage`, `continueWithStockImage` pipeline (Supabase persistence, preview hydration). |
| `modalOpenedAt` | Timestamp for session duration telemetry. | `null` | In-memory | `closeStockLibraryWithReason`, `continueWithStockImage` compute duration before closing. |
| `viewedImageIds` | Set of image ids seen during session. | `new Set()` | In-memory | `markImageViewed` + modal-close telemetry for “images viewed” metric. |

**Computed helpers / implicit selectors**
- `getActiveFilterCount` and `hasActiveFilters` already live in the slice; today only `hasActiveFilters` is consumed (`StockFilterPopover`). `StockFilterPopover` recomputes its badge count locally—worth exposing a memoized selector once slices split so both badge + reset button can reuse the same derived state.
- Components pull many raw fields independently (e.g., `StockGridBrowser` selects `stockImages`, `stockStatus`, `hasNextPage`, `selectedCategory`, `searchQuery`, `accessFilters`, `orientationFilters`). When sub-slices land, dedicated hooks (`useStockFilters`, `useStockPagination`, etc.) could bundle commonly paired selectors to reduce re-renders.

## Phase 2 – Action & Side-Effect Mapping *(🔜)*
- **Modal/session lifecycle**
  - `openStockLibrary`: simple setter resetting `currentView`, `modalOpenedAt`, `viewedImageIds`. No side effects beyond state.
  - `closeStockLibrary`: thin wrapper over `closeStockLibraryWithReason('dismiss')`.
  - `closeStockLibraryWithReason`: reads duration/images-viewed, fires `trackStockModalClosed`, then resets modal state (including applied image fields). *Sequencing*: telemetry must run before `viewedImageIds` is cleared.
  - `markImageViewed`: adds image ids to the session `Set` for later analytics.
- **Filters/search/sort**
  - `setCategory`, `setSearchQuery`, `setSortMode`: no side-effects beyond resetting pagination state to idle. They guard against redundant updates.
  - `toggleAccessFilter`, `toggleOrientationFilter`: flip boolean flags, persist to `localStorage` (`persistFilters`) *before* resetting pagination state. Persist helper must run even when storage is unavailable (try/catch).
  - `resetFilters`: writes defaults to storage, rehydrates state without touching pagination (current implementation only resets filter objects—it’s up to UI to trigger fetch).
- **Pagination actions**
  - `appendStockImages`: pushes new images and marks status `ready`.
  - `resetStockImages`: wipes cache + status.
  - `setStockStatus`: central guard to clear errors when entering `'loading'` and nuke cache when `'error'`.
  - `setStockError`: ensures status flips to `'error'` with cache reset.
  - `fetchStockImages`: sets `stockStatus='loading'` upfront, calls `fetchStockImagesApi` with category/search/sort, handles error/success branches (resets pagination on error). If search query present, fires `trackStockSearchPerformed` with trimmed query/result count.
  - `fetchNextPage`: guards against concurrent loads or missing cursor, sets `stockStatus='loading'`, calls API with cursor, appends data, fires `trackStockScrolled` with next page + total loaded images. On error, sets `stockStatus='error'` but keeps existing cache (unlike initial fetch).
  - `retryFetch`: simply reuses `fetchStockImages`, so upstream callers must ensure filters state is stable.
- **Applied-image pipeline**
  - `applyStockImage`: stores selected image metadata, used by CTA and `continue*`.
  - `clearAppliedStockImage`: resets both `applied*` fields.
  - `continueWithStockImage`: heavy async flow:
    1. Guard: exit if no `appliedStockImage`.
    2. `fetchImageAsDataUrl` (browser `fetch` + `FileReader`) to obtain base64 and dimensions. Errors here `console.error` and abort.
    3. Sequential founder-store mutations: set original/uploaded/cropped data, orientation + tip, mark crop ready, reset previews, seed preview store state (status `ready`).
    4. Persist original upload via `persistOriginalUpload` (needs optional access token). On success, set `originalImageSource` + `setCurrentImageHash`. On failure, log warning and clear preview log id.
    5. Create preview log via `createPreviewLog`; set `originalImagePreviewLogId` on success.
    6. Trigger `generatePreviews` with `{ force: true }`.
    7. Telemetry: compute session duration, call `trackStockModalClosed` with `reason='continue'`, image counts, category. Must happen before state reset.
    8. Reset modal state identical to `closeStockLibraryWithReason`.
- **Sequencing requirements & guards**
  - All state-resetting actions ensure pagination fields are cleared whenever filters change to avoid stale results.
  - API fetches always set `stockStatus='loading'` before awaiting to prevent duplicate requests (`StockGridBrowser` checks status before IntersectionObserver enqueues more loads).
  - Telemetry `trackStockModalClosed` must read `viewedImageIds` before `set` resets it.
  - `persistOriginalUpload` and `createPreviewLog` updates are wrapped in try/catch with fallback logs; `setOriginalImagePreviewLogId(null)` is used to signal failure downstream.
  - `generatePreviews` is awaited after persistence/logging to ensure preview cache is ready when modal closes.

## Phase 3 – Sub-slice Candidates & Data Flow *(🔜)*
- **`stockLibraryModalSlice`**
  - *State*: `stockLibraryModalOpen`, `currentView`, `modalOpenedAt`, `viewedImageIds`.
  - *Actions*: `openStockLibrary`, `closeStockLibrary`, `closeStockLibraryWithReason`, `setView`, `markImageViewed`.
  - *Responsibilities*: Coordinate modal shell (Radix), manage session telemetry metadata, expose selectors for UI (e.g., `useStockLibraryModal()` hook returning open state + handlers).
  - *Shared utils*: wrap telemetry payload formatting (duration/images viewed) so both `close` and `continueWithStockImage` reuse the same helper.
- **`stockLibraryFiltersSlice`**
  - *State*: `selectedCategory`, `searchQuery`, `sortMode`, `accessFilters`, `orientationFilters`.
  - *Actions*: `setCategory`, `setSearchQuery`, `setSortMode`, `toggleAccessFilter`, `toggleOrientationFilter`, `resetFilters`, `getActiveFilterCount`, `hasActiveFilters`.
  - *Responsibilities*: Own persistence via a dedicated `filterPersistence.ts` (read/write, schema versioning). Expose derived selectors (`useStockFilters()` returning filters + counts) to keep components memoized.
  - *Shared utils*: move `loadPersistedFilters` / `persistFilters` into `/utils/stockLibrary/filterPersistence.ts`.
- **`stockLibraryPaginationSlice`**
  - *State*: `stockImages`, `hasNextPage`, `nextCursor`, `currentPage`, `stockStatus`, `stockError`.
  - *Actions*: `fetchStockImages`, `fetchNextPage`, `retryFetch`, `appendStockImages`, `resetStockImages`, `setStockStatus`, `setStockError`.
  - *Responsibilities*: Encapsulate API client interaction with clear loading guards and telemetry (`trackStockSearchPerformed`, `trackStockScrolled`). Could expose a `useStockPagination()` hook returning data/status + `loadMore` callback for components.
  - *Shared utils*: move API wiring + telemetry helpers (search/scrolled payload builder) into `/utils/stockLibrary/pagination.ts`.
- **`stockLibrarySelectionSlice`**
  - *State*: `appliedStockImageId`, `appliedStockImage`.
  - *Actions*: `applyStockImage`, `clearAppliedStockImage`, `continueWithStockImage`.
  - *Responsibilities*: Handle the downstream upload/persistence pipeline. Breaking it out allows easier testing and future reuse (e.g., saving favorites).
  - *Shared utils*: extract `fetchImageAsDataUrl` to `/utils/stockLibrary/assets.ts`, and consider a `stockLibraryTelemetry.ts` helper for `trackStockModalClosed` to keep sequencing consistent across slices.
- **Data-flow considerations**
  - Modal slice needs to notify pagination slice when closing/clearing state (e.g., running `resetStockImages` if we decide to wipe cache on reopen).
  - Filters slice should emit events (`onFiltersChanged`) so pagination slice can reset/fetch without duplicating logic.
  - Selection slice depends on modal slice for telemetry (duration, category, viewed ids) and on pagination slice for the currently highlighted image; provide explicit selectors or helper getters so cross-slice reads stay type-safe.
  - All slices should expose their actions/selectors via dedicated hooks to reduce direct store access in components and prepare for unit testing.

## Phase 4 – Telemetry & API Contract Audit *(🔜)*
- **Telemetry events**
  - `trackStockModalClosed(params)`: fired from `closeStockLibraryWithReason` and `continueWithStockImage`. Payload: `{ reason, durationMs, imagesViewed, imageApplied, category }`. Must run *before* modal state resets so `viewedImageIds` and `modalOpenedAt` are intact.
  - `trackStockModalOpened(params)`: triggered in `StockLibraryModal` (component-level) when modal transitions from closed → open. Payload: `{ source, hasUpload }`.
  - `trackStockSearchPerformed({ query, resultCount, category })`: fired after successful `fetchStockImages` if a non-empty search query was used. Depends on trimmed query and API result length.
  - `trackStockScrolled({ page, imagesLoaded })`: emitted after `fetchNextPage` successfully appends images; page increments via `currentPage + 1`, and `imagesLoaded` counts prior cache + new images.
- **API contracts**
  - `fetchStockImagesApi({ category, search?, sort, limit, cursor? })`:
    * Success shape: `{ images: StockImage[], hasNextPage: boolean, nextCursor?: string }`.
    * Error shape: `{ error: string }` (discriminated by presence of `error` key). Slice must guard for both shapes.
    * Cursor semantics: `nextCursor` may be `undefined` when no further data; `hasNextPage` should reflect that.
    * Category/search changes require the slice to clear `nextCursor` and start fresh.
  - `persistOriginalUpload({ dataUrl, width, height, accessToken? })`:
    * Success: `{ ok: true, storagePath, publicUrl, signedUrl, signedUrlExpiresAt, hash, bytes }`.
    * Failure: `{ ok: false, error: string }`. Caller should log and clear preview log id, but continue flow gracefully (user remains in modal? currently we close but warn).
    * `accessToken` is optional; when absent, backend should fall back to anon or reject. Slice retrieves token via `getSessionAccessToken`.
  - `createPreviewLog({ storagePath, orientation, displayUrl, accessToken? })`:
    * Success: `{ ok: true, previewLogId }`.
    * Failure: `{ ok: false, error: string }`. Caller logs and sets preview log id to null.
    * Requires same `accessToken` semantics as upload.
- **Validation / preconditions**
  - Ensure filter setters still guard against redundant updates to avoid unnecessary API calls (keeps `fetchStockImages` from thrashing).
  - Modal slice must continue tracking `viewedImageIds` so telemetry `imagesViewed` remains accurate.
  - Pagination slice should maintain the current guard: don’t call `fetchNextPage` if `stockStatus === 'loading'` or `hasNextPage` is false.
  - Applied-image slice must continue to await `generatePreviews` after successful persistence/logging to keep preview store coherent before modal closes.

## Phase 5 – Risk & QA Planning *(🔜)*
- **High-risk areas**
  - **Dual-surface consumers**: Launchpad and Studio both rely on `useFounderStore` selectors; splitting slices must not change selector names/signatures or we risk only one surface updating.
  - **Persisted filters schema**: `localStorage` entry (`stock_library_filters`) has implicit shape `{ accessFilters, orientationFilters }`. Any schema change needs migration logic or versioning to avoid breaking existing user preferences.
  - **Applied-image pipeline**: touches Supabase storage, preview logs, and preview generation—bugs here could double-charge tokens or leave previews stuck. Sequencing must remain identical.
  - **Telemetry accuracy**: `trackStockModalClosed` relies on `modalOpenedAt` + `viewedImageIds`; splitting slices should not reset these fields prematurely.
- **QA matrix**
  1. **Entry points**: open the modal from Studio and Launchpad; ensure `trackStockModalOpened` fires with correct `source`, and closing via X/backdrop/ESC routes the right reason.
  2. **Filters with persistence**: toggle access/orientation filters, reload page to confirm persisted state survives. Use both surfaces to ensure they read the same defaults.
  3. **Search + pagination**: search for a term (happy path) → verify results + telemetry; trigger an API error (simulate) to see error UI + retry functionality. Scroll to load multiple pages and ensure `trackStockScrolled` increments correctly.
  4. **Applied image flow**: select free vs premium images (with entitlement gating), test continue CTA success path and failure path (simulate `persistOriginalUpload` rejection) to ensure modal resets and telemetries remain accurate.
  5. **Telemetry spot checks**: capture payloads in dev tools or mocked telemetry to confirm `reason`, duration, images-viewed counts before and after refactor.
- **Instrumentation / rollout**
  - Add temporary dev-only logging or counters (e.g., `console.info('[stock-refactor] fetchNextPage page=', page)`) to confirm new slices are wired identically, gated by `import.meta.env.DEV`.
  - Consider wrapping telemetry helpers so we can emit both the legacy and new event payloads during QA (A/B) to detect drift.
  - Use feature flags or environment toggles to allow reverting to the monolithic slice quickly if errors spike, even though the goal is to delete the flag after validation.

## Phase 6 – Implementation Snapshot *(✅ Complete)*
- Slice files live under `src/store/founder/slices/stockLibrary/` (`modalSlice.ts`, `filtersSlice.ts`, `paginationSlice.ts`, `selectionSlice.ts`) and are composed in `stockLibrarySlice.ts`.
- Shared utilities now live in `/utils/stockLibrary/{filterPersistence,assetFetch,telemetry}.ts`.
- Selector hooks (`useStockLibraryModal`, `useStockLibraryFilters`, `useStockLibraryPagination`, `useStockSelection`) wrap all state/actions; future UI must consume these hooks instead of `useFounderStore` directly.
- New documentation should reference these hooks/slices for any enhancements (filter tabs, saved favorites, etc.) to avoid UI churn.
