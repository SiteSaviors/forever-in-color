
import { useState, useCallback } from 'react';

export type InteractionState = 'idle' | 'loading' | 'success' | 'error' | 'selected';

export type InteractionEvent = 
  | 'SELECT' 
  | 'LOAD' 
  | 'SUCCESS' 
  | 'ERROR' 
  | 'RETRY'
  | 'RESET';

const stateTransitions: Record<InteractionState, Partial<Record<InteractionEvent, InteractionState>>> = {
  idle: {
    SELECT: 'selected',
    LOAD: 'loading'
  },
  loading: {
    SUCCESS: 'success',
    ERROR: 'error',
    RESET: 'idle'
  },
  success: {
    SELECT: 'selected',
    LOAD: 'loading',
    RESET: 'idle'
  },
  error: {
    RETRY: 'loading',
    RESET: 'idle',
    SELECT: 'loading' // Allow selecting from error state (triggers retry)
  },
  selected: {
    LOAD: 'loading',
    RESET: 'idle'
  }
};

export const useInteractionStateMachine = (initialState: InteractionState = 'idle') => {
  const [state, setState] = useState<InteractionState>(initialState);
  const [actionQueue, setActionQueue] = useState<InteractionEvent[]>([]);

  const transition = useCallback((event: InteractionEvent) => {
    setState(currentState => {
      const nextState = stateTransitions[currentState]?.[event];
      
      if (nextState) {
        console.log(`State transition: ${currentState} -> ${nextState} (${event})`);
        return nextState;
      } else {
        // Instead of warning, allow the transition for error recovery
        if (currentState === 'error' && event === 'SELECT') {
          console.log(`Error recovery: ${currentState} -> loading (${event})`);
          return 'loading';
        }
        console.warn(`Invalid transition: ${event} from state ${currentState}`);
        return currentState;
      }
    });
  }, []);

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

  return {
    state,
    transition,
    queueAction,
    processQueue,
    queueLength: actionQueue.length
  };
};
