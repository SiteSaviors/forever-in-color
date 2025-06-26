
import { useState, useEffect, useRef, useCallback } from 'react';
import { PhotoAnalysisResult } from '@/utils/photoAnalysis/types';
import { SmartRecommendation } from '@/utils/recommendation/types';
import { generateStylePreview } from '@/utils/stylePreviewApi';

interface PreloadQueue {
  styleId: number;
  priority: number;
  estimatedLoadTime: number;
  confidence: number;
}

interface PerformanceMetrics {
  averageLoadTime: number;
  successRate: number;
  bandwidthEstimate: number;
  cpuScore: number;
}

interface PreloadedResource {
  styleId: number;
  url: string;
  timestamp: number;
  accessCount: number;
  estimatedSize: number;
}

export const useAdvancedPredictiveLoading = (
  imageUrl: string | null,
  recommendations: SmartRecommendation[] = [],
  analysisResult: PhotoAnalysisResult | null = null
) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedResources, setPreloadedResources] = useState<Map<number, PreloadedResource>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState<Map<number, number>>(new Map());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageLoadTime: 3000,
    successRate: 0.85,
    bandwidthEstimate: 1.5, // MB/s
    cpuScore: 1.0
  });
  
  const preloadQueueRef = useRef<PreloadQueue[]>([]);
  const isPreloadingRef = useRef(false);
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceMonitoring();
    estimateDeviceCapabilities();
    
    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, []);

  // Smart preloading based on recommendations
  useEffect(() => {
    if (imageUrl && recommendations.length > 0 && analysisResult) {
      startIntelligentPreloading();
    }
    
    return () => {
      stopAllPreloading();
    };
  }, [imageUrl, recommendations, analysisResult]);

  const initializePerformanceMonitoring = () => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          updatePerformanceMetrics(entries);
        });
        
        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
        performanceObserverRef.current = observer;
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  };

  const estimateDeviceCapabilities = () => {
    const connection = (navigator as any).connection;
    const memory = (performance as any).memory;
    
    let bandwidthEstimate = 1.5; // Default 1.5 MB/s
    let cpuScore = 1.0; // Default score
    
    // Estimate bandwidth
    if (connection) {
      if (connection.effectiveType === '4g') bandwidthEstimate = 3.0;
      else if (connection.effectiveType === '3g') bandwidthEstimate = 1.0;
      else if (connection.effectiveType === '2g') bandwidthEstimate = 0.3;
      
      if (connection.downlink) {
        bandwidthEstimate = Math.min(connection.downlink, bandwidthEstimate);
      }
    }
    
    // Estimate CPU performance
    if (memory && memory.jsHeapSizeLimit) {
      // Rough CPU estimation based on available memory
      const memoryGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
      cpuScore = Math.min(memoryGB / 4, 2.0); // Scale with memory
    }
    
    // Hardware concurrency as CPU indicator
    if (navigator.hardwareConcurrency) {
      cpuScore = Math.max(cpuScore, navigator.hardwareConcurrency / 8);
    }
    
    setPerformanceMetrics(prev => ({
      ...prev,
      bandwidthEstimate,
      cpuScore: Math.max(0.5, Math.min(2.0, cpuScore))
    }));
  };

  const updatePerformanceMetrics = (entries: PerformanceEntry[]) => {
    const resourceEntries = entries.filter(entry => 
      entry.entryType === 'resource' && 
      (entry.name.includes('style-preview') || entry.name.includes('generate-style'))
    ) as PerformanceResourceTiming[];
    
    if (resourceEntries.length > 0) {
      const totalDuration = resourceEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const averageLoadTime = totalDuration / resourceEntries.length;
      
      // Count successful loads (we'll assume they're successful if they complete)
      const successfulLoads = resourceEntries.filter(entry => entry.responseEnd > 0).length;
      const successRate = successfulLoads / resourceEntries.length;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        averageLoadTime: prev.averageLoadTime * 0.8 + averageLoadTime * 0.2,
        successRate: prev.successRate * 0.9 + successRate * 0.1
      }));
    }
  };

  const startIntelligentPreloading = useCallback(async () => {
    if (isPreloadingRef.current || !imageUrl || !recommendations.length) return;
    
    setIsPreloading(true);
    isPreloadingRef.current = true;
    
    try {
      // Build intelligent preload queue
      const preloadQueue = buildPreloadQueue(recommendations, analysisResult!);
      preloadQueueRef.current = preloadQueue;
      
      console.log('🧠 Starting intelligent preloading with queue:', preloadQueue);
      
      // Process queue based on device capabilities and network conditions
      await processPreloadQueue(preloadQueue);
      
    } catch (error) {
      console.error('❌ Intelligent preloading failed:', error);
    } finally {
      setIsPreloading(false);
      isPreloadingRef.current = false;
    }
  }, [imageUrl, recommendations, analysisResult]);

  const buildPreloadQueue = (recs: SmartRecommendation[], analysis: PhotoAnalysisResult): PreloadQueue[] => {
    const queue: PreloadQueue[] = [];
    
    recs.forEach((rec, index) => {
      // Skip original image style
      if (rec.styleId === 1) return;
      
      // Calculate priority based on multiple factors
      let priority = rec.confidence * 100; // Base priority from ML confidence
      
      // Category-based priority boost
      if (rec.category === 'ai-perfect') priority += 30;
      else if (rec.category === 'personal') priority += 25;
      else if (rec.category === 'trending') priority += 15;
      else if (rec.category === 'discovery') priority += 5;
      
      // Position-based priority (higher for top recommendations)
      priority += (10 - index) * 2;
      
      // Performance-based priority adjustment
      const styleComplexity = getStyleComplexity(rec.styleId);
      if (styleComplexity === 'simple' && performanceMetrics.cpuScore < 0.8) {
        priority += 10; // Prioritize simple styles on low-end devices
      }
      
      // Estimated load time based on style complexity and device performance
      const baseLoadTime = getStyleBaseLoadTime(rec.styleId);
      const estimatedLoadTime = baseLoadTime / performanceMetrics.cpuScore / performanceMetrics.bandwidthEstimate;
      
      queue.push({
        styleId: rec.styleId,
        priority: Math.round(priority),
        estimatedLoadTime: Math.round(estimatedLoadTime),
        confidence: rec.confidence
      });
    });
    
    // Sort by priority (highest first)
    return queue.sort((a, b) => b.priority - a.priority);
  };

  const processPreloadQueue = async (queue: PreloadQueue[]) => {
    const maxConcurrent = Math.min(3, Math.max(1, Math.floor(performanceMetrics.cpuScore * 2)));
    const maxPreloads = Math.min(6, Math.floor(8 * performanceMetrics.bandwidthEstimate));
    
    console.log(`🔧 Processing preload queue: ${queue.length} items, max concurrent: ${maxConcurrent}, max total: ${maxPreloads}`);
    
    const semaphore = new Semaphore(maxConcurrent);
    const preloadPromises: Promise<void>[] = [];
    
    for (let i = 0; i < Math.min(queue.length, maxPreloads); i++) {
      const queueItem = queue[i];
      
      const preloadPromise = semaphore.acquire().then(async (release) => {
        try {
          await preloadStyle(queueItem);
        } finally {
          release();
        }
      });
      
      preloadPromises.push(preloadPromise);
      
      // Stagger requests to avoid overwhelming the server
      if (i < queue.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    await Promise.allSettled(preloadPromises);
  };

  const preloadStyle = async (queueItem: PreloadQueue): Promise<void> => {
    const { styleId, estimatedLoadTime } = queueItem;
    
    if (preloadedResources.has(styleId)) {
      console.log(`✅ Style ${styleId} already preloaded`);
      return;
    }
    
    const abortController = new AbortController();
    abortControllersRef.current.set(styleId, abortController);
    
    try {
      console.log(`🔄 Preloading style ${styleId} (estimated ${estimatedLoadTime}ms)`);
      
      const startTime = performance.now();
      setLoadingProgress(prev => new Map(prev).set(styleId, 0));
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(90, (elapsed / estimatedLoadTime) * 100);
        setLoadingProgress(prev => new Map(prev).set(styleId, progress));
      }, 200);
      
      // Generate preview - removed signal option as it's not supported
      const previewUrl = await generateStylePreview(
        imageUrl!,
        getStyleName(styleId),
        `preload_${styleId}_${Date.now()}`,
        '1:1'
      );
      
      clearInterval(progressInterval);
      
      if (previewUrl) {
        const loadTime = performance.now() - startTime;
        const resource: PreloadedResource = {
          styleId,
          url: previewUrl,
          timestamp: Date.now(),
          accessCount: 0,
          estimatedSize: estimateImageSize(previewUrl)
        };
        
        setPreloadedResources(prev => new Map(prev).set(styleId, resource));
        setLoadingProgress(prev => new Map(prev).set(styleId, 100));
        
        console.log(`✅ Style ${styleId} preloaded in ${Math.round(loadTime)}ms`);
        
        // Clean up progress after a delay
        setTimeout(() => {
          setLoadingProgress(prev => {
            const updated = new Map(prev);
            updated.delete(styleId);
            return updated;
          });
        }, 2000);
      }
      
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error(`❌ Failed to preload style ${styleId}:`, error);
      }
    } finally {
      abortControllersRef.current.delete(styleId);
    }
  };

  const stopAllPreloading = () => {
    abortControllersRef.current.forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    isPreloadingRef.current = false;
    setIsPreloading(false);
  };

  const getPreloadedUrl = useCallback((styleId: number): string | null => {
    const resource = preloadedResources.get(styleId);
    if (resource) {
      // Update access count for LRU cache management
      resource.accessCount++;
      resource.timestamp = Date.now();
      return resource.url;
    }
    return null;
  }, [preloadedResources]);

  const isStylePreloaded = useCallback((styleId: number): boolean => {
    return preloadedResources.has(styleId);
  }, [preloadedResources]);

  const getPreloadingProgress = useCallback((styleId: number): number => {
    return loadingProgress.get(styleId) || 0;
  }, [loadingProgress]);

  const clearCache = useCallback(() => {
    setPreloadedResources(new Map());
    setLoadingProgress(new Map());
  }, []);

  // LRU cache management
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // 10 minutes
      const maxSize = 20; // Maximum cached items
      
      const resources = Array.from(preloadedResources.entries());
      
      // Remove expired resources
      const fresh = resources.filter(([_, resource]) => now - resource.timestamp < maxAge);
      
      // If still too many, remove least recently used
      if (fresh.length > maxSize) {
        fresh.sort(([, a], [, b]) => b.accessCount - a.accessCount || b.timestamp - a.timestamp);
        fresh.splice(maxSize);
      }
      
      const newMap = new Map(fresh);
      if (newMap.size !== preloadedResources.size) {
        setPreloadedResources(newMap);
      }
    };
    
    const interval = setInterval(cleanup, 2 * 60 * 1000); // Clean every 2 minutes
    return () => clearInterval(interval);
  }, [preloadedResources]);

  return {
    isPreloading,
    preloadedResourcesCount: preloadedResources.size,
    getPreloadedUrl,
    isStylePreloaded,
    getPreloadingProgress,
    performanceMetrics,
    clearCache,
    preloadQueue: preloadQueueRef.current
  };
};

