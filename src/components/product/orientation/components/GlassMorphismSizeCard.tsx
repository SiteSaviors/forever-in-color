
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

const GlassMorphismSizeCard = memo(({
  option,
  orientation,
  isSelected,
  userImageUrl,
  isRecommended = false,
  onClick,
  onContinue
}: GlassMorphismSizeCardProps) => {
  
  // Optimized click handler to prevent event bubbling issues
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  }, [onClick]);

  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue(e);
  }, [onContinue]);

  // Simplified styles to reduce re-computation
  const cardStyles = useMemo(() => ({
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    background: isSelected 
      ? 'rgba(255, 255, 255, 0.85)' 
      : 'rgba(255, 255, 255, 0.65)',
    borderColor: isSelected ? 'rgb(196, 181, 253)' : 'rgba(255, 255, 255, 0.4)',
    boxShadow: isSelected 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }), [isSelected]);

  return (
    <div 
      className="relative group cursor-pointer transition-transform duration-150 will-change-transform"
      style={cardStyles}
      onClick={handleCardClick}
      role="button" 
      tabIndex={0} 
      aria-pressed={isSelected} 
      aria-label={`Select ${option.size} size`}
    >
      {/* Simplified Background */}
      <div 
        className="absolute inset-0 rounded-2xl border-2 transition-all duration-150"
        style={{
          background: cardStyles.background,
          borderColor: cardStyles.borderColor,
          boxShadow: cardStyles.boxShadow
        }}
      />

      {/* Content Container */}
      <div className="relative p-6 space-y-4">
        {/* Top Badges */}
        <CardBadges 
          popular={option.popular}
          isRecommended={isRecommended}
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Canvas Preview */}
        <CanvasPreview 
          orientation={orientation}
          userImageUrl={userImageUrl}
        />

        {/* Size Information */}
        <SizeInfo size={option.size} />

        {/* Pricing Display */}
        <PricingDisplay 
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
        />

        {/* Description */}
        <div className="bg-gray-50/90 rounded-lg p-3 text-center border border-white/30">
          <p className="text-sm text-gray-700">{option.description}</p>
        </div>

        {/* Continue Button */}
        <ContinueButton 
          size={option.size}
          isSelected={isSelected}
          onContinue={handleContinueClick}
        />
      </div>

      {/* Simplified Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/60 pointer-events-none"></div>
      )}
    </div>
  );
});

GlassMorphismSizeCard.displayName = 'GlassMorphismSizeCard';

export default GlassMorphismSizeCard;
