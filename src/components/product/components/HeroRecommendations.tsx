
import { useState } from "react";
import { Crown, Zap, Image } from "lucide-react";
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
  
  // Show 5 AI recommendations
  const heroRecommendations = recommendations.filter(r => r.category === 'hero').slice(0, 5);

  if (heroRecommendations.length === 0) return null;

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎯 HeroRecommendations handleStyleSelect:', styleId, styleName);
    onStyleSelect(styleId, styleName);
  };

  // Create original style object for the first card
  const originalStyle = {
    id: 1,
    name: "Original Image",
    description: "Your photo as uploaded - perfect as is",
    image: croppedImage
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
          Your original photo plus our AI-selected styles that will create stunning results
        </p>
      </div>

      {/* Hero Grid - 3 cards per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Original Photo Card - Always First */}
        <div
          className={`relative group transform transition-all duration-500 hover:scale-105 ${
            hoveredStyle === 1 ? 'z-10' : ''
          }`}
          onMouseEnter={() => setHoveredStyle(1)}
          onMouseLeave={() => setHoveredStyle(null)}
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
          
          <div className="relative style-card-hover style-card-press">
            <StyleCard
              style={originalStyle}
              croppedImage={croppedImage}
              selectedStyle={selectedStyle}
              isPopular={true}
              cropAspectRatio={cropAspectRatio}
              selectedOrientation={selectedOrientation}
              showContinueButton={false}
              onStyleClick={() => handleStyleSelect(1, "Original Image")}
              onContinue={onComplete}
              shouldBlur={false}
            />

            <div className="absolute -top-3 -right-3 z-20">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold px-3 py-1 shadow-lg">
                <Image className="w-3 h-3 mr-1" />
                Original
              </Badge>
            </div>
          </div>
        </div>

        {/* AI Recommended Styles - 5 cards in rows of 3 */}
        {heroRecommendations.map((rec, index) => {
          const style = artStyles.find(s => s.id === rec.styleId);
          if (!style) return null;

          return (
            <div
              key={rec.styleId}
              className={`relative group transform transition-all duration-500 hover:scale-105 recommended-pulse ${
                hoveredStyle === rec.styleId ? 'z-10' : ''
              }`}
              style={{ animationDelay: `${(index + 1) * 200}ms` }}
              onMouseEnter={() => setHoveredStyle(rec.styleId)}
              onMouseLeave={() => setHoveredStyle(null)}
            >
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
