# Edge Function Prompt Pre-Warming & Caching Roadmap

This guide captures the shared implementation plan for Optimization #5. It is written for both Codex and Claude so we stay aligned on priorities, sequencing, and safeguards while improving preview throughput.

---

## 1. Objectives
- **Reduce median and p95 latency** for the `generate-style-preview` edge function by eliminating repeated Supabase prompt lookups and redundant Replicate calls.
- **Maintain output fidelity**—prompt content must remain consistent with the values stored in the `style_prompts` table and existing fallbacks.
- **Keep the rollout reversible** (feature flags + clear instrumentation) in case of regressions.

---

## 2. Current Behaviour Summary (Baseline)
- Each request to `generate-style-preview/index.ts`:
  1. Validates payload and normalizes the source image (may fetch remote URLs).
  2. Instantiates a Supabase client and calls `StylePromptService.getStylePrompt(styleName)` which hits the `style_prompts` table on every invocation.
  3. Builds a `ReplicateService` and calls `generateImageToImage`, which immediately executes Replicate’s API and (when needed) falls back to polling via `replicate/pollingService.ts`.
  4. Returns the pre-signed output URL (no caching of previous generations).
- There is **no prompt caching** or output memoization; repeated requests for the same style within a short window cause identical Supabase + Replicate work.

---

## 3. Phase 1 – Prompt Pre-Warming Plan
### 3.1 Baseline Measurement
- Instrument timing around:
  - Supabase prompt fetch (inside `StylePromptService.getStylePrompt`).
  - Replicate request/response cycle (already logged but add `durationMs`).
- Capture data for at least 50–100 requests in staging:
  - Record style name, cache hit/miss (once caching is added), total duration, and Replicate duration separately.
  - Store metrics via console logs (Supabase logs) and optionally a temporary Supabase `preview_metrics` table.

### 3.2 Design Decisions
- **Cache container:** in-memory map inside the edge function module (Deno runtime allows module-level singletons). Structure: `Map<styleName, { prompt: string; fetchedAt: number }>`.
- **TTL:** 15 minutes default (configurable via env `PROMPT_CACHE_TTL_MS`). Justification: style prompts change infrequently while still allowing manual updates to propagate.
- **Warmup strategy:**
  - On cold start, either rely on lazy caching (first request populates) or proactively load the top N styles (configurable array) after environment validation succeeds.
  - Provide feature flag `ENABLE_PROMPT_CACHE` to toggle caching without redeploying code.
- **Invalidation:**
  - For Phase 1, rely on TTL expiry.
  - Document manual invalidation procedure (e.g., toggle feature flag or redeploy) if prompts change.
- **Error Handling:**
  - Cache should only store successful fetches; if Supabase returns an error or null prompt, fall back to existing string and avoid caching empties unless the style truly lacks a prompt.

### 3.3 Implementation Steps
1. Add module-level cache utility (new file `promptCache.ts`):
   - Functions: `getPrompt(styleName)`, `setPrompt(styleName, prompt)`, `invalidate(styleName?)`, `warmup(initialStyles[])`.
   - Respect TTL + optional logging (`console.log('[prompt-cache]', { styleName, hit: true, age })`).
2. Update `StylePromptService.getStylePrompt` call site in `index.ts`:
   - Check cache before hitting Supabase.
   - Populate cache after successful fetch.
3. Introduce config + feature flag helpers (e.g., `resolvePromptCacheConfig()` in `environmentValidator.ts`):
   - Validate TTL and warmup list.
4. Optional warmup invocation after environment validation (make list configurable via comma-separated env, default to top-performing styles).
5. Extend logs to include: `cacheHit`, `cacheAgeMs`, `promptFetchMs`, `replicateDurationMs`, `totalDurationMs` (see `[prompt-cache]` and `[preview-metrics]` console channels).
6. Guard everything behind `ENABLE_PROMPT_CACHE` (default `false` in production until rollout).

### 3.4 Testing & Validation
- Unit-style tests (Deno) for cache utility functions (TTL expiration, invalidation).
- Manual QA:
  - With cache disabled: baseline behaviour unchanged.
  - With cache enabled: verify first request logs `cacheHit=false`, subsequent requests within TTL log `cacheHit=true` and skip Supabase query.
- Performance validation: compare median/p95 latency before vs after enabling cache using the instrumentation from 3.1.

### 3.5 Rollout Strategy
1. Deploy with cache code but disabled (`ENABLE_PROMPT_CACHE=false`).
2. Flip flag in staging, verify metrics.
3. Enable in production during low-traffic window, monitor logs for increased success rate / lower latency.
4. Document how to revert (`ENABLE_PROMPT_CACHE=false` or redeploy previous build).

---

## 4. Phase 2 – Preview Output Caching (For Future Planning)
### Objectives
- Avoid repeated Replicate calls when identical `(imageUrl, style, aspectRatio, quality)` combinations are requested within a short window.
- Reuse generated preview URLs or store them (with TTL) in Supabase to reduce load.

