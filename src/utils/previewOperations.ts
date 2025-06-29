
import { artStyles } from "@/data/artStyles";

export interface PreviewOptions {
  styleId: number;
  imageUrl: string;
  orientation: string;
  quality?: number;
  watermark?: boolean;
}

export interface PreviewResult {
  previewUrl: string;
  styleId: number;
  timestamp: number;
  cached?: boolean;
}

const previewCache = new Map<string, PreviewResult>();

export const generateStylePreview = async (options: PreviewOptions): Promise<PreviewResult> => {
  const cacheKey = `${options.styleId}-${options.imageUrl}-${options.orientation}`;
  
  const cached = previewCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return { ...cached, cached: true };
  }

  try {
    const mockPreview = await createMockPreview(options);
    
    const result: PreviewResult = {
      previewUrl: mockPreview,
      styleId: options.styleId,
      timestamp: Date.now()
    };

    previewCache.set(cacheKey, result);
    return result;
  } catch (error) {
    throw new Error('Failed to generate preview');
  }
};

const createMockPreview = async (options: PreviewOptions): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve(options.imageUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const style = artStyles.find(s => s.id === options.styleId);
      if (style) {
        applyStyleEffect(ctx, canvas, style.name);
      }
      
      if (options.watermark) {
        addPreviewWatermark(ctx, canvas);
      }
      
      resolve(canvas.toDataURL('image/jpeg', options.quality || 0.8));
    };
    
    img.onerror = () => {
      resolve(options.imageUrl);
    };
    
    img.src = options.imageUrl;
  });
};

const applyStyleEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, styleName: string) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  switch (styleName.toLowerCase()) {
    case 'classic oil':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.1);
        data[i + 1] = Math.min(255, data[i + 1] * 1.05);
        data[i + 2] = Math.min(255, data[i + 2] * 0.95);
      }
      break;
    case 'watercolor dreams':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 0.9 + 30);
        data[i + 1] = Math.min(255, data[i + 1] * 0.95 + 20);
        data[i + 2] = Math.min(255, data[i + 2] * 1.1 + 10);
      }
      break;
    case 'abstract fusion':
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = Math.min(255, avg * 1.2);
        data[i + 1] = Math.min(255, avg * 0.8);
        data[i + 2] = Math.min(255, avg * 1.1);
      }
      break;
    default:
      break;
  }

  ctx.putImageData(imageData, 0, 0);
};

const addPreviewWatermark = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(canvas.width - 150, canvas.height - 30, 140, 25);
  
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText('PREVIEW', canvas.width - 140, canvas.height - 10);
  ctx.restore();
};

export const batchGeneratePreviews = async (
  imageUrl: string,
  styleIds: number[],
  orientation: string
): Promise<PreviewResult[]> => {
  const promises = styleIds.map(styleId =>
    generateStylePreview({
      styleId,
      imageUrl,
      orientation,
      watermark: true
    })
  );

  try {
    const results = await Promise.allSettled(promises);
    return results
      .filter((result): result is PromiseFulfilledResult<PreviewResult> => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    return [];
  }
};

export const clearPreviewCache = () => {
  previewCache.clear();
};

export const getPreviewCacheSize = (): number => {
  return previewCache.size;
};

export const preloadPreviews = async (
  imageUrl: string,
  priorityStyleIds: number[],
  orientation: string
): Promise<void> => {
  const preloadPromises = priorityStyleIds.map(styleId =>
    generateStylePreview({
      styleId,
      imageUrl,
      orientation,
      quality: 0.6
    }).catch(() => null)
  );

  await Promise.allSettled(preloadPromises);
};
