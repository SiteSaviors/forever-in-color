
import { SizeOption } from "../types";
import { memo, useCallback, useMemo } from "react";
import GlassMorphismCardHeader from "./size-card/GlassMorphismCardHeader";
import GlassMorphismCardContent from "./size-card/GlassMorphismCardContent";
import GlassMorphismCardActions from "./size-card/GlassMorphismCardActions";
import GlassMorphismCardEffects from "./size-card/GlassMorphismCardEffects";

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

  const getCardState = () => {
    if (isSelected) return "selected";
    if (isRecommended) return "recommended";
    return "default";
  };

  const cardState = getCardState();

  // Enhanced card styling with state-based transitions and modern design
  const cardStyles = useMemo(() => ({
    transform: isSelected ? 'scale(1.03) translateY(-8px)' : 'scale(1)',
    background: cardState === "selected"
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)' 
      : cardState === "recommended"
      ? 'linear-gradient(135deg, rgba(255, 251, 235, 0.95) 0%, rgba(254, 249, 195, 0.90) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(248, 250, 252, 0.85) 100%)',
    borderColor: cardState === "selected" 
      ? 'rgb(147, 51, 234)' 
      : cardState === "recommended"
      ? 'rgb(245, 158, 11)'
      : 'rgba(203, 213, 225, 0.6)',
    boxShadow: cardState === "selected"
      ? '0 25px 50px -12px rgba(147, 51, 234, 0.4), 0 20px 25px -5px rgba(147, 51, 234, 0.1), 0 0 0 1px rgba(147, 51, 234, 0.2)' 
      : cardState === "recommended"
      ? '0 25px 50px -12px rgba(245, 158, 11, 0.3), 0 15px 25px -5px rgba(245, 158, 11, 0.1), 0 0 0 1px rgba(245, 158, 11, 0.15)'
      : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }), [cardState]);

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-500 will-change-transform min-w-[300px] touch-manipulation font-poppins
        ${cardState === "selected" ? 'z-20' : 'hover:z-10'}
        hover:scale-105 hover:-translate-y-2
      `}
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
      {/* Enhanced background with modern gradients */}
      <div 
        className="absolute inset-0 rounded-3xl border-2 transition-all duration-500 backdrop-blur-xl"
        style={{
          background: cardStyles.background,
          borderColor: cardStyles.borderColor,
          boxShadow: cardStyles.boxShadow
        }}
      />

      {/* Content Container with enhanced spacing */}
      <div className="relative p-6 md:p-8 space-y-6">
        {/* Enhanced Top Badges with modern styling */}
        <GlassMorphismCardHeader 
          popular={option.popular}
          isRecommended={isRecommended}
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Card Content */}
        <GlassMorphismCardContent
          option={option}
          orientation={orientation}
          userImageUrl={userImageUrl}
          cardState={cardState}
        />

        {/* Enhanced Continue Button with better visibility */}
        <GlassMorphismCardActions
          size={option.size}
          isSelected={isSelected}
          onContinue={handleContinueClick}
        />
      </div>

      {/* Visual Effects */}
      <GlassMorphismCardEffects
        isSelected={isSelected}
        isRecommended={isRecommended}
        cardState={cardState}
      />
    </div>
  );
});

GlassMorphismSizeCard.displayName = 'GlassMorphismSizeCard';

export default GlassMorphismSizeCard;
