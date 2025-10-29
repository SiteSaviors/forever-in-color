import type { StyleOption } from '@/store/founder/storeTypes';

export type PreviewResult = {
  previewUrl: string;
  watermarkApplied: boolean;
  startedAt: number;
  completedAt: number;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
};

const simulateDelay = (min = 400, max = 900) =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));

const PREVIEW_ENDPOINT = import.meta.env.VITE_FOUNDER_PREVIEW_ENDPOINT as string | undefined;
const PREVIEW_TOKEN = import.meta.env.VITE_FOUNDER_PREVIEW_TOKEN as string | undefined;

export async function fetchPreviewForStyle(style: StyleOption, baseImage?: string): Promise<PreviewResult> {
  const startedAt = Date.now();

  if (PREVIEW_ENDPOINT) {
    try {
      const response = await fetch(PREVIEW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(PREVIEW_TOKEN ? { Authorization: `Bearer ${PREVIEW_TOKEN}` } : {}),
        },
        body: JSON.stringify({
          styleId: style.id,
          styleName: style.name,
          previewUrl: style.preview,
          baseImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Preview request failed: ${response.status}`);
      }

      const data = (await response.json()) as { previewUrl?: string; watermarkApplied?: boolean };
      if (data.previewUrl) {
        return {
          previewUrl: data.previewUrl,
          watermarkApplied: data.watermarkApplied ?? true,
          startedAt,
          completedAt: Date.now(),
        };
      }
    } catch (error) {
      console.warn('[PreviewClient] Falling back to mock preview', error);
    }
  }

  await simulateDelay();
  const previewUrl = await mockStylize(baseImage ?? style.preview, style);
  return {
    previewUrl,
    watermarkApplied: true,
    startedAt,
    completedAt: Date.now(),
    storageUrl: previewUrl,
    storagePath: null
  };
}

async function mockStylize(imageSrc: string, style: StyleOption): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = styleTint(style.id);
  ctx.globalAlpha = 0.25;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  return canvas.toDataURL('image/jpeg', 0.9);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function styleTint(id: string): string {
  switch (id) {
    case 'neon-bloom':
      return 'rgba(236, 72, 153, 0.95)';
    case 'monochrome-muse':
      return 'rgba(15, 23, 42, 0.9)';
    default:
      return 'rgba(59, 130, 246, 0.9)';
  }
}
