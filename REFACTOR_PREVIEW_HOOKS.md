# Preview Hooks Consolidation Guide

## Objective

Consolidate duplicated code between `useStylePreview.ts` and `usePreviewGeneration.ts` to achieve:
- **-2.5KB bundle size** (gzipped)
- **Single source of truth** for polling and watermarking logic
- **Easier maintenance** - fix bugs in one place
- **Zero API changes** - preserve exact consumer interfaces

---

## Current State Analysis

### Code Duplication (90%)

| Shared Logic | useStylePreview | usePreviewGeneration | Status |
|-------------|-----------------|----------------------|--------|
| `pollPreviewStatusUntilReady` | Lines 60-82 | Lines 13-35 | ✅ Identical |
| Watermark application | Lines 131-137 | Lines 98-126 | ✅ Identical |
| Error handling pattern | Lines 143-145 | Lines 128-148 | ✅ Identical |
| `generateStylePreview` call | Lines 114-116 | Lines 71-76 | ✅ Identical |

### Unique Logic (Keep in hooks)

| Feature | useStylePreview | usePreviewGeneration |
|---------|----------------|----------------------|
| **State** | Single preview URL | Record<styleId, url> |
| **Pre-generated preview** | ✅ Lines 38-56 | ❌ N/A |
| **Aspect ratio** | `useAspectRatioValidator` | `convertOrientationToAspectRatio` |
| **Validation error** | ✅ `validationError` state | ❌ Only generation errors |
| **Auto-generation** | ✅ `handleClick` triggers | ❌ Manual only |
| **DB persistence** | ❌ No | ✅ `createPreview` call |

### Consumers (Must not break)

1. **useStyleCard.ts** → Calls `useStylePreview`
   - Used by: Individual style cards in grid
   - Critical path: Click card → generate preview → show result

2. **useProductFlow.ts** → Calls `usePreviewGeneration`
   - Used by: Bulk preview generation coordinator
   - Critical path: Upload image → generate all style previews

---

## Implementation Steps (Incremental & Safe)

### ✅ Step 0: Preparation (COMPLETE)
- [x] Create branch `refactor/consolidate-preview-hooks`
- [x] Analyze both hooks in detail
- [x] Map call sites and dependencies
- [x] Create this guide document

---

### Step 1: Extract Polling Logic (Zero Risk)

**Goal:** Create shared polling utility that both hooks can use

**File to create:** `src/utils/previewPolling.ts`

```typescript
import { fetchPreviewStatus } from '@/utils/stylePreviewApi';

export interface PollPreviewOptions {
  maxAttempts?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
}

/**
 * Polls preview generation status until ready or timeout.
 * Shared by useStylePreview and usePreviewGeneration.
 *
 * @param requestId - The preview request ID to poll
 * @param options - Polling configuration (optional)
 * @returns Preview URL when ready
 * @throws Error if generation fails or times out
 */
export const pollPreviewStatusUntilReady = async (
  requestId: string,
  options: PollPreviewOptions = {}
): Promise<string> => {
  const {
    maxAttempts = 30,
    initialDelay = 500,
    backoffFactor = 250,
    maxDelay = 4000
  } = options;

  let attempt = 0;

  while (attempt < maxAttempts) {
    const status = await fetchPreviewStatus(requestId);
    const normalizedStatus = status.status?.toLowerCase();

    if ((normalizedStatus === 'succeeded' || normalizedStatus === 'complete') && status.preview_url) {
      return status.preview_url as string;
    }

    if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
      throw new Error(status.error || 'Preview generation failed');
    }

    attempt += 1;
    const wait = Math.min(maxDelay, initialDelay + attempt * backoffFactor);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  throw new Error('Preview generation timed out. Please try again.');
};
```

**Verification:**
- [ ] File created at correct path
- [ ] ESLint passes (no errors)
- [ ] TypeScript compiles
- [ ] Export is available from `@/utils/previewPolling`

**No consumer changes at this step** - just creating the utility

---

### Step 2: Extract Generation Logic (Low Risk)

**Goal:** Create shared generation + watermarking pipeline

**File to create:** `src/utils/previewGeneration.ts`

