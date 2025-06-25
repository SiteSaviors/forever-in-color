
interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

class MemoryManager {
  private readonly MAX_IMAGE_SIZE_MB = 10;
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
  ): { width: number; height: number } {
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

  // Check if image needs compression
  needsCompression(imageDataUrl: string): boolean {
    return this.getImageSizeMB(imageDataUrl) > this.MAX_IMAGE_SIZE_MB;
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

  // Optimize image for preview generation
  async optimizeForPreview(imageDataUrl: string): Promise<string> {
    // Check if compression is needed
    if (!this.needsCompression(imageDataUrl)) {
      console.log('🟢 Image size acceptable, no compression needed');
      return imageDataUrl;
    }

    console.log('🔄 Optimizing large image for preview generation...');
    
    return this.compressImage(imageDataUrl, {
      maxWidth: this.MAX_DIMENSIONS.preview.width,
      maxHeight: this.MAX_DIMENSIONS.preview.height,
      quality: this.COMPRESSION_QUALITY,
      format: 'jpeg'
    });
  }

  // Monitor memory usage (approximate)
  getMemoryUsage(): { 
    estimatedMB: number; 
    recommendation: string;
  } {
    const performanceMemory = (performance as any).memory;
    
    if (performanceMemory) {
      const usedMB = performanceMemory.usedJSHeapSize / (1024 * 1024);
      const totalMB = performanceMemory.totalJSHeapSize / (1024 * 1024);
      
      let recommendation = 'Memory usage normal';
      if (usedMB > 100) {
        recommendation = 'Consider clearing cache or compressing images';
      }
      if (usedMB > 200) {
        recommendation = 'High memory usage - clear cache recommended';
      }
      
      return { 
        estimatedMB: usedMB,
        recommendation 
      };
    }
    
    return { 
      estimatedMB: 0, 
      recommendation: 'Memory monitoring not available' 
    };
  }

  // Clean up memory by removing large data URLs from DOM
  cleanupImageElements(): void {
    const images = document.querySelectorAll('img[src^="data:"]');
    const canvases = document.querySelectorAll('canvas');
    
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (this.getImageSizeMB(src) > 5) {
        // Replace large data URLs with placeholder
        img.setAttribute('data-original-src', src);
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+'; // 1x1 transparent
      }
    });
    
    // Remove unused canvases
    canvases.forEach(canvas => {
      if (!canvas.parentElement || canvas.parentElement.style.display === 'none') {
        canvas.remove();
      }
    });
    
    console.log(`🧹 Cleaned up ${images.length} images and ${canvases.length} canvases`);
  }
}

export const memoryManager = new MemoryManager();

// Utility to monitor and log memory usage
export const logMemoryUsage = (): void => {
  const usage = memoryManager.getMemoryUsage();
  console.log('🧠 Memory Usage:', {
    estimatedMB: usage.estimatedMB.toFixed(2) + 'MB',
    recommendation: usage.recommendation
  });
};

// Auto cleanup on page visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    memoryManager.cleanupImageElements();
  }
});
