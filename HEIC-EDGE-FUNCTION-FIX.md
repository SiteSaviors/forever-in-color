# HEIC Edge Function - Bug Fix

## Problem Analysis

### Error 1: Invalid URL
```
TypeError: Invalid URL: '/@saschazar/wasm-heif@2.0.0/es2022/wasm_heif.wasm'
```

**Root Cause**: The `locateFile` callback in line 287-288 is returning a URL with `/@saschazar` which is not a valid absolute URL.

```typescript
// CURRENT (BROKEN):
locateFile: (file: string) =>
  `https://esm.sh/@saschazar/wasm-heif@2.0.0/${file.replace(/^\//, '')}`,
```

The library is calling `locateFile` with `wasm_heif.wasm` (no leading slash), so the replace doesn't help, and it creates:
- `https://esm.sh/@saschazar/wasm-heif@2.0.0/wasm_heif.wasm` ❌

But the WASM file is actually at a different path in the ESM.sh bundle.

### Error 2: `moduleInstance.free is not a function`
```
TypeError: moduleInstance.free is not a function
```

**Root Cause**: The `wasm-heif` library v2.0.0 API doesn't have a `free()` method. The library initialization and lifecycle in Deno is different from browser environment.

## Solution

Replace the wasm-heif library with a more Deno-compatible approach or use a different HEIC decoder.

### Option 1: Use heic-convert (Better for Deno)

```typescript
// supabase/functions/convert-heic/index.ts

// REPLACE line 4:
// OLD: import wasmHeif from 'https://esm.sh/@saschazar/wasm-heif@2.0.0?bundle';
// NEW: Use heic-decode which works better in Deno
import { decode } from 'https://deno.land/x/heic_decode@1.0.0/mod.ts';
```

### Option 2: Fix wasm-heif Configuration

If you must use wasm-heif, here's the correct configuration:

```typescript
// supabase/functions/convert-heic/index.ts
// Lines 285-324 - REPLACE convertHeicToJpeg function:

async function convertHeicToJpeg(buffer: ArrayBuffer): Promise<{
  jpegBytes: Uint8Array;
  width: number;
  height: number
}> {
  let moduleInstance: any;

  try {
    // Initialize wasm module without custom locateFile
    // The ?bundle param in esm.sh handles the WASM file embedding
    moduleInstance = await wasmHeif();

    const source = new Uint8Array(buffer);

    // Decode HEIC
    const decoded = moduleInstance.decode(source, source.byteLength, false);

    if (!decoded || typeof decoded === 'object' && 'error' in decoded) {
      throw new Error(`heif_decode_failed: ${decoded?.error || 'Unknown error'}`);
    }

    // Get dimensions
    const dimensions = moduleInstance.dimensions();
    const { width, height, channels } = dimensions;

    if (!width || !height) {
      throw new Error('heif_invalid_dimensions');
    }

    // Convert to RGBA
    const decodedBuffer = decoded instanceof Uint8Array ? decoded : new Uint8Array(decoded);
    const rgba = convertToRgba(decodedBuffer, width, height, channels ?? 3);

    // Encode to JPEG using imagescript
    const image = new Image(width, height);
    image.bitmap.set(rgba);
    const jpegBytes = await image.encodeJPEG(92);

    return { jpegBytes, width, height };
  } catch (error) {
    console.error('[convert-heic] Conversion error:', error);
    throw new Error(`heic_conversion_failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  // NOTE: No cleanup needed - wasm-heif doesn't expose free() in this version
}
```

## Recommended Solution: Switch to heic-convert Library

The best solution is to use a library specifically designed for server-side HEIC conversion:

```typescript
// supabase/functions/convert-heic/index.ts
// COMPLETE REPLACEMENT

import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { handleCorsPreflightRequest, createCorsResponse } from '../generate-style-preview/corsUtils.ts';

