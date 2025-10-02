# Edge Function Preview Output Caching — Phase 2 Blueprint

## 1. Executive Summary
Wondertone’s preview Edge Function (`supabase/functions/generate-style-preview/index.ts:1-120`) currently invokes the Replicate GPT-Image-1 API for every request, yielding 3–8 s waits and driving costs on duplicate generations. Phase 2 introduces output caching so repeat previews (same photo, style, aspect ratio, quality) return instantly while keeping configurator flow and throughput guardrails intact.

Our recommended path is a hybrid cache: a persistent layer in Supabase Storage (backed by metadata in Postgres) with an optional in-memory LRU hot cache per Edge instance. This delivers sub‑500 ms hits, 50–70 % cost savings, and preserves fallback behavior—if caching fails, we still call Replicate.

## 2. Current State Analysis

### 2.1 Request → Response Flow
- `index.ts:23-114` serves POST requests, normalizes `imageUrl` into data URLs (`normalizeImageInput`, lines 9‑29), validates payload (`requestValidator.ts:9-48`), fetches style prompts via Supabase (`stylePromptService.ts:3-40`), and generates the preview through `ReplicateService.generateImageToImage` (`replicateService.ts:18-120`).
- `ReplicateService` orchestrates prompt enhancement (`promptEnhancer.ts:3-9`), prediction creation/polling (`replicate/apiClient.ts`, `replicate/pollingService.ts`), and retries (`errorHandling.ts:59-150`). Responses bubble back via `createSuccessResponse` / `createErrorResponse` (`responseUtils.ts:1-18`).
- Downstream clients (`src/utils/stylePreviewApi.ts:15-98`, `src/components/product/hooks/usePreviewGeneration.ts:20-102`, `supabase/functions/remove-watermark/index.ts:59-116`) always call the Edge Function; there’s no short-circuiting when previews already exist.

### 2.2 Image Processing
- Inputs arrive as remote URLs or base64 data URLs. `normalizeImageInput` fetches remote images and inlines them as data URLs (base64). The Replicate payload sends the data URL directly (`replicateService.ts:38-87`). No hashing or dedupe happens today.

### 2.3 Cache-Relevant Parameters
- Function accepts `imageUrl`, `style`, `photoId`, `aspectRatio`, `quality`, `watermark`, `sessionId`; only `imageUrl`, `style`, `aspectRatio`, `quality` influence the Replicate request (`replicateService.ts:61-87`).
- Orientation utilities map UI selections to aspect ratios (`src/components/product/orientation/utils/index.ts:1-73`). Quality defaults to `medium` but also handles legacy values (`requestValidator.ts:14-46`). `watermark` is ignored server-side (client adds overlay).

### 2.4 Existing Caching/State
- Prompt-level “caching” exists in Supabase (`stylePromptService.ts:8-22`) but outputs are never cached. No Redis/KV/in-memory caches are present. Supabase `Previews` table stores user history but is not read during generation.

### 2.5 Error Handling & Resilience
- Edge Function uses `createErrorResponse` with request IDs for observability.
- Retry logic sits inside `executeWithRetry` (`errorHandling.ts:116-149`) and `PollingService` for Replicate polling (`replicate/pollingService.ts:7-122`).
- Environment validation exists in `environmentValidator.ts`, though `index.ts` bypasses it and reads env vars directly.

## 3. Recommended Architecture

### 3.1 High-Level Design
- **Cache Lookup:** Compute a deterministic cache key using normalized image hash + style metadata. Check metadata table (`preview_cache_entries`) for fresh entries.
- **Hit:** Return stored Supabase Storage URL immediately (<500 ms).
- **Miss:** Call Replicate as today, then persist the result to storage + metadata (with TTL, hit counters, created_at). Return response after storing.
- **Hot Cache:** Optional per-instance LRU (e.g., Map capped to 256 entries) to serve recent results without storage round-trip.
- **Fallbacks:** On cache service/storage errors, log and proceed with live generation to protect UX.

### 3.2 Data Flow Diagram
```mermaid
flowchart TD
  A[Client Request\n(imageUrl, style, aspectRatio, quality)] --> B[Edge Function Request Handler]
  B --> C[Normalize Image & Compute Hash]
  C --> D{Cache Metadata Lookup?}
  D -- Hit --> E[Return Cached URL\n(createSuccessResponse)]
  D -- Miss --> F[ReplicateService.generateImageToImage]
  F -->|Success| G[Fetch Output Asset]
  G --> H[Upload to Supabase Storage\npreview-cache bucket]
  H --> I[Upsert preview_cache_entries]
  I --> E
  F -->|Failure| J[createErrorResponse\nHandle retries/fallback]
  B --> K[Hot LRU Cache\n(optional)]
  K --> D
```

