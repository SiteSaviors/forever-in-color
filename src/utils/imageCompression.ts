
// Advanced client-side image compression
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  enableWorker?: boolean;
  progressive?: boolean;
}

export class ImageCompressor {
  private static worker: Worker | null = null;

  // Initialize web worker for non-blocking compression
  static initWorker() {
    if (!this.worker && typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { imageData, options } = e.data;
          
          // Create canvas in worker
          const canvas = new OffscreenCanvas(options.width, options.height);
          const ctx = canvas.getContext('2d');
          
          // Create ImageData and put on canvas
          const imgData = new ImageData(imageData.data, imageData.width, imageData.height);
          ctx.putImageData(imgData, 0, 0);
          
          // Convert to blob with compression
          canvas.convertToBlob({
            type: options.format,
            quality: options.quality
          }).then(blob => {
            self.postMessage({ success: true, blob });
          }).catch(error => {
            self.postMessage({ success: false, error: error.message });
          });
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
    }
  }

  // Smart compression based on image analysis
  static async compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 0.85,
      format = 'jpeg',
      enableWorker = true,
      progressive = true
    } = options;

    // Analyze image first
    const analysis = await this.analyzeImage(file);
    const optimizedOptions = this.optimizeCompressionSettings(analysis, options);

    // Use worker if available and enabled
    if (enableWorker && this.worker) {
      return this.compressWithWorker(file, optimizedOptions);
    }

    return this.compressOnMainThread(file, optimizedOptions);
  }

  // Analyze image characteristics for optimal compression
  private static async analyzeImage(file: File): Promise<{
    hasTransparency: boolean;
    colorComplexity: number;
    dimensions: { width: number; height: number };
    fileSize: number;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      img.onload = () => {
        canvas.width = Math.min(img.width, 100); // Sample size
        canvas.height = Math.min(img.height, 100);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let hasTransparency = false;
        let colorVariance = 0;
        const colors = new Set();
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const [r, g, b, a] = [
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2],
            imageData.data[i + 3]
          ];
          
          if (a < 255) hasTransparency = true;
          colors.add(`${r},${g},${b}`);
        }
        
        colorVariance = colors.size / (canvas.width * canvas.height);
        
        resolve({
          hasTransparency,
          colorComplexity: colorVariance,
          dimensions: { width: img.width, height: img.height },
          fileSize: file.size
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Optimize compression settings based on analysis
  private static optimizeCompressionSettings(
    analysis: any,
    options: CompressionOptions
  ): CompressionOptions {
    const optimized = { ...options };

    // Choose best format based on image characteristics
    if (analysis.hasTransparency) {
      optimized.format = 'png';
    } else if (analysis.colorComplexity > 0.7) {
      optimized.format = 'jpeg';
      optimized.quality = Math.max(0.8, optimized.quality || 0.85);
    } else {
      optimized.format = 'webp';
      optimized.quality = Math.max(0.7, optimized.quality || 0.85);
    }

    // Adjust quality based on file size
    if (analysis.fileSize > 5 * 1024 * 1024) { // > 5MB
      optimized.quality = Math.min(0.7, optimized.quality || 0.85);
    }

    return optimized;
  }

  // Worker-based compression
  private static async compressWithWorker(file: File, options: CompressionOptions): Promise<File> {
    if (!this.worker) {
      this.initWorker();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          options.maxWidth!,
          options.maxHeight!
        );
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        
        this.worker!.postMessage({
          imageData: {
            data: imageData.data,
            width: imageData.width,
            height: imageData.height
          },
          options: {
            width,
            height,
            format: `image/${options.format}`,
            quality: options.quality
          }
        });
        
        this.worker!.onmessage = (e) => {
          const { success, blob, error } = e.data;
          if (success) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${options.format}`,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error(error));
          }
        };
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Main thread compression (fallback)
  private static async compressOnMainThread(file: File, options: CompressionOptions): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          options.maxWidth!,
          options.maxHeight!
        );
        
        canvas.width = width;
        canvas.height = height;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: `image/${options.format}`,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          `image/${options.format}`,
          options.quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Calculate optimal dimensions maintaining aspect ratio
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
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

  // Batch compression for multiple files
  static async compressBatch(files: File[], options: CompressionOptions = {}): Promise<File[]> {
    const results = await Promise.allSettled(
      files.map(file => this.compressImage(file, options))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<File> => result.status === 'fulfilled')
      .map(result => result.value);
  }
}

// Initialize worker on module load
if (typeof window !== 'undefined') {
  ImageCompressor.initWorker();
}
