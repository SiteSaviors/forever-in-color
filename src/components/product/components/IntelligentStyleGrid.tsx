
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useSmartRecommendations } from "./hooks/useSmartRecommendations";
import AIAnalysisStatus from "./intelligence/AIAnalysisStatus";
import EmptyPhotoState from "./intelligence/EmptyPhotoState";
import HeroRecommendations from "./intelligence/HeroRecommendations";
import PopularChoices from "./intelligence/PopularChoices";
import CompleteCollection from "./intelligence/CompleteCollection";

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
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Memoize smart recommendations to prevent unnecessary re-calculations
  const {
    isAnalyzing,
    heroRecommendations,
    popularChoices,
    secondaryStyles
  } = useSmartRecommendations({
    croppedImage,
    selectedOrientation
  });

  // Memoized style selection handler to prevent re-renders
  const handleStyleSelect = useCallback((styleId: number, styleName: string) => {
    console.log('🎯 IntelligentStyleGrid handleStyleSelect:', styleId, styleName);
    
    // Validate inputs before calling parent handler
    if (typeof styleId !== 'number' || !styleName || typeof styleName !== 'string') {
      console.error('❌ Invalid style selection parameters:', { styleId, styleName });
      return;
    }
    
    try {
      onStyleSelect(styleId, styleName);
    } catch (error) {
      console.error('❌ Error in style selection:', error);
    }
  }, [onStyleSelect]);

  // Memoized toggle handler
  const handleToggleAllStyles = useCallback(() => {
    setShowAllStyles(prev => {
      const newValue = !prev;
      console.log('👁️ Toggle all styles:', newValue ? 'showing' : 'hiding');
      return newValue;
    });
  }, []);

  // Memoized button text calculation
  const buttonText = useMemo(() => {
    return showAllStyles 
      ? 'Show Less Styles' 
      : `Explore ${secondaryStyles.length} More Styles`;
  }, [showAllStyles, secondaryStyles.length]);

  // Early return with validation
  if (!croppedImage) {
    return <EmptyPhotoState />;
  }

  // Validate required props
  if (typeof cropAspectRatio !== 'number' || cropAspectRatio <= 0) {
    console.error('❌ Invalid cropAspectRatio:', cropAspectRatio);
    return <EmptyPhotoState />;
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* AI Analysis Status with Loading Skeleton */}
      <AIAnalysisStatus isAnalyzing={isAnalyzing} />

      {/* Hero Recommendations Section with Error Boundary */}
      {heroRecommendations.length > 0 && (
        <div>
          <HeroRecommendations
            heroRecommendations={heroRecommendations}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            cropAspectRatio={cropAspectRatio}
            selectedOrientation={selectedOrientation}
            onStyleSelect={handleStyleSelect}
            onComplete={onComplete}
          />
        </div>
      )}

      {/* Popular Choices Section with Error Boundary */}
      {popularChoices.length > 0 && (
        <div>
          <PopularChoices
            popularChoices={popularChoices}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            cropAspectRatio={cropAspectRatio}
            selectedOrientation={selectedOrientation}
            onStyleSelect={handleStyleSelect}
            onComplete={onComplete}
          />
        </div>
      )}

      {/* Show More Styles Toggle - Enhanced with better validation */}
      {secondaryStyles.length > 0 && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={handleToggleAllStyles}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:border-purple-300 hover:text-purple-700 hover:shadow-lg transform hover:scale-105"
            disabled={isAnalyzing}
          >
            <Eye className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </div>
      )}

      {/* Complete Collection with Error Boundary */}
      {showAllStyles && secondaryStyles.length > 0 && (
        <div>
          <CompleteCollection
            secondaryStyles={secondaryStyles}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            cropAspectRatio={cropAspectRatio}
            selectedOrientation={selectedOrientation}
            onStyleSelect={handleStyleSelect}
            onComplete={onComplete}
          />
        </div>
      )}
    </div>
  );
};

export default IntelligentStyleGrid;
