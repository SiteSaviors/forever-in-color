
import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { ImageSkeleton } from './skeleton';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: number;
  lowQualitySrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

const ProgressiveImage = memo(({
  src,
  alt,
  className,
  aspectRatio = 1,
  lowQualitySrc,
  onLoad,
  onError,
  showSkeleton = true,
  skeletonClassName
}: ProgressiveImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    // Preload the high-quality image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;

    // Preload low-quality version if provided
    if (lowQualitySrc) {
      const lowQualityImg = new Image();
      lowQualityImg.onload = () => setLowQualityLoaded(true);
      lowQualityImg.src = lowQualitySrc;
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, lowQualitySrc, onLoad, onError]);

  // Show skeleton while loading
  if (!imageLoaded && !hasError && showSkeleton) {
    return (
      <ImageSkeleton 
        className={cn(skeletonClassName, className)} 
        aspectRatio={aspectRatio}
      />
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div 
        className={cn("bg-gray-100 flex items-center justify-center text-gray-400 text-sm", className)}
        style={{ aspectRatio }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className="relative" style={{ aspectRatio }}>
      {/* Low quality placeholder */}
      {lowQualitySrc && lowQualityLoaded && !imageLoaded && (
        <img
          src={lowQualitySrc}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover filter blur-sm transition-opacity duration-300",
            className
          )}
        />
      )}
      
      {/* High quality image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          imageLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading="lazy"
      />
    </div>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

export default ProgressiveImage;
