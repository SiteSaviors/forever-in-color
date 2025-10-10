# SeeDream 4.0 Migration - Session Summary

**Date**: October 9, 2025
**Migration**: GPT-Image-1 → SeeDream 4.0 via Replicate
**Status**: ✅ Complete & Deployed

---

## Overview

Successfully migrated Wondertone's AI style generation from OpenAI's GPT-Image-1 to ByteDance's SeeDream 4.0, both running through Replicate's infrastructure. This migration eliminates the OpenAI API key dependency and leverages SeeDream's superior image-to-image capabilities.

---

## Key Benefits

- ✅ **Simpler authentication**: Only requires `REPLICATE_API_TOKEN` (no `OPENAI_API_KEY` needed)
- ✅ **Cost-effective**: $0.03 per image on Replicate
- ✅ **Faster generation**: ~1.8s for 2K images
- ✅ **Better quality**: SeeDream ranks #1 on Artificial Analysis Image Editing Leaderboard
- ✅ **Purpose-built**: Native image-to-image model designed for style transfer
- ✅ **Higher resolution**: Supports up to 4K output (4096×4096)

---

## Files Modified

### 1. Core Model Configuration

#### `supabase/functions/generate-style-preview/replicate/config.ts`
**Line 4** - Changed model endpoint
```typescript
// BEFORE
model: "openai/gpt-image-1"

// AFTER
model: "bytedance/seedream-4"
```

---

### 2. Replicate Service Layer

#### `supabase/functions/generate-style-preview/replicateService.ts`

**Lines 8-21** - Added quality-to-size mapper
```typescript
/**
 * Maps Wondertone quality setting to SeeDream size parameter
 */
function mapQualityToSize(quality: string): string {
  switch (quality.toLowerCase()) {
    case 'low':
      return '1K';
    case 'high':
      return '4K';
    case 'medium':
    default:
      return '2K';
  }
}
```

**Lines 23-34** - Removed OpenAI API key dependency
```typescript
// BEFORE
constructor(apiToken: string, openaiApiKey: string) {
  this.apiToken = apiToken.replace(/^export\s+REPLICATE_API_TOKEN=/, '').trim();
  this.openaiApiKey = openaiApiKey.replace(/^export\s+OPENAI_API_KEY=/, '').trim();
  // ...
}

// AFTER
constructor(apiToken: string) {
  this.apiToken = apiToken.replace(/^export\s+REPLICATE_API_TOKEN=/, '').trim();
  this.apiClient = new ReplicateApiClient(this.apiToken);
  this.pollingService = new PollingService(this.apiToken);
}
```

**Lines 46-75** - Updated request format for SeeDream
```typescript
// BEFORE
const requestBody = {
  input: {
    prompt: enhancedPrompt,
    input_images: [imageData],           // ❌ GPT-Image-1 param
    openai_api_key: this.openaiApiKey,   // ❌ No longer needed
    aspect_ratio: aspectRatio,
    quality: quality
  }
};

// AFTER
const seedreamSize = mapQualityToSize(quality);
const requestBody = {
  input: {
    prompt: enhancedPrompt,
    image_input: [imageData],            // ✅ SeeDream param
    aspect_ratio: aspectRatio,           // ✅ Supports 1:1, 3:2, 2:3, 4:3, 16:9
    size: seedreamSize,                  // ✅ 1K, 2K, or 4K
    max_images: 1
  }
};
```

**Line 113** - Updated error message
```typescript
// BEFORE
const errorMsg = data.error || "GPT-Image-1 generation failed";

// AFTER
const errorMsg = data.error || "SeeDream generation failed";
```

**Line 137** - Updated retry context
```typescript
// BEFORE
}, 'GPT-Image-1 Generation');

// AFTER
}, 'SeeDream Generation');
```

---

### 3. Image Generation Service (Legacy Path)

#### `supabase/functions/generate-style-preview/imageGenerationService.ts`

**Lines 3-16** - Added quality mapper
```typescript
/**
 * Maps Wondertone quality setting to SeeDream size parameter
 */
function mapQualityToSize(quality: string): string {
  switch (quality.toLowerCase()) {
    case 'low':
      return '1K';
    case 'high':
      return '4K';
    case 'medium':
    default:
      return '2K';
  }
}
```

**Line 19** - Removed OpenAI API key from constructor
```typescript
// BEFORE
constructor(private openaiApiKey: string, private replicateApiToken: string) {}

// AFTER
constructor(private replicateApiToken: string) {}
```

