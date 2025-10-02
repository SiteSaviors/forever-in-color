# Generate-Style-Preview: Acceptance Checklists

This page tracks the v2 pilot, measurement plan, cleanup guards, and flip/rollback. Use it as a literal checklist.

## Goals
- [ ] Reduce p95 latency and compute by removing server-side polling (v2 via webhook)
- [ ] Preserve request/response shape and codes to avoid client regressions
- [ ] Add an on/off flag for instant rollback
- [ ] Clean up dead code to shrink cold-start surface

## Current Layout (Quick Map)
- Entry: `supabase/functions/generate-style-preview/index.ts` (Deno `serve`, CORS, validation, env, Supabase, Replicate)
- Prompt fetch: `stylePromptService.ts` (DB: `style_prompts`), fallback string
- Replicate orchestration: `replicateService.ts` (retry + prompt enhancer + polling service)
- Polling: `replicate/pollingService.ts` (2s interval, 30 attempts)
- Errors/retry: `errorHandling.ts` (`executeWithRetry`, backoff = max(retry-after, exponential))

---

## V2 Pilot Parity
- [ ] Schema parity: inputs match `requestValidator.ts` (`imageUrl`, `style`, `aspectRatio`, `quality` with legacy normalization)
- [ ] Response shape: success uses `createSuccessResponse` keys (`preview_url`, `requestId`, `duration`, `timestamp`); errors use `createErrorResponse`
- [ ] HTTP codes: `200` success, `400` invalid, `503` generation_failed, `500` internal (align with `index.ts` success/failure paths)
- [ ] Prompt parity: use `StylePromptService.getStylePrompt` + same fallback copy; apply `PromptEnhancer` rules from `replicate/config.ts`
- [ ] Auth keys: read `OPENAI_API_KEY` and `REPLICATE_API_TOKEN`; return configuration error if missing
- [ ] Logging parity: diagnostic logs include `requestId`, aspect/quality, prompt length; record `duration`

Notes:
- v2 POST to Replicate should omit `Prefer: "wait"` and include a webhook URL + secret. Keep the same request body fields (`prompt`, `input_images`, `openai_api_key`, `aspect_ratio`, `quality`).

---

## p50/p95 Validation Procedure
- [ ] Scenarios: measure cold and warm starts separately; run both low-load and burst tests
- [ ] Sample size: target N=100 per scenario per version (v1 vs v2)
- [ ] Warm-up: 5–10 warm-up calls before timed runs
- [ ] Collection (v1, synchronous): parse `.duration` if present; fallback to wall time
- [ ] Collection (v2): if synchronous, same as v1; if `202` async, measure end-to-end (request→completion) by polling a status endpoint or reading a Supabase row keyed by `requestId`
- [ ] Stats: compute min/avg/p50/p95/max and error rate

Example commands (set `URL`/`URL_V2` first):

```zsh
# Warm-up (v1)
for i in {1..10}; do \
  node scripts/measure-latency.ts --url "$URL" --body-inline '{"imageUrl":"data:image/png;base64,","style":"Classic Oil Painting","aspectRatio":"1:1","quality":"medium"}' \
  --count 1 --concurrency 1 --warmup 0 >/dev/null; \
  done

# Timed run (v1)
node scripts/measure-latency.ts --url "$URL" \
  --body-inline '{"imageUrl":"data:image/png;base64,","style":"Classic Oil Painting","aspectRatio":"1:1","quality":"medium"}' \
  --count 100 --concurrency 5 --out v1_durations.txt

# Timed run (v2)
node scripts/measure-latency.ts --url "$URL_V2" \
  --body-inline '{"imageUrl":"data:image/png;base64,","style":"Classic Oil Painting","aspectRatio":"1:1","quality":"medium"}' \
  --count 100 --concurrency 5 --out v2_durations.txt

# Quick stats dump is printed as JSON by the script (min/avg/p50/p95/max)
```

If you must compute p50/p95 manually from the raw files:

```zsh
awk '{print $2}' v1_durations.txt | sort -n | awk 'BEGIN{c=0} {a[c++]=$1} END{p50=a[int(0.50*c)]; p95=a[int(0.95*c)]; printf("p50=%sms p95=%sms\n",p50,p95)}'
```

---

## Safe-Delete Search/Guards
Targets (must have zero imports):
- [ ] `supabase/functions/generate-style-preview/openaiService.ts`
- [ ] `supabase/functions/generate-style-preview/imageGenerationService.ts`
- [ ] `supabase/functions/generate-style-preview/canvasWatermarkService.ts`
- [ ] `supabase/functions/generate-style-preview/stylePrompts.ts`
- [ ] `supabase/functions/generate-style-preview/types.ts` (function root, not `replicate/types.ts`)
- [ ] Candidate: `supabase/functions/generate-style-preview/imageUtils.ts` (imported in `index.ts` but unused)

Repo-wide checks:
```zsh
# Direct imports (should return nothing)
grep -R --line-number --include='*.ts' "from './openaiService" supabase/functions/generate-style-preview || true
grep -R --line-number --include='*.ts' "from './imageGenerationService" supabase/functions/generate-style-preview || true
grep -R --line-number --include='*.ts' "from './canvasWatermarkService" supabase/functions/generate-style-preview || true
grep -R --line-number --include='*.ts' "from './stylePrompts" supabase/functions/generate-style-preview || true
grep -R --line-number --include='*.ts' "from './types'\" supabase/functions/generate-style-preview | grep -v 'replicate/types' || true

# Dynamic import guard (should not reference targets)
grep -R --line-number --include='*.ts' "import\\(" supabase/functions/generate-style-preview | \
  grep -E "openaiService|imageGenerationService|canvasWatermarkService|stylePrompts|/types\\.ts" || true

# Dead code tools
npm run dead-code:check
npm run lint:unused
```

Keep-for-now (exclude from deletion without owner sign-off):
- `imageAnalysisService.ts` (unused but plausible future analysis)
- `watermarkService.ts` (dynamic Imagescript import; keep isolated and not imported by `index.ts`)

---

## Production Flip & Rollback
- [ ] Gate flag: introduce `USE_GENERATE_PREVIEW_V2` env; router reads it at request time (or boot) to choose v1 vs v2
- [ ] Webhook: configure Replicate webhook URL to v2 handler; set shared secret; verify signature; accept `succeeded|failed|canceled`
- [ ] Canary: route 10–20% to v2; monitor p50/p95 + error rate + logs; compare to v1
- [ ] Success criteria: p95 improves vs v1; error rate not worse; no schema/code regressions
- [ ] Flip: set flag to 100% v2; keep v1 deployed for one release window
- [ ] Rollback: toggle `USE_GENERATE_PREVIEW_V2=false`; optionally disable Replicate webhook to stop callbacks

---

## Notes & Tips
- Use identical prompts and params for apples-to-apples latency comparisons.
- Node 18+ recommended for the metric harness (built-in `fetch`).
- For v2 async, prefer persisting completion to Supabase with `requestId`; the harness can be extended to poll your status endpoint.
