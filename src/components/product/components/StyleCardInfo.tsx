
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
  // Get style-specific gradient pills
  const getStylePills = (styleId: number) => {
    const pillConfigs: { [key: number]: { pills: Array<{text: string, gradient: string}> } } = {
      1: { pills: [{ text: "Original", gradient: "from-gray-500 to-gray-700" }] },
      2: { pills: [{ text: "Classic", gradient: "from-amber-500 to-orange-600" }, { text: "Refined", gradient: "from-yellow-500 to-amber-600" }] },
      4: { pills: [{ text: "Serene", gradient: "from-blue-500 to-cyan-600" }, { text: "Abstract", gradient: "from-orange-500 to-red-600" }] },
      5: { pills: [{ text: "Dreamy", gradient: "from-pink-500 to-rose-600" }, { text: "Soft", gradient: "from-purple-500 to-pink-600" }] },
      6: { pills: [{ text: "Geometric", gradient: "from-emerald-500 to-teal-600" }, { text: "Modern", gradient: "from-green-500 to-emerald-600" }] },
      7: { pills: [{ text: "Whimsical", gradient: "from-blue-500 to-indigo-600" }, { text: "3D", gradient: "from-cyan-500 to-blue-600" }] },
      8: { pills: [{ text: "Artistic", gradient: "from-slate-600 to-gray-700" }, { text: "Textured", gradient: "from-gray-600 to-slate-700" }] },
      9: { pills: [{ text: "Bold", gradient: "from-pink-600 to-rose-700" }, { text: "Vibrant", gradient: "from-fuchsia-600 to-pink-700" }] },
      10: { pills: [{ text: "Electric", gradient: "from-green-500 to-emerald-600" }, { text: "Neon", gradient: "from-lime-500 to-green-600" }] },
      11: { pills: [{ text: "Dynamic", gradient: "from-purple-600 to-violet-700" }, { text: "Bloom", gradient: "from-indigo-600 to-purple-700" }] },
      13: { pills: [{ text: "Abstract", gradient: "from-blue-600 to-indigo-700" }, { text: "Fusion", gradient: "from-cyan-600 to-blue-700" }] },
      15: { pills: [{ text: "Luxe", gradient: "from-yellow-600 to-amber-700" }, { text: "Deco", gradient: "from-amber-600 to-orange-700" }] },
    };
    
    return pillConfigs[styleId] || { pills: [{ text: "Style", gradient: "from-gray-500 to-gray-700" }] };
  };

  const styleConfig = getStylePills(style.id);

  return (
    <div className="p-4 space-y-3">
      {/* Gradient Pills */}
      <div className="flex flex-wrap gap-1.5">
        {styleConfig.pills.map((pill, index) => (
          <div
            key={index}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${pill.gradient} shadow-sm`}
          >
            {pill.text}
          </div>
        ))}
      </div>

      {/* Header with badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-poppins font-semibold text-gray-900 truncate text-sm md:text-base">
            {style.name}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 mt-1 font-poppins">
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
            className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50 font-poppins"
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
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-poppins"
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
            className="flex-1 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 font-poppins"
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
