
import React from 'react';
import { useInteractionStateMachine } from './useInteractionStateMachine';
import { useStyleCardHandlers } from './useStyleCardHandlers';
import { useStyleCardVisualState } from './useStyleCardVisualState';

interface UseStyleCardInteractionsProps {
  styleId: number;
  styleName: string;
  isSelected: boolean;
  isGenerating: boolean;
  hasError: boolean;
  canAccess: boolean;
  onStyleClick: () => void;
  onGenerateStyle?: () => void;
}

export const useStyleCardInteractions = ({
  styleId,
  styleName,
  isSelected,
  isGenerating,
  hasError,
  canAccess,
  onStyleClick,
  onGenerateStyle
}: UseStyleCardInteractionsProps) => {
  
  // Initialize state machine with current props
  const stateMachine = useInteractionStateMachine({
    initialState: !canAccess ? 'disabled' : hasError ? 'error' : isGenerating ? 'loading' : isSelected ? 'selected' : 'idle',
    debounceDelay: 100,
    animationDuration: 300
  });

  // Sync external state with state machine
  React.useEffect(() => {
    console.log(`🔄 Syncing state for ${styleName}:`, { canAccess, hasError, isGenerating, isSelected, currentState: stateMachine.state });
    
    if (!canAccess && !stateMachine.isDisabled) {
      stateMachine.transition('DISABLE', true);
    } else if (canAccess && stateMachine.isDisabled) {
      stateMachine.transition('ENABLE', true);
    }
    
    if (hasError && !stateMachine.hasError) {
      stateMachine.transition('ERROR', true);
    } else if (!hasError && stateMachine.hasError) {
      // Reset from error state when error is cleared
      stateMachine.transition('RESET', true);
    }
    
    if (isGenerating && !stateMachine.isLoading) {
      stateMachine.transition('START_LOADING', true);
    } else if (!isGenerating && stateMachine.isLoading) {
      stateMachine.transition('FINISH_LOADING', true);
    }
    
    if (isSelected && !stateMachine.isSelected && !stateMachine.isLoading) {
      stateMachine.transition('SELECT', true);
    } else if (!isSelected && stateMachine.isSelected) {
      stateMachine.transition('DESELECT', true);
    }
  }, [canAccess, hasError, isGenerating, isSelected, stateMachine, styleName]);

  // Use handlers hook
  const handlers = useStyleCardHandlers({
    styleId,
    styleName,
    stateMachine,
    onStyleClick,
    onGenerateStyle
  });

  // Use visual state hook
  const { visualState, cssClasses } = useStyleCardVisualState({
    isHovered: stateMachine.shouldShowHover,
    isSelected: stateMachine.shouldShowSelected,
    isLoading: stateMachine.shouldShowLoading,
    hasError: stateMachine.shouldShowError,
    isDisabled: stateMachine.shouldShowDisabled,
    isAnimating: stateMachine.isAnimating,
    isInteractive: stateMachine.isInteractive
  });

  return {
    // Visual state
    visualState,
    cssClasses,
    
    // Handlers
    ...handlers,
    
    // State machine access for debugging
    currentState: stateMachine.state,
    animationQueueLength: stateMachine.animationQueueLength
  };
};
