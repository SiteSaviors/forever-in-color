
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

  return (
    <div className="relative p-2 md:p-3">
      {/* Enhanced background with subtle texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl opacity-60"></div>
      
      {/* Premium card with enhanced touch targets and visual hierarchy */}
      <Card 
        className={`group cursor-pointer transition-all duration-300 ease-out relative z-10 
          bg-white/98 border-0 rounded-2xl overflow-hidden
          shadow-lg hover:shadow-2xl md:hover:shadow-2xl
          ${!shouldBlur && !isMobile ? 'hover:scale-[1.03] hover:-translate-y-2' : 'active:scale-[0.98]'} 
          min-h-[360px] sm:min-h-[420px] md:min-h-0 md:h-full flex flex-col
          min-w-[280px] sm:min-w-[320px]
          ${isSelected ? 
            'ring-4 ring-purple-400/50 shadow-2xl shadow-purple-200/50 scale-[1.02] -translate-y-1 bg-gradient-to-br from-white to-purple-50/20' : 
            'hover:ring-2 hover:ring-purple-200/30'
          }
        `}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 overflow-hidden rounded-2xl h-full flex flex-col">
          {/* Premium selection indicator */}
          {isSelected && (
            <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardContainer;
