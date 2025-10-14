
export type FounderPreviewStage = 'generating' | 'polling' | 'watermarking';

export interface FounderPreviewParams {
  imageUrl: string;
  styleId: string;
  styleName: string;
  aspectRatio: string;
  onStage?: (stage: FounderPreviewStage) => void;
  signal?: AbortSignal;
  anonToken?: string | null;
  accessToken?: string | null;
  idempotencyKey?: string;
}

export interface FounderPreviewResult {
  previewUrl: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
}

const PREVIEW_MODE = import.meta.env.VITE_FOUNDER_PREVIEW_MODE ?? 'live';

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = window.setTimeout(() => {
      resolve();
    }, ms);

    signal?.addEventListener('abort', () => {
      window.clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });

export const startFounderPreviewGeneration = async ({
  imageUrl,
  styleId,
  styleName,
  aspectRatio,
  onStage,
  signal,
  anonToken,
  accessToken,
  idempotencyKey,
}: FounderPreviewParams): Promise<FounderPreviewResult> => {
  if (!imageUrl) {
    throw new Error('No base image available for style generation');
  }

  onStage?.('generating');

  if (PREVIEW_MODE === 'stub') {
    await delay(700, signal);
    onStage?.('polling');
    await delay(600, signal);
    onStage?.('watermarking');
    await delay(500, signal);
    return {
      previewUrl: imageUrl,
      requiresWatermark: true,
      remainingTokens: null,
      tier: 'anonymous',
      priority: 'normal'
    };
  }

  const result = await generateAndWatermarkPreview(
    imageUrl,
    styleName,
    styleId,
    aspectRatio,
    {
      watermark: true,
      onStage: (stage) => onStage?.(stage),
      anonToken,
      accessToken,
      idempotencyKey
    }
  );

  return result;
};
import { generateAndWatermarkPreview } from './previewGeneration';
