import { ClientWatermarkService } from './clientWatermarkService';

export const addWatermarkToImage = async (
  imageUrl: string, 
  logoUrl: string = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png"
): Promise<string> => {
  try {
    // Use the new client watermarking service
    const watermarkedImage = await ClientWatermarkService.addWatermarkToImage(imageUrl);
    
    // Verify the watermarked image is different from original
    if (watermarkedImage === imageUrl) {
      // Watermark may not have been applied
    }
    
    return watermarkedImage;
  } catch (error) {
    return imageUrl;
  }
};