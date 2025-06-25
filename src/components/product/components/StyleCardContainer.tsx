
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

/**
 * StyleCardContainer Component
 * 
 * Enhanced container with improved accessibility, touch targets, and visual feedback.
 * 
 * Key Improvements:
 * - Minimum 44px touch targets for mobile accessibility
 * - Enhanced visual feedback with proper focus states
 * - Better keyboard navigation support
 * - Improved selection indicators
 * - Optimized performance with reduced layout shifts
 */
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
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enhanced keyboard accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="relative p-1 md:p-2">
      {/* Simplified background with better contrast */}
      <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-70"></div>
      
      {/* Enhanced card with accessibility improvements */}
      <Card 
        className={`group cursor-pointer transition-all duration-200 ease-out relative z-10 bg-white/98 border-0 
          shadow-md hover:shadow-lg md:shadow-lg md:hover:shadow-xl touch-manipulation
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
          ${!shouldBlur && !isMobile ? 'hover:scale-[1.02] hover:-translate-y-1' : ''} 
          ${isMobile ? 'min-h-[400px] active:scale-[0.98]' : 'min-h-[320px] sm:min-h-[400px] md:min-h-0 md:h-full'} 
          flex flex-col overflow-hidden
          ${isSelected ? 
            `ring-2 ring-inset ${isMobile ? 'ring-3' : 'sm:ring-4 sm:ring-offset-2'} ring-purple-500 shadow-purple-200 scale-[1.01] -translate-y-0.5` : 
            ''
          }
        `}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Style card ${styleId}${isSelected ? ' (selected)' : ''}`}
        aria-pressed={isSelected}
      >
        <CardContent className="p-0 overflow-hidden rounded-xl h-full flex flex-col touch-manipulation">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardContainer;
