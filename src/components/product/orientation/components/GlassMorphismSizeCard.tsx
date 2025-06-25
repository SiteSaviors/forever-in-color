
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Zap, Heart, Sparkles } from "lucide-react";
import MorphingCanvasPreview from "./MorphingCanvasPreview";
import { GlassMorphismSizeCardProps } from "../types/interfaces";

const GlassMorphismSizeCard = ({ 
  option, 
  orientation, 
  isSelected, 
  userImageUrl,
  isRecommended = false,
  disabled = false,
  onClick, 
  onContinue 
}: GlassMorphismSizeCardProps) => {
  const getRoomContext = (size: string) => {
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
  };

  const getPopularityIcon = () => {
    if (option.popular) return <Crown className="w-3 h-3" />;
    if (option.salePrice < option.originalPrice) return <Zap className="w-3 h-3" />;
    return <Heart className="w-3 h-3" />;
  };

  const getPopularityLabel = () => {
    if (option.popular) return "Most Popular";
    if (option.salePrice < option.originalPrice) return "Best Value";
    return "Customer Favorite";
  };

  // Single optimized event handler
  const handleCardClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    onContinue(e);
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ${
        disabled ? 'opacity-60 pointer-events-none' : ''
      } ${
        isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
      onClick={handleCardClick}
    >
      {/* Glass morphism background */}
      <div className={`absolute inset-0 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
        isSelected 
          ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-purple-500/20 shadow-xl shadow-purple-500/20 border-white/40' 
          : 'bg-white/70 shadow-lg hover:shadow-xl border-white/30 hover:border-white/50'
      }`}>
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isSelected 
            ? 'bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5 opacity-100' 
            : 'bg-gradient-to-br from-gray-100/30 via-transparent to-gray-200/30 opacity-0 group-hover:opacity-100'
        }`} />
      </div>

      {/* Content Container */}
      <div className="relative p-4 md:p-6 space-y-3 md:space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          {(option.popular || isRecommended) && (
            <Badge className={`${
              isRecommended 
                ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90' 
                : 'bg-gradient-to-r from-purple-600/90 to-pink-600/90'
            } text-white shadow-lg backdrop-blur-sm border border-white/20 text-xs`}>
              {getPopularityIcon()}
              <span className="ml-1">{isRecommended ? 'AI Pick' : getPopularityLabel()}</span>
            </Badge>
          )}
          
          {option.originalPrice > option.salePrice && (
            <Badge className="bg-green-500/80 text-white border border-green-300/30 backdrop-blur-sm shadow-lg text-xs">
              Save $50
            </Badge>
          )}
        </div>

        {/* Canvas preview */}
        <div className="mb-3 md:mb-4">
          <MorphingCanvasPreview
            orientation={orientation}
            userImageUrl={null} // Optimized for performance
            size={option.size}
            isSelected={isSelected}
            isRecommended={isRecommended}
            onClick={() => {}} // Prevent nested clicks
          />
        </div>

        {/* Size Information */}
        <div className="text-center space-y-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/30">
            <h5 className="font-bold text-base md:text-lg text-gray-900 mb-1">{option.size}</h5>
            <p className="text-xs md:text-sm text-purple-600 font-medium">{getRoomContext(option.size)}</p>
            <p className="text-xs text-gray-500">{option.category}</p>
          </div>
        </div>

        {/* Pricing Display */}
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/40 shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${option.salePrice}
              </span>
              {option.originalPrice > option.salePrice && (
                <span className="text-base md:text-lg text-gray-500 line-through">${option.originalPrice}</span>
              )}
            </div>
            
            {option.originalPrice > option.salePrice && (
              <p className="text-xs md:text-sm text-green-600 font-semibold mt-1">
                🎉 Limited Time: {Math.round(((option.originalPrice - option.salePrice) / option.originalPrice) * 100)}% Off
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-lg p-2 md:p-3 text-center border border-white/30">
          <p className="text-xs md:text-sm text-gray-700">{option.description}</p>
        </div>

        {/* Continue button */}
        {isSelected && (
          <Button
            onClick={handleContinueClick}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 md:py-3 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 backdrop-blur-sm border border-white/20 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Continue with {option.size}
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/3 group-hover:via-pink-500/3 group-hover:to-purple-500/3 transition-all duration-500 pointer-events-none" />
    </div>
  );
};

export default GlassMorphismSizeCard;
