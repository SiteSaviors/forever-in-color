
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
        <CardBadges 
          popular={option.popular}
          isRecommended={isRecommended}
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Enhanced Canvas Preview with hover effects */}
        <div className={`
          flex justify-center transition-all duration-500
          ${cardState === "selected" ? 'scale-110 drop-shadow-2xl' : 'group-hover:scale-105 group-hover:drop-shadow-xl'}
        `}>
          <CanvasPreview 
            orientation={orientation}
            userImageUrl={userImageUrl}
          />
        </div>

        {/* Size Information with enhanced typography and drop shadow */}
        <div className="text-center">
          <h3 className={`
            text-2xl md:text-3xl font-bold tracking-tight font-poppins transition-colors duration-300 drop-shadow-sm
            ${cardState === "selected" ? 'text-purple-800' : cardState === "recommended" ? 'text-amber-800' : 'text-gray-800'}
          `}>
            {option.size}
          </h3>
        </div>

        {/* Enhanced Pricing Display with modern styling */}
        <PricingDisplay 
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Description with enhanced styling and drop shadow */}
        <div className={`
          rounded-2xl p-5 text-center border backdrop-blur-sm transition-all duration-300 shadow-sm
          ${cardState === "selected"
            ? 'bg-gradient-to-r from-purple-50/95 to-violet-50/80 border-purple-200/70 shadow-purple-100'
            : cardState === "recommended"
            ? 'bg-gradient-to-r from-amber-50/95 to-yellow-50/80 border-amber-200/70 shadow-amber-100'
            : 'bg-gradient-to-r from-slate-50/95 to-gray-50/80 border-slate-200/50 shadow-gray-100'
          }
        `}>
          <p className={`
            text-sm md:text-base leading-relaxed font-medium transition-colors duration-300 tracking-tight font-poppins drop-shadow-sm
            ${cardState === "selected" ? 'text-purple-700' : cardState === "recommended" ? 'text-amber-700' : 'text-gray-700'}
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

      {/* Enhanced selection effects with modern glow */}
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-3xl border-3 border-purple-400/70 pointer-events-none animate-pulse"></div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-400/20 via-violet-400/15 to-purple-400/20 blur-xl pointer-events-none animate-pulse"></div>
        </>
      )}
      
      {/* Enhanced recommended glow effect */}
      {isRecommended && !isSelected && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/20 via-yellow-400/15 to-amber-400/20 blur-lg pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Enhanced hover effect for non-selected cards */}
      {!isSelected && (
        <div className={`
          absolute inset-0 rounded-3xl border-2 border-transparent transition-all duration-500 pointer-events-none
          ${cardState === "recommended" 
            ? 'group-hover:border-amber-300/70 group-hover:shadow-amber-200/50' 
            : 'group-hover:border-purple-200/70 group-hover:shadow-purple-200/50'
          }
        `}></div>
      )}
    </div>
  );
});

GlassMorphismSizeCard.displayName = 'GlassMorphismSizeCard';

export default GlassMorphismSizeCard;
