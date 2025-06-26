
import { useState, useCallback, forwardRef, ImgHTMLAttributes } from 'react';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { optimizeImage, generateImageSrcSet, generateImageSizes } from '@/utils/imageOptimization';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  lazy?: boolean;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableSrcSet?: boolean;
  placeholderClassName?: string;
  errorFallback?: string;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(({
  src,
  alt,
  className,
  lazy = true,
  quality = 0.85,
  maxWidth = 1920,
  maxHeight = 1920,
  enableSrcSet = true,
  placeholderClassName,
  errorFallback,
  onLoadComplete,
  onError,
  ...props
}, ref) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(true);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  // Lazy loading setup
  const {
    ref: lazyRef,
    isLoading: isLazyLoading,
    isLoaded,
    hasError: lazyError,
    retry
  } = useLazyLoading(src, {
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  // Optimize image when it comes into view
  const handleImageOptimization = useCallback(async () => {
    if (!src || optimizedSrc) return;

    try {
      setIsOptimizing(true);
      setOptimizationError(null);

      const result = await optimizeImage(src, {
        quality,
        maxWidth,
        maxHeight,
        format: 'auto'
      });

      setOptimizedSrc(result.url);
      onLoadComplete?.();
    } catch (error) {
      console.warn('Image optimization failed:', error);
      setOptimizationError(error instanceof Error ? error.message : 'Optimization failed');
      setOptimizedSrc(src); // Fallback to original
      onError?.(error instanceof Error ? error : new Error('Optimization failed'));
    } finally {
      setIsOptimizing(false);
    }
  }, [src, optimizedSrc, quality, maxWidth, maxHeight, onLoadComplete, onError]);

  // Trigger optimization when image is in view (for lazy loading)
  useState(() => {
    if (!lazy) {
      handleImageOptimization();
    } else if (isLoaded) {
      handleImageOptimization();
    }
  });

  // Combine refs for lazy loading and forwarded ref
  const combinedRef = useCallback((node: HTMLImageElement | null) => {
    lazyRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [lazyRef, ref]);

  // Show placeholder while optimizing or lazy loading
  if ((lazy && (!isLoaded || isLazyLoading)) || isOptimizing) {
    return (
      <div 
        ref={combinedRef}
        className={cn(
          'bg-gray-200 animate-pulse flex items-center justify-center',
          placeholderClassName || className
        )}
        {...props}
      >
        <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
      </div>
    );
  }

  // Show error state
  if (lazyError || optimizationError) {
    if (errorFallback) {
      return (
        <img
          ref={combinedRef}
          src={errorFallback}
          alt={alt}
          className={cn('opacity-50', className)}
          {...props}
        />
      );
    }
    
    return (
      <div 
        ref={combinedRef}
        className={cn(
          'bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm',
          className
        )}
        {...props}
      >
        <div className="text-center p-4">
          <div className="mb-2">Failed to load image</div>
          <button 
            onClick={retry}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render optimized image
  const finalSrc = optimizedSrc || src;
  const srcSet = enableSrcSet ? generateImageSrcSet(finalSrc) : undefined;
  const sizes = enableSrcSet ? generateImageSizes() : undefined;

  return (
    <img
      ref={combinedRef}
      src={finalSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={cn('transition-opacity duration-300', className)}
      loading={lazy ? 'lazy' : 'eager'}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
