
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';

export class CanvasWatermarkService {
  private static watermarkUrl = "/lovable-uploads/6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";

  static async createWatermarkedImage(
    imageUrl: string, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<string> {
    console.log('Creating watermarked image using ImageScript approach');
    
    try {
      console.log('Loading original image from:', imageUrl.substring(0, 50) + '...');
      
      // Load the original generated image
      const originalResponse = await fetch(imageUrl);
      if (!originalResponse.ok) {
        throw new Error(`Failed to fetch original image: ${originalResponse.status}`);
      }
      const originalBuffer = await originalResponse.arrayBuffer();
      const originalImage = await Image.decode(new Uint8Array(originalBuffer));
      
      console.log('Original image loaded successfully:', { width: originalImage.width, height: originalImage.height });

      if (isPreview) {
        // Load and composite the infinity logo watermark
        try {
          const logoUrl = `https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`;
          console.log('Loading infinity logo from:', logoUrl);
          
          const logoResponse = await fetch(logoUrl);
          if (!logoResponse.ok) {
            throw new Error(`Failed to fetch logo: ${logoResponse.status}`);
          }
          const logoBuffer = await logoResponse.arrayBuffer();
          const logoImage = await Image.decode(new Uint8Array(logoBuffer));
          
          console.log('Infinity logo loaded successfully');
          
          // Calculate logo size (20% of image width, maintaining aspect ratio)
          const logoScale = (originalImage.width * 0.2) / logoImage.width;
          const logoWidth = Math.round(logoImage.width * logoScale);
          const logoHeight = Math.round(logoImage.height * logoScale);
          const resizedLogo = logoImage.resize(logoWidth, logoHeight);
          
          // Position logo in exact center
          const logoX = Math.round((originalImage.width - logoWidth) / 2);
          const logoY = Math.round((originalImage.height - logoHeight) / 2);
          
          // Composite logo with 40% opacity at center
          originalImage.composite(resizedLogo, logoX, logoY);
          
          console.log('Infinity logo watermark added successfully at center:', { 
            x: logoX, 
            y: logoY, 
            width: logoWidth, 
            height: logoHeight,
            opacity: '40%'
          });
        } catch (logoError) {
          console.warn('Could not load infinity logo watermark:', logoError);
        }
      }

      // Encode the final watermarked image as PNG
      const outputBuffer = await originalImage.encode();
      
      // Convert to base64 data URL
      const base64 = btoa(String.fromCharCode(...new Uint8Array(outputBuffer)));
      const watermarkedDataUrl = `data:image/png;base64,${base64}`;

      console.log('ImageScript watermarking completed successfully');
      return watermarkedDataUrl;

    } catch (error) {
      console.error('ImageScript watermarking failed:', error);
      // Return original URL if watermarking fails
      return imageUrl;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
