
import { Button } from "@/components/ui/button";
import StyleCardIndicators from "./StyleCardIndicators";

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
  onContinueClick: (e: React.MouseEvent) => void;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  onContinueClick
}: StyleCardInfoProps) => {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
        <StyleCardIndicators 
          hasGeneratedPreview={hasGeneratedPreview}
          isPopular={isPopular}
          isSelected={isSelected}
          isStyleGenerated={showGeneratedBadge}
        />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
      
      {/* Already Generated Message */}
      {showGeneratedBadge && style.id !== 1 && (
        <p className="text-xs text-gray-500 italic">
          Refresh page to generate again
        </p>
      )}

      {/* Continue Button - Show at bottom of card when style is selected and has preview */}
      {showContinueInCard && (
        <div className="pt-2">
          <Button 
            onClick={onContinueClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Continue with {style.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
