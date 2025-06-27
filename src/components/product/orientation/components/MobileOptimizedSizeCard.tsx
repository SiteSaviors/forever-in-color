
import React, { memo, useCallback, useState } from "react";
import { SizeOption } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, TrendingUp, Heart, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHapticFeedback } from "../../progress/hooks/useHapticFeedback";

interface MobileOptimizedSizeCardProps {
  option: SizeOption & { 
    tier?: string; 
    label?: string; 
    isRecommended?: boolean;
    popularity?: number;
  };
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  onSelect: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

const MobileOptimizedSizeCard = memo(({
  option,
  orientation,
  isSelected,
  userImageUrl,
  onSelect,
  onContinue
}: MobileOptimizedSizeCardProps) => {
  const isMobile = useIsMobile();
  const { triggerHaptic } = useHapticFeedback({ completedSteps: [] });
  const [isPressed, setIsPressed] = useState(false);

  const handleCardPress = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    triggerHaptic();
    onSelect();
    
    // Reset press state after animation
    setTimeout(() => setIsPressed(false), 150);
  }, [onSelect, triggerHaptic]);

  const handleContinuePress = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    onContinue(e);
  }, [onContinue, triggerHaptic]);

  const getTierIcon = () => {
    switch (option.tier) {
      case 'best':
        return <Crown className="w-4 h-4" />;
      case 'better':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  // Simplified mobile-first styling
  const cardClasses = `
    relative cursor-pointer transition-all duration-300 transform will-change-transform
    ${isMobile ? 'min-h-[320px] mx-2' : 'min-h-[400px]'}
    ${isSelected 
      ? 'scale-105 -translate-y-2 z-30' 
      : isPressed 
        ? 'scale-98' 
        : 'hover:scale-102 hover:-translate-y-1 z-10'
    }
  `;

  const backgroundStyles = isSelected
    ? 'bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-400'
    : option.isRecommended
      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300'
      : 'bg-white border-2 border-gray-200 hover:border-purple-200';

  const shadowStyles = isSelected
    ? 'shadow-2xl shadow-purple-200/50'
    : option.isRecommended
      ? 'shadow-xl shadow-amber-200/50'
      : 'shadow-lg hover:shadow-xl';

  return (
    <div 
      className={`${cardClasses} ${backgroundStyles} ${shadowStyles} rounded-2xl overflow-hidden touch-manipulation`}
      onClick={handleCardPress}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      role="button" 
      tabIndex={0} 
      aria-pressed={isSelected}
      aria-label={`Select ${option.size} canvas size`}
      style={{ minHeight: isMobile ? '320px' : '400px' }}
    >
      {/* Content Container with generous padding for mobile */}
      <div className={`relative p-4 ${isMobile ? 'md:p-6' : 'md:p-8'} space-y-4 h-full flex flex-col`}>
        
        {/* Top Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            {option.isRecommended && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Pick
              </Badge>
            )}
            
            {option.label && (
              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 font-semibold">
                {getTierIcon()}
                <span className="ml-1">{option.label}</span>
              </Badge>
            )}
          </div>

          {/* Popularity indicator */}
          {option.popularity && (
            <div className="text-xs text-gray-600 font-medium">
              {option.popularity}% choose this
            </div>
          )}
        </div>

        {/* Canvas Preview - Simplified for mobile */}
        <div className="flex justify-center flex-1 items-center">
          <div className={`
            relative transition-all duration-300
            ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
          `}>
            {/* Simplified canvas representation */}
            <div className={`
              relative bg-gradient-to-br from-gray-100 to-gray-200 
              ${orientation === 'square' ? 'w-24 h-24' : 
                orientation === 'horizontal' ? 'w-32 h-20' : 'w-20 h-28'}
              rounded-lg shadow-md border-2 border-white
            `}>
              {userImageUrl && (
                <img 
                  src={userImageUrl} 
                  alt="Your photo preview" 
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>

        {/* Size Information */}
        <div className="text-center space-y-2">
          <h3 className={`
            ${isMobile ? 'text-xl' : 'text-2xl'} font-bold font-poppins tracking-tight
            ${isSelected ? 'text-purple-800' : option.isRecommended ? 'text-amber-800' : 'text-gray-800'}
          `}>
            {option.size}
          </h3>
          
          <p className={`
            text-sm font-medium font-poppins
            ${isSelected ? 'text-purple-600' : option.isRecommended ? 'text-amber-600' : 'text-gray-600'}
          `}>
            Perfect for {orientation === 'square' ? 'balanced displays' : 
                       orientation === 'horizontal' ? 'wide spaces' : 'tall walls'}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className={`
              ${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent
            `}>
              ${option.salePrice}
            </span>
            {option.originalPrice > option.salePrice && (
              <span className="text-lg text-gray-500 line-through font-poppins">
                ${option.originalPrice}
              </span>
            )}
          </div>
          
          {option.originalPrice > option.salePrice && (
            <div className="bg-green-50 rounded-lg px-3 py-1 border border-green-200">
              <p className="text-sm text-green-700 font-bold font-poppins">
                Save ${option.originalPrice - option.salePrice}
              </p>
            </div>
          )}
        </div>

        {/* Continue Button - Enhanced for mobile */}
        <div className={`
          transition-all duration-300 mt-auto
          ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}>
          <Button 
            onClick={handleContinuePress} 
            className={`
              w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 
              text-white font-bold py-4 px-6 transition-all duration-300 border-0 rounded-xl 
              shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] 
              ${isMobile ? 'min-h-[56px] text-base' : 'min-h-[60px] text-lg'} font-poppins
            `}
            size="lg"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Continue with {option.size}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </div>

      {/* Selection Effects - Simplified for mobile performance */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 pointer-events-none animate-pulse" />
      )}
    </div>
  );
});

MobileOptimizedSizeCard.displayName = 'MobileOptimizedSizeCard';

export default MobileOptimizedSizeCard;
