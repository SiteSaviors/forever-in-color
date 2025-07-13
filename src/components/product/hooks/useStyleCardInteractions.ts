
import React, { useCallback, useMemo } from 'react';
import { useInteractionStateMachine } from './useInteractionStateMachine';

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

  // Interaction handlers with improved error handling
  const handleMouseEnter = useCallback(() => {
    if (stateMachine.isInteractive) {
      console.log(`🎯 HOVER START ▶️ ${styleName} (ID: ${styleId})`);
      stateMachine.debouncedHoverStart();
    }
  }, [stateMachine, styleName, styleId]);

  const handleMouseLeave = useCallback(() => {
    if (stateMachine.isInteractive) {
      console.log(`🎯 HOVER END ▶️ ${styleName} (ID: ${styleId})`);
      stateMachine.hoverEnd();
    }
  }, [stateMachine, styleName, styleId]);

  const handleClick = useCallback(() => {
    console.log(`🎯 CLICK ATTEMPT ▶️ ${styleName} (ID: ${styleId}) - State: ${stateMachine.state}, Interactive: ${stateMachine.isInteractive}, Animating: ${stateMachine.isAnimating}`);
    
    if (!stateMachine.isInteractive && !stateMachine.hasError) {
      console.log(`🚫 CLICK BLOCKED ▶️ ${styleName} (ID: ${styleId}) - State: ${stateMachine.state}`);
      return;
    }

    // Allow clicks from error state for recovery
    if (stateMachine.hasError) {
      console.log(`🔄 RECOVERY CLICK ▶️ ${styleName} (ID: ${styleId}) - Resetting from error`);
      stateMachine.transition('RESET');
    }
    
    console.log(`✅ CLICK PROCESSING ▶️ ${styleName} (ID: ${styleId})`);
    
    try {
      // Queue the click action to prevent conflicts
      stateMachine.queueAnimation(() => {
        onStyleClick();
        stateMachine.transition('SELECT');
      });
    } catch (error) {
      console.error(`❌ CLICK ERROR ▶️ ${styleName}:`, error);
      stateMachine.transition('ERROR', true);
    }
  }, [stateMachine, styleName, styleId, onStyleClick]);

  const handleGenerateClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    console.log(`🎨 GENERATE ATTEMPT ▶️ ${styleName} (ID: ${styleId}) - State: ${stateMachine.state}`);
    
    if (!stateMachine.isInteractive && !stateMachine.hasError) {
      console.log(`🚫 GENERATE BLOCKED ▶️ ${styleName} - Not interactive`);
      return;
    }

    if (!onGenerateStyle) {
      console.log(`🚫 GENERATE BLOCKED ▶️ ${styleName} - No generate function`);
      return;
    }

    // Allow generation from error state (retry scenario)
    if (stateMachine.hasError) {
      console.log(`🔄 RETRY GENERATE ▶️ ${styleName} - From error state`);
      stateMachine.transition('RESET');
    }

    console.log(`✅ GENERATE PROCESSING ▶️ ${styleName} (ID: ${styleId})`);
    
    try {
      stateMachine.queueAnimation(() => {
        stateMachine.transition('START_LOADING');
        onGenerateStyle();
      });
    } catch (error) {
      console.error(`❌ GENERATE ERROR ▶️ ${styleName}:`, error);
      stateMachine.transition('ERROR', true);
    }
  }, [stateMachine, styleName, styleId, onGenerateStyle]);

  const handleRetryClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    console.log(`🔄 RETRY ATTEMPT ▶️ ${styleName} (ID: ${styleId})`);
    
    if (!onGenerateStyle) {
      console.log(`🚫 RETRY BLOCKED ▶️ ${styleName} - No generate function`);
      return;
    }

    console.log(`✅ RETRY PROCESSING ▶️ ${styleName} (ID: ${styleId})`);
    
    try {
      stateMachine.queueAnimation(() => {
        stateMachine.transition('RESET');
        stateMachine.transition('START_LOADING');
        onGenerateStyle();
      });
    } catch (error) {
      console.error(`❌ RETRY ERROR ▶️ ${styleName}:`, error);
      stateMachine.transition('ERROR', true);
    }
  }, [stateMachine, styleName, styleId, onGenerateStyle]);

  // Computed visual states for styling
  const visualState = useMemo(() => ({
    isHovered: stateMachine.shouldShowHover,
    isSelected: stateMachine.shouldShowSelected,
    isLoading: stateMachine.shouldShowLoading,
    hasError: stateMachine.shouldShowError,
    isDisabled: stateMachine.shouldShowDisabled,
    isAnimating: stateMachine.isAnimating,
    isInteractive: stateMachine.isInteractive
  }), [stateMachine]);

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
    currentState: stateMachine.state,
    animationQueueLength: stateMachine.animationQueueLength
  };
};