### Considerations
- Cache key should incorporate a stable hash of the normalized image + style parameters.
- Decide on storage layer:
  - **In-memory only** (fast but non-persistent; good for quick retries).
  - **Supabase table** (persistent; allows sharing across edge function instances but requires cleanup + security review).
- Need to verify Replicate output URL lifetime; if pre-signed URLs expire quickly, consider storing the asset in Supabase storage or a CDN bucket.

### High-Level Steps
1. Extend request validation to generate a deterministic key.
2. Implement cache lookup (likely Supabase table with columns: key, preview_url, created_at, ttl_expiry).
3. On cache hit, return cached URL and skip Replicate; on miss, proceed with generation and store result.
4. Add periodic cleanup job or TTL check to avoid stale/costly storage.
5. Update metrics to distinguish between cache hits/misses and measure throughput improvements.

### Risks & Safeguards
- Ensure cached previews are still accessible (handle expired URLs by re-generating and updating cache).
- Respect user-specific data (if previews should not be shared across users, include userID in cache key or skip caching for private content).
- Add kill switch (`ENABLE_PREVIEW_CACHE`).

---

## 5. Observability & Tooling
- Leverage existing console logs (captured by Supabase) for real-time monitoring.
- Consider emitting structured logs or storing metrics in Supabase `profile_metrics` table for long-term tracking.
- Document playbook for investigating anomalies: check cache hit rates, TTL expiry enforcement, fallback errors.

---

## 6. Open Questions / Follow-ups
1. **Prompt Updates:** Does the team need a CLI or dashboard button to invalidate prompt cache when marketing tweaks copy? (Optional but useful.)
2. **Warmup Styles:** Confirm which styles have highest traffic to prioritize in warmup (analytics required).
3. **Preview CDN:** Long-term plan could include moving generated previews into Wondertone’s storage/CDN for re-use.
4. **CI Coverage:** Determine if we want automated tests (Deno test suite) for cache logic or rely on manual QA + logging.
5. **Security:** Ensure storing preview URLs respects privacy policies (especially if users can upload sensitive images).

---

## 7. Environment Variables & Configuration

### Required Environment Variables

**Cache Control:**
```bash
# Feature flag - defaults to false for safety
ENABLE_PROMPT_CACHE=false

# Optional: TTL in milliseconds (default: 900000 = 15 minutes)
PROMPT_CACHE_TTL_MS=900000

# Optional: Comma-separated list of styles to pre-warm on cold start
PROMPT_CACHE_WARMUP_STYLES=classic-oil-painting,watercolor-dreams,modern-abstract
```

**Existing Required Variables:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
```

### Configuration Examples

**Development/Testing (cache disabled):**
```bash
ENABLE_PROMPT_CACHE=false
```

**Staging (cache enabled, no warmup):**
```bash
ENABLE_PROMPT_CACHE=true
PROMPT_CACHE_TTL_MS=900000
```

**Production (cache enabled with warmup for top 5 styles):**
```bash
ENABLE_PROMPT_CACHE=true
PROMPT_CACHE_TTL_MS=1800000  # 30 minutes
PROMPT_CACHE_WARMUP_STYLES=classic-oil-painting,watercolor-dreams,modern-abstract,vintage-poster,digital-illustration
```

### Cache Invalidation Procedures

**Manual Cache Clear (when prompts are updated):**
1. **Option A - Toggle feature flag:**
   ```bash
   # Disable cache (clears on next cold start)
   ENABLE_PROMPT_CACHE=false

   # Re-enable after a few minutes
   ENABLE_PROMPT_CACHE=true
   ```

2. **Option B - Update TTL to force expiry:**
   ```bash
   # Set very short TTL temporarily
   PROMPT_CACHE_TTL_MS=1000  # 1 second

   # Restore normal TTL after cache expires
   PROMPT_CACHE_TTL_MS=900000
   ```

3. **Option C - Redeploy Edge Function:**
   ```bash
   supabase functions deploy generate-style-preview
   ```
   Cold start will reset cache completely.

**Automatic Expiry:**
- All cache entries auto-expire after `PROMPT_CACHE_TTL_MS` (default 15 minutes)
- Stale entries are automatically purged on next access attempt

---

## 8. Deployment & Validation Guide

### Phase 1A: Baseline Deployment (Cache Disabled)

**Step 1: Deploy with cache code but disabled**
```bash
# Ensure feature flag is OFF
ENABLE_PROMPT_CACHE=false

# Deploy to staging
supabase functions deploy generate-style-preview --project-ref <staging-project>
```

**Step 2: Verify baseline behavior unchanged**
- Test 10-20 preview requests with various styles
- Confirm no `[prompt-cache]` logs appear (cache is disabled)
- Verify existing `[preview-metrics]` logs show normal latency
- Check no errors or regressions

### Phase 1B: Staging Validation (Cache Enabled)

**Step 1: Enable cache in staging**
```bash
# Set environment variables in Supabase dashboard or CLI
supabase secrets set ENABLE_PROMPT_CACHE=true --project-ref <staging-project>
supabase secrets set PROMPT_CACHE_WARMUP_STYLES=classic-oil-painting,watercolor-dreams --project-ref <staging-project>
```

**Step 2: Trigger cold start & monitor warmup**
```bash
# Redeploy to trigger cold start
supabase functions deploy generate-style-preview --project-ref <staging-project>

