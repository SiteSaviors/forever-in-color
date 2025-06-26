
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
