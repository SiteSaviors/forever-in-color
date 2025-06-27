import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Crown, Zap, Eye, Loader2 } from "lucide-react";
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
    <div className="space-y-8 md:space-y-12">
      {/* AI Analysis Status with Loading Skeleton */}
      {isAnalyzing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-full border border-purple-200">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              AI analyzing your photo for perfect style matches...
            </span>
          </div>
          
          {/* Loading Skeleton for Hero Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="loading-shimmer rounded-2xl h-64 animate-pulse"></div>
            ))}
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

          {/* Hero Grid - Enhanced with Pulsing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {heroRecommendations.map((rec, index) => {
              const style = artStyles.find(s => s.id === rec.styleId);
              if (!style) return null;

              return (
                <div
                  key={rec.styleId}
                  className={`relative group transform transition-all duration-500 hover:scale-105 recommended-pulse ${
                    hoveredStyle === rec.styleId ? 'z-10' : ''
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                  onMouseEnter={() => setHoveredStyle(rec.styleId)}
                  onMouseLeave={() => setHoveredStyle(null)}
                >
                  {/* Enhanced Premium Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  
                  <div className="relative style-card-hover style-card-press">
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

                    {/* Enhanced AI Recommendation Badge */}
                    <div className="absolute -top-3 -right-3 z-20">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-3 py-1 shadow-lg">
                        <Zap className="w-3 h-3 mr-1 animate-pulse" />
                        AI Pick
                      </Badge>
                    </div>

                    {/* Enhanced Confidence & Reason Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-sm font-semibold">
                          {Math.round(rec.confidence * 100)}% Match
                        </p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mx-0.5 ${
                                i < Math.round(rec.confidence * 5)
                                  ? 'bg-amber-400'
                                  : 'bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/90 text-xs leading-relaxed">
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

      {/* Popular Choices Section - Enhanced */}
      {popularChoices.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Popular Choices
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 animate-pulse">
              <Users className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          </div>
          
          <p className="text-center text-gray-600">
            Styles other customers loved for similar photos
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {popularChoices.map((rec, index) => {
              const style = artStyles.find(s => s.id === rec.styleId);
              if (!style) return null;

              return (
                <div
                  key={rec.styleId}
                  className="transform transition-all duration-300 hover:scale-105 style-card-hover style-card-press"
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

      {/* Complete Collection - UPDATED LAYOUT & SIZING */}
      {showAllStyles && secondaryStyles.length > 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Collection
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover all our artistic styles and find your perfect match. Each style is carefully crafted to transform your photo into a unique work of art.
            </p>
          </div>

          {/* UPDATED GRID LAYOUT - Match Popular Choices: 3 cards per row on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {secondaryStyles.map((rec, index) => {
              const style = artStyles.find(s => s.id === rec.styleId);
              if (!style) return null;

              return (
                <div
                  key={rec.styleId}
                  className="transform transition-all duration-300 hover:scale-105 style-card-hover style-card-press"
                  style={{ 
                    animationDelay: `${index * 150}ms`
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
                    shouldBlur={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Conversion-Optimized CTA Section */}
          <div className="text-center mt-12 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">
                Ready to Create Your Masterpiece?
              </h4>
              <p className="text-gray-600 text-sm">
                Select any style above to see your photo transformed with AI magic
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentStyleGrid;
