
import { createWatermarkWorker } from './watermarkWorker';

class WatermarkService {
  private worker: Worker | null = null;
  private queue: Array<{
    imageData: string;
    options: any;
    resolve: (url: string) => void;
    reject: (error: Error) => void;
  }> = [];
  private processing = false;

  private async initWorker() {
    if (!this.worker) {
      this.worker = createWatermarkWorker();
      this.worker.onmessage = (event) => {
        const current = this.queue.shift();
        if (current) {
          if (event.data.success) {
            current.resolve(event.data.url);
          } else {
            current.reject(new Error(event.data.error));
          }
        }
        this.processQueue();
      };
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const current = this.queue[0];
    
    if (current && this.worker) {
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        this.worker!.postMessage({
          imageData: current.imageData,
          watermarkData: '/watermark.png', // Your watermark image
          options: {
            width: img.width,
            height: img.height,
            quality: 0.95,
            ...current.options
          }
        });
      };
      img.src = current.imageData;
    }
    
    this.processing = false;
  }

  async addWatermark(imageData: string, options: any = {}): Promise<string> {
    await this.initWorker();
    
    return new Promise((resolve, reject) => {
      this.queue.push({
        imageData,
        options,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.queue.length = 0;
  }
}

export const watermarkService = new WatermarkService();
