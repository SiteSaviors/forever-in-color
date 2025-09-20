
import { useMemo, useCallback } from 'react';
import { useDebouncedInteraction } from './useDebouncedInteraction';

interface UseOptimizedStyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  isSelected: boolean;
  isGenerating: boolean;
  hasGeneratedPreview: boolean;
  canAccess: boolean;
}

export const useOptimizedStyleCard = ({
  style,
  isSelected,
  isGenerating,
  hasGeneratedPreview,
  canAccess
}: UseOptimizedStyleCardProps) => {
  // Debounced hover state to prevent rapid re-renders
  const [isHovered, setIsHovered] = useDebouncedInteraction(false, { delay: 100 });

  // Memoized computed styles to prevent recalculation on every render
  const computedClasses = useMemo(() => {
    const baseClasses = "group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 border-0 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] flex flex-col w-full touch-manipulation select-none";
    
    const stateClasses = isSelected
      ? 'ring-3 sm:ring-4 ring-purple-400/70 shadow-2xl shadow-purple-200/60 scale-[1.02] sm:scale-[1.03] -translate-y-1 sm:-translate-y-2 animate-pulse bg-gradient-to-br from-white to-purple-50/30'
      : !canAccess
      ? 'opacity-60 grayscale-[0.3] shadow-lg cursor-not-allowed'
      : 'shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-purple-200/50 hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-0.5 sm:hover:-translate-y-1';

    return `${baseClasses} ${stateClasses}`;
  }, [isSelected, canAccess]);

  // Memoized interaction handlers
  const handleMouseEnter = useCallback(() => {
    if (canAccess) {
      setIsHovered(true);
    }
  }, [canAccess, setIsHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, [setIsHovered]);

  // Memoized loading state
  const showLoadingOverlay = useMemo(() => {
    return isGenerating && !hasGeneratedPreview;
  }, [isGenerating, hasGeneratedPreview]);

  return {
    isHovered,
    computedClasses,
    showLoadingOverlay,
    handleMouseEnter,
    handleMouseLeave
  };
};
