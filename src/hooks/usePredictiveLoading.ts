
import { usePhotoAnalysis } from './usePhotoAnalysis';
import { useSmartRecommendations } from './useSmartRecommendations';
import { usePredictivePreloading } from './usePredictivePreloading';

interface UsePredictiveLoadingOptions {
  enablePreloading?: boolean;
  maxPreloadStyles?: number;
  analysisDelay?: number;
  maxRecommendations?: number;
}

export const usePredictiveLoading = (
  imageUrl: string | null,
  options: UsePredictiveLoadingOptions = {}
) => {
  const {
    enablePreloading = true,
    maxPreloadStyles = 3,
    analysisDelay = 500,
    maxRecommendations = 6
  } = options;

  // Photo analysis
  const {
    isAnalyzing,
    analysisResult,
    confidence
  } = usePhotoAnalysis(imageUrl, { analysisDelay });

  // Smart recommendations
  const {
    recommendations,
    isGenerating,
    recordStyleInteraction,
    getRecommendationForStyle,
    hasRecommendations,
    topRecommendation
  } = useSmartRecommendations(analysisResult, { maxRecommendations });

  // Predictive preloading
  const {
    isPreloading,
    isStylePreloaded,
    preloadedStylesCount
  } = usePredictivePreloading(recommendations, {
    enablePreloading,
    maxPreloadStyles
  });

  return {
    // Analysis state
    isAnalyzing,
    analysisResult,
    confidenceScore: confidence,
    
    // Recommendations
    recommendations,
    isGenerating,
    hasRecommendations,
    topRecommendation,
    
    // Preloading
    isPreloading,
    isStylePreloaded,
    preloadedStylesCount,
    
    // Methods
    recordStyleInteraction,
    getRecommendationForStyle
  };
};

export default usePredictiveLoading;
