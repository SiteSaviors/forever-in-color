
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Eye, Expand } from "lucide-react";

interface StyleCardIndicatorsProps {
  isPopular: boolean;
  showGeneratedBadge: boolean;
  isSelected: boolean;
  hasPreviewOrCropped: boolean;
  onExpandClick: () => void;
  onCanvasPreviewClick: () => void;
}

const StyleCardIndicators = ({
  isPopular,
  showGeneratedBadge,
  isSelected,
  hasPreviewOrCropped,
  onExpandClick,
  onCanvasPreviewClick
}: StyleCardIndicatorsProps) => {
  return (
    <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
      {/* Left side badges */}
      <div className="flex flex-col gap-1">
        {isPopular && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        )}
        
        {showGeneratedBadge && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Generated
          </Badge>
        )}
        
        {isSelected && (
          <Badge className="bg-purple-600 text-white text-xs">
            Selected
          </Badge>
        )}
      </div>

      {/* Right side actions */}
      {hasPreviewOrCropped && (
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandClick();
            }}
            className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
            title="View larger"
          >
            <Expand className="w-3 h-3" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCanvasPreviewClick();
            }}
            className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
            title="Canvas preview"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StyleCardIndicators;
