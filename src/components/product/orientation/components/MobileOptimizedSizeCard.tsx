
import React, { memo, useCallback, useState } from "react";
import { SizeOption } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import SizeCardBadges from "./mobile-size-card/SizeCardBadges";
import SizeCardCanvasPreview from "./mobile-size-card/SizeCardCanvasPreview";
import SizeCardInfo from "./mobile-size-card/SizeCardInfo";
import SizeCardContinueButton from "./mobile-size-card/SizeCardContinueButton";

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
  const [isPressed, setIsPressed] = useState(false);

  // Simple haptic feedback function that doesn't depend on progress state
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(10); // Light haptic feedback
    }
  }, []);

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
        <SizeCardBadges
          isRecommended={option.isRecommended}
          tier={option.tier}
          label={option.label}
          popularity={option.popularity}
        />

        {/* Canvas Preview */}
        <SizeCardCanvasPreview
          orientation={orientation}
          userImageUrl={userImageUrl}
          isSelected={isSelected}
        />

        {/* Size Information and Pricing */}
        <SizeCardInfo
          size={option.size}
          orientation={orientation}
          salePrice={option.salePrice}
          originalPrice={option.originalPrice}
          isSelected={isSelected}
          isRecommended={option.isRecommended}
        />

        {/* Continue Button */}
        <SizeCardContinueButton
          size={option.size}
          isSelected={isSelected}
          onContinue={handleContinuePress}
        />
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
