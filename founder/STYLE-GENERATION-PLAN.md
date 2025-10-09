# Wondertone Founder – Style Generation V2 Plan

## North Star
- Deliver an **instant-feeling, story-driven transformation** when the user explores styles.
- Preserve **preview ownership per style** inside the session – each generated look becomes a reusable asset.
- Keep the UI **deterministic and safe** (no concurrent jobs, no lost state, graceful recovery).

---

## Experience Playbook

| Phase | User Perception | System Reality | Notes |
| ----- | ---------------- | --------------- | ----- |
| Tap on style | “The atelier is waking up” | Lock the carousel (no other taps). Fire `animating` state. | Provide tactile feedback + disable other styles. |
| Style Forge overlay | “I’m watching art being created” | Start founder preview generation promise chain. Update overlay copy per stage. | Reuse AI Analysis visuals, but change copy/icons. |
| Reveal | “Wow, the canvas updated exactly how I imagined” | Animate overlay collapse, update both studio preview + room preview, unlock UI. | Quick shimmer + audible cue (optional). |
| Returning to style | “Instant recall” | Serve cached preview URL from store, skip API, show subtle pulse. | Communicate reuse to build trust. |

---

## Interaction Rules
1. **Single job at a time**
   - `pendingStyleId` lives in store; all other taps ignored until finalized or cancelled.
   - If user taps the same style again while pending, ignore (or show “Already generating…” toast).
2. **Session cache**
   - `previews[styleId] = { url, generatedAt, orientation }`.
   - Selecting a cached style reuses the URL instantly (no animation except a “Recall” pulse).
   - Provide ability to “Refresh” from the card (optional, later).
3. **Viewport sync**
   - When preview completes:
     - Update `currentStyle` preview image (main canvas).
     - Update `CanvasInRoomPreview` fallback order to prefer cached style preview.
4. **Error handling**
   - Overlay switches to a friendly failure state with retry CTA.
   - Unlock carousel, keep previous style selected.
   - Log telemetry with error context.

---

## State Additions (useFounderStore)

```ts
stylePreviewStatus: 'idle' | 'animating' | 'generating' | 'polling' | 'watermarking' | 'ready' | 'error';
stylePreviewMessage?: string;
pendingStyleId: string | null;
previews: Record<string, { url: string; orientation: Orientation; generatedAt: number }>;
stylePreviewError?: string;
setStylePreviewState(status, message?);
setPendingStyle(styleId | null);
cachePreview(styleId, data);
```

Additional derived getters:
- `getPreviewForStyle(styleId)` – returns cached data if present.
- `isStyleInFlight(styleId)` – used to disable button & show spinner.

---

## Founder Preview Generation Utility

File: `founder/src/utils/founderPreviewGeneration.ts`

Responsibilities:
- Wrap production `generateStylePreview` with founder‑specific Supabase config.
- Return `{ previewUrl, stages }`.
- Expose `startStylePreview({ styleId, styleName, aspectRatio, image })` that:
  1. Emits `onStage('generating')`.
  2. Calls Supabase.
  3. If `processing`, enters polling loop (short intervals, e.g., 400 ms, 20 attempts).
  4. Emits `onStage('watermarking')`, runs `watermarkManager` if needed.
  5. Resolves with `{ url, isAuthenticated }`.

Stages map:  
`generating → polling → watermarking → ready` (error path short-circuits with message).

---

## UI Components

### 1. `StyleForgeOverlay`
Props: `{ status, styleName, orientationLabel, message, onCancel? }`
- Visuals:
  - Reuse gradient backdrop with animated glyphs/scanlines.
  - Steps indicator (e.g., 3 dots or timeline).
  - Status copy pulls from `stylePreviewMessage`.
  - Optional cancel/abort (future).

### 2. `StyleCard`
- Disable the card + button when `isStyleInFlight(style.id)` is true.
- Show spinner replacing “Generate” text.
- When style has cached preview, show “Ready” badge and allow immediate continue.

### 3. `StudioConfigurator`
- Render `StyleForgeOverlay` inside canvas container when `stylePreviewStatus !== 'idle'`.
- On completion, fade overlay out and update preview image.

---

## Telemetry Hooks

Emit via `emitStepOneEvent`:
```ts
emit({ type: 'preview', styleId, status: 'start' | 'polling' | 'complete' | 'error' });
```
Include error codes for debugging founder experiments.

