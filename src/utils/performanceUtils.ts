
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

// Critical resource preloader
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