### 3.3 Cache Key Structure
- **Components:**
  - `image_digest`: SHA-256 of normalized base64 payload (after `normalizeImageInput`).
  - `style_id`: Numeric ID via `StylePromptService.getStyleIdByName`.
  - `style_version`: Incremented when prompt/style parameters change (tie to `style_prompts.updated_at`).
  - `aspect_ratio`: Raw string (e.g., `3:2`).
  - `quality`: Normalized enum (`low|medium|high|auto`).
  - `watermark_flag`: Preserve future server watermark differences, default `true`.
- **Format:** `preview:v1:${style_id}:${style_version}:${aspect_ratio}:${quality}:${watermark_flag}:${image_digest}`
- **Hashing:**
  - Use Deno `crypto.subtle.digest('SHA-256', Uint8Array)` and base64url encoding.
  - `image_digest` ensures different crops yield different keys (because crop is baked into data URL), while identical images across users coalesce.

### 3.4 Storage Schema
- **Supabase Storage Bucket:** `preview-cache`
  - Folder: `${style_id}/${quality}/${aspect_ratio}/`
  - File: `${image_digest}.jpg` (or `.png` if original).
  - ACL: Public read via CDN, write restricted to service role.
- **Postgres Table:** `preview_cache_entries`
  - Columns: `cache_key (PK)`, `style_id`, `style_version`, `image_digest`, `aspect_ratio`, `quality`, `watermark`, `storage_path`, `preview_url`, `ttl_expires_at`, `created_at`, `last_accessed_at`, `hit_count`, `source_request_id`.
  - Index on `(image_digest, style_id, aspect_ratio, quality, watermark)` for quick lookups.
  - Optional `invalidate_reason` column for style updates.
- **Metadata Updates:** On hit, update `hit_count` and `last_accessed_at` asynchronously (fire-and-forget Supabase RPC or queue). On miss, insert records.

### 3.5 Observability & Analytics
- Emit logs with requestId, cache status (hit/miss/stale).
- Optionally push metrics to Supabase `functionsHooks` table or external metrics service.
- Provide `GET /status` (existing in v2) to include cache metadata for debugging when requestId is known.

### 3.6 Storage Strategy Evaluation
| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| **A. Supabase Storage (Recommended)** | Durable, CDN-backed, cheap (~$5/TB/mo), integrates with service role | Requires upload round-trip; TTL management via metadata | **Yes** – primary cache |
| **B. Edge Memory/KV** | Ultra-fast, zero storage cost | Ephemeral, cold boot resets, limited capacity per instance | Use as LRU layer only |
| **C. Hybrid** | Combines low latency with durability | Slight complexity | **Adopt**: LRU (256 entries) over Supabase metadata |

### 3.7 Cache Invalidation & TTL
- **TTL:** 30 days default (`PREVIEW_CACHE_TTL_DAYS` env). Extend if storage budget allows; purge daily with scheduled job.
- **Style Updates:** Track `style_prompts.updated_at`; increment `style_version` or add `style_hash` to key to auto-invalidate.
- **Manual Purge:** Admin RPC to delete by `style_id` or `image_digest` (handles GDPR requests).
- **Stale Handling:** On lookup with expired `ttl_expires_at`, treat as miss but optionally serve stale while revalidating asynchronously (stale-while-revalidate pattern) if time allows.

### 3.8 Security & Privacy
- Supabase Storage paths avoid PII; hashed keys ensure images aren’t guessable.
- Provide deletion workflow tied to user request to comply with GDPR (metadata table makes mapping easy).
- Ensure only public preview URLs are returned; no user ID stored in cache key.

## 4. Implementation Roadmap

### Phase 2.1 — Foundation (6–8 h)
1. Add cache utilities module (`supabase/functions/generate-style-preview/cache/cacheKey.ts`) to normalize payloads and compute SHA hashes.
2. Create Supabase Storage bucket `preview-cache` (infra task; document in deployment checklist).
3. Define Postgres table `preview_cache_entries` migration + RLS (service role write, public read via Supabase function).
4. Introduce env vars: `PREVIEW_CACHE_BUCKET`, `PREVIEW_CACHE_TTL_DAYS`, `PREVIEW_CACHE_MAX_MEMORY_ITEMS`, `PREVIEW_CACHE_LOG_LEVEL`.

