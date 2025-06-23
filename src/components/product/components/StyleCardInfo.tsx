
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "lucide-react";

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
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
    <div className="p-2 md:p-3 space-y-1 md:space-y-2">
      {/* Title with badges */}
      <div className="flex items-center justify-between">
        <h5 className="font-semibold text-gray-900 text-sm md:text-base leading-tight">{style.name}</h5>
        <div className="flex items-center gap-1">
          {isPopular && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 h-auto">
              <Crown className="w-2.5 h-2.5 mr-0.5" />
              <span className="hidden md:inline">Popular</span>
            </Badge>
          )}
          {showGeneratedBadge && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0.5 h-auto">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              <span className="hidden md:inline">Generated</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Description - more compact on mobile */}
      <p className="text-xs md:text-sm text-gray-600 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">
        {style.description}
      </p>
      
      {/* Continue button */}
      {showContinueInCard && (
        <div className="pt-1 md:pt-2">
          <Button 
            onClick={onContinueClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs md:text-sm py-1.5 md:py-2 h-auto"
          >
            Continue with {style.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
