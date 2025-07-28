import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StyleCard from "../StyleCard";
import { artStyles } from "@/data/artStyles";
import { StyleRecommendation } from "../utils/styleRecommendationEngine";
interface PopularChoicesProps {
  recommendations: StyleRecommendation[];
  croppedImage: string;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}
const PopularChoices = ({
  recommendations,
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: PopularChoicesProps) => {
  // Combine both popular and secondary categories to show all remaining styles
  // Filter out the "Original Image" style (ID 1) since it's already shown in the hero section
  const allRemainingStyles = recommendations.filter(r => (r.category === 'popular' || r.category === 'secondary') && r.styleId !== 1);
  if (allRemainingStyles.length === 0) return null;
  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎯 PopularChoices handleStyleSelect:', styleId, styleName);
    onStyleSelect(styleId, styleName);
  };
  return <div className="space-y-6">
      <div className="text-center mb-8 p-6 md:p-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-2xl border border-violet-100">
        <div className="flex items-center justify-center mb-4">
          <div className="relative p-3 bg-gradient-to-br from-violet-100/80 to-pink-100/80 rounded-xl shadow-lg backdrop-blur-sm">
            <span className="text-2xl">🎨</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400/10 to-pink-400/10 blur-sm -z-10" />
          </div>
        </div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3 font-poppins tracking-tight font-bold">
          Explore More Artistic Styles
        </h3>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
          Discover trending styles loved by our community that could bring a unique flair to your canvas.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/50 rounded-full border border-violet-200">
          <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full animate-pulse" />
          <span className="text-sm text-violet-700 font-medium">Popular Choices</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {allRemainingStyles.map((rec, index) => {
        const style = artStyles.find(s => s.id === rec.styleId);
        if (!style) return null;
        const isPopularCategory = rec.category === 'popular';
        return <div key={rec.styleId} className="transform transition-all duration-300 hover:scale-105 style-card-hover style-card-press" style={{
          animationDelay: `${index * 150}ms`
        }}>
              <StyleCard style={style} croppedImage={croppedImage} selectedStyle={selectedStyle} isPopular={isPopularCategory} cropAspectRatio={cropAspectRatio} selectedOrientation={selectedOrientation} showContinueButton={false} onStyleClick={() => handleStyleSelect(rec.styleId, rec.styleName)} onContinue={onComplete} shouldBlur={false} />
            </div>;
      })}
      </div>
    </div>;
};
export default PopularChoices;