```typescript
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { createPreview } from '@/utils/previewOperations';
import { watermarkManager } from '@/utils/watermarkManager';
import { pollPreviewStatusUntilReady } from '@/utils/previewPolling';

export interface GeneratePreviewOptions {
  watermark?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  persistToDb?: boolean;
  onProgress?: (stage: 'generating' | 'polling' | 'watermarking') => void;
}

export interface GeneratePreviewResult {
  previewUrl: string;
  isAuthenticated: boolean;
}

/**
 * Generates a style preview with watermarking.
 * Shared by useStylePreview and usePreviewGeneration.
 *
 * Handles:
 * 1. Initial generation request
 * 2. Polling for async results
 * 3. Optional DB persistence
 * 4. Client-side watermarking
 *
 * @param imageUrl - Base64 data URI or HTTP URL
 * @param styleName - Style name (e.g., "Classic Oil Painting")
 * @param styleId - Style ID for temp photo naming
 * @param aspectRatio - Aspect ratio string (e.g., "1:1")
 * @param options - Generation options
 * @returns Preview URL and authentication status
 */
export const generateAndWatermarkPreview = async (
  imageUrl: string,
  styleName: string,
  styleId: number,
  aspectRatio: string,
  options: GeneratePreviewOptions = {}
): Promise<GeneratePreviewResult> => {
  const { watermark = false, persistToDb = false, onProgress } = options;

  onProgress?.('generating');
  const tempPhotoId = `temp_${Date.now()}_${styleId}`;

  const generationResult = await generateStylePreview(
    imageUrl,
    styleName,
    tempPhotoId,
    aspectRatio,
    { watermark }
  );

  let rawPreviewUrl: string | null = null;

  if (generationResult.status === 'complete') {
    rawPreviewUrl = generationResult.previewUrl;
  } else if (generationResult.status === 'processing') {
    onProgress?.('polling');
    rawPreviewUrl = await pollPreviewStatusUntilReady(generationResult.requestId);

    // Persist to DB if authenticated and requested
    if (persistToDb && generationResult.isAuthenticated) {
      try {
        await createPreview(tempPhotoId, styleName, rawPreviewUrl);
      } catch (error) {
        console.warn('Failed to persist preview metadata', error);
      }
    }
  }

  if (!rawPreviewUrl) {
    throw new Error('Failed to generate preview - no URL returned');
  }

  // Apply client-side watermarking
  onProgress?.('watermarking');
  try {
    const watermarkedUrl = await watermarkManager.addWatermark(rawPreviewUrl);
    return {
      previewUrl: watermarkedUrl,
      isAuthenticated: generationResult.isAuthenticated
    };
  } catch (watermarkError) {
    console.warn('Watermarking failed, using original', watermarkError);
    return {
      previewUrl: rawPreviewUrl,
      isAuthenticated: generationResult.isAuthenticated
    };
  }
};
```

**Verification:**
- [ ] File created at correct path
- [ ] ESLint passes (no errors)
- [ ] TypeScript compiles
- [ ] Export is available from `@/utils/previewGeneration`
- [ ] Imports resolve correctly

**No consumer changes at this step** - just creating the utility

---

### Step 3: Refactor useStylePreview (Medium Risk)

**Goal:** Replace inline logic with shared utilities

**File to modify:** `src/components/product/hooks/useStylePreview.ts`

**Changes:**
1. Import shared utilities:
   ```typescript
   import { pollPreviewStatusUntilReady } from '@/utils/previewPolling';
   import { generateAndWatermarkPreview } from '@/utils/previewGeneration';
   ```

2. Remove internal `pollPreviewStatusUntilReady` (lines 60-82)

3. Replace `generatePreview` function (lines 84-150) with:
   ```typescript
   const generatePreview = useCallback(async () => {
     // Re-entrancy guard
     if (isLoading || !croppedImage || style.id === 1 || preGeneratedPreview) {
       return;
     }

     const correctedOrientation = autoCorrect(selectedOrientation);
     const aspectRatio = getAspectRatio(correctedOrientation);

     setValidationError(null);
     setIsLoading(true);

     try {
       // Use shared generation function
       const { previewUrl: generatedUrl } = await generateAndWatermarkPreview(
         croppedImage,
         style.name,
         style.id,
         aspectRatio,
         { watermark: false, persistToDb: false }
       );

       setPreviewUrl(generatedUrl);
       setHasGeneratedPreview(true);
     } catch (error) {
       setValidationError(`Generation failed: ${error.message}`);
     } finally {
       setIsLoading(false);
     }
   }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation, autoCorrect, isLoading]);
   ```

4. Keep all unique logic:
   - Pre-generated preview handling (lines 38-56)
   - Aspect ratio validation
   - `handleClick` auto-generation
   - Return interface (same 7 fields)

**Verification:**
- [ ] ESLint passes
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] Return type matches original (7 fields)
- [ ] No new dependencies added beyond shared utils

**Testing checklist:**
- [ ] StyleCard renders correctly
- [ ] Click triggers generation
- [ ] Loading states work
- [ ] Error states work
- [ ] Pre-generated previews still display
- [ ] Watermarking works
- [ ] Validation errors display

---

### Step 4: Refactor usePreviewGeneration (Medium Risk)

**Goal:** Replace inline logic with shared utilities

**File to modify:** `src/components/product/hooks/usePreviewGeneration.ts`

**Changes:**
1. Import shared utilities (same as Step 3)

2. Remove internal `pollPreviewStatusUntilReady` (lines 13-35)

