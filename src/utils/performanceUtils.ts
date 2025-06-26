
import { lazy } from 'react';

// Lazy load heavy components to improve initial bundle size
export const LazyPhotoFrames = lazy(() => import('@/components/PhotoFrames'));
export const LazyPhoneMockup = lazy(() => import('@/components/PhoneMockup'));
export const LazyMorphingCanvasPreview = lazy(() => import('@/components/product/orientation/components/MorphingCanvasPreview'));

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Critical resource preloader with intelligent prioritization
export const preloadCriticalImages = async () => {
  const criticalImages = [
    '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png',
    '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
    '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png',
    '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png'
  ];

  try {
    await Promise.allSettled(criticalImages.map(preloadImage));
  } catch (error) {
    console.warn('Some critical images failed to preload:', error);
  }
};

// Intelligent predictive preloading for style previews
export const predictivePreloader = (() => {
  const preloadQueue = new Set<string>();
  const preloadPromises = new Map<string, Promise<void>>();
  const MAX_CONCURRENT_PRELOADS = 3;
  let activePreloads = 0;

  const executePreload = async (url: string): Promise<void> => {
    if (preloadPromises.has(url)) {
      return preloadPromises.get(url)!;
    }

    const promise = preloadImage(url).finally(() => {
      activePreloads--;
      preloadQueue.delete(url);
      processQueue();
    });

    preloadPromises.set(url, promise);
    activePreloads++;
    
    return promise;
  };

  const processQueue = () => {
    while (activePreloads < MAX_CONCURRENT_PRELOADS && preloadQueue.size > 0) {
      const nextUrl = preloadQueue.values().next().value;
      if (nextUrl) {
        executePreload(nextUrl);
      }
    }
  };

  return {
    // Preload popular styles based on user behavior patterns
    preloadPopularStyles: (userImageType: 'portrait' | 'landscape' | 'object' = 'portrait') => {
      const popularStylesByType = {
        portrait: [
          '/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png', // Classic Oil
          '/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png', // Electric Bloom
          '/lovable-uploads/58ce8c1f-4fcb-4135-a850-600a0915b141.png'  // Pastel Bliss
        ],
        landscape: [
          '/lovable-uploads/933dd4e5-58bc-404d-8c89-a93dcce93079.png', // Gemstone Poly
          '/lovable-uploads/723f2a1a-0e03-4c36-a8d3-a930c81a7d08.png', // Abstract Fusion
          '/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png'  // Deco Luxe
        ],
        object: [
          '/lovable-uploads/933dd4e5-58bc-404d-8c89-a93dcce93079.png', // Gemstone Poly
          '/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png', // Classic Oil
          '/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png'  // Electric Bloom
        ]
      };

      const stylesToPreload = popularStylesByType[userImageType] || popularStylesByType.portrait;
      stylesToPreload.forEach(url => preloadQueue.add(url));
      processQueue();
    },

    // Preload next likely choices based on current selection
    preloadRelatedStyles: (currentStyleId: number) => {
      const styleRelations: Record<number, string[]> = {
        1: ['/lovable-uploads/8c321d4c-0a53-4b43-8f4f-e718d2320392.png'], // Original -> Classic Oil
        2: ['/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png'], // Classic Oil -> Electric Bloom
        4: ['/lovable-uploads/58ce8c1f-4fcb-4135-a850-600a0915b141.png'], // Watercolor -> Pastel Bliss
        5: ['/lovable-uploads/933dd4e5-58bc-404d-8c89-a93dcce93079.png']  // Pastel -> Gemstone Poly
      };

      const relatedStyles = styleRelations[currentStyleId] || [];
      relatedStyles.forEach(url => preloadQueue.add(url));
      processQueue();
    },

    // Preload canvas frames for selected orientation
    preloadCanvasFrames: (orientation: 'square' | 'horizontal' | 'vertical') => {
      const canvasFrames = {
        square: '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
        horizontal: '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png',
        vertical: '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png'
      };

      // Preload current orientation frame with high priority
      executePreload(canvasFrames[orientation]);

      // Preload other orientations with lower priority
      Object.entries(canvasFrames).forEach(([key, url]) => {
        if (key !== orientation) {
          preloadQueue.add(url);
        }
      });
      processQueue();
    },

    // Get preload status
    getPreloadStatus: () => ({
      queueSize: preloadQueue.size,
      activePreloads,
      totalPreloaded: preloadPromises.size
    })
  };
})();

// Debounce utility for reducing excessive re-renders
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance-critical operations
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer utility for lazy loading with enhanced options
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Resource hints for better performance
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'images.unsplash.com',
    'via.placeholder.com'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Bundle analysis and code splitting utilities
export const getComponentLoadTime = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    markEnd: () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      return loadTime;
    }
  };
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    // Core Web Vitals approximation
    timeToFirstByte: navigation.responseStart - navigation.requestStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Resource loading
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    
    // Memory usage
    memory: monitorMemoryUsage()
  };
};
