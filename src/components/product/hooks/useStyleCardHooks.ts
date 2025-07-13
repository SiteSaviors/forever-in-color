
import { useState, useMemo } from 'react';
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

// Create a proper mock event object with all required methods
const createMockEvent = (): React.MouseEvent => {
  const mockNativeEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 1,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    buttons: 1,
    relatedTarget: null
  });

  return {
    stopPropagation: () => {},
    preventDefault: () => {},
    currentTarget: null,
    target: null,
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 2,
    isTrusted: false,
    nativeEvent: mockNativeEvent,
    timeStamp: Date.now(),
    type: 'click',
    detail: 1,
    view: window,
    altKey: false,
    button: 0,
    buttons: 1,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    movementX: 0,
    movementY: 0,
    pageX: 0,
    pageY: 0,
    relatedTarget: null,
    screenX: 0,
    screenY: 0,
    shiftKey: false,
    getModifierState: () => false,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => {}
  } as React.MouseEvent;
};

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

  // Convert hasError to boolean and extract error message
  const hasErrorBoolean = Boolean(styleCardState.hasError);
  const errorMessage = typeof styleCardState.hasError === 'string' ? styleCardState.hasError : (styleCardState.validationError || 'Generation failed');

  // Create proper wrapper functions with real event handling
  const handleGenerateWrapper = (e?: React.MouseEvent) => {
    const event = e || createMockEvent();
    console.log('🎯 Generate wrapper called for style:', style.name);
    try {
      styleCardState.handleGenerateClick(event);
    } catch (error) {
      console.error('Error in generate wrapper:', error);
    }
  };
  
  const handleRetryWrapper = (e?: React.MouseEvent) => {
    const event = e || createMockEvent();
    console.log('🔄 Retry wrapper called for style:', style.name);
    try {
      styleCardState.handleRetryClick(event);
    } catch (error) {
      console.error('Error in retry wrapper:', error);
    }
  };

  // Create wrapper functions for touch handlers
  const handleTouchTap = () => {
    console.log('👆 Touch tap for style:', style.name);
    try {
      styleCardState.handleCardClick();
    } catch (error) {
      console.error('Error in touch tap:', error);
    }
  };

  const handleTouchLongPress = () => {
    console.log('👆 Touch long press for style:', style.name);
    try {
      styleCardState.handleImageExpand(createMockEvent());
    } catch (error) {
      console.error('Error in touch long press:', error);
    }
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
