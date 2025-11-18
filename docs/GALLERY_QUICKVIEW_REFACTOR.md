# Gallery Quickview Refactor Plan

## Phase 0 – Current Behavior Mapping *(Complete ✅)*
- Documented UI sections, animation logic, state buckets, external dependencies, and data flows for `GalleryQuickview` (modern + legacy).

## Phase 1 – Interaction Matrix *(Complete ✅)*
- Mapped hover, select, delete, scroll, refresh, empty/error states, and legacy vs modern switch: state changes, external hooks, UI feedback, dependencies.

## Phase 2 – Selection Engine Deep Dive *(Complete ✅)*
- Responsibilities, store coupling, helper seams, and failure modes captured for `galleryQuickviewSelectionEngine`.

## Phase 3 – Component & Hook Boundaries *(Complete ✅)*
- Proposed component + hook splits for the modern view (and reuse plan for legacy).

## Phase 4 – Risk Assessment & Test Matrix *(Complete ✅)*
- Risks, test cases, instrumentation needs documented.

## Phase A – Safety Net & Feature Guard *(Complete ✅)*
- Added (and now decommissioned) `ENABLE_GALLERY_QV_REWRITE` flag so we could stage the rollout; once QA completed, the flag was removed and the refactor became the sole code path.
- Introduced telemetry counters: `gallery_qv_source_fallback` (fires on missing/expired source data or invalid dimensions) and `gallery_qv_data_uri_usage` for data-URI conversions. Fallback telemetry hooks into `galleryQuickviewSelectionEngine` to capture current gaps in source metadata. Existing delete result telemetry continues to capture success/failure.

## Phase B – Selection Engine Hardening *(Complete ✅)*
- Extracted `resolveDisplayImage`, `resolveSourceImage`, `buildSmartCropResult`, and `hydratePreviewState` helpers so display/source handling, smart-crop math, and store mutations live in testable modules.
- `resolveSourceImage` now guarantees Wondertone storage paths when present, otherwise converts the best available URL into a data URI while emitting `gallery_qv_data_uri_usage`. Missing/expired sources trigger `gallery_qv_source_fallback` telemetry.
- `handleGalleryQuickviewSelection` delegates to the helpers, ensuring Canvas shows the saved preview while generation always receives a storage path/data URI, keeping the Supabase pipeline contract intact with zero UI changes.

## Phase C – Component Decomposition *(Complete ✅)*
- Created `GalleryQuickviewHeader`, `GallerySkeletonRow`, `GalleryEmptyState`, `GalleryScrollContainer`, `GalleryThumbnailCard`, `GalleryDeleteControls`, and `GalleryDeleteModal` under `src/sections/studio/gallery`.
- The new components are wired into the modern view (now the default experience), so the UI is preserved while the codebase gains modular pieces for future refactors.
- `GalleryScrollContainer` now owns fade hints and scroll telemetry; cards encapsulate motion/hover/delete affordances, and the modal lives in a standalone component for easier testing.

## Phase 2C – Supporting Hooks *(Complete ✅)*
- Added focused hooks (`useGalleryScroll`, `useGallerySelection`, `useGalleryDeleteQueue`, `useGallerySurface`, `useGalleryExternalRefresh`) so scroll hints, selection pending/highlight, delete mode queueing, surface detection, and global refresh listeners live outside the monolith.
- Rebuilt `GalleryQuickviewModern` atop those hooks + shared components; legacy view now reuses the header/skeleton/scroll container to minimize divergence while still omitting delete controls.
- Delete queue hook centralizes telemetry + Supabase mutations, ensuring the UI simply requests deletes and all token/restore logic stays encapsulated.

## Phase D – QA & Gradual Rollout *(Complete ✅)*
- Enabled the rewrite in development, executed the manual matrix (desktop/mobile/reduced motion, selection flows, delete-mode edge cases, scroll/pagination, legacy fallback telemetry), and validated Supabase preview + delete pipelines.
- Monitored `gallery_qv_source_fallback`, `gallery_qv_data_uri_usage`, and delete error telemetry—no regressions observed.
- Decommissioned the feature flag and legacy code path; `GalleryQuickview` now always renders the refactored experience (with `ENABLE_QUICKVIEW_DELETE_MODE` still available to disable delete mode globally).
