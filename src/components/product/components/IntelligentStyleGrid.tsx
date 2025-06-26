
import { useState } from "react";
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

  const {
    isAnalyzing,
    heroRecommendations,
    popularChoices,
    secondaryStyles
  } = useSmartRecommendations({
    croppedImage,
    selectedOrientation
  });

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎯 IntelligentStyleGrid handleStyleSelect:', styleId, styleName);
    onStyleSelect(styleId, styleName);
  };

  if (!croppedImage) {
    return <EmptyPhotoState />;
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* AI Analysis Status with Loading Skeleton */}
      <AIAnalysisStatus isAnalyzing={isAnalyzing} />

      {/* Hero Recommendations Section */}
      <HeroRecommendations
        heroRecommendations={heroRecommendations}
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio}
        selectedOrientation={selectedOrientation}
        onStyleSelect={handleStyleSelect}
        onComplete={onComplete}
      />

      {/* Popular Choices Section */}
      <PopularChoices
        popularChoices={popularChoices}
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio}
        selectedOrientation={selectedOrientation}
        onStyleSelect={handleStyleSelect}
        onComplete={onComplete}
      />

      {/* Show More Styles Toggle - Enhanced */}
      {secondaryStyles.length > 0 && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={() => setShowAllStyles(!showAllStyles)}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:border-purple-300 hover:text-purple-700 hover:shadow-lg transform hover:scale-105"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showAllStyles ? 'Show Less Styles' : `Explore ${secondaryStyles.length} More Styles`}
          </Button>
        </div>
      )}

      {/* Complete Collection */}
      {showAllStyles && (
        <CompleteCollection
          secondaryStyles={secondaryStyles}
          croppedImage={croppedImage}
          selectedStyle={selectedStyle}
          cropAspectRatio={cropAspectRatio}
          selectedOrientation={selectedOrientation}
          onStyleSelect={handleStyleSelect}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};

export default IntelligentStyleGrid;