3. Replace `generatePreviewForStyle` function (lines 50-149) with:
   ```typescript
   const generatePreviewForStyle = useCallback(async (styleId: number, styleName: string) => {
     if (!uploadedImage) {
       console.error('Cannot generate preview: no image uploaded');
       return null;
     }

     setIsGenerating(true);

     try {
       // Skip generation for Original Image style
       if (styleId === 1) {
         setIsGenerating(false);
         return uploadedImage;
       }

       const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);

       // Use shared generation function
       const { previewUrl: generatedUrl, isAuthenticated } = await generateAndWatermarkPreview(
         uploadedImage,
         styleName,
         styleId,
         aspectRatio,
         {
           watermark: false,
           persistToDb: isAuthenticated // Only persist if authenticated
         }
       );

       // Update state with successful result
       setPreviewUrls(prev => ({ ...prev, [styleId]: generatedUrl }));
       setGenerationErrors(prev => {
         const newErrors = {...prev};
         delete newErrors[styleId];
         return newErrors;
       });

       setIsGenerating(false);
       return generatedUrl;
     } catch (error) {
       // Store error for this specific style
       setGenerationErrors(prev => ({
         ...prev,
         [styleId]: error.message || 'Failed to generate preview'
       }));
       setIsGenerating(false);
       return null;
     }
   }, [uploadedImage, selectedOrientation]);
   ```

4. Keep all unique logic:
   - Batch preview URL tracking (`Record<number, string>`)
   - Per-style error tracking
   - `autoGenerationComplete` state
   - Return interface (same 7 fields)

**Verification:**
- [ ] ESLint passes
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] Return type matches original (7 fields)
- [ ] No new dependencies added beyond shared utils

**Testing checklist:**
- [ ] ProductFlow bulk generation works
- [ ] Multiple styles can generate in sequence
- [ ] Error tracking per style works
- [ ] DB persistence works for authenticated users
- [ ] Watermarking works
- [ ] Loading states work across multiple styles

---

### Step 5: Verification & Cleanup

**Goal:** Ensure everything works end-to-end

**Build checks:**
- [ ] `npm run lint` passes (no new errors)
- [ ] `npm run build` succeeds
- [ ] Bundle size reduced by ~2.5KB (check `npm run build:analyze`)

**E2E testing:**
1. **StyleCard flow:**
   - [ ] Upload image
   - [ ] Crop image
   - [ ] Click style card
   - [ ] Preview generates
   - [ ] Watermark visible
   - [ ] Can select and continue

2. **Bulk generation flow:**
   - [ ] Upload image
   - [ ] Crop image
   - [ ] Multiple previews generate
   - [ ] Each preview watermarked
   - [ ] Errors handled per style

3. **Edge cases:**
   - [ ] Pre-generated preview displays (if applicable)
   - [ ] Network error shows error state
   - [ ] Timeout shows timeout error
   - [ ] Authenticated users get DB persistence

**Cleanup:**
- [ ] Remove any dead code
- [ ] Remove unused imports
- [ ] Update comments if needed
- [ ] Verify no console warnings

---

## Success Criteria

- [x] Branch created: `refactor/consolidate-preview-hooks`
- [ ] All 5 steps completed
- [ ] Bundle size reduced by ~2.5KB
- [ ] No breaking changes to consumers
- [ ] All tests pass
- [ ] E2E flow works
- [ ] ESLint clean
- [ ] Build succeeds

---

## Rollback Plan

If any step breaks functionality:

1. **Immediate rollback:**
   ```bash
   git reset --hard HEAD~1  # Undo last commit
   git push -f origin refactor/consolidate-preview-hooks
   ```

2. **Identify broken step** - Check which component is failing

3. **Fix or revert** - Either fix the issue or revert the specific file:
   ```bash
   git checkout HEAD~1 -- path/to/broken/file.ts
   ```

4. **Re-test** before proceeding to next step

---

## Notes & Observations

### During Implementation

- Use this section to track issues, decisions, or gotchas discovered during refactoring
- Document any deviations from the plan
- Note any additional testing needed

### Post-Implementation

- Bundle size change: ____ KB → ____ KB (savings: ____ KB)
- Any unexpected issues: ____
- Additional benefits discovered: ____

---

## Commit Strategy

**Step 1:** `refactor: extract shared polling logic to utils`
**Step 2:** `refactor: extract shared preview generation logic to utils`
**Step 3:** `refactor: migrate useStylePreview to use shared utils`
**Step 4:** `refactor: migrate usePreviewGeneration to use shared utils`
**Step 5:** `refactor: cleanup and verify consolidation complete`

Each commit should:
- Be atomic (can be reverted independently)
- Pass build + lint
- Include brief description of what changed

---

## References

- Original analysis: `/docs/hotspot-analysis.md` (if exists)
- useStylePreview: `src/components/product/hooks/useStylePreview.ts`
- usePreviewGeneration: `src/components/product/hooks/usePreviewGeneration.ts`
- Call sites: `useStyleCard.ts`, `useProductFlow.ts`
