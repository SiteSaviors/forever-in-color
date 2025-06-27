
import { Card, CardContent } from "@/components/ui/card";
import { TouchTarget } from "@/components/ui/mobile-touch-target";
import { ReactNode } from "react";
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

const StyleCardContainer = ({
  isSelected,
  styleId,
  shouldBlur = false,
  hideBlurOverlay = false,
  children,
  onClick
}: StyleCardContainerProps) => {
  const isMobile = useIsMobile();
  
  const handleCardClick = () => {
    console.log(`🎯 CARD CONTAINER CLICKED ▶️ Style ID: ${styleId}, shouldBlur: ${shouldBlur}`);
    triggerHapticFeedback();
    onClick();
  };

  const getCardState = () => {
    if (isSelected) return "selected";
    if (shouldBlur && !hideBlurOverlay) return "unavailable";
    return "available";
  };

  const cardState = getCardState();

  return (
    <div className="relative p-1 sm:p-2 md:p-3 group w-full prevent-overflow">
      {/* Enhanced background with mobile-optimized spacing */}
      <div className={`
        absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl transition-all duration-500 opacity-60
        ${cardState === "selected" 
          ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
          : cardState === "unavailable"
          ? 'bg-gradient-to-br from-gray-100 to-gray-200'
          : 'bg-gradient-to-br from-gray-50 to-purple-50/30 group-hover:from-purple-50 group-hover:to-pink-50'}
      `} />
      
      {/* Premium card with mobile-first sizing */}
      <Card 
        className={`
          group cursor-pointer transition-all duration-500 ease-out relative z-10 
          bg-white/98 border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-sm
          min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] flex flex-col
          w-full touch-manipulation select-none prevent-overflow
          ${cardState === "selected"
            ? 'ring-2 sm:ring-3 md:ring-4 ring-purple-400/70 shadow-xl sm:shadow-2xl shadow-purple-200/60 scale-[1.01] sm:scale-[1.02] md:scale-[1.03] -translate-y-0.5 sm:-translate-y-1 md:-translate-y-2 animate-pulse bg-gradient-to-br from-white to-purple-50/30' 
            : cardState === "unavailable"
            ? 'opacity-60 grayscale-[0.3] shadow-md sm:shadow-lg cursor-not-allowed'
            : 'shadow-md sm:shadow-lg md:shadow-xl hover:shadow-lg sm:hover:shadow-xl md:hover:shadow-2xl hover:ring-1 sm:hover:ring-2 hover:ring-purple-200/50 hover:scale-[1.005] sm:hover:scale-[1.01] md:hover:scale-[1.02] hover:-translate-y-0.5 sm:hover:-translate-y-1'
          }
        `}
        onClick={cardState !== "unavailable" ? handleCardClick : undefined}
      >
        <CardContent className="p-0 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl h-full flex flex-col relative prevent-overflow">
          {/* Mobile-optimized selection indicator */}
          {isSelected && (
            <TouchTarget 
              size="md" 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg sm:shadow-xl animate-bounce"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </TouchTarget>
          )}
          
          {/* Mobile-optimized unavailable state overlay */}
          {cardState === "unavailable" && !hideBlurOverlay && (
            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 shadow-md sm:shadow-lg">
                <span className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Select photo first</span>
              </div>
            </div>
          )}
          
          {/* Content with mobile-optimized filtering */}
          <div className={`
            h-full flex flex-col transition-all duration-500 prevent-overflow
            ${cardState === "unavailable" && !hideBlurOverlay ? 'blur-sm' : ''}
          `}>
            {children}
          </div>
          
          {/* Enhanced selection glow effect */}
          {isSelected && (
            <>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none animate-pulse" />
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-sm pointer-events-none animate-pulse" />
            </>
          )}
          
          {/* Mobile-optimized hover enhancement */}
          {cardState === "available" && (
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl border border-transparent group-hover:border-purple-200/60 transition-all duration-500 pointer-events-none" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardContainer;
