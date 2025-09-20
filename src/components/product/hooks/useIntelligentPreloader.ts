
import { useEffect, useRef } from 'react';

interface PreloadOptions {
  priority: 'high' | 'medium' | 'low';
  delay?: number;
  maxConcurrent?: number;
}

export const useIntelligentPreloader = () => {
  const preloadQueue = useRef<Array<{ url: string; options: PreloadOptions }>>([]);
  const activePreloads = useRef<Set<string>>(new Set());
  const preloadedImages = useRef<Set<string>>(new Set());

  const preloadImage = async (url: string, options: PreloadOptions = { priority: 'medium' }) => {
    // Skip if already preloaded or currently preloading
    if (preloadedImages.current.has(url) || activePreloads.current.has(url)) {
      return Promise.resolve();
    }

    // Add to queue if max concurrent reached
    if (activePreloads.current.size >= (options.maxConcurrent || 3)) {
      preloadQueue.current.push({ url, options });
      return Promise.resolve();
    }

    activePreloads.current.add(url);

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      // Set priority hints
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = options.priority;
      }
      
      img.onload = () => {
        preloadedImages.current.add(url);
        activePreloads.current.delete(url);
        resolve();
        
        // Process next in queue
        processQueue();
      };
      
      img.onerror = () => {
        activePreloads.current.delete(url);
        reject(new Error(`Failed to preload: ${url}`));
        processQueue();
      };

      // Add delay for low priority images
      const loadImage = () => {
        img.src = url;
      };

      if (options.delay && options.priority === 'low') {
        setTimeout(loadImage, options.delay);
      } else {
        loadImage();
      }
    });
  };

  const processQueue = () => {
    if (preloadQueue.current.length === 0) return;
    
    const next = preloadQueue.current.shift();
    if (next) {
      preloadImage(next.url, next.options);
    }
  };

  const preloadStyleImages = (styleImages: string[], userInteractionPattern?: string[]) => {
    // Prioritize based on user interaction patterns
    const prioritized = styleImages.map((url, index) => ({
      url,
      priority: userInteractionPattern?.includes(url) ? 'high' as const :
                index < 3 ? 'medium' as const : 'low' as const,
      delay: index < 3 ? 0 : index * 100
    }));

    // Sort by priority
    prioritized.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Start preloading
    prioritized.forEach(({ url, priority, delay }) => {
      preloadImage(url, { priority, delay });
    });
  };

  return {
    preloadImage,
    preloadStyleImages,
    isPreloaded: (url: string) => preloadedImages.current.has(url)
  };
};
