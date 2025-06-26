
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface CanvasBadgesProps {
  isRecommended: boolean;
  isSelected: boolean;
}

const CanvasBadges = ({ isRecommended, isSelected }: CanvasBadgesProps) => {
  return (
    <>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-2xl backdrop-blur-sm border border-white/20">
            <Sparkles className="w-3 h-3" />
            Selected
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasBadges;