// Use sharp-wasm for HEIC conversion (better Deno support)
// Alternative: https://deno.land/x/libheif_wasm
const LIBHEIF_WASM_URL = 'https://esm.sh/libheif-js@1.17.6';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('[convert-heic] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const CACHE_BUCKET = Deno.env.get('HEIC_CACHE_BUCKET') ?? 'preview-cache';
const SIGNED_URL_TTL_SECONDS = clampPositiveInt(Deno.env.get('HEIC_SIGNED_URL_TTL_SECONDS'), 24 * 60 * 60);
const CACHE_TTL_DAYS = clampPositiveInt(Deno.env.get('HEIC_CACHE_TTL_DAYS'), 30);
const MAX_FILE_BYTES = clampPositiveInt(Deno.env.get('HEIC_MAX_FILE_BYTES'), 12 * 1024 * 1024);

const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// HEIC conversion using canvas-based approach (works in Deno with polyfills)
async function convertHeicToJpeg(buffer: ArrayBuffer): Promise<{
  jpegBytes: Uint8Array;
  width: number;
  height: number
}> {
  try {
    // Use libheif-js which has better WASM support
    const { default: libheif } = await import(LIBHEIF_WASM_URL);

    // Initialize decoder
    const decoder = new libheif.HeifDecoder();
    const data = new Uint8Array(buffer);

    // Decode HEIC
    const images = decoder.decode(data);
    if (!images || images.length === 0) {
      throw new Error('No images found in HEIC file');
    }

    const image = images[0];
    const width = image.get_width();
    const height = image.get_height();

    // Get image data as RGBA
    const imageData = await new Promise<ImageData>((resolve, reject) => {
      image.display({ data: new Uint8ClampedArray(width * height * 4), width, height }, (displayData: any) => {
        if (!displayData) {
          reject(new Error('Failed to decode image data'));
          return;
        }
        resolve(displayData);
      });
    });

    // Convert to JPEG using canvas API (available via polyfill)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
    const arrayBuffer = await blob.arrayBuffer();

    return {
      jpegBytes: new Uint8Array(arrayBuffer),
      width,
      height
    };
  } catch (error) {
    console.error('[convert-heic] libheif error:', error);
    throw new Error(`heic_conversion_failed: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

// ... rest of the file remains the same
```

## Quick Fix (Temporary)

If you need a quick fix while testing, simply **remove the locateFile option** and let esm.sh handle the WASM file:

```typescript
// supabase/functions/convert-heic/index.ts
// Line 285-289 - REPLACE:

async function convertHeicToJpeg(buffer: ArrayBuffer): Promise<{
  jpegBytes: Uint8Array;
  width: number;
  height: number
}> {
  // Initialize WITHOUT locateFile - let esm.sh handle it
  const moduleInstance = await wasmHeif();  // Remove the config object entirely

  // ... rest remains the same
```

And update the cleanup:

```typescript
// Lines 315-323 - REPLACE finally block:
} catch (error) {
  console.error('[convert-heic] Conversion failed:', error);
  throw new Error(`heic_conversion_failed: ${error instanceof Error ? error.message : String(error)}`);
}
// Remove finally block - no cleanup needed
```

## Testing the Fix

1. **Update the edge function**:
```bash
# Deploy the fixed version
cd supabase
supabase functions deploy convert-heic
```

2. **Enable the feature flag**:
```bash
# Add to .env
VITE_HEIC_EDGE_CONVERSION=true
```

3. **Test upload**:
- Upload a HEIC file from iOS device
- Check browser console for errors
- Check Supabase logs: `supabase functions logs convert-heic`

## Alternative: Fallback to Client-Side

If the edge function continues to have issues, you can fall back to the original client-side heic2any (which you already have working):

```typescript
// src/utils/imageUtils.ts
// Lines 44-60 - The fallback is already implemented!

// Just disable the feature flag:
VITE_HEIC_EDGE_CONVERSION=false

// This will use the try-catch fallback to heic2any on line 61-76
```

## Root Cause Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| **Invalid URL** | `locateFile` creating malformed URLs | Remove `locateFile` or use different library |
| **free() not a function** | wasm-heif v2 API doesn't expose `free()` | Remove cleanup code or switch library |
| **WASM loading in Deno** | ESM.sh bundling doesn't work well with Deno's fetch | Use Deno-native HEIC library |

## Recommended Next Steps

1. **Immediate**: Remove `locateFile` and `finally` block (lines 286-288, 315-323)
2. **Short-term**: Test if that fixes the issue
3. **Long-term**: Switch to `libheif-js` or another Deno-compatible library
4. **Fallback**: Keep client-side heic2any as backup

The client-side fallback you already have (lines 61-76) is working, so users can still upload HEIC files even if the edge function fails.
