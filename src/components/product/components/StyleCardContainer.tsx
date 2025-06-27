
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

// Enhanced haptic feedback with different intensities
const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 30,
      medium: 50,
      heavy: [100, 50, 100]
    };
    navigator.vibrate(patterns[intensity]);
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
      triggerHapticFeedback(isSelected ? 'heavy' : 'medium');
      onClick();
    },
    onGenerateStyle
  });

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`StyleCard ${styleId} - State: ${currentState}, Queue: ${animationQueueLength}, Visual:`, visualState);
  }

  // Check if this is NOT the Original Image card (styleId !== 1)
  const shouldShowPinkGradient = styleId !== 1;

  return (
    <div 
      className="relative p-1 sm:p-2 md:p-3 group w-full will-change-transform transform-gpu"
      // Enhanced accessibility
      role="button"
      tabIndex={visualState.isInteractive ? 0 : -1}
      aria-label={`${styleName} style card${isSelected ? ', selected' : ''}${isGenerating ? ', generating' : ''}${hasError ? ', error occurred' : ''}`}
      aria-pressed={isSelected}
      aria-disabled={!visualState.isInteractive}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (visualState.isInteractive) {
            triggerHapticFeedback('light');
            handleClick();
          }
        }
      }}
    >
      {/* Enhanced pink gradient glow with micro-animations */}
      {shouldShowPinkGradient && (
        <>
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
          {/* Additional glow layer for depth */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-400/20 via-purple-500/20 to-amber-400/20 rounded-3xl blur-sm opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
        </>
      )}

      {/* Enhanced background with state-based micro-animations */}
      <div className={`
        absolute inset-0 rounded-2xl sm:rounded-3xl transition-all duration-500 opacity-60 will-change-opacity transform-gpu
        ${visualState.isSelected 
          ? 'bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse' 
          : visualState.isDisabled
          ? 'bg-gradient-to-br from-gray-100 to-gray-200'
          : visualState.isLoading
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 animate-pulse'
          : 'bg-gradient-to-br from-gray-50 to-purple-50/30 group-hover:from-purple-50 group-hover:to-pink-50'}
      `} />
      
      {/* Premium card with enhanced state-managed styling */}
      <Card 
        className={`${cssClasses} ${
          visualState.isLoading ? 'animate-pulse ring-2 ring-purple-300/50' : ''
        } ${
          hasError ? 'ring-2 ring-red-300/50 animate-bounce' : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={visualState.isInteractive ? handleClick : undefined}
        style={{
          willChange: visualState.isAnimating ? 'transform, box-shadow, opacity' : 'auto',
          transform: 'translate3d(0,0,0)' // Force GPU layer
        }}
      >
        <CardContent className="p-0 overflow-hidden rounded-2xl sm:rounded-3xl h-full flex flex-col relative will-change-auto contain-layout">
          {/* Enhanced selection indicator with micro-animations */}
          {visualState.isSelected && (
            <TouchTarget 
              size="md" 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl animate-bounce will-change-transform transform-gpu"
              aria-label={`${styleName} selected`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </TouchTarget>
          )}

          {/* Enhanced loading indicator */}
          {visualState.isLoading && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Enhanced unavailable state overlay with better UX */}
          {visualState.isDisabled && !hideBlurOverlay && (
            <div 
              className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center rounded-2xl sm:rounded-3xl will-change-opacity animate-fade-in"
              role="status"
              aria-label="This style is not available yet"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 shadow-lg animate-scale-in">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Select photo first</span>
              </div>
            </div>
          )}
          
          {/* Content with enhanced filtering and animations */}
          <div className={`
            h-full flex flex-col transition-all duration-500 will-change-auto
            ${visualState.isDisabled && !hideBlurOverlay ? 'blur-sm' : ''}
            ${visualState.isLoading ? 'animate-pulse' : ''}
          `}>
            {children}
          </div>
          
          {/* Enhanced selection glow effects with layered animations */}
          {visualState.isSelected && (
            <>
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none animate-pulse will-change-opacity transform-gpu" />
              <div className="absolute -inset-0.5 sm:-inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-sm pointer-events-none animate-pulse will-change-transform transform-gpu" />
              {/* Additional shimmer effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-ping will-change-opacity transform-gpu" />
            </>
          )}
          
          {/* Enhanced hover effects with micro-animations */}
          {visualState.isInteractive && (
            <>
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-purple-200/60 transition-all duration-500 pointer-events-none will-change-auto transform-gpu" />
              {/* Hover shimmer effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-purple-100/0 group-hover:via-purple-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none will-change-opacity transform-gpu" />
            </>
          )}

          {/* Focus indicator for accessibility */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent focus-within:border-blue-500/50 transition-all duration-200 pointer-events-none" />
        </CardContent>
      </Card>
    </div>
  );
});

StyleCardContainer.displayName = 'StyleCardContainer';

export default StyleCardContainer;
