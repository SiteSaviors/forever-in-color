# HEIC → JPEG Server Conversion (Phase 0 Research)

Branch: `research/heic-edge-phase0`  
Target change: replace client-side `heic2any` conversion with a Supabase edge function while preserving Launchflow → Studio telemetry, orientation handling, and watermark guarantees for free tiers.

## Objectives
- **Bundle reduction:** eliminate the 1.35 MB `heic2any` chunk without regressing Launchflow upload latency.
- **Parity:** converted JPEGs must behave identically to today’s data URLs—Step One telemetry, smart crops, orientation presets, and preview caching must continue to flow through `useFounderStore`, `previewSlice.startStylePreview`, and `emitStepOneEvent`.
- **Security & quality:** ensure Supabase storage permissions, caching, and watermark rules remain intact (free tiers still receive watermarked previews downstream).

## Invariants / Guardrails
- Preserve Launchflow upload ➝ Studio preview gating (`PhotoUploader`, `LaunchpadLayout`, `StudioConfigurator`, `previewSlice.startStylePreview`).
- Step One telemetry continues to emit `upload_started`, `upload_success`, `substep`, etc. New conversion events (`conversion_start`, `conversion_success`, `conversion_error`, `conversion_cache_hit`) must run through `emitStepOneEvent` or `sendAnalyticsEvent`.
- Orientation changes must still route through `useFounderStore.setOrientation` so preview caches remain valid.
- Preview generation and watermarking stay server-controlled (`previewSlice` + Supabase functions). The conversion step produces an unwatermarked JPEG; watermark gates continue to execute during preview generation.

## Edge Function Requirements (`supabase/functions/convert-heic`)

| Concern | Notes |
| --- | --- |
| **Request shape** | Accept multipart/form-data (`file` field) or base64 JSON payload. Cap file size (e.g., 25 MB). Attach request id for logging (align with `generate-style-preview` logger). |
| **Authentication** | Require Wondertone origins via CORS plus bearer token (reuse Supabase anon key pattern). Respect `PreviewStorageClient` style CORS helpers if they can be shared. |
| **Conversion** | Decode HEIC via `@saschazar/wasm-heif` (libheif WebAssembly) and re-encode with ImageScript JPEG encoder (quality 92). Capture width/height for orientation. |
| **Caching** | Derive `heic_hash = sha256(buffer)`. Look up `heic_conversion_cache` table; cache hits return stored path/metadata and update access counters. Misses insert new record with TTL aligned to preview cache (30 days). |
| **Storage** | Upload JPEG to private `preview-cache` bucket under `heic-conversions/<hash>/...`. Reuse existing bucket policies and signed URLs for controlled access. |
| **Response** | JSON payload `{ ok, signedUrl, signedUrlExpiresAt, width, height, cacheHit, storagePath }`. Client fetches the signed URL and hydrates Launchflow with an object URL/data URL. |
| **Error handling** | 4xx for bad inputs; 5xx for conversion failures. Include safe error codes (`conversion_failed`, `unsupported_format`, `payload_too_large`). |
| **Telemetry** | Log conversions + cache hits for observability (mirror `createRequestLogger` usage). |

### Open Questions
1. **Response format**: use storage path + short-lived signed URL (no base64 bloat). Client fetches the signed URL and converts to `Blob`/`ObjectURL`, preserving current Launchflow flow.
2. **Bucket selection**: store all conversions in the private `preview-cache` bucket (`heic-conversions/<hash>/...`) to keep assets off public buckets while still leveraging existing storage policies.
3. **Cleanup strategy**: cache table tracks `expires_at` / `hit_count`. Future cron job can purge expired rows and delete corresponding storage objects to control footprint.

## Client Integration Plan (`src/utils/imageUtils.ts` + `PhotoUploader`)

1. **Detection**: keep existing HEIC detection (`looksLikeHeic`).
2. **Conversion call**: replace `import('heic2any')` with an edge-function request. Emit telemetry events before and after the call; show a “Converting HEIC…” state in `PhotoUploader`.
3. **Timeout + fallback**: set a ~5 s timeout. On failure, surface a toast (`Conversion unavailable. Try again or upload JPEG.`) and skip straight to error telemetry. Optionally retain the old `heic2any` path behind a feature flag for rollout safety.
4. **State hydration**: once a JPEG is received, continue calling `setOriginalImage`, `setOriginalImageDimensions`, and `determineOrientationFromDimensions` exactly as today. Smart crop cache + preview pipeline remain untouched.
5. **Caching hook**: store the hash returned by the edge function in `useFounderStore.setCurrentImageHash` so preview caches stay consistent. If the server returns `cacheHit`, optionally short-circuit local digest computation.

## Telemetry & Analytics Updates
- New events (proposal):
  - `emitStepOneEvent({ type: 'conversion', status: 'start' | 'success' | 'error', details })`
  - `sendAnalyticsEvent('heic_conversion_cache_hit', { hash, latency })` for Launchflow health surfaces.
- Ensure existing metrics (upload counts, preview momentum) can segment HEIC conversions if needed.

## Testing Checklist (pre-implementation)
- Edge function unit tests (Supabase: conversion, cache hit/miss, large file rejection, bad MIME types, orientation metadata).
- Client integration smoke tests:
  - iOS/Safari HEIC upload → Launchflow preview.
  - Non-HEIC upload unaffected.
  - Network timeout fallback path.
  - Free tier watermark flow after conversion.
- End-to-end manual tests: confirm Step One progress indicators, orientation tooltips, and `startStylePreview` caching still behave.

## Risks & Mitigations
- **Network latency**: conversion now depends on an extra round-trip. Mitigate with user-facing progress indicators and caching.
- **Storage growth**: deterministic hashing allows us to deduplicate conversions; TTL policy must be enforced.
- **Fallback coverage**: maintain a feature-flagged client fallback until server conversion is proven stable.
- **Security**: ensure CORS and auth headers match `generate-style-preview` practices; never store raw HEIC publicly.

## Next Steps
1. Draft edge function skeleton mirroring `generate-style-preview` logging/CORS structure (no deployment yet).
2. Decide on response format + bucket strategy with stakeholders.
3. Map telemetry additions to Step One analytics to avoid gaps.
4. Prepare feature flag (`VITE_HEIC_EDGE_CONVERSION`) and fallback plan for rollout.
