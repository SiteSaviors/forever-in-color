import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { InteractionState } from '../hooks/useInteractionStateMachine';

// State Management Types
export interface StepState {
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  interactionState: InteractionState;
  isAnimating: boolean;
  errorState?: string | null;
}

export interface AccordionState {
  currentStep: number;
  completedSteps: number[];
  steps: Record<number, StepState>;
  isTransitioning: boolean;
  globalError?: string | null;
  animationQueue: number[];
}

// Action Types
export type AccordionAction = 
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'SET_STEP_STATE'; payload: { stepNumber: number; state: Partial<StepState> } }
  | { type: 'SET_INTERACTION_STATE'; payload: { stepNumber: number; interactionState: InteractionState } }
  | { type: 'START_TRANSITION'; payload?: number }
  | { type: 'END_TRANSITION' }
  | { type: 'SET_ERROR'; payload: { stepNumber?: number; error: string } }
  | { type: 'CLEAR_ERROR'; payload?: number }
  | { type: 'QUEUE_ANIMATION'; payload: number }
  | { type: 'DEQUEUE_ANIMATION'; payload: number }
  | { type: 'RESET_STATE' };

// Initial state factory
const createInitialState = (currentStep: number, completedSteps: number[]): AccordionState => ({
  currentStep,
  completedSteps,
  steps: {
    1: {
      stepNumber: 1,
      isActive: currentStep === 1,
      isCompleted: completedSteps.includes(1),
      canAccess: true,
      interactionState: 'idle',
      isAnimating: false
    },
    2: {
      stepNumber: 2,
      isActive: currentStep === 2,
      isCompleted: completedSteps.includes(2),
      canAccess: completedSteps.includes(1),
      interactionState: 'idle',
      isAnimating: false
    },
    3: {
      stepNumber: 3,
      isActive: currentStep === 3,
      isCompleted: completedSteps.includes(3),
      canAccess: completedSteps.includes(1) && completedSteps.includes(2),
      interactionState: 'idle',
      isAnimating: false
    },
    4: {
      stepNumber: 4,
      isActive: currentStep === 4,
      isCompleted: completedSteps.includes(4),
      canAccess: completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3),
      interactionState: 'idle',
      isAnimating: false
    }
  },
  isTransitioning: false,
  animationQueue: []
});

// Optimized reducer with performance considerations
const accordionReducer = (state: AccordionState, action: AccordionAction): AccordionState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP': {
      const newStep = action.payload;
      const updatedSteps = { ...state.steps };
      
      // Update all step active states efficiently
      Object.keys(updatedSteps).forEach(key => {
        const stepNum = parseInt(key);
        updatedSteps[stepNum] = {
          ...updatedSteps[stepNum],
          isActive: stepNum === newStep
        };
      });

      return {
        ...state,
        currentStep: newStep,
        steps: updatedSteps
      };
    }

    case 'COMPLETE_STEP': {
      const stepNumber = action.payload;
      const newCompletedSteps = [...state.completedSteps];
      
      if (!newCompletedSteps.includes(stepNumber)) {
        newCompletedSteps.push(stepNumber);
      }

      // Recalculate access permissions for all steps
      const updatedSteps = { ...state.steps };
      updatedSteps[1].canAccess = true;
      updatedSteps[2].canAccess = newCompletedSteps.includes(1);
      updatedSteps[3].canAccess = newCompletedSteps.includes(1) && newCompletedSteps.includes(2);
      updatedSteps[4].canAccess = newCompletedSteps.includes(1) && newCompletedSteps.includes(2) && newCompletedSteps.includes(3);

      // Mark step as completed
      updatedSteps[stepNumber] = {
        ...updatedSteps[stepNumber],
        isCompleted: true
      };

      return {
        ...state,
        completedSteps: newCompletedSteps,
        steps: updatedSteps
      };
    }

    case 'SET_STEP_STATE': {
      const { stepNumber, state: stepState } = action.payload;
      return {
        ...state,
        steps: {
          ...state.steps,
          [stepNumber]: {
            ...state.steps[stepNumber],
            ...stepState
          }
        }
      };
    }

    case 'SET_INTERACTION_STATE': {
      const { stepNumber, interactionState } = action.payload;
      return {
        ...state,
        steps: {
          ...state.steps,
          [stepNumber]: {
            ...state.steps[stepNumber],
            interactionState
          }
        }
      };
    }

    case 'START_TRANSITION':
      return {
        ...state,
        isTransitioning: true
      };

    case 'END_TRANSITION':
      return {
        ...state,
        isTransitioning: false
      };

    case 'SET_ERROR': {
      const { stepNumber, error } = action.payload;
      if (stepNumber) {
        return {
          ...state,
          steps: {
            ...state.steps,
            [stepNumber]: {
              ...state.steps[stepNumber],
              errorState: error
            }
          }
        };
      }
      return {
        ...state,
        globalError: error
      };
    }

    case 'CLEAR_ERROR': {
      const stepNumber = action.payload;
      if (stepNumber) {
        return {
          ...state,
          steps: {
            ...state.steps,
            [stepNumber]: {
              ...state.steps[stepNumber],
              errorState: null
            }
          }
        };
      }
      return {
        ...state,
        globalError: null
      };
    }

    case 'QUEUE_ANIMATION': {
      const stepNumber = action.payload;
      return {
        ...state,
        animationQueue: [...state.animationQueue, stepNumber]
      };
    }

    case 'DEQUEUE_ANIMATION': {
      const stepNumber = action.payload;
      return {
        ...state,
        animationQueue: state.animationQueue.filter(num => num !== stepNumber)
      };
    }

    case 'RESET_STATE':
      return createInitialState(1, []);

    default:
      return state;
  }
};

