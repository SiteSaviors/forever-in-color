
import { useRef, useEffect, useState, useCallback } from 'react';

export interface LazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  fallbackDelay?: number;
}

export const useLazyLoading = (options: LazyLoadingOptions = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true,
    fallbackDelay = 300
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Fallback for browsers without Intersection Observer
    if (!window.IntersectionObserver) {
      const timer = setTimeout(() => {
        setIsIntersecting(true);
      }, fallbackDelay);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(target);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [rootMargin, threshold, triggerOnce, fallbackDelay]);

  return {
    targetRef,
    isIntersecting,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    shouldLoad: isIntersecting
  };
};

// Specialized hook for image lazy loading
export const useLazyImage = (src: string, options: LazyLoadingOptions = {}) => {
  const {
    targetRef,
    isIntersecting,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    shouldLoad
  } = useLazyLoading(options);

  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    if (shouldLoad && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [shouldLoad, src, imageSrc]);

  return {
    ref: targetRef,
    src: imageSrc,
    isLoaded,
    hasError,
    onLoad: handleLoad,
    onError: handleError,
    isIntersecting
  };
};

// Hook for preloading images in batches
export const useImagePreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(src)) {
        resolve();
        return;
      }

      if (loadingImages.has(src)) {
        // Already loading, wait for it
        const checkLoaded = () => {
          if (preloadedImages.has(src)) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingImages(prev => new Set(prev).add(src));

      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set(prev).add(src));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve();
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to preload image: ${src}`));
      };
      img.src = src;
    });
  }, [preloadedImages, loadingImages]);

  const preloadImages = useCallback(async (urls: string[], maxConcurrent = 3) => {
    const chunks = [];
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      chunks.push(urls.slice(i, i + maxConcurrent));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url => preloadImage(url))
      );
    }
  }, [preloadImage]);

  return {
    preloadImage,
    preloadImages,
    isPreloaded: (src: string) => preloadedImages.has(src),
    isLoading: (src: string) => loadingImages.has(src)
  };
};
