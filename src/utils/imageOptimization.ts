
/**
 * Advanced image optimization utilities for world-class performance
 * Supports WebP/AVIF with intelligent fallbacks and format detection
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  enableProgressive?: boolean;
}

export interface OptimizedImageResult {
  url: string;
  format: string;
  size: number;
  dimensions: { width: number; height: number };
}

class ImageOptimizationService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private supportedFormats: Set<string> = new Set();

  constructor() {
    this.initializeCanvas();
    this.detectFormatSupport();
  }

  private initializeCanvas(): void {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  private async detectFormatSupport(): Promise<void> {
    const formats = ['webp', 'avif'];
    
    for (const format of formats) {
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 1;
        testCanvas.height = 1;
        const testBlob = await new Promise<Blob>((resolve, reject) => {
          testCanvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('No blob')),
            `image/${format}`,
            0.8
          );
        });
        
        if (testBlob && testBlob.type.includes(format)) {
          this.supportedFormats.add(format);
        }
      } catch (error) {
        console.warn(`Format ${format} not supported:`, error);
      }
    }
  }

  public getBestFormat(originalFormat?: string): string {
    // Prioritize modern formats for better compression
    if (this.supportedFormats.has('avif')) return 'avif';
    if (this.supportedFormats.has('webp')) return 'webp';
    
    // Fallback to original or JPEG
    return originalFormat === 'png' ? 'png' : 'jpeg';
  }

  public async optimizeImage(
    imageUrl: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    const {
      quality = 0.85,
      format = 'auto',
      maxWidth = 1920,
      maxHeight = 1920,
      enableProgressive = true
    } = options;

    try {
      // Load the original image
      const img = await this.loadImage(imageUrl);
      
      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      );

      // Determine best format
      const targetFormat = format === 'auto' ? this.getBestFormat() : format;
      
      // Optimize the image
      const optimizedUrl = await this.processImage(img, width, height, targetFormat, quality);
      
      // Calculate file size (approximate)
      const size = this.estimateFileSize(width, height, targetFormat, quality);

      return {
        url: optimizedUrl,
        format: targetFormat,
        size,
        dimensions: { width, height }
      };
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      return {
        url: imageUrl,
        format: 'original',
        size: 0,
        dimensions: { width: 0, height: 0 }
      };
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if needed
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

  private async processImage(
    img: HTMLImageElement,
    width: number,
    height: number,
    format: string,
    quality: number
  ): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available');
    }

    this.canvas.width = width;
    this.canvas.height = height;

    // Use high-quality scaling
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Draw the optimized image
    this.ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob with specified format and quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      this.canvas!.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        `image/${format}`,
        quality
      );
    });

    return URL.createObjectURL(blob);
  }

  private estimateFileSize(width: number, height: number, format: string, quality: number): number {
    const pixels = width * height;
    
    // Rough estimates based on format efficiency
    const compressionRatios = {
      'avif': 0.3,
      'webp': 0.4,
      'jpeg': 0.6,
      'png': 1.2
    };

    const ratio = compressionRatios[format as keyof typeof compressionRatios] || 0.6;
    return Math.round(pixels * ratio * quality);
  }

  public generateSrcSet(
    baseUrl: string,
    sizes: number[] = [480, 768, 1024, 1440, 1920]
  ): string {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }

  public generateSizes(): string {
    return [
      '(max-width: 480px) 100vw',
      '(max-width: 768px) 90vw',
      '(max-width: 1024px) 80vw',
      '(max-width: 1440px) 70vw',
      '60vw'
    ].join(', ');
  }
}

// Singleton instance for performance
export const imageOptimizer = new ImageOptimizationService();

// Utility functions for easy usage
export const optimizeImage = (url: string, options?: ImageOptimizationOptions) => 
  imageOptimizer.optimizeImage(url, options);

export const getBestImageFormat = () => imageOptimizer.getBestFormat();

export const generateImageSrcSet = (url: string, sizes?: number[]) => 
  imageOptimizer.generateSrcSet(url, sizes);

export const generateImageSizes = () => imageOptimizer.generateSizes();
