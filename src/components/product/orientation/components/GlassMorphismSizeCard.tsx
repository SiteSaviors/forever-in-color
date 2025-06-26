
import { SizeOption } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Zap, Heart, Sparkles } from "lucide-react";
import { memo, useState, useCallback } from "react";

interface GlassMorphismSizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  isRecommended?: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

const GlassMorphismSizeCard = memo(({
  option,
  orientation,
  isSelected,
  userImageUrl,
  isRecommended = false,
  onClick,
  onContinue
}: GlassMorphismSizeCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getRoomContext = useCallback((size: string) => {
    const contexts = {
      '8" x 8"': 'Perfect for desks & shelves',
      '12" x 12"': 'Ideal for gallery walls',
      '16" x 16"': 'Statement piece for any room',
      '20" x 20"': 'Bold focal point',
      '24" x 24"': 'Luxury centerpiece',
      '8" x 10"': 'Cozy personal spaces',
      '11" x 14"': 'Classic home display',
      '16" x 20"': 'Professional presentation',
      '18" x 24"': 'Impressive wall art',
      '24" x 36"': 'Grand statement piece',
      '10" x 8"': 'Modern accent piece',
      '14" x 11"': 'Sophisticated display',
      '20" x 16"': 'Eye-catching feature',
      '24" x 18"': 'Premium wall art',
      '36" x 24"': 'Luxury showcase'
    };
    return contexts[size] || 'Beautiful for any space';
  }, []);

  const getPopularityIcon = useCallback(() => {
    if (option.popular) return <Crown className="w-3 h-3" />;
    if (option.salePrice < option.originalPrice) return <Zap className="w-3 h-3" />;
    return <Heart className="w-3 h-3" />;
  }, [option.popular, option.salePrice, option.originalPrice]);

  const getPopularityLabel = useCallback(() => {
    if (option.popular) return "Most Popular";
    if (option.salePrice < option.originalPrice) return "Best Value";
    return "Customer Favorite";
  }, [option.popular, option.salePrice, option.originalPrice]);

  const getCanvasFrame = useCallback(() => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  }, [orientation]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <div 
      className={`relative group cursor-pointer transition-transform duration-200 ${
        isSelected ? 'scale-105' : 'hover:scale-102'
      }`} 
      onClick={onClick}
      role="button" 
      tabIndex={0} 
      aria-pressed={isSelected} 
      aria-label={`Select ${option.size} size`}
    >
      {/* Optimized Glass Morphism Background - Reduced complexity */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-200 ${
        isSelected 
          ? 'bg-white/80 shadow-2xl border-2 border-purple-300' 
          : 'bg-white/60 shadow-xl hover:shadow-2xl border border-white/40'
      }`}>
        {/* Simplified Gradient Overlay */}
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-200 ${
          isSelected 
            ? 'bg-gradient-to-br from-purple-50/80 to-pink-50/80 opacity-100' 
            : 'bg-gradient-to-br from-gray-50/50 to-gray-100/50 opacity-0 group-hover:opacity-100'
        }`} />
      </div>

      {/* Content Container */}
      <div className="relative p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          {(option.popular || isRecommended) && (
            <Badge className={`${
              isRecommended 
                ? 'bg-amber-500/90 text-white' 
                : 'bg-purple-600/90 text-white'
            } shadow-lg border-0`}>
              {getPopularityIcon()}
              <span className="ml-1">{isRecommended ? 'AI Pick' : getPopularityLabel()}</span>
            </Badge>
          )}
          
          {option.originalPrice > option.salePrice && (
            <Badge className="bg-green-500/80 text-white border-0 shadow-lg">
              Save ${(option.originalPrice - option.salePrice).toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Optimized Canvas Preview - Lazy loading */}
        <div className="mb-4 flex justify-center">
          <div className="w-24 h-24 relative">
            {!imageLoaded && (
              <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            )}
            <img 
              src={getCanvasFrame()} 
              alt={`${orientation} canvas frame`} 
              className={`w-full h-full object-contain transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
            />
          </div>
        </div>

        {/* Size Information */}
        <div className="text-center space-y-2">
          <div className="bg-white/50 rounded-lg p-3 border border-white/20">
            <h5 className="font-bold text-gray-900 mb-1 text-2xl">{option.size}</h5>
            <p className="text-sm text-purple-600 font-medium">{getRoomContext(option.size)}</p>
            <p className="text-xs text-gray-500">{option.category}</p>
          </div>
        </div>

        {/* Simplified Pricing Display */}
        <div className="text-center space-y-2">
          <div className="bg-white/70 rounded-xl p-4 border border-white/30 shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-purple-600">
                ${option.salePrice}
              </span>
              {option.originalPrice > option.salePrice && (
                <span className="text-lg text-gray-500 line-through">${option.originalPrice}</span>
              )}
            </div>
            
            {option.originalPrice > option.salePrice && (
              <p className="text-sm text-green-600 font-semibold mt-1">
                🎉 Limited Time: {Math.round((option.originalPrice - option.salePrice) / option.originalPrice * 100)}% Off
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50/80 rounded-lg p-3 text-center border border-white/20">
          <p className="text-sm text-gray-700">{option.description}</p>
        </div>

        {/* Continue Button */}
        {isSelected && (
          <Button 
            onClick={onContinue} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-xl transition-all duration-200 transform hover:scale-105 border-0 min-h-[48px]" 
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Continue with {option.size}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Simplified Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-60 pointer-events-none"></div>
      )}
    </div>
  );
});

GlassMorphismSizeCard.displayName = 'GlassMorphismSizeCard';

export default GlassMorphismSizeCard;
