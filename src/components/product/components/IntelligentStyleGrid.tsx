
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Crown, Zap, Eye } from "lucide-react";
import StyleCard from "../StyleCard";
import { artStyles } from "@/data/artStyles";
import { 
  analyzeImageForRecommendations, 
  generateStyleRecommendations, 
  StyleRecommendation 
} from "../utils/styleRecommendationEngine";

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
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [hoveredStyle, setHoveredStyle] = useState<number | null>(null);

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

  // Get recommendations by category
  const heroRecommendations = recommendations.filter(r => r.category === 'hero').slice(0, 3);
  const popularChoices = recommendations.filter(r => r.category === 'popular').slice(0, 3);
  const secondaryStyles = recommendations.filter(r => r.category === 'secondary');

  if (!croppedImage) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Your Photo First
        </h3>
        <p className="text-gray-600">
          Once you upload a photo, our AI will instantly show you personalized style recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Analysis Status */}
      {isAnalyzing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-full border border-purple-200">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm font-medium text-purple-700">
              AI analyzing your photo for perfect style matches...
            </span>
          </div>
        </div>
      )}

      {/* Hero Recommendations Section */}
      {heroRecommendations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              <h3 className="text-2xl font-bold text-gray-900">
                Perfect for Your Photo
              </h3>
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI analyzed your image and selected these styles that will create stunning results
            </p>
          </div>

          {/* Hero Grid - Larger, Premium Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {heroRecommendations.map((rec, index) => {
              const style = artStyles.find(s => s.id === rec.styleId);
              if (!style) return null;

              return (
                <div
                  key={rec.styleId}
                  className="relative group transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Premium Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  
                  <div className="relative">
                    <StyleCard
                      style={style}
                      croppedImage={croppedImage}
                      selectedStyle={selectedStyle}
                      isPopular={true}
                      cropAspectRatio={cropAspectRatio}
                      selectedOrientation={selectedOrientation}
                      showContinueButton={false}
                      onStyleClick={() => handleStyleSelect(rec.styleId, rec.styleName)}
                      onContinue={onComplete}
                      shouldBlur={false}
                    />

                    {/* AI Recommendation Badge */}
                    <div className="absolute -top-3 -right-3 z-20">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-3 py-1 shadow-lg animate-pulse">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Pick
                      </Badge>
                    </div>

                    {/* Confidence & Reason Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium mb-1">
                        {Math.round(rec.confidence * 100)}% Match
                      </p>
                      <p className="text-white/80 text-xs">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Choices Section */}
      {popularChoices.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Popular Choices
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Trending
            </Badge>
          </div>
          
          <p className="text-center text-gray-600">
            Styles other customers loved for similar photos
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularChoices.map((rec, index) => {
              const style = artStyles.find(s => s.id === rec.styleId);
              if (!style) return null;

              return (
                <div
                  key={rec.styleId}
                  className="transform transition-all duration-300 hover:scale-102"
                  style={{ animationDelay: `${(index + 3) * 150}ms` }}
                >
                  <StyleCard
                    style={style}
                    croppedImage={croppedImage}
                    selectedStyle={selectedStyle}
                    isPopular={true}
                    cropAspectRatio={cropAspectRatio}
                    selectedOrientation={selectedOrientation}
                    showContinueButton={false}
                    onStyleClick={() => handleStyleSelect(rec.styleId, rec.styleName)}
                    onContinue={onComplete}
                    shouldBlur={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show More Styles Toggle */}
      {secondaryStyles.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllStyles(!showAllStyles)}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:border-purple-300 hover:text-purple-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showAllStyles ? 'Show Less Styles' : `Explore ${secondaryStyles.length} More Styles`}
          </Button>
        </div>
      )}

      {/* Complete Collection - Progressive Enhancement */}
      {showAllStyles && secondaryStyles.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Collection
            </h3>
            <p className="text-gray-600">
              Discover all our artistic styles and find your perfect match
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {secondaryStyles.map((rec, index) => {
              const style = artStyles.find(s => s.id === rec.styleId);
              if (!style) return null;

              const shouldBlur = !heroRecommendations.find(h => h.styleId === rec.styleId) && 
                               !popularChoices.find(p => p.styleId === rec.styleId);

              return (
                <div
                  key={rec.styleId}
                  className="transform transition-all duration-300 hover:scale-102"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fade-in 0.5s ease-out forwards'
                  }}
                >
                  <StyleCard
                    style={style}
                    croppedImage={croppedImage}
                    selectedStyle={selectedStyle}
                    isPopular={false}
                    cropAspectRatio={cropAspectRatio}
                    selectedOrientation={selectedOrientation}
                    showContinueButton={false}
                    onStyleClick={() => handleStyleSelect(rec.styleId, rec.styleName)}
                    onContinue={onComplete}
                    shouldBlur={shouldBlur}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentStyleGrid;
