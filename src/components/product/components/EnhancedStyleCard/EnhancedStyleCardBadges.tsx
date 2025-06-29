
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Star } from "lucide-react";

interface EnhancedStyleCardBadgesProps {
  isRecommended: boolean;
  isPopular: boolean;
  confidence?: number;
}

const EnhancedStyleCardBadges = ({
  isRecommended,
  isPopular,
  confidence
}: EnhancedStyleCardBadgesProps) => {
  return (
    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
      <div className="flex flex-col gap-2">
        {isRecommended && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg animate-pulse">
            <Crown className="w-3 h-3 mr-1" />
            AI Pick
          </Badge>
        )}
        {isPopular && !isRecommended && (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow-lg">
            <Users className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      {confidence && (
        <Badge variant="secondary" className="bg-black/80 text-white border-0 backdrop-blur-sm">
          <Star className="w-3 h-3 mr-1 text-amber-400" />
          {Math.round(confidence * 100)}% Match
        </Badge>
      )}
    </div>
  );
};

export default EnhancedStyleCardBadges;
