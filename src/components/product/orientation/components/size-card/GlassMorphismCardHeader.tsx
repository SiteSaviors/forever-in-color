
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Heart } from "lucide-react";
import { useMemo } from "react";

interface GlassMorphismCardHeaderProps {
  popular?: boolean;
  isRecommended?: boolean;
  salePrice: number;
  originalPrice: number;
}

const GlassMorphismCardHeader = ({ 
  popular, 
  isRecommended, 
  salePrice, 
  originalPrice 
}: GlassMorphismCardHeaderProps) => {
  const popularityData = useMemo(() => {
    if (popular) return { icon: Crown, label: "Most Popular" };
    if (salePrice < originalPrice) return { icon: Zap, label: "Best Value" };
    return { icon: Heart, label: "Customer Favorite" };
  }, [popular, salePrice, originalPrice]);

  const hasDiscount = originalPrice > salePrice;

  return (
    <div className="flex items-center justify-between">
      {(popular || isRecommended) && (
        <Badge className={`${
          isRecommended 
            ? 'bg-amber-500 text-white' 
            : 'bg-purple-600 text-white'
        } border-0`}>
          <popularityData.icon className="w-3 h-3" />
          <span className="ml-1">{isRecommended ? 'AI Pick' : popularityData.label}</span>
        </Badge>
      )}
      
      {hasDiscount && (
        <Badge className="bg-green-500 text-white border-0">
          Save ${(originalPrice - salePrice).toFixed(2)}
        </Badge>
      )}
    </div>
  );
};

export default GlassMorphismCardHeader;
