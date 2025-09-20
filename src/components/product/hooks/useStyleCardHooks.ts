
import { useMemo } from 'react';
import { useBlinking } from './useBlinking';
import { useStyleCard } from './useStyleCard';
import { useTouchOptimizedInteractions } from './useTouchOptimizedInteractions';
import { usePerformanceMonitor } from './usePerformanceMonitor';

interface UseStyleCardHooksProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular?: boolean;
  preGeneratedPreview?: string;
  cropAspectRatio?: number;
  selectedOrientation?: string;
  showContinueButton?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
  shouldBlur?: boolean;
}

export const useStyleCardHooks = (props: UseStyleCardHooksProps) => {
  const {
    style,
    croppedImage,
    selectedStyle,
    isPopular = false,
    preGeneratedPreview,
    selectedOrientation = "square",
    showContinueButton = true,
    onStyleClick,
    onContinue,
    shouldBlur = false
  } = props;

  console.log(`🔧 StyleCardHooks initialized for ${style.name}:`, {
    styleId: style.id,
    hasImage: !!croppedImage,
    isSelected: selectedStyle === style.id,
    hasPreGenerated: !!preGeneratedPreview
  });

  // Performance monitoring with consolidated hook
  usePerformanceMonitor(`StyleCard-${style.name}`, { 
    enabled: process.env.NODE_ENV === 'development' 
  });

  // Use the consolidated style card hook
  const styleCardState = useStyleCard({
    style,
    croppedImage,
    selectedStyle,
    isPopular,
    preGeneratedPreview,
    selectedOrientation,
    onStyleClick,
    onContinue
  });

  // Convert hasError to boolean and extract error message - Fix the "Try Again" issue
  // Only show error if there's actually an error message (string) or explicit true
  const hasErrorBoolean = (typeof styleCardState.hasError === 'string' && styleCardState.hasError.length > 0) || styleCardState.hasError === true;
  const errorMessage = typeof styleCardState.hasError === 'string' ? styleCardState.hasError : (styleCardState.validationError || 'Generation failed');

  // Direct event handlers - no mock objects or wrappers
  const handleGenerateClick = (e?: React.MouseEvent) => {
    console.log(`🎯 Direct generate click for ${style.name}`);
    if (e) {
      styleCardState.handleGenerateClick(e);
    } else {
      // Create a minimal synthetic event for programmatic calls
      const syntheticEvent = {
        stopPropagation: () => {},
        preventDefault: () => {}
      } as React.MouseEvent;
      styleCardState.handleGenerateClick(syntheticEvent);
    }
  };
  
  const handleRetryClick = (e?: React.MouseEvent) => {
    console.log(`🔄 Direct retry click for ${style.name}`);
    if (e) {
      styleCardState.handleRetryClick(e);
    } else {
      // Create a minimal synthetic event for programmatic calls  
      const syntheticEvent = {
        stopPropagation: () => {},
        preventDefault: () => {}
      } as React.MouseEvent;
      styleCardState.handleRetryClick(syntheticEvent);
    }
  };

  // Simplified touch handlers
  const handleTouchTap = () => {
    console.log(`👆 Touch tap for ${style.name}`);
    styleCardState.handleCardClick();
  };

  const handleTouchLongPress = () => {
    console.log(`👆 Touch long press for ${style.name}`);
    const syntheticEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as React.MouseEvent;
    styleCardState.handleImageExpand(syntheticEvent);
  };

  // Touch-optimized interactions with integrated debouncing
  const { isPressed, touchHandlers } = useTouchOptimizedInteractions({
    onTap: handleTouchTap,
    onLongPress: handleTouchLongPress,
    debounceDelay: 150
  });

  const { isBlinking } = useBlinking(styleCardState.previewUrl, {
    isGenerating: styleCardState.isPermanentlyGenerated ? false : (styleCardState.effectiveIsLoading),
    hasPreview: !!styleCardState.previewUrl,
    hasGeneratedOnce: styleCardState.isPermanentlyGenerated
  });

  console.log(`📊 StyleCardHooks state for ${style.name}:`, {
    isLoading: styleCardState.isLoading,
    hasError: hasErrorBoolean,
    rawHasError: styleCardState.hasError,
    hasErrorType: typeof styleCardState.hasError,
    isSelected: styleCardState.isSelected,
    hasPreview: !!styleCardState.previewUrl
  });

  return {
    // State from consolidated hook
    ...styleCardState,
    hasErrorBoolean,
    errorMessage,
    
    // Direct handlers (no wrappers)
    handleGenerateClick,
    handleRetryClick,
    
    // Interactions
    isPressed,
    touchHandlers,
    
    // Computed values
    showContinueInCard: showContinueButton && styleCardState.isSelected && (styleCardState.isStyleGenerated || styleCardState.isPermanentlyGenerated),
    isLocked: styleCardState.isPermanentlyGenerated,
    showLockedFeedback: styleCardState.isPermanentlyGenerated && !styleCardState.isSelected
  };
};
