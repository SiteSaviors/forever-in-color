import React, { useCallback } from 'react';

interface UseStyleCardHandlersProps {
  styleId: number;
  styleName: string;
  stateMachine: any;
  onStyleClick: () => void;
  onGenerateStyle?: () => void;
}

export const useStyleCardHandlers = ({
  styleId,
  styleName,
  stateMachine,
  onStyleClick,
  onGenerateStyle
}: UseStyleCardHandlersProps) => {

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

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleGenerateClick,
    handleRetryClick
  };
};