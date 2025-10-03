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