### Phase 2.2 — Core Caching Logic (8–10 h)
1. Extend `index.ts` to compute cache key and look up metadata before hitting Replicate.
2. Implement in-memory LRU (Map + eviction) shared at module scope (Edge instance).
3. On cache hit: short-circuit response with `createSuccessResponse`.
4. On miss: wrap existing generation flow; ensure `requestId` flows through.

### Phase 2.3 — Storage Integration & Write-Back (8–12 h)
1. After successful generation, fetch output asset, store in Supabase Storage using service role client.
2. Upsert metadata entry with TTL, hit_count=1.
3. On write failure, log and still return live output.
4. Add background update of `hit_count` / `last_accessed_at` (fire-and-forget `sb.rpc('increment_preview_cache_hit', …)` or queue).
5. Provide Admin helper endpoint or SQL function to invalidate entries manually.

### Phase 2.4 — Testing & Validation (8 h)
1. Unit tests for cache key hashing, TTL logic, storage upload error handling (Deno tests).
2. Integration tests against Supabase local dev for hit/miss behavior.
3. Load test script (`scripts/measure-latency.ts`) updated to simulate 1000 requests with 60 % duplicates.
4. Observability validation: ensure structured logs show hit/miss counts.
5. Update docs (`README.md`, playbook) + ops runbook.

Total effort: ~30–38 h excluding infra approvals.

## 5. Code Change Specifications

| File | Planned Edits |
| --- | --- |
| `supabase/functions/generate-style-preview/index.ts` | Insert cache lookup/write-back around Replicate call; log cache status; inject TTL logic. |
| `supabase/functions/generate-style-preview/cache/cacheKey.ts` *(new)* | Provide canonical image normalization hash + key builder. |
| `supabase/functions/generate-style-preview/cache/storageClient.ts` *(new)* | Wrap Supabase Storage uploads/downloads with retries and signed URL creation if needed. |
| `supabase/functions/generate-style-preview/cache/cacheMetadataService.ts` *(new)* | CRUD for `preview_cache_entries`; helpers for TTL, hit counts, invalidation. |
| `supabase/functions/generate-style-preview/replicateService.ts` | No structural change, but ensure function returns raw output + metadata for caching layer. |
| `supabase/functions/generate-style-preview/requestValidator.ts` | Validate optional `cacheBypass` flag for debugging (default `false`). |
| `supabase/functions/generate-style-preview/types.ts` | Define `CacheStatus` enum, request/response interfaces with `cache: 'hit' | 'miss' | 'bypass'`. |
| `supabase/functions/generate-style-preview/corsUtils.ts` | Ensure CORS headers allow future debug endpoints (no breaking change). |
| `supabase/functions/generate-style-preview/logging.ts` *(new)* | Structured logging helper for consistent request IDs, cache metrics. |
| `supabase/functions/generate-style-preview/cache/__tests__/*.test.ts` *(new)* | Hashing, TTL, metadata tests. |
| `supabase/functions/generate-style-preview/README.md` *(new or update)* | Document caching behavior, TTL, invalidation commands. |
| `supabase/migrations/xxxx_preview_cache_entries.sql` | Create metadata table + indexes. |
| `.env.example` / deployment docs | Add new env vars. |
| `scripts/measure-latency.ts` | Allow toggling cache bypass to benchmark. |
| Frontend (`src/utils/stylePreviewApi.ts`) | Optionally surface `cache` flag for analytics; no functional change required. |

New Env Vars:
- `PREVIEW_CACHE_BUCKET` (default `preview-cache`)
- `PREVIEW_CACHE_TTL_DAYS` (default `30`)
- `PREVIEW_CACHE_MAX_MEMORY_ITEMS` (default `256`)
- `PREVIEW_CACHE_LOG_LEVEL` (`info|debug`)
- `PREVIEW_CACHE_FLUSH_SECRET` (for admin invalidation endpoint)

## 6. Cache Performance Modeling

### 6.1 Hit Rate Estimate
- Customers typically test 3–4 styles per image; many revisit the same styles while editing orientation.
- Autogenerated previews are off, but manual retries + token-based watermark removal reuse the same inputs.
- Expected duplication:
  - 40 % unique (new image+style combos)
  - 60 % duplicates (same inputs across retry/users)
- Hit rate grows over time as library builds; model 50 % conservative, 70 % optimistic.

