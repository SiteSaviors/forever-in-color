# Generate Style Preview Edge Function

This function powers Wondertone’s AI preview generation. Phase 2 introduces hybrid output caching to serve repeat requests quickly while protecting fallbacks and configurator flow.

## Caching Overview
- **Memory cache**: In-memory LRU per edge worker (size configurable via `PREVIEW_CACHE_MAX_MEMORY_ITEMS`).
- **Persistent cache**: Supabase Storage + Postgres metadata (`preview_cache_entries`).
- **Cache key inputs**: Style ID + version, image digest, aspect ratio, quality, watermark flag.
- **TTL**: Defaults to 30 days (`PREVIEW_CACHE_TTL_DAYS`).
- **Bypass**: Clients can set `cacheBypass` in the request body for diagnostics / forced refreshes.

## Environment Variables
| Variable | Default | Purpose |
| --- | --- | --- |
| `PREVIEW_CACHE_ENABLED` | `true` | Master flag to enable storage+memory caching. Set `false` to revert to on-demand generation. |
| `PREVIEW_CACHE_BUCKET` | `preview-cache` | Supabase Storage bucket for cached previews. Must exist with public read access via CDN. |
| `PREVIEW_CACHE_TTL_DAYS` | `30` | Retention period for cached previews. |
| `PREVIEW_CACHE_MAX_MEMORY_ITEMS` | `256` | Memory cache capacity per edge instance. Set to `0` to disable in-memory caching. |
| `PREVIEW_CACHE_LOG_LEVEL` | `info` | Structured log verbosity (`debug`, `info`, `warn`, `error`). |
| `PREVIEW_CACHE_FLUSH_SECRET` | _optional_ | Reserve for future admin purge endpoint. |

## Database Objects
- Table: `preview_cache_entries` (metadata, TTL, hit counters). RLS allows service role access only.
- Function: `increment_preview_cache_hit(cache_key text)` to record asynchronous hit counts.

## Storage Policy
- Objects are stored under `styleId/quality/aspectRatio/imageDigest.jpg` using hashed filenames.
- For sensitive content, switch to signed URLs by tightening the storage client (future enhancement).

## Operational Runbook
1. **Shadow mode**: Set `PREVIEW_CACHE_ENABLED=false` while deploying to observe would-be hits in logs.
2. **Monitoring**: Filter logs by `cacheStatus` (`hit`, `miss`, `bypass`). Target ≥60% hits and <500 ms p95 for cached responses.
3. **Manual purge**:
   - Delete rows from `preview_cache_entries` by `style_id` or `image_digest`.
   - Remove corresponding objects from the Storage bucket.
4. **GDPR deletion**: Use `image_digest` map to locate assets, remove Storage object, delete metadata row.
5. **Rollback**: Toggle `PREVIEW_CACHE_ENABLED=false`, clear memory cache by redeploying, optionally empty metadata table/storage if needed.

## Testing
- `deno test supabase/functions/generate-style-preview/cache/__tests__`
- Application consistency checks: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.

## Notes
- `style_prompts.updated_at` (or explicit `version`) builds cache keys so prompt updates naturally bust caches.
- Preview URLs returned to clients remain stable CDN URLs; failures in caching fall back to the base Replicate output.
