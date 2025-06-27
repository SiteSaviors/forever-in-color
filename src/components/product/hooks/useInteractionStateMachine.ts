
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

export type InteractionState = 'idle' | 'loading' | 'success' | 'error' | 'selected' | 'disabled';

export type InteractionEvent = 
  | 'SELECT' 
  | 'LOAD' 
  | 'SUCCESS' 
  | 'ERROR' 
  | 'RETRY'
  | 'RESET'
  | 'DISABLE'
  | 'ENABLE'
  | 'DESELECT'
  | 'START_LOADING'
  | 'FINISH_LOADING'
  | 'HOVER_START'
  | 'HOVER_END';

interface StateMachineConfig {
  initialState?: InteractionState;
  debounceDelay?: number;
  animationDuration?: number;
}

const stateTransitions: Record<InteractionState, Partial<Record<InteractionEvent, InteractionState>>> = {
  idle: {
    SELECT: 'selected',
    LOAD: 'loading',
    START_LOADING: 'loading',
    DISABLE: 'disabled'
  },
  loading: {
    SUCCESS: 'success',
    ERROR: 'error',
    RESET: 'idle',
    FINISH_LOADING: 'idle'
  },
  success: {
    SELECT: 'selected',
    LOAD: 'loading',
    START_LOADING: 'loading',
    RESET: 'idle'
  },
  error: {
    RETRY: 'loading',
    RESET: 'idle',
    SELECT: 'loading', // Allow selecting from error state (triggers retry)
    LOAD: 'loading',
    START_LOADING: 'loading'
  },
  selected: {
    LOAD: 'loading',
    START_LOADING: 'loading',
    RESET: 'idle',
    DESELECT: 'idle'
  },
  disabled: {
    ENABLE: 'idle'
  }
};

export const useInteractionStateMachine = (config: InteractionState | StateMachineConfig = 'idle') => {
  // Handle both old API (single state) and new API (config object)
  const resolvedConfig = useMemo(() => {
    if (typeof config === 'string') {
      return { initialState: config, debounceDelay: 100, animationDuration: 300 };
    }
    return {
      initialState: config.initialState || 'idle',
      debounceDelay: config.debounceDelay || 100,
      animationDuration: config.animationDuration || 300
    };
  }, [config]);

  const [state, setState] = useState<InteractionState>(resolvedConfig.initialState);
  const [actionQueue, setActionQueue] = useState<InteractionEvent[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const animationQueueRef = useRef<(() => void)[]>([]);

  const transition = useCallback((event: InteractionEvent, skipAnimation?: boolean) => {
    setState(currentState => {
      const nextState = stateTransitions[currentState]?.[event];
      
      if (nextState) {
        console.log(`State transition: ${currentState} -> ${nextState} (${event})`);
        return nextState;
      } else {
        // Allow error recovery transitions
        if (currentState === 'error' && (event === 'SELECT' || event === 'LOAD' || event === 'START_LOADING')) {
          console.log(`Error recovery: ${currentState} -> loading (${event})`);
          return 'loading';
        }
        console.warn(`Invalid transition: ${event} from state ${currentState}`);
        return currentState;
      }
    });

    // Handle animation state
    if (!skipAnimation) {
      setIsAnimating(true);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, resolvedConfig.animationDuration);
    }
  }, [resolvedConfig.animationDuration]);

  const queueAction = useCallback((event: InteractionEvent) => {
    setActionQueue(prev => [...prev, event]);
  }, []);

  const processQueue = useCallback(() => {
    if (actionQueue.length > 0) {
      const nextAction = actionQueue[0];
      setActionQueue(prev => prev.slice(1));
      transition(nextAction);
    }
  }, [actionQueue, transition]);

  // Queue animation function
  const queueAnimation = useCallback((callback: () => void) => {
    animationQueueRef.current.push(callback);
    
    // Process queue if not animating
    if (!isAnimating) {
      const nextCallback = animationQueueRef.current.shift();
      if (nextCallback) {
        setIsAnimating(true);
        nextCallback();
        setTimeout(() => {
          setIsAnimating(false);
          // Process next animation if any
          if (animationQueueRef.current.length > 0) {
            const next = animationQueueRef.current.shift();
            if (next) next();
          }
        }, resolvedConfig.animationDuration);
      }
    }
  }, [isAnimating, resolvedConfig.animationDuration]);

  // Debounced hover handlers
  const debouncedHoverStart = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      transition('HOVER_START', true);
    }, resolvedConfig.debounceDelay);
  }, [transition, resolvedConfig.debounceDelay]);

  const hoverEnd = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsHovered(false);
    transition('HOVER_END', true);
  }, [transition]);

  // Computed properties
  const isDisabled = state === 'disabled';
  const isSelected = state === 'selected';
  const isLoading = state === 'loading';
  const hasError = state === 'error';
  const isInteractive = !isDisabled && !isAnimating;

  // Visual state helpers
  const shouldShowHover = isHovered && isInteractive;
  const shouldShowSelected = isSelected;
  const shouldShowLoading = isLoading;
  const shouldShowError = hasError;
  const shouldShowDisabled = isDisabled;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    transition,
    queueAction,
    processQueue,
    queueLength: actionQueue.length,
    queueAnimation,
    debouncedHoverStart,
    hoverEnd,
    
    // State checks
    isDisabled,
    isSelected,
    isLoading,
    hasError,
    isInteractive,
    isAnimating,
    isHovered,
    
    // Visual state helpers
    shouldShowHover,
    shouldShowSelected,
    shouldShowLoading,
    shouldShowError,
    shouldShowDisabled,
    
    // Animation queue length for debugging
    animationQueueLength: animationQueueRef.current.length
  };
};
