
// Image optimization utilities for performance enhancement
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  maxWidth?: number;
  maxHeight?: number;
}

export class ImageOptimizer {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  // Check browser support for modern image formats
  static async checkFormatSupport(): Promise<{
    webp: boolean;
    avif: boolean;
  }> {
    const webpSupport = await this.canDisplayFormat('data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA');
    const avifSupport = await this.canDisplayFormat('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=');
    
    return { webp: webpSupport, avif: avifSupport };
  }

  private static canDisplayFormat(dataUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  }

  // Get the best supported format for the user's browser
  static async getBestFormat(): Promise<'avif' | 'webp' | 'original'> {
    const support = await this.checkFormatSupport();
    
    if (support.avif) return 'avif';
    if (support.webp) return 'webp';
    return 'original';
  }

  // Generate optimized image URL based on format support
  static async optimizeImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    const {
      quality = 85,
      format = await this.getBestFormat(),
      maxWidth,
      maxHeight
    } = options;

    // If it's already a data URL or blob URL, return as-is
    if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
      return originalUrl;
    }

    // For Lovable uploads, we can add query parameters for optimization
    if (originalUrl.includes('lovable-uploads')) {
      const url = new URL(originalUrl, window.location.origin);
      
      if (format !== 'original') {
        url.searchParams.set('format', format);
      }
      
      if (quality < 100) {
        url.searchParams.set('quality', quality.toString());
      }
      
      if (maxWidth) {
        url.searchParams.set('w', maxWidth.toString());
      }
      
      if (maxHeight) {
        url.searchParams.set('h', maxHeight.toString());
      }
      
      return url.toString();
    }

    // For other URLs, return original
    return originalUrl;
  }

  // Create responsive srcSet for different screen sizes
  static async createResponsiveSrcSet(
    originalUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280]
  ): Promise<string> {
    if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
      return originalUrl;
    }

    const srcSetEntries = await Promise.all(
      breakpoints.map(async (width) => {
        const optimizedUrl = await this.optimizeImageUrl(originalUrl, { maxWidth: width });
        return `${optimizedUrl} ${width}w`;
      })
    );

    return srcSetEntries.join(', ');
  }

  // Preload critical images
  static preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      
      link.onload = () => resolve();
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }

  // Optimize canvas rendering
  static getOptimizedCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        desynchronized: true
      });
    }
    
    return { canvas: this.canvas, ctx: this.ctx! };
  }
}

// Utility function for quick image optimization
export const optimizeImage = async (
  src: string, 
  options: ImageOptimizationOptions = {}
): Promise<string> => {
  return await ImageOptimizer.optimizeImageUrl(src, options);
};

// Generate responsive image props
export const getResponsiveImageProps = async (
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) => {
  const [optimizedSrc, srcSet] = await Promise.all([
    ImageOptimizer.optimizeImageUrl(src, options),
    ImageOptimizer.createResponsiveSrcSet(src)
  ]);

  return {
    src: optimizedSrc,
    srcSet,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const
  };
};
