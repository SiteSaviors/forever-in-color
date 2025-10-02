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

With this roadmap, either assistant can pick up the implementation knowing the sequence, configuration knobs, and validation expectations. Feel free to append additional notes as research progresses.
