
export type FounderPreviewStage = 'generating' | 'polling' | 'watermarking';

export interface FounderPreviewParams {
  imageUrl: string;
  styleId: string;
  styleName: string;
  aspectRatio: string;
  onStage?: (stage: FounderPreviewStage) => void;
  signal?: AbortSignal;
  accessToken?: string | null;
  idempotencyKey?: string;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  cropConfig?: PreviewCropConfig | null;
}

export interface FounderPreviewResult {
  previewUrl: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  previewLogId?: string | null;
  cropConfig?: PreviewCropConfig | null;
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

const debugStepOneStage = (stage: FounderPreviewStage, context: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.debug('[StepOneSequence]', {
      stage,
      ...context,
      timestamp: Date.now(),
    });
  }
};

export const startFounderPreviewGeneration = async ({
  imageUrl,
  styleId,
  styleName,
  aspectRatio,
  onStage,
  signal,
  accessToken,
  idempotencyKey,
  sourceStoragePath,
  sourceDisplayUrl,
  cropConfig,
}: FounderPreviewParams): Promise<FounderPreviewResult> => {
  if (!imageUrl) {
    throw new Error('No base image available for style generation');
  }

  debugStepOneStage('generating', { styleId, mode: PREVIEW_MODE });
  onStage?.('generating');

  if (PREVIEW_MODE === 'stub') {
    await delay(700, signal);
    debugStepOneStage('polling', { styleId, mode: PREVIEW_MODE });
    onStage?.('polling');
    await delay(600, signal);
    debugStepOneStage('watermarking', { styleId, mode: PREVIEW_MODE });
    onStage?.('watermarking');
    await delay(500, signal);
    return {
      previewUrl: imageUrl,
      requiresWatermark: true,
      remainingTokens: null,
      tier: 'free',
      priority: 'normal',
      storageUrl: imageUrl,
      storagePath: null,
      softRemaining: null,
      sourceStoragePath: null,
      sourceDisplayUrl: imageUrl,
      previewLogId: null,
      cropConfig: null
    };
  }

  // Server determines watermarking based on entitlements - frontend doesn't control this
  const result = await generateAndWatermarkPreview(
    imageUrl,
    styleName,
    styleId,
    aspectRatio,
    {
      onStage: (stage) => {
        debugStepOneStage(stage, { styleId, mode: PREVIEW_MODE });
        onStage?.(stage);
      },
      accessToken,
      idempotencyKey,
      sourceStoragePath,
      sourceDisplayUrl,
      cropConfig,
    }
  );

  return result;
};
import { generateAndWatermarkPreview } from './previewGeneration';
import type { PreviewCropConfig } from '../../shared/validation/previewSchemas';
