
import { SizeOption } from "../types";
import { memo, useCallback, useMemo } from "react";
import CanvasPreview from "./size-card/CanvasPreview";
import SizeInfo from "./size-card/SizeInfo";
import PricingDisplay from "./size-card/PricingDisplay";
import CardBadges from "./size-card/CardBadges";
import ContinueButton from "./size-card/ContinueButton";

interface GlassMorphismSizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  isRecommended?: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

const GlassMorphismSizeCard = memo(({
  option,
  orientation,
  isSelected,
  userImageUrl,
  isRecommended = false,
  onClick,
  onContinue
}: GlassMorphismSizeCardProps) => {
  
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    triggerHapticFeedback();
    onClick();
  }, [onClick]);

  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback();
    onContinue(e);
  }, [onContinue]);

  // Enhanced card styling with better touch feedback
  const cardStyles = useMemo(() => ({
    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
    background: isSelected 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(255, 255, 255, 0.85)',
    borderColor: isSelected ? 'rgb(168, 85, 247)' : 'rgba(255, 255, 255, 0.6)',
    boxShadow: isSelected 
      ? '0 25px 50px -12px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(168, 85, 247, 0.1)' 
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }), [isSelected]);

  return (
    <div 
      className="relative group cursor-pointer transition-all duration-300 will-change-transform min-w-[280px] touch-manipulation"
      style={cardStyles}
      onClick={handleCardClick}
      role="button" 
      tabIndex={0} 
      aria-pressed={isSelected} 
      aria-label={`Select ${option.size} size`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerHapticFeedback();
          onClick();
        }
      }}
    >
      {/* Premium background with enhanced visual depth */}
      <div 
        className="absolute inset-0 rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${cardStyles.background}, rgba(255, 255, 255, 0.7))`,
          borderColor: cardStyles.borderColor,
          boxShadow: cardStyles.boxShadow
        }}
      />

      {/* Content Container with improved spacing */}
      <div className="relative p-6 md:p-8 space-y-6">
        {/* Top Badges with better visual hierarchy */}
        <CardBadges 
          popular={option.popular}
          isRecommended={isRecommended}
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Enhanced Canvas Preview */}
        <div className="flex justify-center">
          <CanvasPreview 
            orientation={orientation}
            userImageUrl={userImageUrl}
          />
        </div>

        {/* Size Information with improved typography */}
        <SizeInfo size={option.size} />

        {/* Enhanced Pricing Display */}
        <PricingDisplay 
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Description with premium card styling */}
        <div className="bg-gradient-to-r from-gray-50/95 to-purple-50/80 rounded-2xl p-4 text-center border border-white/50 backdrop-blur-sm">
          <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">{option.description}</p>
        </div>

        {/* Enhanced Continue Button with better touch target */}
        <ContinueButton 
          size={option.size}
          isSelected={isSelected}
          onContinue={handleContinueClick}
        />
      </div>

      {/* Premium selection ring indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-3xl border-3 border-purple-400/70 pointer-events-none animate-pulse"></div>
      )}
      
      {/* Hover enhancement for non-selected cards */}
      {!isSelected && (
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-200/50 transition-all duration-300 pointer-events-none"></div>
      )}
    </div>
  );
});

GlassMorphismSizeCard.displayName = 'GlassMorphismSizeCard';

export default GlassMorphismSizeCard;
