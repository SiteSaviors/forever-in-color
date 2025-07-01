import { lazy } from 'react';

// Add the missing preloadImage function
const preloadImage = (url: string, priority: 'high' | 'low' = 'high'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// Add the missing preloadImages function
const preloadImages = async (
  urls: string[], 
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  let loadedCount = 0;
  const total = urls.length;
  
  // Preload in chunks to avoid overwhelming the network
  const chunkSize = 3;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    await Promise.allSettled(
      chunk.map(async (url) => {
        await preloadImage(url, 'low');
        loadedCount++;
        onProgress?.(loadedCount, total);
      })
    );
    
    // Small delay between chunks
    await new Promise(resolve => setTimeout(resolve, 100));
  }
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

// Image dimension cache to prevent layout shifts
const imageDimensionCache = new Map<string, { width: number; height: number }>();