import { generateStylePreview } from './stylePreviewApi';
import { pollPreviewStatusUntilReady } from './previewPolling';

export interface GeneratePreviewOptions {
  quality?: 'low' | 'medium' | 'high' | 'auto';
  onStage?: (stage: 'generating' | 'polling' | 'watermarking') => void;
  idempotencyKey?: string;
  anonToken?: string | null;
  accessToken?: string | null;
  fingerprintHash?: string | null;
}

export interface GeneratePreviewResult {
  previewUrl: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
}

export const generateAndWatermarkPreview = async (
  imageUrl: string,
  styleName: string,
  styleId: string,
  aspectRatio: string,
  options: GeneratePreviewOptions = {}
): Promise<GeneratePreviewResult> => {
  const { onStage } = options;

  onStage?.('generating');

  const requestId = `${styleId}-${Date.now()}`;
  // Note: Watermarking is now determined server-side based on user entitlements
  // Frontend no longer controls watermark parameter
  const generationResult = await generateStylePreview({
    imageUrl,
    style: styleName,
    photoId: requestId,
    aspectRatio,
    options: {
      quality: options.quality,
      idempotencyKey: options.idempotencyKey ?? requestId,
      anonToken: options.anonToken ?? null,
      accessToken: options.accessToken ?? null,
      fingerprintHash: options.fingerprintHash ?? null
    }
  });

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

  if (generationResult.requiresWatermark) {
    onStage?.('watermarking');
  }

  return {
    previewUrl: rawPreviewUrl,
    requiresWatermark: Boolean(generationResult.requiresWatermark),
    remainingTokens: generationResult.remainingTokens ?? null,
    tier: generationResult.tier,
    priority: generationResult.priority,
    storageUrl: generationResult.storageUrl ?? null,
    storagePath: generationResult.storagePath ?? null,
    softRemaining: generationResult.softRemaining ?? null
  };
};
