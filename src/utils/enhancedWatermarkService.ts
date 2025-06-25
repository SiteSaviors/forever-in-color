
import { ClientWatermarkService } from './clientWatermarkService';

export interface WatermarkResult {
  success: boolean;
  url: string;
  method: 'watermarked' | 'original' | 'fallback';
  error?: string;
}

export class EnhancedWatermarkService {
  private static fallbackWatermarkUrl = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png";
  private static maxRetries = 2;
  private static retryDelay = 1000; // 1 second

  /**
   * Apply watermark with comprehensive fallback handling
   */
  static async applyWatermarkWithFallbacks(imageUrl: string): Promise<WatermarkResult> {
    console.log('🎨 Starting enhanced watermarking process with fallbacks...');
    
    // First attempt: Try standard client-side watermarking
    try {
      const watermarkedUrl = await this.attemptWatermarking(imageUrl);
      
      if (watermarkedUrl && watermarkedUrl !== imageUrl) {
        console.log('✅ Standard watermarking successful');
        return {
          success: true,
          url: watermarkedUrl,
          method: 'watermarked'
        };
      }
    } catch (error) {
      console.warn('⚠️ Standard watermarking failed:', error);
    }

    // Second attempt: Try with fallback watermark image
    try {
      console.log('🔄 Attempting watermarking with fallback image...');
      const fallbackWatermarkedUrl = await this.attemptWatermarkingWithFallback(imageUrl);
      
      if (fallbackWatermarkedUrl && fallbackWatermarkedUrl !== imageUrl) {
        console.log('✅ Fallback watermarking successful');
        return {
          success: true,
          url: fallbackWatermarkedUrl,
          method: 'watermarked'
        };
      }
    } catch (error) {
      console.warn('⚠️ Fallback watermarking failed:', error);
    }

    // Third attempt: Add text-based watermark overlay
    try {
      console.log('🔄 Attempting text-based watermark...');
      const textWatermarkedUrl = await this.addTextWatermark(imageUrl);
      
      if (textWatermarkedUrl && textWatermarkedUrl !== imageUrl) {
        console.log('✅ Text watermarking successful');
        return {
          success: true,
          url: textWatermarkedUrl,
          method: 'watermarked'
        };
      }
    } catch (error) {
      console.warn('⚠️ Text watermarking failed:', error);
    }

    // Final fallback: Return original image with warning
    console.log('⚠️ All watermarking attempts failed, returning original image');
    return {
      success: false,
      url: imageUrl,
      method: 'original',
      error: 'Watermarking failed - using original image'
    };
  }

  /**
   * Standard watermarking attempt with retry logic
   */
  private static async attemptWatermarking(imageUrl: string, retryCount = 0): Promise<string | null> {
    try {
      return await ClientWatermarkService.addWatermarkToImage(imageUrl);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.log(`🔄 Retrying watermarking (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay);
        return this.attemptWatermarking(imageUrl, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Watermarking with fallback watermark image
   */
  private static async attemptWatermarkingWithFallback(imageUrl: string): Promise<string | null> {
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
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        
        // Draw main image
        ctx.drawImage(mainImage, 0, 0);
        
        // Add simple text overlay as fallback
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(16, mainImage.width * 0.03)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Forever In Color', mainImage.width / 2, mainImage.height / 2);
        
        // Reset alpha
        ctx.globalAlpha = 1;
        
        const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(watermarkedUrl);
      };
      
      mainImage.onerror = () => reject(new Error('Failed to load image for fallback watermarking'));
      mainImage.src = imageUrl;
    });
  }

  /**
   * Text-based watermark as final fallback
   */
  private static async addTextWatermark(imageUrl: string): Promise<string | null> {
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
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        
        // Draw main image
        ctx.drawImage(mainImage, 0, 0);
        
        // Add minimal text watermark
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${Math.max(12, mainImage.width * 0.02)}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText('ForeverInColor.com', mainImage.width - 20, mainImage.height - 20);
        
        // Reset alpha
        ctx.globalAlpha = 1;
        
        const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(watermarkedUrl);
      };
      
      mainImage.onerror = () => reject(new Error('Failed to load image for text watermarking'));
      mainImage.src = imageUrl;
    });
  }

  /**
   * Utility delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if watermarking was successful
   */
  static isWatermarkingSuccessful(result: WatermarkResult): boolean {
    return result.success && result.method === 'watermarked';
  }

  /**
   * Get user-friendly message for watermarking result
   */
  static getWatermarkMessage(result: WatermarkResult): string | null {
    if (result.success && result.method === 'watermarked') {
      return null; // No message needed for success
    }
    
    if (!result.success) {
      return 'Preview generated without watermark due to technical issues.';
    }
    
    return null;
  }
}
