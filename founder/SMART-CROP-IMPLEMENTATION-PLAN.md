# Smart Crop Parity Plan (Founder ↔ Production)

## Objectives
- Reproduce production’s reliable saliency-driven smart crop in the founder experience without altering existing UI/UX (AI overlay, copy, layout).
- Keep manual crop behavior identical—auto crop should feed the same orientation/state the manual cropper expects.
- Maintain performance (client-only, no heavy models) and graceful fallbacks for edge cases (low saliency, errors, HEIC uploads).

## Production Reference Snapshot
1. `PhotoUploadContainer` runs `handleImageAnalysis()` after upload.
2. `detectOrientationFromImage()` → width/height thresholds (>1.2 → horizontal, <0.8 → vertical, else square).
3. `AutoCropPreview` renders; `generateSmartCrop(imageUrl, orientation)` runs.
4. `smartCropUtils.ts` pipeline:
   - `detectSubjectRegion` → draw image to canvas.
   - `analyzeImageForSubject` → 32×32 block saliency (contrast/variance vs. neighbours).
   - `getCenterFallback` if saliency ≤ 0.3.
   - `expandToAspectRatio` grows region to orientation while clamping within 90 % of frame.
   - `applyCropToImage` returns JPEG data URL.
5. Accepting the crop passes the cropped URL/orientation back into the flow; “Adjust Crop” opens `PhotoCropper`.

## Implementation Checklist for Founder

### 1. Utilities
- [ ] Replace `founder/src/utils/smartCrop.ts` with production’s saliency-based logic:
  - `detectSubjectRegion`, `analyzeImageForSubject`, `calculateBlockSaliency`, helpers, `getCenterFallback`, `expandToAspectRatio`, `applyCropToImage`, `generateSmartCrop`.
  - Preserve existing cache helpers (`cacheSmartCropResult`, etc.) so components keep working.
- [ ] Confirm `founder/src/utils/imageUtils.ts` or a new `orientationDetection.ts` mirrors production’s orientation thresholds (1.2 / 0.8).

### 2. Photo Uploader Integration
- [ ] Keep the AI overlay stages untouched (`PhotoUploader`).
- [ ] Ensure `generateSmartCrop` is called during the preview stage; fallback uses original image on error just like production.
- [ ] Manual crop (`CropperModal`) should continue to set orientation/cropped image in store exactly as before. No changes to cropper UI.
- [ ] Clear smart-crop caches when new images load to avoid stale crops.

### 3. Manual Crop Consistency
- [ ] When the user chooses “Adjust Crop,” open the existing `CropperModal`.
- [ ] On manual save, feed `SmartCropResult` back to state like production’s `PhotoCropper`—orientation + cropped data URL.

### 4. Testing & Safeguards
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run build:analyze`
- [ ] `npm run deps:check`
- [ ] Manual QA scenarios:
  - Square, portrait, landscape uploads.
  - HEIC/iOS photos.
  - Low-contrast images (verify center fallback).
  - Manual crop path.
- [ ] Verify there are no visual regressions (screenshots/QA) since UI files remain untouched.

### 5. Notes / Risks
- Saliency-only detection can still favour high-contrast props over faces; this matches production behavior by design.
- Larger images mean more 32×32 blocks; performance remains acceptable on modern devices (validated in production).
- If we revisit smarter detection later, keep this baseline plan as rollback.

## Deliverables
- Updated `founder/src/utils/smartCrop.ts` (production parity).
- Orientation helper reflecting production thresholds.
- No changes to founder UI components besides wiring existing hooks to the new logic.
- Passing build/lint checks and documented testing outcomes.
