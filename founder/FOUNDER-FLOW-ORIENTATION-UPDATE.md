# Founder Flow Orientation & Smart Crop Update

_Date: 2025-10-07_

## Overview
This session brought the founder `/create` flow to parity—and beyond—with the production orientation experience. We now detect portrait/square/landscape uploads, run subject-aware smart crops, and keep previews in sync with user-selected orientations without losing the rapid, artistic feel of Wondertone.

## Core Deliverables

### 1. Smart Crop Engine, AI Overlay & Preview Stage (STATE 2)
- Added `founder/src/utils/smartCrop.ts` with saliency‑based subject detection, aspect‑ratio expansion, and canvas export helpers tuned for portrait/square/landscape.
- Upgraded the analyzer with smaller 16px sampling blocks, skin-tone/edge based face heuristics, rule-of-thirds biasing, and high-resolution PNG output.
- Introduced `AIAnalysisOverlay` (founder/src/components/launchpad/AIAnalysisOverlay.tsx) for the 2.5s “AI Analysis” moment before the crop preview, now wired into `PhotoUploader`.
- Updated `SmartCropPreview` (founder/src/components/launchpad/SmartCropPreview.tsx) to:
  - Shows AI analysis status, orientation reasoning, and the generated crop.
  - Offers `Perfect! Use This` vs. `Adjust Crop` before moving forward.
- Rebuilt `PhotoUploader.tsx` to orchestrate:
  1. Upload / drag‑drop → orientation detection (`detectOrientationFromDataUrl`).
  2. AI analysis overlay (scanning lines, phased messaging) → smart crop preview with per-orientation caching.
  3. Manual cropper fallback; modal now respects active aspect ratios.
  4. Telemetry updates (`emitStepOneEvent`) for upload, crop, and completion events.

### 2. State Store Enhancements
- `useFounderStore.ts` now tracks:
  - `originalImage`, `smartCrops`, orientation-specific cache and gating metadata.
  - `accountPromptTriggerAt` for the delayed soft gate after the third generation.
- `generatePreviews` was upgraded to:
  - Prioritize the selected style + two recommended styles.
  - Skip regenerating ready previews unless forced.
  - Pull the correct crop (current orientation smart crop → manual crop → original) when generating.
  - Increment generation counters and schedule account prompts (respecting dismissal/auth state).
- Added helpers `resetPreviews`, `setSmartCropForOrientation`, `clearSmartCrops`, and `setOriginalImage`.

### 3. Studio Alignment (STATE 4)
- `StickyOrderRail.tsx` re-runs smart crop when users switch orientation. If a cached crop exists, it reuses it; otherwise it generates a new one (with the enhanced heuristics), updates the “Original Image” preview, and triggers regeneration.
- `StudioConfigurator.tsx` now:
  - Reads the active orientation meta to size the center canvas frame.
  - Displays an orientation badge on the preview to reinforce the current aspect ratio.
- Cropper modal (`CropperModal.tsx`) accepts arbitrary aspect ratios and exports orientation-accurate crops.

## Current Flow Summary
1. **Upload** → AI detects orientation and caches the original.
2. **Smart Crop Preview** → subject-aware crop shown with orientation UX; user accepts or adjusts.
3. **Manual Crop (Optional)** → modal enforces current ratio.
4. **Generate Previews** → orientation-aware crop feeds preview pipeline, updates generation counters, and schedules account prompt (2s delay after third generation).
5. **Studio** → orientation toggles recrop using smart cache and render updated previews/canvas.

## Remaining Work / Recommendations
- **Studio Canvas polish:** visually vet portrait/landscape previews across all styles; consider subtle frame placeholders or “updating” states during orientation transitions.
- **Orientation messaging:** add microcopy / tooltips around the orientation rail to highlight the benefits and generation impact when changing ratios.
- **Supabase integration:** when wiring real previews, pass orientation metadata + crop dimensions to the edge functions.
- **Testing:** run `npm run lint` (note: existing repo lint debt remains), continue manual QA of portrait uploads, orientation flips, generation gating, and manual crop adjustments.
- **Snapshots:** consider adding unit/integration coverage for smart crop utilities and orientation state transitions once the flow stabilizes.

## Affected Files
- `founder/src/components/launchpad/PhotoUploader.tsx`
- `founder/src/components/launchpad/SmartCropPreview.tsx` _(new)_
- `founder/src/components/launchpad/cropper/CropperModal.tsx`
- `founder/src/components/studio/StickyOrderRail.tsx`
- `founder/src/sections/StudioConfigurator.tsx`
- `founder/src/store/useFounderStore.ts`
- `founder/src/utils/smartCrop.ts` _(new)_

## Build Status
- `npm run build` ✓ (bundle size warning unchanged, see repo baseline).
- `npm run lint` ⚠️ (not executed this session; existing repo issues remain unresolved).

---
*Prepared for Wondertone founder flow handoff.*
