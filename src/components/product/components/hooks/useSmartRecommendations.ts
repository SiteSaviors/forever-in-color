
import { useState, useEffect } from "react";
import { 
  analyzeImageForRecommendations, 
  generateStyleRecommendations, 
  StyleRecommendation 
} from "../../utils/styleRecommendationEngine";

interface UseSmartRecommendationsProps {
  croppedImage: string | null;
  selectedOrientation: string;
}

export const useSmartRecommendations = ({ 
  croppedImage, 
  selectedOrientation 
}: UseSmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (croppedImage) {
      setIsAnalyzing(true);
      analyzeImageForRecommendations(croppedImage)
        .then(async (analysis) => {
          const recs = await generateStyleRecommendations(analysis, croppedImage);
          setRecommendations(recs);
          console.log('🎯 AI Recommendations generated:', recs);
        })
        .catch(async (error) => {
          console.error('Recommendation analysis failed:', error);
          // Fallback to default recommendations
          const fallbackRecs = await generateStyleRecommendations({
            orientation: selectedOrientation,
            hasPortrait: false,
            isLandscape: false,
            hasHighContrast: false,
            dominantColors: ['neutral'],
            complexity: 'moderate'
          });
          setRecommendations(fallbackRecs);
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    }
  }, [croppedImage, selectedOrientation]);

  // Get recommendations by category
  const heroRecommendations = recommendations.filter(r => r.category === 'hero').slice(0, 3);
  const popularChoices = recommendations.filter(r => r.category === 'popular').slice(0, 3);
  const secondaryStyles = recommendations.filter(r => r.category === 'secondary');

  return {
    recommendations,
    isAnalyzing,
    heroRecommendations,
    popularChoices,
    secondaryStyles
  };
};
