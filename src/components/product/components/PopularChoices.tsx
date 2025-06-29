
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
  const allRemainingStyles = recommendations.filter(r => r.category === 'popular' || r.category === 'secondary');

  if (allRemainingStyles.length === 0) return null;

  const handleStyleSelect = (styleId: number, styleName: string) => {
    onStyleSelect(styleId, styleName);
  };

  return (
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
        Explore all our artistic styles and find your perfect match
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {allRemainingStyles.map((rec, index) => {
          const style = artStyles.find(s => s.id === rec.styleId);
          if (!style) return null;

          const isPopularCategory = rec.category === 'popular';

          return (
            <div
              key={rec.styleId}
              className="transform transition-all duration-300 hover:scale-105 style-card-hover style-card-press"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <StyleCard
                style={style}
                croppedImage={croppedImage}
                selectedStyle={selectedStyle}
                isPopular={isPopularCategory}
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
  );
};

export default PopularChoices;
