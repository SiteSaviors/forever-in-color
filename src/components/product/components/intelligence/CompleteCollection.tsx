
import { Sparkles } from "lucide-react";
import StyleCard from "../../StyleCard";
import { artStyles } from "@/data/artStyles";
import { StyleRecommendation } from "../../utils/styleRecommendationEngine";

interface CompleteCollectionProps {
  secondaryStyles: StyleRecommendation[];
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const CompleteCollection = ({
  secondaryStyles,
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: CompleteCollectionProps) => {
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

      {/* OPTIMIZED GRID LAYOUT - Mobile First, Conversion Focused */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {secondaryStyles.map((rec, index) => {
          const style = artStyles.find(s => s.id === rec.styleId);
          if (!style) return null;

          return (
            <div
              key={rec.styleId}
              className="group relative transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 grid-item"
              style={{ 
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Enhanced Card Container with Premium Effects */}
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 overflow-hidden">
                {/* Subtle Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
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

                {/* Hover Enhancement Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-50/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-2xl"></div>
                
                {/* Premium Glow Effect on Hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-2xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500 -z-10"></div>
              </div>
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
