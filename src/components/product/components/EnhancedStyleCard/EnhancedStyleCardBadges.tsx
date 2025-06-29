
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Zap } from "lucide-react";

interface EnhancedStyleCardBadgesProps {
  isPopular?: boolean;
  isGenerated?: boolean;
  isSelected?: boolean;
  hasPreview?: boolean;
}

const EnhancedStyleCardBadges = memo(({
  isPopular = false,
  isGenerated = false,
  isSelected = false,
  hasPreview = false
}: EnhancedStyleCardBadgesProps) => {
  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1">
      {isPopular && (
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
          <Crown className="w-3 h-3 mr-1" />
          Popular
        </Badge>
      )}
      
      {isGenerated && hasPreview && (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
          <Sparkles className="w-3 h-3 mr-1" />
          Generated
        </Badge>
      )}
      
      {isSelected && (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-md">
          <Zap className="w-3 h-3 mr-1" />
          Selected
        </Badge>
      )}
    </div>
  );
});

EnhancedStyleCardBadges.displayName = 'EnhancedStyleCardBadges';

export default EnhancedStyleCardBadges;
