
import { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ProgressiveStyleImageProps {
  src: string;
  alt: string;
  aspectRatio: number;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

const ProgressiveStyleImage = ({
  src,
  alt,
  aspectRatio,
  placeholder,
  className = '',
  onLoad,
  onError,
  priority = false
}: ProgressiveStyleImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  
  const { elementRef, hasIntersected } = useIntersectionObserver({
    triggerOnce: true,
    rootMargin: '200px'
  });

  // Load image when in viewport or high priority
  useEffect(() => {
    if (!hasIntersected && !priority) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [src, hasIntersected, priority, onLoad, onError]);

  return (
    <div ref={elementRef} className="relative overflow-hidden">
      <AspectRatio ratio={aspectRatio}>
        {/* Placeholder/blur background */}
        {placeholder && !isLoaded && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110 transition-opacity duration-300"
            style={{ backgroundImage: `url(${placeholder})` }}
          />
        )}
        
        {/* Loading skeleton */}
        {!isLoaded && !placeholder && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        {/* Main image */}
        {currentSrc && (
          <img
            src={currentSrc}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded" />
              <p className="text-xs">Failed to load</p>
            </div>
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ProgressiveStyleImage;
