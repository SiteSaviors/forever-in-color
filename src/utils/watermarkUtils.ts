import { ClientWatermarkService } from './clientWatermarkService';

export const addWatermarkToImage = async (
  imageUrl: string, 
  logoUrl: string = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png"
): Promise<string> => {
  try {
    console.log('🎨 Starting client-side watermarking process...');
    console.log('📸 Original image URL:', imageUrl.substring(0, 100) + '...');
    
    // Use the new client watermarking service
    const watermarkedImage = await ClientWatermarkService.addWatermarkToImage(imageUrl);
    
    console.log('🔍 Watermarked image URL length:', watermarkedImage.length);
    console.log('✅ Watermarking completed successfully');
    
    // Verify the watermarked image is different from original
    if (watermarkedImage === imageUrl) {
      console.warn('⚠️ Watermarked image is same as original - watermark may not have been applied');
    } else {
      console.log('✨ Watermarked image is different from original - watermark applied');
    }
    
    return watermarkedImage;
    
  } catch (error) {
    console.error('❌ Client-side watermarking failed:', error);
    console.log('🔄 Returning original image as fallback');
    return imageUrl;
  }
};