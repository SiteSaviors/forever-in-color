
import { ClientWatermarkService } from './clientWatermarkService';

export const addWatermarkToImage = async (
  imageUrl: string, 
  logoUrl: string = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png"
): Promise<string> => {
  try {
    console.log('🎨 Adding client-side watermark to image...');
    
    // Use the new client watermarking service
    const watermarkedImage = await ClientWatermarkService.addWatermarkToImage(imageUrl);
    
    console.log('✅ Watermarking completed successfully');
    return watermarkedImage;
    
  } catch (error) {
    console.error('❌ Client-side watermarking failed:', error);
    console.log('🔄 Returning original image as fallback');
    return imageUrl;
  }
};