**Lines 23-37** - Updated request format and endpoint
```typescript
// BEFORE
const requestBody = {
  input: {
    prompt: prompt,
    input_images: [imageData],
    openai_api_key: this.openaiApiKey,
    aspect_ratio: aspectRatio,
    quality: quality
  }
};
const response = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-1/predictions', {

// AFTER
const seedreamSize = mapQualityToSize(quality);
const requestBody = {
  input: {
    prompt: prompt,
    image_input: [imageData],
    aspect_ratio: aspectRatio,
    size: seedreamSize,
    max_images: 1
  }
};
const response = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
```

---

### 4. Environment Validation

#### `supabase/functions/generate-style-preview/environmentValidator.ts`

**Lines 4-8** - Removed OpenAI key from interface
```typescript
// BEFORE
export interface EnvironmentValidationResult {
  isValid: boolean;
  openaiApiKey?: string;
  replicateApiToken?: string;
  error?: Response;
}

// AFTER
export interface EnvironmentValidationResult {
  isValid: boolean;
  replicateApiToken?: string;
  error?: Response;
}
```

**Lines 10-46** - Removed OpenAI validation logic
```typescript
// BEFORE
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

// Check for missing or empty OpenAI API key
if (!openaiApiKey || openaiApiKey.trim() === '') {
  // ... error handling
}
// Check for missing or empty Replicate API token
if (!replicateApiToken || replicateApiToken.trim() === '') {
  // ... error handling
}

return {
  isValid: true,
  openaiApiKey: openaiApiKey.trim(),
  replicateApiToken: replicateApiToken.trim()
};

// AFTER
const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

// Check for missing or empty Replicate API token
if (!replicateApiToken || replicateApiToken.trim() === '') {
  // ... error handling
}

return {
  isValid: true,
  replicateApiToken: replicateApiToken.trim()
};
```

---

### 5. Main Edge Function Entry Point

#### `supabase/functions/generate-style-preview/index.ts`

**Lines 333-343** - Removed OpenAI API key requirement
```typescript
// BEFORE
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!openaiApiKey || !replicateApiToken || !supabaseUrl || !supabaseServiceKey) {
  // ... error
}

// AFTER
const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!replicateApiToken || !supabaseUrl || !supabaseServiceKey) {
  // ... error
}
```

**Lines 556-576** - Fixed async webhook path (CRITICAL BUG FIX)
```typescript
// BEFORE - Was still using GPT-Image-1!
if (asyncEnabled && webhookBaseUrl && webhookSecret) {
  const createBody = {
    input: {
      prompt: stylePrompt,
      input_images: [normalizedImageUrl],      // ❌ Old param
      openai_api_key: openaiApiKey,            // ❌ Doesn't exist
      aspect_ratio: normalizedAspectRatio,
      quality: normalizedQuality,              // ❌ Should be 'size'
      request_id: requestId
    },
    webhook: webhookUrl,
    webhook_events_filter: ['completed', 'failed', 'canceled']
  };

  const asyncResp = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-1/predictions', {

// AFTER - Now correctly uses SeeDream
if (asyncEnabled && webhookBaseUrl && webhookSecret) {
  const seedreamSize = normalizedQuality === 'high' ? '4K' :
                      normalizedQuality === 'low' ? '1K' : '2K';

  const createBody = {
    input: {
      prompt: stylePrompt,
      image_input: [normalizedImageUrl],       // ✅ SeeDream param
      aspect_ratio: normalizedAspectRatio,
      size: seedreamSize,                      // ✅ Mapped to size
      max_images: 1,
      request_id: requestId
    },
    webhook: webhookUrl,
    webhook_events_filter: ['completed', 'failed', 'canceled']
  };

  const asyncResp = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
```

**Line 589** - Updated error message
```typescript
// BEFORE
`GPT-Image-1 API request failed: ${asyncResp.status} - ${errTxt}`

// AFTER
`SeeDream API request failed: ${asyncResp.status} - ${errTxt}`
```

**Line 649** - Removed OpenAI key from service instantiation
```typescript
// BEFORE
const replicateService = new ReplicateService(replicateApiToken, openaiApiKey);

// AFTER
const replicateService = new ReplicateService(replicateApiToken);
```

**Line 652** - Updated log message
```typescript
// BEFORE
logger.info('Generating preview via Replicate', {

// AFTER
logger.info('Generating preview via Replicate (SeeDream 4.0)', {
```

