
export class CanvasWatermarkService {
  private static watermarkUrl = "/lovable-uploads/781d4b89-6ecc-4101-aeaf-c5743efce1c1.png";

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
        // Load and draw the watermark logo
        try {
          const logoUrl = `https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`;
          console.log('Loading watermark logo from:', logoUrl);
          
          const logoImage = await loadImage(logoUrl);
          console.log('Logo loaded successfully');
          
          // Calculate logo size (15% of image width, maintaining aspect ratio)
          const logoSize = Math.floor(originalImage.width() * 0.15);
          const logoAspectRatio = logoImage.height() / logoImage.width();
          const logoHeight = Math.floor(logoSize * logoAspectRatio);
          
          // Position logo in center
          const logoX = Math.floor((originalImage.width() - logoSize) / 2);
          const logoY = Math.floor((originalImage.height() - logoHeight) / 2);
          
          // Set opacity and draw logo
          ctx.globalAlpha = 0.3;
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoHeight);
          ctx.globalAlpha = 1.0;
          
          console.log('Logo watermark added successfully');
        } catch (logoError) {
          console.warn('Could not load logo watermark:', logoError);
        }

        // Add session ID text watermark
        if (sessionId) {
          const sessionText = sessionId.slice(0, 8);
          const timestamp = new Date().toISOString().slice(0, 10);
          const watermarkText = `${sessionText} • ${timestamp}`;
          
          // Set up text style
          ctx.font = `${Math.floor(originalImage.width() * 0.03)}px Arial`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          
          // Draw text in bottom-left corner
          const textX = Math.floor(originalImage.width() * 0.02);
          const textY = Math.floor(originalImage.height() * 0.95);
          
          ctx.strokeText(watermarkText, textX, textY);
          ctx.fillText(watermarkText, textX, textY);
          
          console.log('Session text watermark added:', watermarkText);
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
