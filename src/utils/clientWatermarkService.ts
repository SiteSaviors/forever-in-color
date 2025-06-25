
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
        // CRITICAL: Set canvas size to EXACTLY match the main image - no scaling
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        
        console.log(`📐 Canvas dimensions: ${canvas.width}x${canvas.height}`);
        console.log(`📐 Original image dimensions: ${mainImage.width}x${mainImage.height}`);
        
        // Draw the main image at exact size and position - no scaling or cropping
        ctx.drawImage(mainImage, 0, 0, mainImage.width, mainImage.height, 0, 0, canvas.width, canvas.height);
        
        // Load and draw the watermark
        const watermarkImage = new Image();
        watermarkImage.crossOrigin = 'anonymous';
        
        watermarkImage.onload = () => {
          console.log(`🖼️ Watermark image loaded: ${watermarkImage.width}x${watermarkImage.height}`);
          
          // Calculate watermark size (80% of image width - 400% increase from 20%)
          const watermarkWidth = mainImage.width * 0.8;
          const aspectRatio = watermarkImage.height / watermarkImage.width;
          const watermarkHeight = watermarkWidth * aspectRatio;
          
          // Position watermark in center
          const x = (mainImage.width - watermarkWidth) / 2;
          const y = (mainImage.height - watermarkHeight) / 2;
          
          console.log(`🎯 Watermark position: (${x}, ${y}), size: ${watermarkWidth}x${watermarkHeight}`);
          console.log(`🎯 Image center calculation: width=${mainImage.width}, height=${mainImage.height}`);
          
          // Set opacity for watermark (50% for better visibility)
          ctx.globalAlpha = 0.5;
          
          // Add a subtle shadow for better contrast
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Draw watermark in center
          ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
          
          // Reset shadow and alpha
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.globalAlpha = 1;
          
          // Convert to data URL with high quality - preserve original format and quality
          const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
          console.log('✅ Client-side watermark applied successfully with 400% increased size');
          console.log('✅ Canvas output dimensions match original input exactly');
          resolve(watermarkedImageUrl);
        };
        
        watermarkImage.onerror = (error) => {
          console.warn('⚠️ Failed to load watermark, returning original image', error);
          resolve(imageUrl);
        };
        
        watermarkImage.src = this.logoUrl;
      };
      
      mainImage.onerror = (error) => {
        console.error('❌ Failed to load main image for watermarking', error);
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
