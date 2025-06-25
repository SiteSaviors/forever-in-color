
import { ImageCompressionService } from './imageCompression';
import { MemoryMonitorService } from './memoryMonitor';
import { MemoryCleanupService } from './memoryCleanup';
import { ImageProcessingOptions } from './types';

class MemoryManager {
  private readonly MAX_IMAGE_SIZE_MB = 10;
  private imageCompression = new ImageCompressionService();
  private memoryMonitor = new MemoryMonitorService();
  private memoryCleanup = new MemoryCleanupService();

  // Compress image for efficient processing
  async compressImage(
    imageDataUrl: string, 
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    return this.imageCompression.compressImage(imageDataUrl, options);
  }

  // Get image size in MB
  getImageSizeMB(dataUrl: string): number {
    return this.imageCompression.getImageSizeMB(dataUrl);
  }

  // Check if image needs compression
  needsCompression(imageDataUrl: string): boolean {
    return this.getImageSizeMB(imageDataUrl) > this.MAX_IMAGE_SIZE_MB;
  }

  // Create thumbnail for UI display
  async createThumbnail(imageDataUrl: string): Promise<string> {
    return this.imageCompression.createThumbnail(imageDataUrl);
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
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      format: 'jpeg'
    });
  }

  // Monitor memory usage
  getMemoryUsage() {
    return this.memoryMonitor.getMemoryUsage();
  }

  // Clean up memory
  cleanupImageElements(): void {
    this.memoryCleanup.cleanupImageElements();
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

// Re-export types for convenience
export * from './types';
