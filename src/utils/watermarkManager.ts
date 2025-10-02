/**
 * WatermarkManager - Main thread coordinator for Web Worker watermarking
 * Provides a simple Promise-based API while handling worker lifecycle
 */

interface WatermarkRequest {
  type: 'watermark';
  imageUrl: string;
  watermarkUrl: string;
  requestId: string;
}

interface WatermarkResponse {
  type: 'success' | 'error';
  requestId: string;
  watermarkedImageUrl?: string;
  error?: string;
}

interface PendingRequest {
  resolve: (url: string) => void;
  reject: (error: Error) => void;
}

export class WatermarkManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;
  private readonly logoUrl = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png";

  /**
   * Initialize the worker (lazy initialization)
   */
  private initWorker(): Worker {
    if (this.worker) {
      return this.worker;
    }

    // Create worker from URL
    this.worker = new Worker(
      new URL('../workers/watermark.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Set up message handler
    this.worker.onmessage = (event: MessageEvent<WatermarkResponse>) => {
      this.handleWorkerMessage(event.data);
    };

    // Set up error handler
    this.worker.onerror = (error) => {
      console.error('[WatermarkManager] Worker error:', error);
      // Reject all pending requests
      this.pendingRequests.forEach((request) => {
        request.reject(new Error('Worker error: ' + error.message));
      });
      this.pendingRequests.clear();
    };

    return this.worker;
  }

  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(response: WatermarkResponse): void {
    const { requestId, type } = response;
    const pendingRequest = this.pendingRequests.get(requestId);

    if (!pendingRequest) {
      console.warn('[WatermarkManager] Received response for unknown request:', requestId);
      return;
    }

    // Remove from pending
    this.pendingRequests.delete(requestId);

    if (type === 'success' && response.watermarkedImageUrl) {
      pendingRequest.resolve(response.watermarkedImageUrl);
    } else if (type === 'error') {
      pendingRequest.reject(new Error(response.error || 'Unknown watermarking error'));
    } else {
      pendingRequest.reject(new Error('Invalid response from worker'));
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestIdCounter}`;
  }

  /**
   * Add watermark to image (primary public API)
   */
  async addWatermark(imageUrl: string): Promise<string> {
    // Check if Web Workers are supported
    if (typeof Worker === 'undefined') {
      console.warn('[WatermarkManager] Web Workers not supported, falling back to sync method');
      return this.addWatermarkSync(imageUrl);
    }

    // Check if OffscreenCanvas is supported
    if (typeof OffscreenCanvas === 'undefined') {
      console.warn('[WatermarkManager] OffscreenCanvas not supported, falling back to sync method');
      return this.addWatermarkSync(imageUrl);
    }

    const worker = this.initWorker();
    const requestId = this.generateRequestId();

    return new Promise<string>((resolve, reject) => {
      // Store pending request
      this.pendingRequests.set(requestId, { resolve, reject });

      // Send request to worker
      const request: WatermarkRequest = {
        type: 'watermark',
        imageUrl,
        watermarkUrl: this.logoUrl,
        requestId,
      };

      worker.postMessage(request);

      // Set timeout (30 seconds)
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Watermarking timeout after 30 seconds'));
        }
      }, 30000);
    });
  }

  /**
   * Fallback synchronous method for browsers without Worker/OffscreenCanvas support
   */
  private async addWatermarkSync(imageUrl: string): Promise<string> {
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
        // Set canvas size to match image
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;

        // Draw main image
        ctx.drawImage(mainImage, 0, 0, mainImage.width, mainImage.height, 0, 0, canvas.width, canvas.height);

        // Load watermark
        const watermarkImage = new Image();
        watermarkImage.crossOrigin = 'anonymous';

        watermarkImage.onload = () => {
          // Calculate watermark size (80% of image width)
          const watermarkWidth = mainImage.width * 0.8;
          const aspectRatio = watermarkImage.height / watermarkImage.width;
          const watermarkHeight = watermarkWidth * aspectRatio;

          // Center position
          const x = (mainImage.width - watermarkWidth) / 2;
          const y = (mainImage.height - watermarkHeight) / 2;

          // Apply shadow and opacity
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.globalAlpha = 0.5;

          // Draw watermark
          ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);

          // Reset
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.globalAlpha = 1;

          // Convert to data URL
          const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
          resolve(watermarkedImageUrl);
        };

        watermarkImage.onerror = () => {
          resolve(imageUrl); // Return original if watermark fails
        };

        watermarkImage.src = this.logoUrl;
      };

      mainImage.onerror = () => {
        reject(new Error('Failed to load main image'));
      };

      mainImage.src = imageUrl;
    });
  }

  /**
   * Terminate worker and clean up resources
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Reject all pending requests
    this.pendingRequests.forEach((request) => {
      request.reject(new Error('WatermarkManager terminated'));
    });
    this.pendingRequests.clear();
  }

  /**
   * Get number of pending requests (for debugging/monitoring)
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Export singleton instance
export const watermarkManager = new WatermarkManager();
