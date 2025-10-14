# Watermark Enforcement Hardening – Investigation Guide

## 1. Mandate Overview
- **Objective:** Anonymous and free tiers must only ever see/download watermarked previews; paid tiers get clean previews via signed URLs only.
- **Telemetry / UX Guardrails:** Keep the four-step configurator intact, StepOneExperience metrics firing, and preview caching/orientation resets (`useProductFlow`) untouched.
- **Acceptance Signal:** Five watermark placements (four corners + center band) visible in UI for non-premium tiers and returned by the Supabase edge function, with gallery downloads respecting entitlements.

## 2. Recent Code Changes (Codex Branch `feature/harden-watermarks`)

### Supabase Edge Functions
1. `supabase/functions/generate-style-preview/index.ts`
   - Adds helper `ensureWatermarkedPreview()` to force-watermark cached or idempotent responses before returning them.  
   - Memory/storage cache hits now re-upload the rewatermarked asset via `PreviewStorageClient.uploadFromBuffer`.  
   - Idempotent success branch rehydrates the stored preview if `requires_watermark` is true.
2. `supabase/functions/generate-style-preview/watermarkService.ts`
   - Replaced temporary stub with ImageScript-based compositor that renders five watermark placements with size/opacity scaled to the base image.
3. `supabase/functions/get-gallery/index.ts`
   - Requires entitlements lookup; free/anon results strip `cleanUrl` from payloads.
4. `supabase/functions/save-to-gallery/index.ts`
   - Now rejects anonymous saves (auth required) and only persists clean URLs for authenticated users.
5. `supabase/functions/generate-style-preview/cache/storageClient.ts`
   - New `uploadFromBuffer` + `getPublicUrl` helpers so edge logic can overwrite existing cached files in place.

### Frontend
1. `src/utils/previewGeneration.ts`
   - Removed browser watermark worker; still fires `watermarking` stage for telemetry.  
2. `src/sections/StudioConfigurator.tsx`
   - Anonymous “Save to Gallery” now opens the account prompt; no more anonymous saves.
3. `src/pages/GalleryPage.tsx` / `src/utils/galleryApi.ts`
   - Downloads respect `entitlements.requiresWatermark`; free tiers receive a nudge UI instead of clean downloads.

## 3. Current Symptoms
- Anonymous preview still shows a single watermark & can be downloaded clean after deploying edge functions.
- This implies either:
  1. **Cache objects remain unmodified** (our re-upload logic didn’t persist), or
  2. **Edge path not executing new code** (e.g., different environment/function deployed, branch not in production), or
  3. **Orientation/generation path returning raw storage URL that bypasses watermark service**.

## 4. Files / Sections to Inspect
1. **Edge Function Deploy Result**  
   - `supabase/functions/generate-style-preview/index.ts` – ensure the deployed function matches the repo version (`supabase functions list --project-ref …` then `supabase functions download generate-style-preview`).  
   - Confirm `ensureWatermarkedPreview` is in the deployed file.
2. **Supabase Storage**  
   - Bucket: `preview-cache`.  
   - Grab path via `extractStoragePath` logic (look for `/storage/v1/object/public/preview-cache/...`).  
   - Download the object directly to confirm watermark overlays. If clean, re-upload failed.
3. **Logs**  
   - `console.warn('[watermark] Failed to enforce watermark on cached preview', …)` from edge.  
   - Check Supabase Edge Logs to see if this fires (indicates re-upload failure).  
   - Look for `Cache hit (memory)` / `Cache hit (storage)` lines near returns to confirm path.
4. **Web App**  
   - `src/utils/founderPreviewGeneration.ts` ensures `watermark: true` for anonymous.  
   - Confirm network response from `/functions/v1/generate-style-preview` returns `requires_watermark: true` and a watermarked `preview_url` data vs public URL.

## 5. Investigation Strategy for Claude
1. **Verify Deployment**  
   - Download the deployed function to guarantee the edge runtime matches modifications.  
   - If mismatched, redeploy from the latest build.
2. **Force Cache Rewrite**  
   - For a known clean URL, hit `ensureWatermarkedPreview` manually via a scripted POST:  
     ```ts
     // pseudo from Deno REPL
     await ensureWatermarkedPreview('https://...preview-cache/path.jpg', 'manual-test', new PreviewStorageClient(...), 'path.jpg');
     ```  
   - Alternatively, temporarily disable cache hits (`cacheBypass = true`) to force regeneration and confirm new watermarks appear.
3. **Check Storage Permissions**  
   - Ensure the service role has rights to overwrite existing objects (bucket config `upsert: true`).  
   - Confirm `uploadFromBuffer` doesn’t fail (logs).
4. **Network Trace**  
   - Re-run preview generation with dev tools open; note the `preview_url` returned.  
   - Download the exact file via curl to confirm watermark presence.
5. **Gallery Download**  
   - For anonymous: expect watermarked file and alert message.  
   - If still clean, verify `get-gallery` response includes `cleanUrl` (should be `null`).  
   - Inspect Supabase Edge logs for `requiresWatermark` flag when hitting `get-gallery`.

## 6. Expected Outcome
- After adjustments: every anonymous/free preview request returns a JPEG with five watermarks, whether newly generated or served from cache.  
- Downloads from gallery for anonymous/free tiers always deliver the watermarked version; clean URLs are only returned for authenticated paid users (and those receive signed URLs once implemented).  
- Supabase storage bucket holds only watermarked copies for public access; clean originals reside privately or are generated on demand server-side.

## 7. Next Actions for Claude
1. Confirm deployed function matches repo code; redeploy if needed.  
2. Inspect edge logs for watermark errors and cache hits; share findings.  
3. Validate storage overwrite by fetching the stored object post-deploy.  
4. Report discrepancies or propose additional instrumentation if the re-upload path is failing silently.

> Once Claude verifies the edge updates are live and working, we can proceed to wire a private clean bucket + signed URLs for premium tiers.

