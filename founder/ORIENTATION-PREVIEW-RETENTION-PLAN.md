# Wondertone Founder Flow — Orientation-Persistent Preview Plan

## Why This Matters
- Users expect previously generated previews to stay visible when they explore new orientations. Losing the artwork breaks momentum and risks duplicate API spend.
- Orientation swaps are central to Step One, so the interaction must remain smooth, performant, and telemetry-safe while honoring existing guardrails (StepOneExperience provider, `usePreviewGeneration`, Supabase contracts).

## Current Architecture Snapshot
- **Orientation handling (`setOrientation`)** – updates `orientation`, attempts to hydrate from `stylePreviewCache`, otherwise sets preview state back to `idle` (founder/src/store/useFounderStore.ts:884-928).
- **Orientation selector (`StickyOrderRail`)** – triggers smart crop generation, calls `resetPreviews()`, then repopulates “Original Image” style and (optionally) regenerates styles (founder/src/components/studio/StickyOrderRail.tsx:51-123).
- **Preview storage** – `previews` map holds the active entry per style; `stylePreviewCache` already differentiates entries by `styleId + orientation` (founder/src/store/useFounderStore.ts:135, 460-508).
- **Reset blast radius** – `resetPreviews()` clears all `previews`, cache, pending style, and live status (founder/src/store/useFounderStore.ts:701-712). This is why orientation swaps blank the canvas.
- **Crop integration** – Changing orientation recalculates smart crops and reassigns `croppedImage`/`uploadedImage`, which we rely on to seed “Original Image” previews.

## Pain Points to Address
1. **Preview loss on orientation change** – `resetPreviews()` purges cache before `setOrientation` can reuse it.
2. **Jarring UI** – Canvas drops to idle while a new orientation preview is pending.
3. **Mixed orientation caches** – We already store orientation-specific previews; the UI never exposes them.
4. **Crop alignment** – Landscape ↔ portrait requires either re-cropping guidance or graceful fallback without losing the current image.
5. **Cross-style glide** – Users should be able to rotate orientation and immediately tap into any style that already generated for that orientation without waiting.

## Design Principles
- **Never drop the current preview** unless the user explicitly resets or the data becomes invalid.
- **Reuse cached renders first**, background-generate second, prompt for crop only when required.
- **Maintain telemetry + Supabase contracts** by routing all new renders through existing hooks (`startStylePreview`, `usePreviewGeneration`).
- **Keep StepOneExperience signals** intact when orientation changes (emit events, maintain progress indicators).
- **Avoid duplicate API calls** by debouncing orientation flips (orientationChanging flag) and honoring cache size limits.

## Proposed Workflow
1. **Augment orientation handling**
   - Introduce a helper (e.g., `setOrientationWithPreviewPersistence`) that:
     - Checks `stylePreviewCache[styleId][nextOrientation]`.
     - If found, swap canvas immediately and keep `previews[styleId]` pointing at the cached data.
     - If missing, keep the current preview visible, mark a `previewOrientationPending` flag, and asynchronously trigger generation via `startStylePreview(currentStyle, { force: true, orientationOverride: nextOrientation })`.
   - Only flush cache when the user uploads a new source image.

2. **Refine `resetPreviews` usage**
   - Split into two actions:
     - `clearPreviewsForNewSource()` – current aggressive reset (called when a new image or manual crop invalidates all previews).
     - `softResetForOrientation()` – removes outdated entries for orientations that no longer match crop data but preserves valid cached renders.
   - Ensure orientation swaps call the soft variant; full reset remains for new uploads or explicit “start over” events.

3. **Canvas behavior**
   - In `StudioConfigurator`, allow the preview component to render from either:
     - Active orientation preview (preferred).
     - Last-known orientation preview while new orientation is pending (show a ribbon: “Reframing for Landscape…”).
   - If we ultimately need a new crop, pause the orientation switch with UI guidance instead of wiping the preview.

4. **Smart crop integration**
   - When orientation changes:
     - Use cached smart crop if available (`smartCrops[orient]`).
     - If not, generate asynchronously but keep the previous crop active until the new one arrives.
     - Once the crop is ready, update `croppedImage`/`uploadedImage`, store per-orientation crop metadata (already handled), and then sync previews.
   - Provide a fallback path (center-fit with blur edges) if AI crop fails, preserving the preview continuity.

5. **Cross-style glide**
   - When a user taps another style:
     - Maintain orientation context and reuse cached orientation previews.
     - If the style has a cached entry for the current orientation, show instantly (already supported by `cacheStylePreview`).
     - Otherwise, keep the prior style’s preview on screen and run the new generation in the background, updating the UI once ready.

6. **State additions**
   - `orientationPreviewPending: boolean` – toggled when we’re regenerating for a new orientation.
   - `orientationLastStable: Orientation` – track the orientation that matches the currently displayed preview for fallback messaging.
   - Optional `previewFallbackUrl` to hold the last rendered image while the new one loads.

7. **Telemetry & UX polish**
   - Emit StepOneExperience events (`emitStepOneEvent`) for orientation pivot start/complete.
   - Update StyleForge overlay copy for orientation remixes (“Reframing crop…”, “Adapting brush strokes to landscape”).
   - Surface subtle UI cues (badge/spinner) instead of flashing empty states.

## Implementation Roadmap
1. **Store refactor**
   - Split reset actions, add new flags (`orientationPreviewPending`, etc.).
   - Update `setOrientation` to leverage cache first and defer to background generation.
   - Ensure `startStylePreview` accepts an optional orientation override (without breaking existing callers).

2. **Orientation selector flow**
   - Update `StickyOrderRail.handleOrientationSelect` to:
     - Avoid immediate `resetPreviews()`; use the new soft reset.
     - Keep last preview visible until new crop/previews are ready.
     - Gate user interactions with `orientationChanging` and show progress UI.

3. **Preview display**
   - Adjust the canvas component to read `orientationPreviewPending` and render the fallback image + status while waiting.
   - Confirm original-image style stays in sync by swapping the correct orientation variant.

4. **Cropper + uploader alignment**
   - Ensure `PhotoUploader.finalizeCrop` differentiates between orientation changes (needs soft vs. hard reset).
   - Maintain per-orientation smart crop cache persistently across toggles.

5. **Edge-case handling**
   - Rapid orientation flipping: debounce updates, reuse in-flight promises (`inFlightCropsRef` already exists).
   - Style switch mid-orientation-change: pending state should cancel or finish gracefully without double renders.
   - Uploading a new source instantly clears all orientation caches (existing `setUploadedImage` flow already resets state).

6. **Testing Checklist**
   - Orientation toggles with cached previews (should swap instantly, no blank state).
   - Orientation toggles without cache (canvas holds old preview while new render finishes).
   - Switching styles post-orientation change (cached variants load instantly).
   - Rapid orientation cycling (no race conditions, final orientation matches displayed preview).
   - Manual crop adjustments respecting new orientation without leaking stale previews.

## Open Questions / Decisions
- Do we auto-letterbox when crop data is missing, or force users through the cropper? (Leaning toward auto-fit with optional “Adjust Crop” CTA.)
- Should orientation-specific previews count separately toward cache limits? (Current limit is 12 entries; may need to bump or tweak eviction logic.)
- How aggressively should we pre-generate alternate orientation previews once the first style is ready? (Potential future enhancement for premium polish.)

This plan keeps Wondertone’s preview experience fluid while safeguarding performance, telemetry, and Supabase API usage. Once approved, we can execute against the roadmap with confidence.
