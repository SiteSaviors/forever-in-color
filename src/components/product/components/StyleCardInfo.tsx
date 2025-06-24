
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
  // Only show one primary badge - prioritize Generated > Popular
  const showPopularBadge = isPopular && !showGeneratedBadge;
  
  return (
    <div className="p-3 md:p-4 space-y-2 min-h-[100px] flex flex-col justify-between">
      {/* Title with badges */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-playfair font-bold text-gray-900 text-lg md:text-xl leading-tight tracking-wide">
            {style.name}
          </h5>
          <div className="flex items-center gap-1 flex-shrink-0">
            {showPopularBadge && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 h-auto">
                <Crown className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Popular</span>
              </Badge>
            )}
            {showGeneratedBadge && hasGeneratedPreview && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1 h-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Generated</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Description with refined typography */}
        <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2">
          {style.description}
        </p>
      </div>
      
      {/* Continue button */}
      {showContinueInCard && (
        <div className="pt-2">
          <Button 
            onClick={onContinueClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2.5 h-auto font-medium"
          >
            Continue with {style.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
