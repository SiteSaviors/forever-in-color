
import { useEffect, useState } from 'react';
import { ResourcePreloader } from '@/utils/resourcePreloader';
import { SmartRecommendation } from '@/utils/smartRecommendations';

interface UsePredictivePreloadingOptions {
  enablePreloading?: boolean;
  maxPreloadStyles?: number;
  confidenceThreshold?: number;
}

export const usePredictivePreloading = (
  recommendations: SmartRecommendation[],
  options: UsePredictivePreloadingOptions = {}
) => {
  const {
    enablePreloading = true,
    maxPreloadStyles = 3,
    confidenceThreshold = 0.6
  } = options;

  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedStyles, setPreloadedStyles] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!enablePreloading || recommendations.length === 0) {
      return;
    }

    startPredictivePreloading();
  }, [recommendations, enablePreloading, maxPreloadStyles, confidenceThreshold]);

  const startPredictivePreloading = async () => {
    setIsPreloading(true);
    
    const stylesToPreload = recommendations
      .filter(rec => rec.confidence > confidenceThreshold)
      .slice(0, maxPreloadStyles)
      .map(rec => rec.styleId);

    console.log('🔮 Starting predictive preloading for styles:', stylesToPreload);
    
    try {
      // Preload styles sequentially to avoid overwhelming the system
      for (const styleId of stylesToPreload) {
        await ResourcePreloader.preloadStyleResources(styleId);
        
        setPreloadedStyles(prev => new Set([...prev, styleId]));
        
        // Small delay between preloads
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('✅ Predictive preloading completed');
    } catch (error) {
      console.warn('Predictive preloading failed:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  const isStylePreloaded = (styleId: number): boolean => {
    return preloadedStyles.has(styleId) || ResourcePreloader.isStylePreloaded(styleId);
  };

  return {
    isPreloading,
    isStylePreloaded,
    preloadedStylesCount: preloadedStyles.size
  };
};
