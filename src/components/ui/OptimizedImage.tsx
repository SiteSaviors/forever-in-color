
import React, { useState } from 'react';
import { useLazyImage } from '@/hooks/useLazyLoading';
import { optimizeImage, getResponsiveImageProps } from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageProps, setImageProps] = useState<any>(null);
  const [isOptimized, setIsOptimized] = useState(false);

  // Use lazy loading unless it's a priority image
  const lazyImageProps = useLazyImage(src, {
    triggerOnce: true,
    rootMargin: priority ? '0px' : '50px'
  });

  // Optimize image on mount
  React.useEffect(() => {
    const optimizeImageProps = async () => {
      try {
        const props = await getResponsiveImageProps(src, alt, {
          quality,
          maxWidth: width,
          maxHeight: height
        });
        setImageProps(props);
        setIsOptimized(true);
      } catch (error) {
        console.warn('Image optimization failed, using original:', error);
        setImageProps({ src, alt });
        setIsOptimized(true);
      }
    };

    if (src) {
      optimizeImageProps();
    }
  }, [src, alt, quality, width, height]);

  // Handle loading events
  const handleLoad = () => {
    lazyImageProps.onLoad();
    onLoad?.();
  };

  const handleError = () => {
    lazyImageProps.onError();
    onError?.();
  };

  // Show placeholder while optimizing or loading
  if (!isOptimized || (!priority && !lazyImageProps.src)) {
    return (
      <div 
        ref={lazyImageProps.ref}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={lazyImageProps.ref}
      {...imageProps}
      className={className}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: lazyImageProps.isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default OptimizedImage;
