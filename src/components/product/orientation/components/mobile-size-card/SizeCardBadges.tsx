
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Heart, Sparkles } from "lucide-react";

interface SizeCardBadgesProps {
  isRecommended?: boolean;
  tier?: string;
  label?: string;
  popularity?: number;
}

const SizeCardBadges: React.FC<SizeCardBadgesProps> = ({
  isRecommended,
  tier,
  label,
  popularity
}) => {
  const getTierIcon = () => {
    switch (tier) {
      case 'best':
        return <Crown className="w-4 h-4" />;
      case 'better':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex gap-2 flex-wrap">
        {isRecommended && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Pick
          </Badge>
        )}
        
        {label && (
          <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 font-semibold">
            {getTierIcon()}
            <span className="ml-1">{label}</span>
          </Badge>
        )}
      </div>

      {popularity && (
        <div className="text-xs text-gray-600 font-medium">
          {popularity}% choose this
        </div>
      )}
    </div>
  );
};

export default SizeCardBadges;
