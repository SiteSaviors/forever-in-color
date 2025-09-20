import { useMemo } from 'react';

interface UseStyleCardVisualStateProps {
  isHovered: boolean;
  isSelected: boolean;
  isLoading: boolean;
  hasError: boolean;
  isDisabled: boolean;
  isAnimating: boolean;
  isInteractive: boolean;
}

export const useStyleCardVisualState = ({
  isHovered,
  isSelected,
  isLoading,
  hasError,
  isDisabled,
  isAnimating,
  isInteractive
}: UseStyleCardVisualStateProps) => {
  
  // Computed visual states for styling
  const visualState = useMemo(() => ({
    isHovered,
    isSelected,
    isLoading,
    hasError,
    isDisabled,
    isAnimating,
    isInteractive
  }), [isHovered, isSelected, isLoading, hasError, isDisabled, isAnimating, isInteractive]);

  // CSS classes based on current state
  const cssClasses = useMemo(() => {
    const base = "group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 border-0 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] flex flex-col w-full touch-manipulation select-none will-change-transform transform-gpu";
    
    if (visualState.isDisabled) {
      return `${base} opacity-60 grayscale-[0.3] shadow-lg cursor-not-allowed`;
    }
    
    if (visualState.hasError) {
      return `${base} ring-2 ring-red-200 shadow-red-100 cursor-pointer`;
    }
    
    if (visualState.isSelected) {
      return `${base} ring-3 sm:ring-4 ring-purple-400/70 shadow-2xl shadow-purple-200/60 scale-[1.02] sm:scale-[1.03] -translate-y-1 sm:-translate-y-2 animate-pulse bg-gradient-to-br from-white to-purple-50/30`;
    }
    
    if (visualState.isHovered) {
      return `${base} shadow-2xl ring-2 ring-purple-200/50 scale-[1.01] sm:scale-[1.02] -translate-y-0.5 sm:-translate-y-1`;
    }
    
    return `${base} shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-purple-200/50 hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-0.5 sm:hover:-translate-y-1`;
  }, [visualState]);

  return {
    visualState,
    cssClasses
  };
};