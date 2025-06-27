
import { Card, CardContent } from "@/components/ui/card";
import { TouchTarget } from "@/components/ui/mobile-touch-target";
import { ReactNode, useMemo, useCallback, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StyleCardContainerProps {
  isSelected: boolean;
  styleId: number;
  shouldBlur?: boolean;
  hideBlurOverlay?: boolean;
  children: ReactNode;
  onClick: () => void;
}

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

const StyleCardContainer = memo(({
  isSelected,
  styleId,
  shouldBlur = false,
  hideBlurOverlay = false,
  children,
  onClick
}: StyleCardContainerProps) => {
  const isMobile = useIsMobile();
  
  const handleCardClick = useCallback(() => {
    console.log(`🎯 CARD CONTAINER CLICKED ▶️ Style ID: ${styleId}, shouldBlur: ${shouldBlur}`);
    triggerHapticFeedback();
    onClick();
  }, [styleId, shouldBlur, onClick]);

  const cardState = useMemo(() => {
    if (isSelected) return "selected";
    if (shouldBlur && !hideBlurOverlay) return "unavailable";
    return "available";
  }, [isSelected, shouldBlur, hideBlurOverlay]);

  const backgroundClasses = useMemo(() => `
    absolute inset-0 rounded-2xl sm:rounded-3xl transition-all duration-500 opacity-60
    ${cardState === "selected" 
      ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
      : cardState === "unavailable"
      ? 'bg-gradient-to-br from-gray-100 to-gray-200'
      : 'bg-gradient-to-br from-gray-50 to-purple-50/30 group-hover:from-purple-50 group-hover:to-pink-50'}
  `, [cardState]);

  const cardClasses = useMemo(() => `
    group cursor-pointer transition-all duration-500 ease-out relative z-10 
    bg-white/98 border-0 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm
    min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] flex flex-col
    w-full touch-manipulation select-none
    ${cardState === "selected"
      ? 'ring-3 sm:ring-4 ring-purple-400/70 shadow-2xl shadow-purple-200/60 scale-[1.02] sm:scale-[1.03] -translate-y-1 sm:-translate-y-2 animate-pulse bg-gradient-to-br from-white to-purple-50/30' 
      : cardState === "unavailable"
      ? 'opacity-60 grayscale-[0.3] shadow-lg cursor-not-allowed'
      : 'shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-purple-200/50 hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-0.5 sm:hover:-translate-y-1'
    }
  `, [cardState]);

  const contentClasses = useMemo(() => `
    h-full flex flex-col transition-all duration-500
    ${cardState === "unavailable" && !hideBlurOverlay ? 'blur-sm' : ''}
  `, [cardState, hideBlurOverlay]);

  return (
    <div className="relative p-1 sm:p-2 md:p-3 group w-full">
      {/* Enhanced background with mobile-optimized spacing */}
      <div className={backgroundClasses} />
      
      {/* Premium card with mobile-first sizing */}
      <Card 
        className={cardClasses}
        onClick={cardState !== "unavailable" ? handleCardClick : undefined}
      >
        <CardContent className="p-0 overflow-hidden rounded-2xl sm:rounded-3xl h-full flex flex-col relative">
          {/* Mobile-optimized selection indicator */}
          {isSelected && (
            <TouchTarget 
              size="md" 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl animate-bounce"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </TouchTarget>
          )}
          
          {/* Mobile-optimized unavailable state overlay */}
          {cardState === "unavailable" && !hideBlurOverlay && (
            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center rounded-2xl sm:rounded-3xl">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 shadow-lg">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Select photo first</span>
              </div>
            </div>
          )}
          
          {/* Content with mobile-optimized filtering */}
          <div className={contentClasses}>
            {children}
          </div>
          
          {/* Enhanced selection glow effect */}
          {isSelected && (
            <>
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none animate-pulse" />
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-sm pointer-events-none animate-pulse" />
            </>
          )}
          
          {/* Mobile-optimized hover enhancement */}
          {cardState === "available" && (
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-purple-200/60 transition-all duration-500 pointer-events-none" />
          )}
        </CardContent>
      </Card>
    </div>
  );
});

StyleCardContainer.displayName = 'StyleCardContainer';

export default StyleCardContainer;
