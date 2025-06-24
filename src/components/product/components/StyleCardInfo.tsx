
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Crown } from "lucide-react";

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
  shouldBlur?: boolean;
  onContinueClick: () => void;
  onGenerateClick: () => void;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur = false,
  onContinueClick,
  onGenerateClick
}: StyleCardInfoProps) => {
  return (
    <div className="p-4 flex flex-col flex-1">
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-black leading-tight mb-1 truncate">
            {style.name}
          </h3>
          <p className="text-xs text-black/70 leading-relaxed">
            {style.description}
          </p>
        </div>
        
        {/* Badges container */}
        <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
          {isPopular && (
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 text-xs px-2 py-0.5 font-medium flex items-center gap-1"
            >
              <Crown className="w-2.5 h-2.5" />
              Popular
            </Badge>
          )}
          
          {showGeneratedBadge && (
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 text-xs px-2 py-0.5 font-medium flex items-center gap-1"
            >
              <CheckCircle className="w-2.5 h-2.5" />
              Generated
            </Badge>
          )}
        </div>
      </div>

      {/* Continue button - appears at bottom after generation */}
      {showContinueInCard && (
        <div className="mt-auto pt-3">
          <Button
            onClick={onContinueClick}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-sm"
          >
            Continue with {style.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