// Context interfaces
interface AccordionContextValue {
  state: AccordionState;
  dispatch: React.Dispatch<AccordionAction>;
  
  // Optimized action creators
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  setStepInteractionState: (stepNumber: number, interactionState: InteractionState) => void;
  setStepError: (stepNumber: number, error: string) => void;
  clearStepError: (stepNumber: number) => void;
  setGlobalError: (error: string) => void;
  clearGlobalError: () => void;
  
  // Animation management
  startAnimation: (stepNumber: number) => void;
  endAnimation: (stepNumber: number) => void;
  
  // State selectors for performance
  getStepState: (stepNumber: number) => StepState;
  canProceedToStep: (stepNumber: number) => boolean;
  isStepAnimating: (stepNumber: number) => boolean;
}

const AccordionStateContext = createContext<AccordionContextValue | null>(null);

// Provider props
interface AccordionStateProviderProps {
  children: React.ReactNode;
  initialCurrentStep?: number;
  initialCompletedSteps?: number[];
  onStepChange?: (step: number) => void;
  onStepComplete?: (step: number) => void;
}

// Provider component with performance optimizations
export const AccordionStateProvider: React.FC<AccordionStateProviderProps> = ({
  children,
  initialCurrentStep = 1,
  initialCompletedSteps = [],
  onStepChange,
  onStepComplete
}) => {
  const [state, dispatch] = useReducer(
    accordionReducer,
    createInitialState(initialCurrentStep, initialCompletedSteps)
  );

  // Memoized action creators
  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    onStepChange?.(step);
  }, [onStepChange]);

  const completeStep = useCallback((step: number) => {
    dispatch({ type: 'COMPLETE_STEP', payload: step });
    onStepComplete?.(step);
  }, [onStepComplete]);

  const setStepInteractionState = useCallback((stepNumber: number, interactionState: InteractionState) => {
    dispatch({ type: 'SET_INTERACTION_STATE', payload: { stepNumber, interactionState } });
  }, []);

  const setStepError = useCallback((stepNumber: number, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { stepNumber, error } });
  }, []);

  const clearStepError = useCallback((stepNumber: number) => {
    dispatch({ type: 'CLEAR_ERROR', payload: stepNumber });
  }, []);

  const setGlobalError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { error } });
  }, []);

  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const startAnimation = useCallback((stepNumber: number) => {
    dispatch({ type: 'QUEUE_ANIMATION', payload: stepNumber });
    dispatch({ type: 'SET_STEP_STATE', payload: { stepNumber, state: { isAnimating: true } } });
  }, []);

  const endAnimation = useCallback((stepNumber: number) => {
    dispatch({ type: 'DEQUEUE_ANIMATION', payload: stepNumber });
    dispatch({ type: 'SET_STEP_STATE', payload: { stepNumber, state: { isAnimating: false } } });
  }, []);

  // Optimized selectors
  const getStepState = useCallback((stepNumber: number): StepState => {
    return state.steps[stepNumber];
  }, [state.steps]);

  const canProceedToStep = useCallback((stepNumber: number): boolean => {
    return state.steps[stepNumber]?.canAccess || false;
  }, [state.steps]);

  const isStepAnimating = useCallback((stepNumber: number): boolean => {
    return state.steps[stepNumber]?.isAnimating || false;
  }, [state.steps]);

  // Performance optimization: sync external state changes
  useEffect(() => {
    if (state.currentStep !== initialCurrentStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: initialCurrentStep });
    }
  }, [initialCurrentStep, state.currentStep]);

  const contextValue: AccordionContextValue = {
    state,
    dispatch,
    setCurrentStep,
    completeStep,
    setStepInteractionState,
    setStepError,
    clearStepError,
    setGlobalError,
    clearGlobalError,
    startAnimation,
    endAnimation,
    getStepState,
    canProceedToStep,
    isStepAnimating
  };

  return (
    <AccordionStateContext.Provider value={contextValue}>
      {children}
    </AccordionStateContext.Provider>
  );
};

// Custom hook with error handling
export const useAccordionState = (): AccordionContextValue => {
  const context = useContext(AccordionStateContext);
  
  if (!context) {
    throw new Error('useAccordionState must be used within an AccordionStateProvider');
  }
  
  return context;
};

// Additional utility hooks for specific use cases
export const useStepState = (stepNumber: number) => {
  const { getStepState } = useAccordionState();
  return getStepState(stepNumber);
};

export const useStepAccess = (stepNumber: number) => {
  const { canProceedToStep } = useAccordionState();
  return canProceedToStep(stepNumber);
};

export const useStepAnimation = (stepNumber: number) => {
  const { startAnimation, endAnimation, isStepAnimating } = useAccordionState();
  
  return {
    startAnimation: () => startAnimation(stepNumber),
    endAnimation: () => endAnimation(stepNumber),
    isAnimating: isStepAnimating(stepNumber)
  };
};