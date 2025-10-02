/**
 * Web Worker for watermarking images
 * Runs canvas operations off the main thread to prevent UI freezing
 */

interface WatermarkRequest {
  type: 'watermark';
  imageUrl: string;
  watermarkUrl: string;
  requestId: string;
}

interface WatermarkResponse {
  type: 'success' | 'error';
  requestId: string;
  watermarkedImageUrl?: string;
  error?: string;
}

const WATERMARK_CONFIG = {
  // 80% of image width for watermark (matching current implementation)
  sizeRatio: 0.8,
  opacity: 0.5,
  shadow: {
    color: 'rgba(0, 0, 0, 0.3)',
    blur: 4,
    offsetX: 2,
    offsetY: 2,
  },
  // High quality JPEG output
  quality: 0.95,
} as const;

/**
 * Load image as ImageBitmap (async, efficient for workers)
 */
async function loadImageBitmap(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  const blob = await response.blob();
  return await createImageBitmap(blob);
}

/**
 * Add watermark to image using OffscreenCanvas
 */
async function addWatermark(
  imageUrl: string,
  watermarkUrl: string
): Promise<string> {
  // Load both images in parallel
  const [mainImageBitmap, watermarkBitmap] = await Promise.all([
    loadImageBitmap(imageUrl),
    loadImageBitmap(watermarkUrl),
  ]);

  // Create OffscreenCanvas matching main image size
  const canvas = new OffscreenCanvas(mainImageBitmap.width, mainImageBitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('OffscreenCanvas 2D context not available');
  }

  // Draw main image at exact size - no scaling
  ctx.drawImage(
    mainImageBitmap,
    0,
    0,
    mainImageBitmap.width,
    mainImageBitmap.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Calculate watermark dimensions (80% of image width)
  const watermarkWidth = mainImageBitmap.width * WATERMARK_CONFIG.sizeRatio;
  const aspectRatio = watermarkBitmap.height / watermarkBitmap.width;
  const watermarkHeight = watermarkWidth * aspectRatio;

  // Center watermark
  const x = (mainImageBitmap.width - watermarkWidth) / 2;
  const y = (mainImageBitmap.height - watermarkHeight) / 2;

  // Apply shadow effect
  ctx.shadowColor = WATERMARK_CONFIG.shadow.color;
  ctx.shadowBlur = WATERMARK_CONFIG.shadow.blur;
  ctx.shadowOffsetX = WATERMARK_CONFIG.shadow.offsetX;
  ctx.shadowOffsetY = WATERMARK_CONFIG.shadow.offsetY;

  // Set opacity
  ctx.globalAlpha = WATERMARK_CONFIG.opacity;

  // Draw watermark
  ctx.drawImage(watermarkBitmap, x, y, watermarkWidth, watermarkHeight);

  // Reset shadow and alpha
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.globalAlpha = 1;

  // Convert to Blob then to data URL
  const blob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: WATERMARK_CONFIG.quality,
  });

  // Convert blob to data URL
  return await blobToDataURL(blob);
}

/**
 * Convert Blob to data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Message handler
 */
self.onmessage = async (event: MessageEvent<WatermarkRequest>) => {
  const { type, imageUrl, watermarkUrl, requestId } = event.data;

  if (type !== 'watermark') {
    const errorResponse: WatermarkResponse = {
      type: 'error',
      requestId,
      error: `Unknown message type: ${type}`,
    };
    self.postMessage(errorResponse);
    return;
  }

  try {
    const watermarkedImageUrl = await addWatermark(imageUrl, watermarkUrl);

    const successResponse: WatermarkResponse = {
      type: 'success',
      requestId,
      watermarkedImageUrl,
    };

    self.postMessage(successResponse);
  } catch (error) {
    const errorResponse: WatermarkResponse = {
      type: 'error',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error during watermarking',
    };

    self.postMessage(errorResponse);
  }
};
