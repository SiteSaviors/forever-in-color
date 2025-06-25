
export class CanvasWatermarkService {
  private static watermarkUrl = "/lovable-uploads/6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";

  static async createWatermarkedImage(
    imageUrl: string, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<string> {
    console.log('Creating watermarked image using Canvas API approach');
    
    try {
      // Import canvas for Deno
      const { createCanvas, loadImage } = await import('https://deno.land/x/canvas@v1.4.1/mod.ts');
      
      console.log('Loading original image from:', imageUrl.substring(0, 50) + '...');
      
      // Load the original generated image
      const originalImage = await loadImage(imageUrl);
      console.log('Original image loaded successfully:', { width: originalImage.width(), height: originalImage.height() });

      // Create canvas with same dimensions
      const canvas = createCanvas(originalImage.width(), originalImage.height());
      const ctx = canvas.getContext('2d');
      
      // Draw the original image
      ctx.drawImage(originalImage, 0, 0);

      if (isPreview) {
        // Load and draw the infinity logo watermark in center
        try {
          const logoUrl = `https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`;
          console.log('Loading infinity logo from:', logoUrl);
          
          const logoImage = await loadImage(logoUrl);
          console.log('Infinity logo loaded successfully');
          
          // Calculate logo size (20% of image width, maintaining aspect ratio)
          const logoSize = Math.floor(originalImage.width() * 0.2);
          const logoAspectRatio = logoImage.height() / logoImage.width();
          const logoHeight = Math.floor(logoSize * logoAspectRatio);
          
          // Position logo in exact center
          const logoX = Math.floor((originalImage.width() - logoSize) / 2);
          const logoY = Math.floor((originalImage.height() - logoHeight) / 2);
          
          // Set opacity and draw centered logo
          ctx.globalAlpha = 0.4;
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoHeight);
          ctx.globalAlpha = 1.0;
          
          console.log('Infinity logo watermark added successfully at center:', { x: logoX, y: logoY, width: logoSize, height: logoHeight });
        } catch (logoError) {
          console.warn('Could not load infinity logo watermark:', logoError);
        }
      }

      // Convert canvas to base64 data URL
      const watermarkedDataUrl = canvas.toDataURL('image/png', 0.9);
      console.log('Canvas watermarking completed successfully');
      
      return watermarkedDataUrl;

    } catch (error) {
      console.error('Canvas watermarking failed:', error);
      // Return original URL if watermarking fails
      return imageUrl;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
