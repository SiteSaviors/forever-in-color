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
| `PREVIEW_ASYNC_ENABLED` | `false` | Toggles webhook-driven async generation. When `true`, clients receive a `requestId` for polling. |
| `PREVIEW_WEBHOOK_BASE_URL` | — | Public base URL (no trailing slash) for invoking the webhook endpoint. Required when async is enabled. |
| `PREVIEW_WEBHOOK_SECRET` | — | Shared secret appended to webhook callback for verification. Required when async is enabled. |

## Database Objects
- Table: `preview_cache_entries` (metadata, TTL, hit counters). RLS allows service role access only.
- Table: `previews_status` (request tracking for async generation). RLS limited to service role.
- Function: `increment_preview_cache_hit(cache_key text)` to record asynchronous hit counts.
- Trigger: `trg_touch_previews_status` keeps `updated_at` fresh on status updates.

## Storage Policy
- Objects are stored under `styleId/quality/aspectRatio/imageDigest.jpg` using hashed filenames.
- For sensitive content, switch to signed URLs by tightening the storage client (future enhancement).

## Operational Runbook
1. **Shadow mode**: Set `PREVIEW_CACHE_ENABLED=false` while deploying to observe would-be hits in logs.
2. **Async rollout**: Enable `PREVIEW_ASYNC_ENABLED=true` only after configuring the webhook base URL + secret. Keep an eye on `/status` responses before removing the legacy polling path.
3. **Monitoring**: Filter logs by `cacheStatus` (`hit`, `miss`, `bypass`). Target ≥60% hits and <500 ms p95 for cached responses. Track async queue health via `previews_status.status`.
4. **Manual purge**:
   - Delete rows from `preview_cache_entries` by `style_id` or `image_digest`.
   - Remove corresponding objects from the Storage bucket.
5. **GDPR deletion**: Use `image_digest` map to locate assets, remove Storage object, delete metadata row.
6. **Rollback**: Toggle `PREVIEW_CACHE_ENABLED=false` and/or `PREVIEW_ASYNC_ENABLED=false`, clear memory cache by redeploying, optionally empty metadata table/storage if needed.

## Testing
- `deno test supabase/functions/generate-style-preview/cache/__tests__`
- Application consistency checks: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.

## Notes
- `style_prompts.updated_at` (or explicit `version`) builds cache keys so prompt updates naturally bust caches.
- Preview URLs returned to clients remain stable CDN URLs; failures in caching fall back to the base Replicate output.
