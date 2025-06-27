
import { Card, CardContent } from "@/components/ui/card";
import { TouchTarget } from "@/components/ui/mobile-touch-target";
import { ReactNode, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStyleCardInteractions } from "../hooks/useStyleCardInteractions";

interface StyleCardContainerProps {
  isSelected: boolean;
  styleId: number;
  styleName: string;
  shouldBlur?: boolean;
  hideBlurOverlay?: boolean;
  isGenerating?: boolean;
  hasError?: boolean;
  canAccess?: boolean;
  children: ReactNode;
  onClick: () => void;
  onGenerateStyle?: () => void;
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
  styleName,
  shouldBlur = false,
  hideBlurOverlay = false,
  isGenerating = false,
  hasError = false,
  canAccess = true,
  children,
  onClick,
  onGenerateStyle
}: StyleCardContainerProps) => {
  const isMobile = useIsMobile();
  
  // Use the interaction state machine
  const {
    visualState,
    cssClasses,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    currentState,
    animationQueueLength
  } = useStyleCardInteractions({
    styleId,
    styleName,
    isSelected,
    isGenerating,
    hasError,
    canAccess,
    onStyleClick: () => {
      triggerHapticFeedback();
      onClick();
    },
    onGenerateStyle
  });

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`StyleCard ${styleId} - State: ${currentState}, Queue: ${animationQueueLength}, Visual:`, visualState);
  }

  return (
    <div className="relative p-1 sm:p-2 md:p-3 group w-full will-change-transform transform-gpu">
      {/* Enhanced background with mobile-optimized spacing */}
      <div className={`
        absolute inset-0 rounded-2xl sm:rounded-3xl transition-all duration-500 opacity-60 will-change-opacity transform-gpu
        ${visualState.isSelected 
          ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
          : visualState.isDisabled
          ? 'bg-gradient-to-br from-gray-100 to-gray-200'
          : 'bg-gradient-to-br from-gray-50 to-purple-50/30 group-hover:from-purple-50 group-hover:to-pink-50'}
      `} />
      
      {/* Premium card with state-managed styling */}
      <Card 
        className={cssClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={visualState.isInteractive ? handleClick : undefined}
        style={{
          willChange: visualState.isAnimating ? 'transform, box-shadow, opacity' : 'auto',
          transform: 'translate3d(0,0,0)' // Force GPU layer
        }}
      >
        <CardContent className="p-0 overflow-hidden rounded-2xl sm:rounded-3xl h-full flex flex-col relative will-change-auto contain-layout">
          {/* Mobile-optimized selection indicator */}
          {visualState.isSelected && (
            <TouchTarget 
              size="md" 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl animate-bounce will-change-transform transform-gpu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </TouchTarget>
          )}
          
          {/* Mobile-optimized unavailable state overlay */}
          {visualState.isDisabled && !hideBlurOverlay && (
            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center rounded-2xl sm:rounded-3xl will-change-opacity">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 shadow-lg">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Select photo first</span>
              </div>
            </div>
          )}
          
          {/* Content with mobile-optimized filtering */}
          <div className={`
            h-full flex flex-col transition-all duration-500 will-change-auto
            ${visualState.isDisabled && !hideBlurOverlay ? 'blur-sm' : ''}
          `}>
            {children}
          </div>
          
          {/* Enhanced selection glow effect with GPU acceleration */}
          {visualState.isSelected && (
            <>
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none animate-pulse will-change-opacity transform-gpu" />
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-sm pointer-events-none animate-pulse will-change-transform transform-gpu" />
            </>
          )}
          
          {/* Mobile-optimized hover enhancement with GPU acceleration */}
          {visualState.isInteractive && (
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-purple-200/60 transition-all duration-500 pointer-events-none will-change-auto transform-gpu" />
          )}
        </CardContent>
      </Card>
    </div>
  );
});

StyleCardContainer.displayName = 'StyleCardContainer';

export default StyleCardContainer;
