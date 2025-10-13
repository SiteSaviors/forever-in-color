import { watermarkManager } from './watermarkManager';
import { generateStylePreview } from './stylePreviewApi';
import { pollPreviewStatusUntilReady } from './previewPolling';

export interface GeneratePreviewOptions {
  watermark?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  onStage?: (stage: 'generating' | 'polling' | 'watermarking') => void;
}

export interface GeneratePreviewResult {
  previewUrl: string;
  isAuthenticated: boolean;
}

export const generateAndWatermarkPreview = async (
  imageUrl: string,
  styleName: string,
  styleId: string,
  aspectRatio: string,
  options: GeneratePreviewOptions = {}
): Promise<GeneratePreviewResult> => {
  const { watermark = true, onStage } = options;

  onStage?.('generating');

  const requestId = `${styleId}-${Date.now()}`;
  const generationResult = await generateStylePreview(
    imageUrl,
    styleName,
    requestId,
    aspectRatio,
    { watermark }
  );

  let rawPreviewUrl: string;

  if (generationResult.status === 'complete') {
    rawPreviewUrl = generationResult.previewUrl;
  } else {
    onStage?.('polling');
    rawPreviewUrl = await pollPreviewStatusUntilReady(generationResult.requestId);
  }

  if (!rawPreviewUrl) {
    throw new Error('Failed to generate preview');
  }

  if (watermark) {
    onStage?.('watermarking');
    try {
      const watermarked = await watermarkManager.addWatermark(rawPreviewUrl);
      return {
        previewUrl: watermarked,
        isAuthenticated: generationResult.status === 'complete' ? generationResult.isAuthenticated : false,
      };
    } catch (error) {
      console.warn('[FounderPreviewGeneration] Watermarking failed, using raw preview.', error);
    }
  }

  return {
    previewUrl: rawPreviewUrl,
    isAuthenticated: generationResult.status === 'complete' ? generationResult.isAuthenticated : false,
  };
};
