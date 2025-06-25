
import { ImageProcessingOptions, ImageDimensions, CompressionResult } from './types';

export class ImageCompressionService {
  private readonly COMPRESSION_QUALITY = 0.8;
  private readonly MAX_DIMENSIONS = {
    preview: { width: 1024, height: 1024 },
    thumbnail: { width: 300, height: 300 },
    display: { width: 800, height: 800 }
  };

  // Compress image for efficient processing
  async compressImage(
    imageDataUrl: string, 
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    const {
      maxWidth = this.MAX_DIMENSIONS.preview.width,
      maxHeight = this.MAX_DIMENSIONS.preview.height,
      quality = this.COMPRESSION_QUALITY,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          const { width: newWidth, height: newHeight } = this.calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          );

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Use high-quality scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          const compressedDataUrl = canvas.toDataURL(
            format === 'png' ? 'image/png' : `image/${format}`,
            quality
          );

          const originalSizeMB = this.getImageSizeMB(imageDataUrl);
          const compressedSizeMB = this.getImageSizeMB(compressedDataUrl);
          
          console.log(`🗜️ Image compressed: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);
          
          // Clean up
          canvas.remove();
          img.remove();
          
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = imageDataUrl;
    });
  }

  // Calculate optimal dimensions maintaining aspect ratio
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): ImageDimensions {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Scale down if necessary
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  // Get image size in MB
  getImageSizeMB(dataUrl: string): number {
    // Remove data URL prefix to get base64 content
    const base64 = dataUrl.split(',')[1] || dataUrl;
    // Convert base64 to approximate byte size
    const bytes = (base64.length * 3) / 4;
    return bytes / (1024 * 1024);
  }

  // Create thumbnail for UI display
  async createThumbnail(imageDataUrl: string): Promise<string> {
    return this.compressImage(imageDataUrl, {
      maxWidth: this.MAX_DIMENSIONS.thumbnail.width,
      maxHeight: this.MAX_DIMENSIONS.thumbnail.height,
      quality: 0.7,
      format: 'jpeg'
    });
  }
}