---

### 6. Error Handling Updates

#### `supabase/functions/generate-style-preview/errorHandling.ts`

**Lines 86-110** - Updated error messages for SeeDream
```typescript
// BEFORE
case 401:
  return {
    type: 'invalid_request',
    status,
    message: 'Invalid or missing OpenAI API key',
    details: 'Verify OPENAI_API_KEY in environment variables'
  };

case 403:
  return {
    type: 'invalid_request',
    status,
    message: 'Access denied - check API key permissions',
    details: 'API key may not have access to GPT-Image-1 model'
  };

case 502:
case 504:
  return {
    type: 'network_error',
    status,
    message: 'Gateway error - upstream service issue',
    retryAfter: 15,
    details: 'Temporary network issue with OpenAI servers'
  };

// AFTER
case 401:
  return {
    type: 'invalid_request',
    status,
    message: 'Invalid or missing Replicate API key',
    details: 'Verify REPLICATE_API_TOKEN in environment variables'
  };

case 403:
  return {
    type: 'invalid_request',
    status,
    message: 'Access denied - check API key permissions',
    details: 'API key may not have access to SeeDream model'
  };

case 502:
case 504:
  return {
    type: 'network_error',
    status,
    message: 'Gateway error - upstream service issue',
    retryAfter: 15,
    details: 'Temporary network issue with Replicate servers'
  };
```

---

### 7. Documentation Updates

#### `founder/.env.example`

**Lines 1-16** - Added migration notes
```bash
# BEFORE
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# AFTER
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Optional: hardcode a single image for load testing
# TEST_IMAGE_URL=https://images.unsplash.com/...

# Optional: simulate previews without hitting Supabase/Replicate
# VITE_FOUNDER_PREVIEW_MODE=stub

# Note: Style generation now uses SeeDream 4.0 via Replicate
# Only REPLICATE_API_TOKEN is required (no OpenAI key needed)
```

#### `supabase/functions/generate-style-preview/README.md`

**Line 3** - Updated header
```markdown
# BEFORE
This function powers Wondertone's AI preview generation. Phase 2 introduces hybrid output caching...

# AFTER
This function powers Wondertone's AI preview generation using **SeeDream 4.0** via Replicate. Phase 2 introduces hybrid output caching...
```

**Lines 12-28** - Updated environment variables table
```markdown
# ADDED to top of table:
| `REPLICATE_API_TOKEN` | — | **Required**. Replicate API token for SeeDream 4.0 model access. |
| `SUPABASE_URL` | — | **Required**. Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | — | **Required**. Supabase service role key for database/storage access. |

# ADDED note at bottom:
**Note**: OpenAI API key is no longer required as SeeDream 4.0 runs natively on Replicate.
```

---

## Critical Bug Fixed

### Issue: Async Webhook Path Still Using GPT-Image-1

**Problem**: The edge function has two execution paths:
1. **Synchronous path** (line 649+): Uses `ReplicateService` → ✅ Was correctly updated
2. **Async webhook path** (line 556-647): Direct API call → ❌ **Was still using GPT-Image-1**

When `PREVIEW_ASYNC_ENABLED=true` in Supabase environment variables, the function takes the async path, which was bypassing our SeeDream changes entirely.

**Root Cause**: Direct fetch() call to Replicate API with hardcoded GPT-Image-1 endpoint and old request format.

**Fix Location**: `supabase/functions/generate-style-preview/index.ts` lines 556-589

**Result**: Both sync and async paths now correctly use SeeDream 4.0

---

## Deployment Steps Completed

1. ✅ Updated all code references from GPT-Image-1 → SeeDream 4.0
2. ✅ Removed OpenAI API key dependencies
3. ✅ Fixed critical async webhook path bug
4. ✅ Updated documentation
5. ✅ Deployed to Supabase Edge Functions

**Deployment Command Used**:
```bash
cd /Users/admin/Downloads/forever-in-color-main/forever-in-color
supabase functions deploy generate-style-preview --no-verify-jwt
```

**Deployment Result**:
- Function size: 177.8kB
- Status: Successfully deployed to project `fvjganetpyyrguuxjtqi`

---

## Environment Variable Changes Required

### Remove from Supabase Edge Function Secrets:
- ❌ `OPENAI_API_KEY` (no longer needed)

