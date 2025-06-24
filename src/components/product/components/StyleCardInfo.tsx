
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
  };
  hasGeneratedPreview: boolean;
  isPopular: boolean;
  isSelected: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur: boolean;
  onContinueClick: () => void;
  onGenerateClick: (e: React.MouseEvent) => void;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur,
  onContinueClick,
  onGenerateClick
}: StyleCardInfoProps) => {
  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Tags - Show only essential on mobile */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Mobile: Show only Popular tag, Desktop: Show all tags */}
        {isPopular && (
          <span className="inline-block bg-yellow-200 text-xs font-medium px-2 py-1 rounded-full">
            Popular
          </span>
        )}
        {showGeneratedBadge && (
          <span className="hidden sm:inline-block bg-green-200 text-xs font-medium px-2 py-1 rounded-full">
            Generated
          </span>
        )}
      </div>

      {/* Title - Responsive sizing */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">
        {style.name}
      </h3>

      {/* Description - Truncated on mobile, full on desktop */}
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 
                    truncate sm:line-clamp-none flex-1">
        {style.description}
      </p>

      {/* Action Buttons */}
      <div className="mt-auto">
        {showContinueInCard && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onContinueClick();
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium transition-all hover:shadow-lg"
          >
            Continue with this style
          </Button>
        )}

        {shouldBlur && !hasGeneratedPreview && (
          <Button
            onClick={onGenerateClick}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Style
          </Button>
        )}
      </div>
    </div>
  );
};

export default StyleCardInfo;
