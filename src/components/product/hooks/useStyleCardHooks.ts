import { useState, useMemo } from 'react';
import { useBlinking } from './useBlinking';
import { useStyleCard } from './useStyleCard';
import { useTouchOptimizedInteractions } from './useTouchOptimizedInteractions';

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

  // Convert hasError to boolean and extract error message before passing to handlers
  const hasErrorBoolean = Boolean(styleCardState.hasError);
  const errorMessage = typeof styleCardState.hasError === 'string' ? styleCardState.hasError : (styleCardState.validationError || 'Generation failed');

  // Create minimal mock event for handlers that require it
  const createMockEvent = (): React.MouseEvent => ({
    stopPropagation: () => {},
    preventDefault: () => {}
  } as React.MouseEvent);

  // Simplified direct handlers without mock events
  const handleGenerateWrapper = () => {
    if (styleCardState.isPermanentlyGenerated) {
      return;
    }
    
    if (styleCardState.effectiveIsLoading) {
      return;
    }
    
    // Direct generate call
    styleCardState.generatePreview();
  };
  
  const handleRetryWrapper = () => {
    if (styleCardState.isPermanentlyGenerated) {
      return;
    }
    
    if (styleCardState.effectiveIsLoading) {
      return;
    }
    
    // Direct retry call
    styleCardState.setShowError(false);
    styleCardState.generatePreview();
  };

  // Create wrapper functions for touch handlers that accept events but ignore them
  const handleTouchTap = () => styleCardState.handleCardClick();
  const handleTouchLongPress = () => styleCardState.handleImageExpand(createMockEvent());

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

  return {
    // State from consolidated hook
    ...styleCardState,
    hasErrorBoolean,
    errorMessage,
    
    // Wrapper handlers
    handleGenerateWrapper,
    handleRetryWrapper,
    
    // Interactions
    isPressed,
    touchHandlers,
    
    // Computed values
    showContinueInCard: showContinueButton && styleCardState.isSelected && (styleCardState.isStyleGenerated || styleCardState.isPermanentlyGenerated),
    isLocked: styleCardState.isPermanentlyGenerated,
    showLockedFeedback: styleCardState.isPermanentlyGenerated && !styleCardState.isSelected
  };
};
