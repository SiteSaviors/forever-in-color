
import { useState, useEffect } from "react";
import { 
  analyzeImageForRecommendations, 
  generateStyleRecommendations, 
  StyleRecommendation 
} from "../utils/styleRecommendationEngine";
import EmptyState from "./EmptyState";
import AIAnalysisStatus from "./AIAnalysisStatus";
import HeroRecommendations from "./HeroRecommendations";
import PopularChoices from "./PopularChoices";

interface IntelligentStyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation?: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const IntelligentStyleGrid = ({ 
  croppedImage, 
  selectedStyle, 
  cropAspectRatio,
  selectedOrientation = "square",
  onStyleSelect, 
  onComplete 
}: IntelligentStyleGridProps) => {
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze image and generate recommendations
  useEffect(() => {
    if (croppedImage) {
      setIsAnalyzing(true);
      analyzeImageForRecommendations(croppedImage)
        .then(analysis => {
          const recs = generateStyleRecommendations(analysis);
          setRecommendations(recs);
          console.log('🎯 AI Recommendations generated:', recs);
        })
        .catch(error => {
          console.error('Recommendation analysis failed:', error);
          // Fallback to default recommendations
          const fallbackRecs = generateStyleRecommendations({
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

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎯 IntelligentStyleGrid handleStyleSelect:', styleId, styleName);
    onStyleSelect(styleId, styleName);
  };

  if (!croppedImage) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8 md:space-y-12">
      <AIAnalysisStatus isAnalyzing={isAnalyzing} />

      <HeroRecommendations
        recommendations={recommendations}
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio}
        selectedOrientation={selectedOrientation}
        onStyleSelect={handleStyleSelect}
        onComplete={onComplete}
      />

      <PopularChoices
        recommendations={recommendations}
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio}
        selectedOrientation={selectedOrientation}
        onStyleSelect={handleStyleSelect}
        onComplete={onComplete}
      />
    </div>
  );
};

export default IntelligentStyleGrid;