---

## Edge Cases & Safeguards

- **Mismatch orientation**: if user changes orientation mid-generation, cancel pending job and reset overlay.
- **Upload cleared**: if user removes photo, purge `previews` & pending states.
- **Network failure**: show overlay error with `Try Again` button that restarts generation for same style.
- **Auth change mid-session**: generation returns `isAuthenticated`; we don’t persist to DB in founder mode, but keep the flag for potential future gating.
- **Polling timeout**: bubble friendly message (“Taking longer than expected… Try again.”).
- **Multiple tabs**: store is per tab; no cross-tab sync needed, but we should guard against stale `pendingStyleId` by expiring after overlay closes.

---

## Implementation Checklist

1. **State updates**
   - Add new fields & actions to `useFounderStore`.
   - Update selectors in components (studio, overlays, cards).

2. **Utility scaffolding**
   - Create `founderPreviewGeneration.ts`.
   - Wire Supabase function call using founder ENV vars.

3. **Overlay component**
   - Build `StyleForgeOverlay`.
   - Hook into `StudioConfigurator` + `StyleCarousel`.

4. **Card integration**
   - Disable concurrent taps.
   - Use cached previews for previously generated styles.

5. **Canvas sync**
   - Update `CanvasInRoomPreview` fallback order to prefer cached style preview.
   - Add subtle reveal animation when new preview arrives.

6. **Telemetry + logging**
   - Emit events per stage.
   - Console warn for founder debugging (easy removal later).

7. **QA Scenarios**
   - Generate first style → ensure overlay fades and previews update.
   - Generate second style → confirm first style shows “Ready” and reuses cached URL instantly.
   - Error injection (simulate network down) → overlay shows retry and unlocks UI.
   - Orientation switch during generation cancels gracefully.

---

## Future Enhancements

- **Progress streaming** from Edge Function (webhook or SSE) for smoother animations.
- **Batch pre-generation** of top 3 styles after first success (idle time optimization).
- **User notes** (“Tell Wondertone how to customize this style”) feeding prompt enhancer.
- **Episode history** (keep generated previews in a timeline for social sharing).

---

## Guiding Principle
> The user should feel like they stepped into Wondertone’s studio: every tap sets machinery in motion, the result arrives with ceremony, and nothing is lost along the way. V2 isn’t just faster—it’s theatrical, reliable, and ready to scale back into production.

---

## Phased Execution Roadmap

### Phase 0 – Foundations & Safeguards
- **State scaffolding**: add pending status, per-style cache, and status messages to `useFounderStore` without wiring UI. Include unit tests for selectors/helpers.
- **API harness**: create `founderPreviewGeneration.ts` with mocked responses + small Storybook/dev harness, ensuring it can swap between a stub and the production Supabase function via env flags.
- **Supabase credentials audit**: confirm founder environment variables, rate limits, and edge function availability; document fallback behaviour if the function is unreachable.
- **Cancellation semantics**: design and implement store-driven cancellation (orientation change, upload removal) so no ghost jobs linger before UI work starts.

### Phase 1 – Style Forge Overlay & UX Shell
- Build `StyleForgeOverlay` with animation placeholders; drive it purely from store state (manual toggles via debug panel).
- Update `StudioConfigurator` and `StyleCarousel` to render/lock based on store without hitting the network yet (simulate stages via mocked callbacks).
- Add golden-path Cypress test: tapping a style shows overlay, locks other cards, and releasing returns to idle.

### Phase 2 – API Integration & Polling ✅
- Overlay now streams live Supabase/Replicate stages (with `VITE_FOUNDER_PREVIEW_MODE` defaulting to `live`).
- Error cases bubble through the overlay with graceful recovery and automatic unlock/timeout reset.
- Generated previews cache per style/orientation and are immediately reused on reselection; state cleared when uploads change.
- Telemetry emits `preview:start`, stage updates, `preview:complete`, and `preview:error` for founder analytics.

### Phase 3 – Multi-Viewport Sync & Persistence ✅
- Studio + in-room preview now source from the shared cache; orientation changes reuse the correct variant when available.
- Added a capped in-memory LRU (12 entries) that resets on new uploads and is trimmed automatically.
- Introduced a “Refresh Preview” action that forces regeneration while still obeying the single-job lock.

