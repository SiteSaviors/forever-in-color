
import { ImageCompressionService } from './imageCompression';

export class MemoryCleanupService {
  private imageCompression = new ImageCompressionService();

  // Clean up memory by removing large data URLs from DOM
  cleanupImageElements(): void {
    const images = document.querySelectorAll('img[src^="data:"]');
    const canvases = document.querySelectorAll('canvas');
    
    images.forEach(img => {
      const imageElement = img as HTMLImageElement;
      const src = imageElement.src || '';
      if (this.imageCompression.getImageSizeMB(src) > 5) {
        // Replace large data URLs with placeholder
        imageElement.setAttribute('data-original-src', src);
        imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+'; // 1x1 transparent
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
