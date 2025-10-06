# Launchpad Phase A — Upload Delight Plan

## Objectives
- Make the first interaction cinematic and reassuring.
- Provide immediate feedback on orientation and crop readiness.
- Reinforce that previews are on the way with delightful motion.

## Deliverables
1. **Immersive Drop Zone ✅**
   - Full-width animated drop area with drag state, sample photo toggle, accessible upload button.

2. **Orientation Feedback Badge ✅**
   - Orientation-specific badge and friendly tip shown after upload.

3. **Smart Crop Confirmation ✅**
   - “Smart crop ready” chip with relative timestamp and manual crop entry.

4. **Preview Rail Delight ✅**
   - Shimmer skeletons while generating, confetti burst on first ready state.

## Steps
1. **Design & Motion Pass**
   - Sketch hero drop-zone states (default, hover, drag-enter) and orientation badge look.
   - Define CSS keyframes for skeleton shimmer + confetti.

2. **State Enhancements**
   - Extend founder store with `isDragging`, `orientationTip`, `cropReadyAt`.
   - Emit telemetry events: `upload_started`, `upload_success`, `orientation_detected`.

3. **Implementation Outline**
   - Update `PhotoUploader` with drag/drop handlers, sample upload button, ARIA labels.
   - Render orientation badge + crop chip once upload completes.
   - Add confetti overlay component triggered when first preview transitions to ready.

4. **QA & Telemetry Validation**
   - Unit test orientation detection/crop pipeline.
   - Check keyboard navigation + screen reader announcements for upload/crop.
   - Verify telemetry payloads align with StepOne expectations.

## Dependencies
- Existing image utils (`readFileAsDataURL`, `detectOrientationFromDataUrl`, `cropImageToDataUrl`).
- Tailwind tokens + new animation classes.
- Telemetry adapter stub (expand to real analytics later).
