
import { useState, useCallback, useRef, useEffect } from 'react';

export type InteractionState = 
  | 'idle'
  | 'hovering' 
  | 'selected'
  | 'animating'
  | 'loading'
  | 'error'
  | 'disabled';

export type InteractionEvent = 
  | 'HOVER_START'
  | 'HOVER_END' 
  | 'SELECT'
  | 'DESELECT'
  | 'START_LOADING'
  | 'FINISH_LOADING'
  | 'ERROR'
  | 'RESET'
  | 'DISABLE'
  | 'ENABLE';

interface InteractionStateMachineOptions {
  initialState?: InteractionState;
  debounceDelay?: number;
  animationDuration?: number;
}

const stateTransitions: Record<InteractionState, Partial<Record<InteractionEvent, InteractionState>>> = {
  idle: {
    HOVER_START: 'hovering',
    SELECT: 'selected',
    START_LOADING: 'loading',
    ERROR: 'error',
    DISABLE: 'disabled'
  },
  hovering: {
    HOVER_END: 'idle',
    SELECT: 'selected',
    START_LOADING: 'loading',
    ERROR: 'error',
    DISABLE: 'disabled'
  },
  selected: {
    HOVER_START: 'selected', // Stay selected when hovering
    HOVER_END: 'selected',
    DESELECT: 'idle',
    START_LOADING: 'loading',
    ERROR: 'error',
    DISABLE: 'disabled'
  },
  animating: {
    // During animation, allow critical state changes
    ERROR: 'error',
    DISABLE: 'disabled',
    RESET: 'idle',
    FINISH_LOADING: 'selected'
  },
  loading: {
    FINISH_LOADING: 'selected',
    ERROR: 'error',
    DISABLE: 'disabled',
    RESET: 'idle'
  },
  error: {
    RESET: 'idle',
    START_LOADING: 'loading',
    SELECT: 'selected', // Allow direct selection from error state
    DISABLE: 'disabled',
    HOVER_START: 'error' // Stay in error but allow hover feedback
  },
  disabled: {
    ENABLE: 'idle',
    RESET: 'idle'
  }
};

export const useInteractionStateMachine = (options: InteractionStateMachineOptions = {}) => {
  const {
    initialState = 'idle',
    debounceDelay = 100,
    animationDuration = 300
  } = options;

  const [state, setState] = useState<InteractionState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation queue to prevent conflicts
  const animationQueue = useRef<Array<() => void>>([]);
  const isProcessingQueue = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const animationTimer = useRef<NodeJS.Timeout>();

  // Process animation queue sequentially
  const processAnimationQueue = useCallback(() => {
    if (isProcessingQueue.current || animationQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    const nextAnimation = animationQueue.current.shift();
    
    if (nextAnimation) {
      setIsTransitioning(true);
      nextAnimation();
      
      // Clear after animation duration
      animationTimer.current = setTimeout(() => {
        setIsTransitioning(false);
        isProcessingQueue.current = false;
        processAnimationQueue(); // Process next in queue
      }, animationDuration);
    } else {
      isProcessingQueue.current = false;
    }
  }, [animationDuration]);

  // Queue an animation to prevent conflicts
  const queueAnimation = useCallback((animation: () => void) => {
    animationQueue.current.push(animation);
    processAnimationQueue();
  }, [processAnimationQueue]);

  // Transition between states with validation and improved error recovery
  const transition = useCallback((event: InteractionEvent, immediate = false) => {
    const currentTransitions = stateTransitions[state];
    const nextState = currentTransitions?.[event];

    if (!nextState) {
      console.warn(`Invalid transition: ${event} from state ${state}. Available transitions:`, Object.keys(currentTransitions || {}));
      
      // For error recovery, allow RESET from any state
      if (event === 'RESET') {
        console.log('🔄 Force resetting state to idle from:', state);
        setState('idle');
        return true;
      }
      
      return false;
    }

    const performTransition = () => {
      setState(nextState);
      console.log(`✅ State transition: ${state} -> ${nextState} (${event})`);
    };

    if (immediate || nextState === 'error' || nextState === 'disabled') {
      // Critical state changes happen immediately
      performTransition();
    } else {
      // Queue non-critical transitions
      queueAnimation(performTransition);
    }

    return true;
  }, [state, queueAnimation]);

  // Debounced hover start
  const debouncedHoverStart = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      transition('HOVER_START');
    }, debounceDelay);
  }, [transition, debounceDelay]);

  // Immediate hover end (no debounce needed for leaving)
  const hoverEnd = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    transition('HOVER_END');
  }, [transition]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, []);

  // State helper functions
  const isIdle = state === 'idle';
  const isHovering = state === 'hovering';
  const isSelected = state === 'selected';
  const isAnimating = state === 'animating' || isTransitioning;
  const isLoading = state === 'loading';
  const hasError = state === 'error';
  const isDisabled = state === 'disabled';
  
  // Interactive states (can respond to user input) - allow interaction in error state for recovery
  const isInteractive = !isDisabled && !isLoading;
  
  // Visual states for styling
  const shouldShowHover = isHovering && isInteractive;
  const shouldShowSelected = isSelected;
  const shouldShowLoading = isLoading;
  const shouldShowError = hasError;
  const shouldShowDisabled = isDisabled;

  return {
    // Current state
    state,
    
    // State checks
    isIdle,
    isHovering,
    isSelected,
    isAnimating,
    isLoading,
    hasError,
    isDisabled,
    isInteractive,
    
    // Visual states
    shouldShowHover,
    shouldShowSelected,
    shouldShowLoading,
    shouldShowError,
    shouldShowDisabled,
    
    // Actions
    transition,
    debouncedHoverStart,
    hoverEnd,
    
    // Animation queue management
    queueAnimation,
    animationQueueLength: animationQueue.current.length
  };
};
