
import { useState, useEffect, useRef, useCallback } from 'react';

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  placeholderUrl?: string;
  loadingDelay?: number;
  errorRetryCount?: number;
}

export interface LazyLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  retryCount: number;
}

export const useLazyLoading = (
  imageSrc: string,
  options: LazyLoadingOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    placeholderUrl,
    loadingDelay = 0,
    errorRetryCount = 3
  } = options;

  const [state, setState] = useState<LazyLoadingState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    retryCount: 0
  });

  const [isInView, setIsInView] = useState(false);
  const [actualImageSrc, setActualImageSrc] = useState<string>(placeholderUrl || '');
  
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer setup
  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !imageSrc || state.isLoaded) return;

    const loadImage = async () => {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));

      try {
        // Add loading delay for better UX (prevents flash)
        if (loadingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, loadingDelay));
        }

        // Preload the image
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageSrc;
        });

        // Image loaded successfully
        setActualImageSrc(imageSrc);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isLoaded: true,
          hasError: false
        }));

      } catch (error) {
        console.warn('Lazy loading failed:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          retryCount: prev.retryCount + 1
        }));
      }
    };

    loadImage();
  }, [isInView, imageSrc, loadingDelay, state.isLoaded]);

  // Auto-retry on error
  useEffect(() => {
    if (state.hasError && state.retryCount < errorRetryCount) {
      retryTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, hasError: false }));
      }, Math.pow(2, state.retryCount) * 1000); // Exponential backoff
    }
  }, [state.hasError, state.retryCount, errorRetryCount]);

  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: false,
      retryCount: 0
    }));
  }, []);

  const forceLoad = useCallback(() => {
    setIsInView(true);
  }, []);

  return {
    ref: elementRef,
    src: actualImageSrc,
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    hasError: state.hasError,
    retryCount: state.retryCount,
    retry,
    forceLoad
  };
};

// Hook for progressive image loading with multiple quality levels
export const useProgressiveImageLoading = (
  lowQualitySrc: string,
  highQualitySrc: string,
  options: LazyLoadingOptions = {}
) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  
  const { ref, isLoaded, isLoading, hasError, retry } = useLazyLoading(
    highQualitySrc,
    options
  );

  useEffect(() => {
    if (isLoaded && !isHighQualityLoaded) {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    }
  }, [isLoaded, highQualitySrc, isHighQualityLoaded]);

  return {
    ref,
    src: currentSrc,
    isLoading,
    isHighQualityLoaded,
    hasError,
    retry
  };
};

// Hook for batch lazy loading (useful for galleries)
export const useBatchLazyLoading = (
  imageSources: string[],
  batchSize: number = 3,
  options: LazyLoadingOptions = {}
) => {
  const [loadedBatches, setLoadedBatches] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  const totalBatches = Math.ceil(imageSources.length / batchSize);

  const loadNextBatch = useCallback(() => {
    if (loadedBatches < totalBatches) {
      setLoadedBatches(prev => prev + 1);
    }
  }, [loadedBatches, totalBatches]);

  useEffect(() => {
    if (loadedBatches >= totalBatches) {
      setAllLoaded(true);
    }
  }, [loadedBatches, totalBatches]);

  const shouldLoadImage = useCallback((index: number) => {
    const batchIndex = Math.floor(index / batchSize);
    return batchIndex < loadedBatches;
  }, [loadedBatches, batchSize]);

  return {
    shouldLoadImage,
    loadNextBatch,
    allLoaded,
    loadedBatches,
    totalBatches,
    progress: (loadedBatches / totalBatches) * 100
  };
};
