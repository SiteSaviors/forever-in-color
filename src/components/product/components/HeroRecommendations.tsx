
import { useState } from "react";
import { Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StyleCard from "../StyleCard";
import { artStyles } from "@/data/artStyles";
import { StyleRecommendation } from "../utils/styleRecommendationEngine";

interface HeroRecommendationsProps {
  recommendations: StyleRecommendation[];
  croppedImage: string;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const HeroRecommendations = ({
  recommendations,
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: HeroRecommendationsProps) => {
  const [hoveredStyle, setHoveredStyle] = useState<number | null>(null);
  
  const heroRecommendations = recommendations.filter(r => r.category === 'hero').slice(0, 3);

  if (heroRecommendations.length === 0) return null;

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎯 HeroRecommendations handleStyleSelect:', styleId, styleName);
    onStyleSelect(styleId, styleName);
  };

  return (
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
                {/* StyleCard with overlay positioning */}
                <div className="relative overflow-hidden">
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

                  {/* Subtle AI Match Overlay - Positioned over bottom of image only */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Image-specific overlay container */}
                    <div className="relative w-full" style={{ height: `${100 * cropAspectRatio}%` }}>
                      {/* Compact overlay at bottom of image */}
                      <div className={`absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md rounded-lg px-3 py-2 transition-all duration-300 ease-out ${
                        hoveredStyle === rec.styleId 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-2'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-medium">
                              {Math.round(rec.confidence * 100)}% Match
                            </span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    i < Math.round(rec.confidence * 5)
                                      ? 'bg-amber-400'
                                      : 'bg-gray-500'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80 text-xs mt-1 leading-tight font-light">
                          {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced AI Recommendation Badge */}
                <div className="absolute -top-3 -right-3 z-20">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-3 py-1 shadow-lg">
                    <Zap className="w-3 h-3 mr-1 animate-pulse" />
                    AI Pick
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroRecommendations;