# Watch logs in real-time
supabase functions logs generate-style-preview --project-ref <staging-project> --follow
```

**Step 3: Verify cache behavior**
- **Expected warmup logs:**
  ```json
  [prompt-cache] { action: "warmup_populate", styleName: "classic-oil-painting", timestamp: "2024-..." }
  [prompt-cache] { action: "warmup_populate", styleName: "watercolor-dreams", timestamp: "2024-..." }
  ```

- **First request for warmed style:**
  ```json
  [prompt-cache] { action: "hit", style: "classic-oil-painting", requestId: "req_...", source: "warmup", ageMs: 234 }
  ```

- **First request for non-warmed style:**
  ```json
  [prompt-cache] { action: "miss", style: "modern-abstract", requestId: "req_...", fetchDurationMs: 87, source: "db" }
  ```

- **Second request for same style (within TTL):**
  ```json
  [prompt-cache] { action: "hit", style: "modern-abstract", requestId: "req_...", source: "db", ageMs: 5432 }
  ```

**Step 4: Performance validation**
- Send 50-100 requests to same style within 15 minutes
- Compare `[preview-metrics]` before/after:
  - **Cache disabled:** `totalDurationMs` includes ~50-200ms Supabase fetch time
  - **Cache enabled (hits):** `totalDurationMs` reduces by 45-195ms per request
- Calculate cache hit rate: `(hits / total_requests) * 100%`
- Target: >70% hit rate after initial warmup

### Phase 1C: Production Rollout

**Step 1: Enable during low-traffic window**
```bash
# Enable cache with extended TTL and top 5 styles
supabase secrets set ENABLE_PROMPT_CACHE=true --project-ref <production-project>
supabase secrets set PROMPT_CACHE_TTL_MS=1800000 --project-ref <production-project>
supabase secrets set PROMPT_CACHE_WARMUP_STYLES=classic-oil-painting,watercolor-dreams,modern-abstract,vintage-poster,digital-illustration --project-ref <production-project>

# Redeploy to activate
supabase functions deploy generate-style-preview --project-ref <production-project>
```

**Step 2: Monitor for 1-2 hours**
- Watch `[preview-metrics]` logs for:
  - Reduced `totalDurationMs` on cache hits
  - No increase in error rates
  - `promptCacheHit: true` appearing in success logs
- Check Supabase dashboard for reduced `style_prompts` table queries

**Step 3: Rollback procedure (if needed)**
```bash
# Instant disable - no redeploy needed
supabase secrets set ENABLE_PROMPT_CACHE=false --project-ref <production-project>

# Wait 1-2 minutes for config to propagate
# Next cold start will run without cache
```

### Success Metrics

**Target Performance Improvements:**
- **Median latency:** -30ms to -100ms (cache hit rate dependent)
- **p95 latency:** -150ms to -200ms (for cached styles)
- **Supabase load:** -70% to -90% reduction in `style_prompts` queries
- **Cache hit rate:** >70% after 1 hour of production traffic

**Health Indicators:**
- Zero increase in error rate after enabling cache
- `[prompt-cache]` logs show consistent hits for top styles
- `[preview-metrics]` shows `promptCacheHit: true` for majority of requests
- No `warmup_error` or `fetch_error` logs

---

## 9. Implementation Notes & Optimizations

### Warmup Timing Optimization
**Issue:** Original implementation triggered warmup inside request handler, causing redundant checks on every request.

**Solution:** Module-level initialization closure that ensures warmup runs exactly once on first request:
```typescript
// Module-level warmup initialization - runs once on cold start
const initializeWarmup = (() => {
  let initialized = false;
  return (stylePromptService: any) => {
    if (initialized) return;
    initialized = true;

    const config = getPromptCacheConfig();
    if (config.enabled) {
      schedulePromptWarmup((styleName) => stylePromptService.getStylePrompt(styleName));
    }
  };
})();
```

**Benefits:**
- Warmup triggered exactly once per Edge Function instance lifecycle
- No redundant config checks on subsequent requests
- Still lazy (requires Supabase client from first request)
- Fire-and-forget: doesn't block first user request

### Cache Architecture
- **In-memory Map** at module level (survives across requests in Deno runtime)
- **TTL-based expiry** with automatic cleanup on access
- **Three source types:** `db` (Supabase), `fallback` (generated string), `warmup` (pre-loaded)
- **Normalized keys:** Case-insensitive with whitespace trimming
- **Feature flag first:** All cache logic short-circuits if `ENABLE_PROMPT_CACHE=false`

---

With this roadmap, either assistant can pick up the implementation knowing the sequence, configuration knobs, and validation expectations. Feel free to append additional notes as research progresses.