### Phase 4 – Production Parity Gates
- Validate prompts + style metadata: ensure each style in founder has an existing prompt entry in the Supabase style prompt table or provide founder-specific overrides. *(Script: `npm run check:prompts` – requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)*
- Run load-test script (sequence through top styles) to evaluate Replicate throughput and caching hit rate. *(Script: `npm run loadtest:styles` – set `TEST_IMAGE_URL` as needed)*
- Final polish: audio/visual cues, accessibility sweep, copy review, analytics dashboards.

### Phase 5 – Launch Readiness & Cutover Path
- Document rollback plan (feature flag, cached preview invalidation). 
- Provide post-launch monitoring checklist (Supabase logs, Replicate errors, watermark worker failures).
- Prepare migration notes to backport the V2 approach into production (shared utilities, prompt schema changes, cache compatibility).

---

## Current Implementation Snapshot (for next agent)

### Core Files & Responsibilities
- **`founder/src/store/useFounderStore.ts`** – central state: single-job lock, overlay status/messages/errors, per-orientation preview cache (LRU capped at 12), preview timing (`stylePreviewStartAt`), telemetry + success chime triggers. Actions include `startStylePreview(style, { force? })`, `cacheStylePreview`, `getCachedStylePreview`, and orientation-aware reuse logic.
- **`founder/src/utils/founderPreviewGeneration.ts`** – orchestrator calling Supabase/Replicate via shared utilities; defaults to live mode, respects `VITE_FOUNDER_PREVIEW_MODE=stub` for simulations.
- **`founder/src/utils/previewGeneration.ts`**, **`stylePreviewApi.ts`**, **`previewPolling.ts`**, **`watermarkManager.ts`**, **`src/workers/watermark.worker.ts`** – production-grade pipeline translated for founder: invoke `generate-style-preview`, poll status, watermark in worker, return final URL.
- **`founder/src/utils/previewAnalytics.ts`** – emits console + `founder-preview-analytics` events with stage timing.
- **`founder/src/utils/playPreviewChime.ts`** – lightweight success audio cue; resumes the AudioContext if suspended.
- **UI layers**:
  - `founder/src/components/studio/StyleForgeOverlay.tsx` – accessible overlay, stage copy, progress indicator.
  - `founder/src/sections/StudioConfigurator.tsx` – integrates overlay, locks cards, exposes “Refresh Preview” button (force regeneration), pushes cached previews into the canvas.
  - `founder/src/components/studio/CanvasInRoomPreview.tsx` – mirrors studio preview, honouring per-orientation cache.
- **Scripts**:
  - `founder/scripts/check-style-prompts.mjs` (`npm run check:prompts`) – verifies Supabase prompt entries for founder styles.
  - `founder/scripts/load-test-styles.mjs` (`npm run loadtest:styles`) – sequential load test against Replicate/Supabase (requires env vars + optional `TEST_IMAGE_URL`).

### Status Summary
- **Phase 0–3** implemented: overlay UX, live generation/polling, orientation-aware caching, multi-viewport sync, manual refresh, telemetry, audio cue.
- **Phase 4** scaffolding ready (scripts + success/error messaging) but requires Supabase credentials to execute prompt audit/load test; polish tasks (accessibility/A11Y sweep, copy review, dashboards) remain outstanding.
- **Phase 5** not yet started.

### Outstanding Tasks
1. Run `npm run check:prompts` with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; capture missing styles and either patch Supabase or provide founder overrides.
2. Execute `npm run loadtest:styles` (needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, optional `TEST_IMAGE_URL`) to benchmark throughput/cache hits; note failures/timeouts.
3. Final polish: confirm overlay focus order/reduced-motion behaviour, review copy, hook analytics dashboards to `founder-preview-analytics`, validate audio cue accessibility.
4. Prep Phase 5 documentation/rollback plan once parity checks are complete.

### Nice-to-Have Enhancements
- Real-time progress streaming (webhooks/SSE) to reduce polling latency.
- Background pre-generation of popular styles after first success for instant recalls.
- Preview history timeline (UI for switching between generated looks).
- Prompt experimentation toggles (A/B testing prompt variants per style).

### Required Environment Variables
- **Runtime**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_FOUNDER_PREVIEW_MODE=stub`.
- **Scripts**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, optional `TEST_IMAGE_URL`.
