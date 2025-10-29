# Gallery Original Source Persistence – Implementation Blueprint

## Mission Context
- Uphold Wondertone’s premium AI canvas mandate (README.md:1) by ensuring saved art rehydrates flawlessly without regressing Launchflow → Studio sequencing (`src/sections/LaunchpadLayout.tsx`, `src/sections/StudioConfigurator.tsx`, `src/store/useFounderStore.ts`, `src/store/founder/previewSlice.ts`).
- Maintain Step One telemetry and preview pipeline integrity (`src/utils/telemetry.ts`, `src/utils/launchflowTelemetry.ts`, `src/store/founder/previewSlice.ts`).
- Keep Supabase preview caching + `startFounderPreviewGeneration` as the single preview pipeline (`src/store/founder/previewSlice.ts`, `src/utils/founderPreviewGeneration.ts`, `src/utils/stylePreviewApi.ts`).
- Guarantee future-proof hydration without relying on base64 payloads, enabling instant iteration from Gallery Quickview.

## Current Architecture Findings
- **Upload & Crop Flow**  
  - `PhotoUploader` normalises uploads into data URLs via `readFileAsDataURL`; only HEICs reach the Supabase edge converter.  
  - Crops + smart-crop metadata live solely in Zustand (`useFounderStore`), never persisted to storage.
- **Preview Generation**  
  - `startFounderPreviewGeneration` → `generateAndWatermarkPreview` → `generate-style-preview` pass through the existing idempotent pipeline.  
  - `generate-style-preview` supports `sourceStoragePath` / `sourceDisplayUrl` fields, but we never populate them because the frontend sends pure data URLs.
- **Gallery APIs**  
  - `save-to-gallery` creates thumbnails and stores `preview_log_id`, but depends on the preview log carrying source metadata.  
  - `get-gallery` left joins `preview_logs` and exposes fields, yet they are currently `null`, forcing Quickview rehydration to fall back to base64 previews.
- **Quickview Hydration**  
  - `useGalleryQuickviewSelection` fetches the preview or `sourceDisplayUrl` and converts to base64 again, adding latency and failing for HEIC-only paths.
- **Storage Gatekeeping**  
  - `storageUtils.ts` restricts buckets to `preview-cache*`; persisting originals into `user-uploads` requires widening `WT_ALLOWED_STORAGE_BUCKETS` or introducing a sibling bucket.

## Goals & Guardrails
- Persist a canonical JPEG for every finalized crop with deterministic hashing (per-user) to prevent duplicates.
- Remain 100% within existing telemetry, gating, and Supabase workflow contracts—no bypassing `useFounderStore` or `previewSlice.startStylePreview`.
- Prefer signed URLs over base64 for hydration, respecting “no base64” directive.
- Keep carousel UX untouched, only altering the underlying data hydration path.
- Avoid regressions in entitlement enforcement, cache warmers, or thumbnail generation.

## Key Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Misconfigured storage policies prevent uploads | High | Update `WT_ALLOWED_STORAGE_BUCKETS` or introduce `preview-source` bucket with explicit RLS and unit smoke tests. |
| Preview pipeline regressions when passing new metadata | High | Preserve existing request schema (extend optional fields), add integration tests + manual QA across Launchflow → Studio. |
| Signed URLs expiring mid-session | Medium | Use generous TTL (e.g., 15 min) with auto-refresh & fallback to public URL when available. |
| Storage growth from duplicate uploads | Medium | Hash canonical JPEG + upsert; consider scheduled cleanup or dedupe metrics. |
| Frontend refactor introduces hydration flicker | Medium | Reuse existing transition states, preload images before state swap, verify Step One telemetry remains intact. |

## Proposed Rollout Phases

### Phase 1 – Storage & Edge Foundations
**Objectives**
1. Create a dedicated edge function (`persist-original-upload`) that accepts a canonical JPEG data URL + metadata, writes to Supabase storage (`preview-source` or updated `user-uploads`), and returns `{ storagePath, publicUrl, signedUrl, width, height }`.
2. Update `storageUtils` allow-list + bucket policies (RLS) so the new bucket is eligible for uploads, signed URLs, and public reads.
3. Hash assets using SHA-256 (`computeSha256Hex`) to support idempotent upserts per user.

**Exit Criteria**
- Edge function deployed locally with unit tests covering dedupe, signed URL issuance, and failure paths.
- RLS policies verified via Supabase CLI tests; lint/build checks remain green.

### Phase 2 – Preview Pipeline Integration
**Objectives**
1. Extend `PhotoUploader`’s crop finalization flow to call the new edge helper asynchronously after crop commit. Persist `{sourceStoragePath, sourceDisplayUrl, signedUrl}` into `useFounderStore`.
2. Thread the canonical source fields through `generateAndWatermarkPreview`, `startFounderPreviewGeneration`, and `previewSlice.startStylePreview` so every preview request updates `preview_logs` with `source_storage_path`, `source_display_url`, and `crop_config`.
3. Ensure idempotent preview lookups reuse stored metadata, avoiding extra writes.

**Exit Criteria**
- `preview_logs` rows show populated source metadata for newly generated previews.
- Launchflow → Studio preview generation (including Step One telemetry) passes regression checklist.

### Phase 3 – Gallery API Enhancements
**Objectives**
1. Update `save-to-gallery` to require a valid `preview_log_id` and verify source metadata before insert; persist thumbnail generation unchanged.
2. Enhance `get-gallery` to return canonical signed URLs derived from `source_storage_path`, with configurable TTL, plus fallback public URLs.
3. Add instrumentation for signed URL issuance + failure logging to aid future monitoring.

**Exit Criteria**
- Gallery fetch responses contain `{ sourceStoragePath, sourceDisplayUrl, sourceSignedUrl }` for new saves.
- Unit tests (Deno) cover success/failure paths and signed URL expiry.

### Phase 4 – Frontend Hydration Refactor
**Objectives**
1. Replace base64 hydration in `useGalleryQuickviewSelection` with signed URL ingestion: preload image for dimension detection, then feed URL into `useFounderStore` (set original/cropped image + smart crop).
2. Guard orientation + telemetry logic to ensure no regressions in `emitStepOneEvent`, `startStylePreview`, or sticky rail layout.
3. Add Vitest coverage for the hook (mocking signed URLs, failure fallbacks, orientation switches).

**Exit Criteria**
- Manual QA confirms instant swaps, no crop modal flash, style regeneration succeeds for hydrated gallery items.
- Vitest suite covers success + error cases, with mocks ensuring no network hits.

### Phase 5 – Quality Gates & Rollout
**Objectives**
1. Comprehensive regression run: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`, targeted Vitest suites, edge function deno tests.
2. Stage rollout plan with feature toggles (if necessary) for bucket updates; monitor Supabase logs for upload failures or signed URL churn.
3. Document migration + operational runbook (bucket cleanup, monitoring, troubleshooting) and update `docs/gallery-quickview-codex-implementation-brief.md`.

**Exit Criteria**
- All required checks and QA steps pass; documentation updated.
- Stakeholder sign-off acknowledging adherence to guardrails and premium UX bar.

## Immediate Next Steps
1. Align on bucket selection (`user-uploads` vs. new `preview-source`) and update infra secrets (`WT_ALLOWED_STORAGE_BUCKETS`).
2. Prototype `persist-original-upload` locally to verify hashing/upsert strategy.
3. Once validated, kick off Phase 2 coding per blueprint.
