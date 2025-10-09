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

class WatermarkManagerImpl {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;
  private readonly logoUrl = '/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png';

  private initWorker(): Worker {
    if (this.worker) return this.worker;

    this.worker = new Worker(new URL('../workers/watermark.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (event: MessageEvent<WatermarkResponse>) => {
      this.handleWorkerMessage(event.data);
    };

    this.worker.onerror = (error) => {
      this.pendingRequests.forEach((request) => {
        request.reject(new Error('Worker error: ' + error.message));
      });
      this.pendingRequests.clear();
    };

    return this.worker;
  }

  private handleWorkerMessage(response: WatermarkResponse) {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) return;

    this.pendingRequests.delete(response.requestId);

    if (response.type === 'success' && response.watermarkedImageUrl) {
      pending.resolve(response.watermarkedImageUrl);
    } else {
      pending.reject(new Error(response.error || 'Unknown watermarking error'));
    }
  }

  private generateRequestId() {
    return `req_${Date.now()}_${++this.requestIdCounter}`;
  }

  async addWatermark(imageUrl: string): Promise<string> {
    const start = performance.now();

    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
      const result = await this.addWatermarkSync(imageUrl);
      this.trackPerformance(start);
      return result;
    }

    const worker = this.initWorker();
    const requestId = this.generateRequestId();

    return new Promise<string>((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });

      const request: WatermarkRequest = {
        type: 'watermark',
        imageUrl,
        watermarkUrl: this.logoUrl,
        requestId,
      };
      worker.postMessage(request);

      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Watermarking timeout after 30 seconds'));
        }
      }, 30000);
    }).finally(() => {
      this.trackPerformance(start);
    });
  }

  private trackPerformance(start: number) {
    const duration = performance.now() - start;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watermark-performance', { detail: { duration } }));
    }
  }

  private async addWatermarkSync(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const baseImage = new Image();
      baseImage.crossOrigin = 'anonymous';
      baseImage.onload = () => {
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        ctx.drawImage(baseImage, 0, 0);

        const watermark = new Image();
        watermark.crossOrigin = 'anonymous';
        watermark.onload = () => {
          const watermarkWidth = baseImage.width * 0.8;
          const aspect = watermark.height / watermark.width;
          const watermarkHeight = watermarkWidth * aspect;
          const x = (baseImage.width - watermarkWidth) / 2;
          const y = (baseImage.height - watermarkHeight) / 2;

          ctx.globalAlpha = 0.25;
          ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);
          ctx.globalAlpha = 1;

          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        watermark.onerror = () => reject(new Error('Failed to load watermark image'));
        watermark.src = this.logoUrl;
      };
      baseImage.onerror = () => reject(new Error('Failed to load base image'));
      baseImage.src = imageUrl;
    });
  }
}

export const watermarkManager = new WatermarkManagerImpl();
