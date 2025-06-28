
import { useState, useMemo } from 'react';
import { useBlinking } from './useBlinking';
import { useStyleCardLogic } from './useStyleCardLogic';
import { useStyleCardEffects } from './useStyleCardEffects';
import { useStyleCardHandlers } from './useStyleCardHandlers';
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
    onStyleClick,
    onContinue,
    shouldBlur = false
  } = props;

  // Performance monitoring
  usePerformanceMonitor(`StyleCard-${style.name}`, process.env.NODE_ENV === 'development');

  // Memoize style comparison for better performance
  const isSelected = useMemo(() => selectedStyle === style.id, [selectedStyle, style.id]);
  
  // Use the logic hook for state management
  const logicState = useStyleCardLogic({
    style,
    croppedImage,
    selectedStyle,
    isPopular,
    preGeneratedPreview,
    selectedOrientation,
    onStyleClick
  });

  // Use the effects hook for side effects
  useStyleCardEffects({
    previewUrl: logicState.previewUrl,
    preGeneratedPreview,
    isPermanentlyGenerated: logicState.isPermanentlyGenerated,
    setIsPermanentlyGenerated: logicState.setIsPermanentlyGenerated,
    setLocalIsLoading: logicState.setLocalIsLoading,
    styleName: style.name
  });

  // Convert hasError to boolean and extract error message before passing to handlers
  const hasErrorBoolean = Boolean(logicState.hasError);
  const errorMessage = typeof logicState.hasError === 'string' ? logicState.hasError : (logicState.validationError || 'Generation failed');

  // Use the handlers hook for event handling
  const handlers = useStyleCardHandlers({
    style,
    previewUrl: logicState.previewUrl,
    isPermanentlyGenerated: logicState.isPermanentlyGenerated,
    effectiveIsLoading: logicState.effectiveIsLoading,
    hasError: hasErrorBoolean,
    setShowError: logicState.setShowError,
    setLocalIsLoading: logicState.setLocalIsLoading,
    setIsLightboxOpen: logicState.setIsLightboxOpen,
    onStyleClick,
    onContinue,
    generatePreview: logicState.generatePreview
  });

  // Create wrapper functions that match the expected signatures (no parameters)
  const handleGenerateWrapper = () => handlers.handleGenerateClick({} as React.MouseEvent);
  const handleRetryWrapper = () => handlers.handleRetryClick({} as React.MouseEvent);

  // Touch-optimized interactions
  const { isPressed, touchHandlers } = useTouchOptimizedInteractions({
    onTap: handlers.handleCardClick,
    onLongPress: handlers.handleImageExpand
  });

  const { isBlinking } = useBlinking(logicState.previewUrl, {
    isGenerating: logicState.isPermanentlyGenerated ? false : (logicState.effectiveIsLoading),
    hasPreview: !!logicState.previewUrl,
    hasGeneratedOnce: logicState.isPermanentlyGenerated
  });

  return {
    // State
    ...logicState,
    isSelected,
    hasErrorBoolean,
    errorMessage,
    
    // Handlers
    ...handlers,
    handleGenerateWrapper,
    handleRetryWrapper,
    
    // Interactions
    isPressed,
    touchHandlers,
    
    // Computed values
    showContinueInCard: props.showContinueButton && isSelected && (logicState.isStyleGenerated || logicState.isPermanentlyGenerated),
    isLocked: logicState.isPermanentlyGenerated,
    showLockedFeedback: logicState.isPermanentlyGenerated && !isSelected
  };
};
