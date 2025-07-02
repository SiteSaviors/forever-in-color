
import { lazy } from 'react';

// Lazy load heavy components to improve initial bundle size
export const LazyPhotoFrames = lazy(() => import('@/components/PhotoFrames'));
export const LazyPhoneMockup = lazy(() => import('@/components/PhoneMockup'));

// Enhanced image preloading utility with progress tracking
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set loading priority for modern browsers
    if ('loading' in img) {
      img.loading = priority === 'high' ? 'eager' : 'lazy';
    }
    
    // Add performance hints
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = priority;
    }
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Batch preload images with progress tracking
export const preloadImages = async (
  urls: string[], 
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> => {
  const results: HTMLImageElement[] = [];
  let loaded = 0;
  
  const promises = urls.map(async (url) => {
    try {
      const img = await preloadImage(url, 'high');
      results.push(img);
      loaded++;
      onProgress?.(loaded, urls.length);
      return img;
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
      loaded++;
      onProgress?.(loaded, urls.length);
      throw error;
    }
  });
  
  const settled = await Promise.allSettled(promises);
  return results;
};

// Critical resource preloader with enhanced performance
export const preloadCriticalImages = async (onProgress?: (progress: number) => void) => {
  const criticalImages = [
    '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png',
    '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
    '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png',
    '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png'
  ];

  try {
    await preloadImages(criticalImages, (loaded, total) => {
      const progress = (loaded / total) * 100;
      onProgress?.(progress);
      console.log(`Critical images: ${loaded}/${total} loaded (${Math.round(progress)}%)`);
    });
    console.log('✅ All critical images preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Some critical images failed to preload:', error);
  }
};

// Smart preloader that respects connection speed
export const smartPreload = async (urls: string[]) => {
  // Check connection speed if available
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.saveData
  );
  
  if (isSlowConnection) {
    console.log('🐌 Slow connection detected, skipping preload');
    return;
  }
  
  // Preload in chunks to avoid overwhelming the network
  const chunkSize = 3;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    await Promise.allSettled(chunk.map(url => preloadImage(url, 'low')));
    
    // Small delay between chunks
    await new Promise(resolve => setTimeout(resolve, 100));
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

// Enhanced intersection observer for lazy loading with loading states
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    rootMargin: '100px', // Increased for better preloading
    threshold: 0.1,
    ...options
  });
};

// Image dimension cache to prevent layout shifts
const imageDimensionCache = new Map<string, { width: number; height: number }>();

export const getImageDimensions = async (src: string): Promise<{ width: number; height: number }> => {
  if (imageDimensionCache.has(src)) {
    return imageDimensionCache.get(src)!;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = { width: img.width, height: img.height };
      imageDimensionCache.set(src, dimensions);
      resolve(dimensions);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
};
