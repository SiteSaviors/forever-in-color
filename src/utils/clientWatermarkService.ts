
/**
 * Client-side watermarking service
 * Adds the gradient infinity logo to the center of generated images
 */
export class ClientWatermarkService {
  private static logoUrl = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png";

  /**
   * Add watermark to image on the client side using Canvas API
   */
  static async addWatermarkToImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const mainImage = new Image();
      mainImage.crossOrigin = 'anonymous';
      
      mainImage.onload = () => {
        // Set canvas size to match the main image
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        
        // Draw the main image
        ctx.drawImage(mainImage, 0, 0);
        
        // Load and draw the watermark
        const watermarkImage = new Image();
        watermarkImage.crossOrigin = 'anonymous';
        
        watermarkImage.onload = () => {
          // Calculate watermark size (15% of image width, maintaining aspect ratio)
          const watermarkWidth = mainImage.width * 0.15;
          const aspectRatio = watermarkImage.height / watermarkImage.width;
          const watermarkHeight = watermarkWidth * aspectRatio;
          
          // Position watermark in center
          const x = (mainImage.width - watermarkWidth) / 2;
          const y = (mainImage.height - watermarkHeight) / 2;
          
          // Set opacity for watermark (30% transparency)
          ctx.globalAlpha = 0.3;
          
          // Draw watermark in center
          ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
          
          // Convert to data URL with high quality
          const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
          console.log('✅ Client-side watermark applied successfully');
          resolve(watermarkedImageUrl);
        };
        
        watermarkImage.onerror = () => {
          console.warn('⚠️ Failed to load watermark, returning original image');
          resolve(imageUrl);
        };
        
        watermarkImage.src = this.logoUrl;
      };
      
      mainImage.onerror = () => {
        console.error('❌ Failed to load main image for watermarking');
        reject(new Error('Failed to load main image'));
      };
      
      mainImage.src = imageUrl;
    });
  }

  /**
   * Generate session ID for tracking
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
