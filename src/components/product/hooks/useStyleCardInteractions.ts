import { useCallback, useMemo, useEffect } from 'react';
import { useInteractionStateMachine } from './useInteractionStateMachine';

interface UseStyleCardInteractionsProps {
  isSelected: boolean;
  isGenerating: boolean;
  hasError: boolean;
  canAccess: boolean;
  onStyleClick: () => void;
  onGenerateStyle?: () => void;
}

export const useStyleCardInteractions = ({
  isSelected,
  isGenerating,
  hasError,
  canAccess,
  onStyleClick,
  onGenerateStyle
}: UseStyleCardInteractionsProps) => {
  
  // Initialize state machine with current props
  const stateMachine = useInteractionStateMachine({
    initialState: isSelected ? 'selected' : hasError ? 'error' : isGenerating ? 'loading' : canAccess ? 'idle' : 'disabled',
    debounceDelay: 100,
    animationDuration: 300
  });

  const {
    isDisabled: machineDisabled,
    hasError: machineHasError,
    isLoading: machineLoading,
    isSelected: machineSelected,
    isInteractive: machineInteractive,
    isAnimating: machineAnimating,
    shouldShowHover,
    shouldShowSelected,
    shouldShowLoading,
    shouldShowError,
    shouldShowDisabled,
    transition,
    debouncedHoverStart,
    hoverEnd,
    queueAnimation,
    animationQueueLength,
    state: machineState
  } = stateMachine;

  // Sync external state with state machine - memoized to prevent infinite re-renders
  const syncExternalState = useCallback(() => {
    // Only sync if there are actual state differences to prevent infinite loops
    const needsDisableTransition = !canAccess && !machineDisabled;
    const needsEnableTransition = canAccess && machineDisabled;
    const needsErrorTransition = hasError && !machineHasError;
    const needsResetTransition = !hasError && machineHasError;
    const needsLoadingStartTransition = isGenerating && !machineLoading;
    const needsLoadingEndTransition = !isGenerating && machineLoading;
    const needsSelectTransition = isSelected && !machineSelected && !machineLoading;
    const needsDeselectTransition = !isSelected && machineSelected;

    if (needsDisableTransition) {
      transition('DISABLE', true);
    } else if (needsEnableTransition) {
      transition('ENABLE', true);
    }
    
    if (needsErrorTransition) {
      transition('ERROR', true);
    } else if (needsResetTransition) {
      transition('RESET', true);
    }
    
    if (needsLoadingStartTransition) {
      transition('START_LOADING', true);
    } else if (needsLoadingEndTransition) {
      transition('FINISH_LOADING', true);
    }
    
    if (needsSelectTransition) {
      // If in error state and trying to select, reset first then select
      if (machineHasError) {
        transition('RESET', true);
        // Allow a frame for state to settle before selecting
        setTimeout(() => transition('SELECT', true), 0);
      } else {
        transition('SELECT', true);
      }
    } else if (needsDeselectTransition) {
      transition('DESELECT', true);
    }
  }, [canAccess, hasError, isGenerating, isSelected, machineDisabled, machineHasError, machineLoading, machineSelected, transition]);

  // Only sync when dependencies actually change
  useEffect(() => {
    syncExternalState();
  }, [syncExternalState]);

  // Interaction handlers with state machine integration
  const handleMouseEnter = useCallback(() => {
    if (machineInteractive) {
      // Hover start on style card
      debouncedHoverStart();
    }
  }, [debouncedHoverStart, machineInteractive]);

  const handleMouseLeave = useCallback(() => {
    if (machineInteractive) {
      // Hover end on style card
      hoverEnd();
    }
  }, [hoverEnd, machineInteractive]);

  const handleClick = useCallback(() => {
    if (!machineInteractive || machineAnimating) {
      // Click blocked - not interactive or animating
      return;
    }

    // Style card clicked
    
    // Queue the click action to prevent conflicts
    queueAnimation(() => {
      onStyleClick();
      transition('SELECT');
    });
  }, [machineAnimating, machineInteractive, onStyleClick, queueAnimation, transition]);

  const handleGenerateClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!onGenerateStyle) {
      return;
    }

    // Allow generation even in error state by resetting first
    if (machineHasError) {
      // Resetting error state before generation
      transition('RESET', true);
    }
    
    if (!machineInteractive && !machineHasError) {
      return;
    }

    // Generate click on style card
    
    // Direct call without animation queue to prevent conflicts
    transition('START_LOADING', true);
    onGenerateStyle();
  }, [machineHasError, machineInteractive, onGenerateStyle, transition]);

  const handleRetryClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!onGenerateStyle) {
      return;
    }

    // Retry click on style card
    
    // Reset error state and start generation immediately
    transition('RESET', true);
    transition('START_LOADING', true);
    onGenerateStyle();
  }, [onGenerateStyle, transition]);

  // Computed visual states for styling
  const visualState = useMemo(() => ({
    isHovered: shouldShowHover,
    isSelected: shouldShowSelected,
    isLoading: shouldShowLoading,
    hasError: shouldShowError,
    isDisabled: shouldShowDisabled,
    isAnimating: machineAnimating,
    isInteractive: machineInteractive
  }), [machineAnimating, machineInteractive, shouldShowDisabled, shouldShowError, shouldShowHover, shouldShowLoading, shouldShowSelected]);

  // CSS classes based on current state
  const cssClasses = useMemo(() => {
    const base = "group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 border-0 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] flex flex-col w-full touch-manipulation select-none will-change-transform transform-gpu";
    
    if (visualState.isDisabled) {
      return `${base} opacity-60 grayscale-[0.3] shadow-lg cursor-not-allowed`;
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
    // Visual state
    visualState,
    cssClasses,
    
    // Handlers
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleGenerateClick,
    handleRetryClick,
    
    // State machine access for debugging
    currentState: machineState,
    animationQueueLength
  };
};