### Keep in Supabase Edge Function Secrets:
- ✅ `REPLICATE_API_TOKEN` (required for SeeDream)
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `PREVIEW_ASYNC_ENABLED` (optional, defaults to false)
- ✅ `PREVIEW_WEBHOOK_BASE_URL` (if async enabled)
- ✅ `PREVIEW_WEBHOOK_SECRET` (if async enabled)

---

## Testing & Validation

### Build Verification
✅ Founder workspace builds successfully without errors
```bash
cd founder
npm run build
# Output: ✓ built in 2.45s
```

### Expected Replicate Logs After Migration
When generating a preview, Replicate logs should now show:

**Before (GPT-Image-1)**:
```
Model: openai/gpt-image-1
Input: {
  prompt: "...",
  input_images: [...],
  openai_api_key: "sk-...",
  aspect_ratio: "1:1",
  quality: "medium"
}
```

**After (SeeDream 4.0)**:
```
Model: bytedance/seedream-4
Input: {
  prompt: "...",
  image_input: [...],
  aspect_ratio: "1:1",
  size: "2K",
  max_images: 1
}
```

### Supabase Edge Function Logs
Look for this updated log message:
```
Generating preview via Replicate (SeeDream 4.0)
```

---

## Aspect Ratio Compatibility

SeeDream 4.0 supports all Wondertone aspect ratios:
- ✅ `1:1` (square)
- ✅ `3:2` (horizontal)
- ✅ `2:3` (vertical)

Plus bonus support for:
- `4:3`
- `16:9`
- `9:16`

---

## Quality Mapping

Wondertone's quality settings now map to SeeDream sizes:

| Wondertone Quality | SeeDream Size | Resolution |
|-------------------|---------------|------------|
| `low`             | `1K`          | 1024×1024  |
| `medium` (default)| `2K`          | 2048×2048  |
| `high`            | `4K`          | 4096×4096  |

---

## Rollback Plan (If Needed)

If SeeDream quality/performance isn't acceptable, to rollback:

1. Restore `OPENAI_API_KEY` to Supabase secrets
2. Revert these files using git:
   ```bash
   git checkout HEAD~1 -- \
     supabase/functions/generate-style-preview/replicate/config.ts \
     supabase/functions/generate-style-preview/replicateService.ts \
     supabase/functions/generate-style-preview/imageGenerationService.ts \
     supabase/functions/generate-style-preview/environmentValidator.ts \
     supabase/functions/generate-style-preview/index.ts \
     supabase/functions/generate-style-preview/errorHandling.ts
   ```
3. Redeploy edge function:
   ```bash
   supabase functions deploy generate-style-preview
   ```

---

## Next Steps for Quality Validation

1. **Test all 11 styles** in founder workspace with real photos
2. **Compare output quality** against previous GPT-Image-1 results
3. **Verify all 3 aspect ratios** work correctly (1:1, 3:2, 2:3)
4. **Monitor Replicate costs** - SeeDream is $0.03/image
5. **Check generation speed** - should be ~1.8s for 2K images
6. **Run load test**:
   ```bash
   cd founder
   npm run loadtest:styles
   ```

---

## Files Summary

**Total Files Modified**: 8

1. `supabase/functions/generate-style-preview/replicate/config.ts` - Model endpoint
2. `supabase/functions/generate-style-preview/replicateService.ts` - Service layer
3. `supabase/functions/generate-style-preview/imageGenerationService.ts` - Legacy service
4. `supabase/functions/generate-style-preview/environmentValidator.ts` - Validation
5. `supabase/functions/generate-style-preview/index.ts` - Main entry + async path fix
6. `supabase/functions/generate-style-preview/errorHandling.ts` - Error messages
7. `founder/.env.example` - Documentation
8. `supabase/functions/generate-style-preview/README.md` - Documentation

**Lines of Code Changed**: ~150 lines across all files

---

## Success Criteria ✅

- ✅ All references to GPT-Image-1 removed
- ✅ All references to OpenAI API key removed
- ✅ Request format updated to SeeDream specification
- ✅ Both sync and async paths use SeeDream
- ✅ Error messages updated
- ✅ Documentation updated
- ✅ Founder workspace builds successfully
- ✅ Edge function deployed to Supabase
- ✅ No TypeScript/build errors

---

**Migration completed by**: Claude (Anthropic)
**Session date**: October 9, 2025
**Deployment status**: Live on Supabase project `fvjganetpyyrguuxjtqi`
