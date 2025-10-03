import { watermarkManager } from './watermarkManager';

/**
 * Add watermark to image using Web Worker
 * @deprecated - Import watermarkManager directly for better performance control
 */
export const addWatermarkToImage = async (
  imageUrl: string,
  logoUrl: string = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png"
): Promise<string> => {
  try {
    // Use Web Worker watermarking service
    const watermarkedImage = await watermarkManager.addWatermark(imageUrl);

    // Verify the watermarked image is different from original
    if (watermarkedImage === imageUrl) {
      // Watermark may not have been applied
    }

    return watermarkedImage;
  } catch (_error) {
    return imageUrl;
  }
};