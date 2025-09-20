
import { Sparkles } from "lucide-react";
import StyleCard from "../StyleCard";
import { artStyles } from "@/data/artStyles";
import { StyleRecommendation } from "../utils/styleRecommendationEngine";

interface CompleteCollectionProps {
  recommendations: StyleRecommendation[];
  croppedImage: string;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const CompleteCollection = ({
  recommendations,
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: CompleteCollectionProps) => {
  const secondaryStyles = recommendations.filter(r => r.category === 'secondary');

  if (secondaryStyles.length === 0) return null;

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎯 CompleteCollection handleStyleSelect:', styleId, styleName);
    onStyleSelect(styleId, styleName);
  };

  return (
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
  );
};

export default CompleteCollection;
