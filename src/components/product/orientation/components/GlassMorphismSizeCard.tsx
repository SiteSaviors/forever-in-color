
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

  const getCardState = () => {
    if (isSelected) return "selected";
    if (isRecommended) return "recommended";
    return "default";
  };

  const cardState = getCardState();

  // Enhanced card styling with state-based transitions
  const cardStyles = useMemo(() => ({
    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    background: cardState === "selected"
      ? 'rgba(255, 255, 255, 0.98)' 
      : cardState === "recommended"
      ? 'rgba(255, 251, 235, 0.95)'
      : 'rgba(255, 255, 255, 0.85)',
    borderColor: cardState === "selected" 
      ? 'rgb(168, 85, 247)' 
      : cardState === "recommended"
      ? 'rgb(245, 158, 11)'
      : 'rgba(255, 255, 255, 0.6)',
    boxShadow: cardState === "selected"
      ? '0 25px 50px -12px rgba(168, 85, 247, 0.35), 0 0 0 1px rgba(168, 85, 247, 0.2)' 
      : cardState === "recommended"
      ? '0 25px 50px -12px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.1)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }), [cardState]);

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-500 will-change-transform min-w-[280px] touch-manipulation
        ${cardState === "selected" ? 'z-10 animate-pulse' : ''}
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
      {/* Enhanced background with state transitions */}
      <div 
        className="absolute inset-0 rounded-3xl border-2 transition-all duration-500 backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, ${cardStyles.background}, rgba(255, 255, 255, 0.7))`,
          borderColor: cardStyles.borderColor,
          boxShadow: cardStyles.boxShadow
        }}
      />

      {/* Content Container with improved spacing and animations */}
      <div className="relative p-6 md:p-8 space-y-6">
        {/* Enhanced Top Badges */}
        <CardBadges 
          popular={option.popular}
          isRecommended={isRecommended}
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Enhanced Canvas Preview with state transitions */}
        <div className={`
          flex justify-center transition-all duration-500
          ${cardState === "selected" ? 'scale-110 drop-shadow-2xl' : 'group-hover:scale-105'}
        `}>
          <CanvasPreview 
            orientation={orientation}
            userImageUrl={userImageUrl}
          />
        </div>

        {/* Size Information with enhanced typography */}
        <SizeInfo size={option.size} />

        {/* Enhanced Pricing Display with state awareness */}
        <PricingDisplay 
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Description with state-based styling */}
        <div className={`
          rounded-2xl p-4 text-center border backdrop-blur-sm transition-all duration-300
          ${cardState === "selected"
            ? 'bg-gradient-to-r from-purple-50/95 to-pink-50/80 border-purple-200/70'
            : cardState === "recommended"
            ? 'bg-gradient-to-r from-amber-50/95 to-orange-50/80 border-amber-200/70'
            : 'bg-gradient-to-r from-gray-50/95 to-purple-50/80 border-white/50'
          }
        `}>
          <p className={`
            text-sm md:text-base leading-relaxed font-medium transition-colors duration-300
            ${cardState === "selected" ? 'text-purple-700' : 'text-gray-700'}
          `}>
            {option.description}
          </p>
        </div>

        {/* Enhanced Continue Button with better visibility */}
        <div className={`
          transition-all duration-500 transform
          ${isSelected ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}>
          <ContinueButton 
            size={option.size}
            isSelected={isSelected}
            onContinue={handleContinueClick}
          />
        </div>
      </div>

      {/* Enhanced selection effects with multiple layers */}
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-3xl border-3 border-purple-400/70 pointer-events-none animate-pulse"></div>
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-md pointer-events-none animate-pulse"></div>
        </>
      )}
      
      {/* Recommended glow effect */}
      {isRecommended && !isSelected && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/15 to-orange-400/15 blur-sm pointer-events-none"></div>
      )}
      
      {/* Hover enhancement for non-selected cards */}
      {!isSelected && (
        <div className={`
          absolute inset-0 rounded-3xl border-2 border-transparent transition-all duration-500 pointer-events-none
          ${cardState === "recommended" 
            ? 'group-hover:border-amber-300/60' 
            : 'group-hover:border-purple-200/60'
          }
        `}></div>
      )}
    </div>
  );
});

GlassMorphismSizeCard.displayName = 'GlassMorphismSizeCard';

export default GlassMorphismSizeCard;