### 6.2 Latency Impact
| Scenario | Current | With Cache |
| --- | --- | --- |
| Cache Miss | 3–8 s (Replicate) | 3–8 s + ~150 ms storage upload |
| Cache Hit | 3–8 s | <300 ms (Supabase Storage fetch + function overhead) |
| Cache Lookup Overhead | n/a | ~10 ms (metadata query + optional memory read) |

Average response with 60 % hits: `0.6*0.3s + 0.4*5.5s ≈ 2.3s` (vs 5.5s baseline).

### 6.3 Cost Savings
- Assume $0.08 per GPT-Image-1 call (Replicate pricing parity).
- Current: 1000 previews/day → $80/day → ~$2400/mo.
- With 60 % hit rate: 400 paid calls → $32/day → ~$960/mo.
- Savings: ~$1,440/mo. At 70 % hits → ~$1680/mo. Even after storage cost (~$10/mo) and engineering, ROI positive within first month post-deploy.

### 6.4 Cache Storage Footprint
- Average preview ~400 KB as compressed JPEG (Replicate output).
- 400 unique previews/day * 30 days → ~4.8 GB; with 30-day TTL, storage ≈$0.24/mo.
- Add 20 % headroom for finals / watermarks: <6 GB.

## 7. Risk Matrix

| Risk | Severity | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Cache poisoning (bad image cached) | High | Low | Validate Replicate outputs; only cache 200 OK responses; store checksum of downloaded asset; allow manual purge by `requestId`. |
| Cache key collision | Medium | Low | Use SHA-256 digest + full parameter set; include style version. Add uniqueness constraint on `cache_key`. |
| Storage outage / latency | Medium | Medium | Wrap storage calls in try/catch; bypass cache on failure; monitor via health checks. |
| Stale previews after prompt updates | Medium | Medium | Tie key to `style_version` derived from prompt hash/timestamp; run invalidation script post-update. |
| GDPR/right-to-be-forgotten | High | Low | Metadata table maps hashed entries to `source_request_id`; provide deletion RPC removing storage object + row. |
| Supabase cost explosion (unbounded cache) | Medium | Medium | TTL + scheduled pruning function; track `hit_count` to age out cold entries sooner. |
| Migration downtime | Medium | Low | Deploy in feature-flag mode; edge function honors `cacheBypass=true` to revert quickly; integration tests before rollout. |
| Security exposure via public URLs | Medium | Low | Use non-guessable filenames (hash), optional signed URLs (short TTL) if needed. |

## 8. Success Metrics
- Cache hit rate ≥ 60 % within 30 days.
- Cached response latency < 500 ms p95.
- Replicate spend reduced by ≥ 60 %.
- Error rate for preview function unchanged (<1 % 5xx).
- Storage growth ≤ 8 GB/mo with TTL enforcement.
- Add observability KPI: `preview_cache_hits` vs `preview_cache_misses` logged per requestId.

## 9. Testing Plan
- **Unit Tests:** hash determinism, TTL expiration, LRU eviction, metadata serialization.
- **Integration Tests:**
  - Cache miss path populates storage + metadata; returns requestId + `cache: "miss"`.
  - Cache hit without Replicate call (mock to ensure not invoked).
  - Cache bypass flag triggers live generation.
  - Expired entry triggers regeneration and metadata refresh.
  - Storage failure falls back to returning live output (with warning log).
- **Collision Test:** feed distinct inputs with same size/metadata to verify unique keys.
- **Load Test:** `scripts/measure-latency.ts` with 1000 parallel requests, 60 % duplicates; confirm average latency + zero throttling.
- **Security Test:** attempt unauthorized invalidation, ensure protected by `PREVIEW_CACHE_FLUSH_SECRET`.
- **Regression:** run `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` after changes.

## 10. Migration & Rollout Strategy
1. Ship caching code behind env flag (`PREVIEW_CACHE_ENABLED=true`).
2. Shadow mode: log would-be cache hits but still call Replicate to validate key coverage.
3. Flip to active mode once hit rate validated (>40 %).
4. Monitor logs + metrics; add Grafana panel if available.
5. Incrementally lower TTL/adjust bucket policies once stable.
6. Plan A/B test by enabling caching for 50 % of sessions (via client flag) if desired.

---

**Ready for implementation**: This plan keeps Wondertone’s premium experience central, aligns with configurator guardrails, and sets a clear path to 6–16× faster preview responses with immediate cost relief. No code changes have been committed yet; follow the founder VS Code workflow for implementation and validate with the standard lint/build/analyze/deps checks before shipping.