// Helper classes and functions
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve(() => this.release());
      } else {
        this.waiting.push(() => resolve(() => this.release()));
      }
    });
  }

  private release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      if (next) {
        this.permits--;
        next();
      }
    }
  }
}

const getStyleComplexity = (styleId: number): 'simple' | 'moderate' | 'complex' => {
  const complexities: { [key: number]: 'simple' | 'moderate' | 'complex' } = {
    2: 'moderate', 4: 'simple', 5: 'simple', 6: 'complex',
    7: 'moderate', 8: 'moderate', 9: 'complex', 10: 'complex',
    11: 'complex', 13: 'complex', 15: 'moderate'
  };
  return complexities[styleId] || 'moderate';
};

const getStyleBaseLoadTime = (styleId: number): number => {
  const baseTimes: { [key: number]: number } = {
    2: 3000, 4: 2500, 5: 2200, 6: 4000,
    7: 3500, 8: 3200, 9: 4200, 10: 4500,
    11: 4800, 13: 5000, 15: 3800
  };
  return baseTimes[styleId] || 3500;
};

const getStyleName = (styleId: number): string => {
  const names: { [key: number]: string } = {
    2: 'Classic Oil Painting', 4: 'Watercolor Dreams', 5: 'Pastel Bliss',
    6: 'Gemstone Poly', 7: '3D Storybook', 8: 'Artisan Charcoal',
    9: 'Pop Art Burst', 10: 'Neon Splash', 11: 'Electric Bloom',
    13: 'Abstract Fusion', 15: 'Deco Luxe'
  };
  return names[styleId] || 'Unknown Style';
};

const estimateImageSize = (url: string): number => {
  // Rough estimation based on URL or could implement actual size detection
  return 1.5; // MB average
};

export default useAdvancedPredictiveLoading;
