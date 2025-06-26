
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

// Critical resource preloader for canvas frames
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

// Intersection Observer utility for lazy loading
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

// Intelligent preloading based on user behavior
export class IntelligentPreloader {
  private static preloadQueue: Set<string> = new Set();
  private static maxConcurrentPreloads = 3;
  private static currentPreloads = 0;

  // Preload images based on orientation selection
  static async preloadCanvasFrames(orientation: string) {
    const frameMap: Record<string, string> = {
      'square': '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
      'horizontal': '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png',
      'vertical': '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png'
    };

    const frameUrl = frameMap[orientation];
    if (frameUrl) {
      await this.queuePreload(frameUrl);
    }
  }

  // Preload popular style images
  static async preloadPopularStyles() {
    const popularStyleImages = [
      '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png', // Classic Oil
      '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png', // Watercolor Dreams
      '/lovable-uploads/623707ee-39fd-4a88-9362-3db250f9bfcb.png'  // Pastel Bliss
    ];

    await this.queueMultiplePreloads(popularStyleImages);
  }

  // Queue a single image for preloading
  private static async queuePreload(url: string): Promise<void> {
    if (this.preloadQueue.has(url)) return;
    
    this.preloadQueue.add(url);
    
    if (this.currentPreloads < this.maxConcurrentPreloads) {
      await this.processPreloadQueue();
    }
  }

  // Queue multiple images for preloading
  private static async queueMultiplePreloads(urls: string[]): Promise<void> {
    urls.forEach(url => this.preloadQueue.add(url));
    await this.processPreloadQueue();
  }

  // Process the preload queue
  private static async processPreloadQueue(): Promise<void> {
    while (this.preloadQueue.size > 0 && this.currentPreloads < this.maxConcurrentPreloads) {
      const url = this.preloadQueue.values().next().value;
      this.preloadQueue.delete(url);
      this.currentPreloads++;

      try {
        await preloadImage(url);
      } catch (error) {
        console.warn(`Failed to preload image: ${url}`, error);
      } finally {
        this.currentPreloads--;
      }
    }
  }

  // Predict next likely images based on current state
  static predictNextImages(currentOrientation: string, hasImage: boolean): string[] {
    const predictions: string[] = [];

    if (hasImage) {
      // Predict canvas frames for other orientations
      const orientations = ['square', 'horizontal', 'vertical'];
      orientations
        .filter(o => o !== currentOrientation)
        .forEach(orientation => {
          const frameMap: Record<string, string> = {
            'square': '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
            'horizontal': '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png',
            'vertical': '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png'
          };
          predictions.push(frameMap[orientation]);
        });
    }

    return predictions.filter(Boolean);
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(name: string): void {
    this.marks.set(name, performance.now());
    if (performance.mark) {
      performance.mark(name);
    }
  }

  static measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    
    if (performance.measure) {
      try {
        performance.measure(name, startMark);
      } catch (error) {
        // Ignore measurement errors
      }
    }

    return duration;
  }

  static getNavigationTiming(): Record<string, number> {
    if (!performance.getEntriesByType) return {};

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return {};

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseEnd - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      domParsing: navigation.domInteractive - navigation.responseEnd,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart
    };
  }

  static getMemoryUsage(): Record<string, number> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return {};
  }
}

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  // Mark initial load
  PerformanceMonitor.mark('app-start');
  
  // Monitor critical resource loading
  window.addEventListener('load', () => {
    PerformanceMonitor.mark('app-loaded');
    const loadTime = PerformanceMonitor.measure('app-load-time', 'app-start');
    console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
  });

  // Preload critical images
  preloadCriticalImages();
};
