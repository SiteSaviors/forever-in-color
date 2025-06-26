
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StyleCardContainerProps {
  isSelected: boolean;
  styleId: number;
  shouldBlur?: boolean;
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
    if (shouldBlur) return "unavailable";
    return "available";
  };

  const cardState = getCardState();

  return (
    <div className="relative p-2 md:p-3 group">
      {/* Enhanced background with state-based styling */}
      <div className={`
        absolute inset-0 rounded-3xl transition-all duration-500 opacity-60
        ${cardState === "selected" 
          ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
          : cardState === "unavailable"
          ? 'bg-gradient-to-br from-gray-100 to-gray-200'
          : 'bg-gradient-to-br from-gray-50 to-purple-50/30 group-hover:from-purple-50 group-hover:to-pink-50'}
      `} />
      
      {/* Premium card with enhanced state transitions */}
      <Card 
        className={`
          group cursor-pointer transition-all duration-500 ease-out relative z-10 
          bg-white/98 border-0 rounded-3xl overflow-hidden backdrop-blur-sm
          min-h-[360px] sm:min-h-[420px] md:min-h-0 md:h-full flex flex-col
          min-w-[280px] sm:min-w-[320px]
          ${cardState === "selected"
            ? 'ring-4 ring-purple-400/70 shadow-2xl shadow-purple-200/60 scale-[1.03] -translate-y-2 animate-pulse bg-gradient-to-br from-white to-purple-50/30' 
            : cardState === "unavailable"
            ? 'opacity-60 grayscale-[0.3] shadow-lg cursor-not-allowed'
            : 'shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-purple-200/50 hover:scale-[1.02] hover:-translate-y-1'
          }
        `}
        onClick={cardState !== "unavailable" ? handleCardClick : undefined}
      >
        <CardContent className="p-0 overflow-hidden rounded-3xl h-full flex flex-col relative">
          {/* Enhanced selection indicator with animation */}
          {isSelected && (
            <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-xl animate-bounce">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Unavailable state overlay */}
          {cardState === "unavailable" && (
            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center rounded-3xl">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                <span className="text-gray-600 font-medium">Select photo first</span>
              </div>
            </div>
          )}
          
          {/* Content with state-aware filtering */}
          <div className={`
            h-full flex flex-col transition-all duration-500
            ${cardState === "unavailable" ? 'blur-sm' : ''}
          `}>
            {children}
          </div>
          
          {/* Enhanced selection glow effect */}
          {isSelected && (
            <>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none animate-pulse" />
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-sm pointer-events-none animate-pulse" />
            </>
          )}
          
          {/* Hover enhancement for available cards */}
          {cardState === "available" && (
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-200/60 transition-all duration-500 pointer-events-none" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardContainer;
