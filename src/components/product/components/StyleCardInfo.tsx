
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, RefreshCw } from "lucide-react";

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
  showError: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: (e: React.MouseEvent) => void;
  onRetryClick: (e: React.MouseEvent) => void;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur,
  showError,
  onContinueClick,
  onGenerateClick,
  onRetryClick
}: StyleCardInfoProps) => {
  return (
    <div className="p-4 space-y-3">
      {/* Header with badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
            {style.name}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
            {style.description}
          </p>
        </div>
        
        <div className="flex flex-col gap-1 flex-shrink-0">
          {isPopular && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {showGeneratedBadge && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5">
              <Zap className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Error state - show retry button */}
        {showError && (
          <Button
            onClick={onRetryClick}
            size="sm"
            variant="outline"
            className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        )}

        {/* Continue button for completed styles */}
        {showContinueInCard && isSelected && !shouldBlur && !showError && (
          <Button
            onClick={onContinueClick}
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs"
          >
            Continue
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}

        {/* Generate button for blurred cards */}
        {shouldBlur && !showError && (
          <Button
            onClick={onGenerateClick}
            size="sm"
            variant="outline"
            className="flex-1 text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Zap className="w-3 h-3 mr-1" />
            Generate Preview
          </Button>
        )}
      </div>
    </div>
  );
};

export default StyleCardInfo;
