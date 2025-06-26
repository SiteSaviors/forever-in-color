
import { useState, useEffect } from 'react';
import { smartRecommendationEngine, SmartRecommendation } from '@/utils/smartRecommendations';
import { PhotoAnalysisResult } from '@/utils/photoAnalysisEngine';

interface UseSmartRecommendationsOptions {
  maxRecommendations?: number;
}

export const useSmartRecommendations = (
  analysisResult: PhotoAnalysisResult | null,
  options: UseSmartRecommendationsOptions = {}
) => {
  const { maxRecommendations = 6 } = options;
  
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!analysisResult) {
      setRecommendations([]);
      return;
    }

    setIsGenerating(true);

    try {
      const recs = smartRecommendationEngine.generateRecommendations(
        analysisResult,
        {
          timeOfDay: new Date().getHours(),
          isFirstTime: !localStorage.getItem('artify_user_preferences'),
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        }
      );

      const limitedRecs = recs.slice(0, maxRecommendations);
      setRecommendations(limitedRecs);
      
    } catch (error) {
      console.error('Smart recommendations failed:', error);
      setRecommendations(getFallbackRecommendations());
    } finally {
      setIsGenerating(false);
    }
  }, [analysisResult, maxRecommendations]);

  const getFallbackRecommendations = (): SmartRecommendation[] => {
    return [
      {
        styleId: 2,
        confidence: 0.8,
        reason: 'Classic choice that works beautifully with any photo',
        category: 'ai-perfect'
      },
      {
        styleId: 4,
        confidence: 0.7,
        reason: 'Popular watercolor style for artistic appeal',
        category: 'trending'
      },
      {
        styleId: 5,
        confidence: 0.6,
        reason: 'Gentle pastel style for a dreamy look',
        category: 'discovery'
      }
    ];
  };

  const recordStyleInteraction = (styleId: number, completed: boolean = false) => {
    if (analysisResult) {
      smartRecommendationEngine.recordUserChoice(styleId, analysisResult, completed);
    }
  };

  const getRecommendationForStyle = (styleId: number): SmartRecommendation | undefined => {
    return recommendations.find(rec => rec.styleId === styleId);
  };

  return {
    recommendations,
    isGenerating,
    recordStyleInteraction,
    getRecommendationForStyle,
    hasRecommendations: recommendations.length > 0,
    topRecommendation: recommendations[0] || null
  };
};
