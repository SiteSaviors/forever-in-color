import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { InteractionState } from './hooks/useInteractionStateMachine';

// NOTE: This file is a lightweight, drop-in compatible shim for
// src/components/product/contexts/AccordionStateContext.tsx.
// It preserves the public API (provider props and hook members)
// while replacing the heavy reducer/queue system with simple local state.

// Types replicated to ensure compatibility with existing consumers
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

interface AccordionContextValue {
  state: AccordionState;
  dispatch: React.Dispatch<AccordionAction>;

  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  setStepInteractionState: (stepNumber: number, interactionState: InteractionState) => void;
  setStepError: (stepNumber: number, error: string) => void;
  clearStepError: (stepNumber: number) => void;
  setGlobalError: (error: string) => void;
  clearGlobalError: () => void;

  startAnimation: (stepNumber: number) => void;
  endAnimation: (stepNumber: number) => void;

  getStepState: (stepNumber: number) => StepState;
  canProceedToStep: (stepNumber: number) => boolean;
  isStepAnimating: (stepNumber: number) => boolean;
}

interface AccordionStateProviderProps {
  children: React.ReactNode;
  initialCurrentStep?: number;
  initialCompletedSteps?: number[];
  onStepChange?: (step: number) => void;
  onStepComplete?: (step: number) => void;
}

const createInitialSteps = (currentStep: number, completedSteps: number[]): Record<number, StepState> => ({
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
});

const AccordionCompatContext = createContext<AccordionContextValue | null>(null);

export const AccordionCompatProvider: React.FC<AccordionStateProviderProps> = ({
  children,
  initialCurrentStep = 1,
  initialCompletedSteps = [],
  onStepChange,
  onStepComplete
}) => {
  const [currentStep, setCurrentStepState] = useState<number>(initialCurrentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);
  const [steps, setSteps] = useState<Record<number, StepState>>(() => createInitialSteps(initialCurrentStep, initialCompletedSteps));
  const [globalError, setGlobalErrorState] = useState<string | null>(null);
  const [animationQueue, setAnimationQueue] = useState<number[]>([]);
  const isTransitioning = false; // not used in consumers; maintained for parity

  // Helper to recalc derived fields on step/state changes
  const recalcSteps = useCallback((nextCurrentStep: number, nextCompleted: number[], base?: Record<number, StepState>) => {
    const baseSteps = base ?? steps;
    const next: Record<number, StepState> = { ...baseSteps };

    Object.keys(next).forEach((k) => {
      const n = parseInt(k, 10);
      next[n] = {
        ...next[n],
        isActive: n === nextCurrentStep,
        isCompleted: nextCompleted.includes(n),
      };
    });

    // Access rules identical to original
    next[1].canAccess = true;
    next[2].canAccess = nextCompleted.includes(1);
    next[3].canAccess = nextCompleted.includes(1) && nextCompleted.includes(2);
    next[4].canAccess = nextCompleted.includes(1) && nextCompleted.includes(2) && nextCompleted.includes(3);

    return next;
  }, [steps]);

  const state: AccordionState = useMemo(() => ({
    currentStep,
    completedSteps,
    steps,
    isTransitioning,
    globalError,
    animationQueue,
  }), [animationQueue, completedSteps, currentStep, globalError, isTransitioning, steps]);

  const setCurrentStep = useCallback((step: number) => {
    setCurrentStepState(step);
    setSteps((prev) => recalcSteps(step, completedSteps, prev));
    onStepChange?.(step);
  }, [completedSteps, onStepChange, recalcSteps]);

  const completeStep = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(step) ? prev : [...prev, step];
      setSteps((s) => recalcSteps(currentStep, next, s));
      return next;
    });
    onStepComplete?.(step);
  }, [currentStep, onStepComplete, recalcSteps]);

  const setStepInteractionState = useCallback((stepNumber: number, interactionState: InteractionState) => {
    setSteps((prev) => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        interactionState,
      }
    }));
  }, []);

  const setStepError = useCallback((stepNumber: number, error: string) => {
    setSteps((prev) => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        errorState: error,
      }
    }));
  }, []);

  const clearStepError = useCallback((stepNumber: number) => {
    setSteps((prev) => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        errorState: null,
      }
    }));
  }, []);

  const setGlobalError = useCallback((error: string) => {
    setGlobalErrorState(error);
  }, []);

  const clearGlobalError = useCallback(() => {
    setGlobalErrorState(null);
  }, []);

  const startAnimation = useCallback((stepNumber: number) => {
    setAnimationQueue((q) => [...q, stepNumber]);
    setSteps((prev) => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        isAnimating: true,
      }
    }));
  }, []);

  const endAnimation = useCallback((stepNumber: number) => {
    setAnimationQueue((q) => q.filter((n) => n !== stepNumber));
    setSteps((prev) => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        isAnimating: false,
      }
    }));
  }, []);

  const getStepState = useCallback((stepNumber: number): StepState => {
    return steps[stepNumber];
  }, [steps]);

  const canProceedToStep = useCallback((stepNumber: number): boolean => {
    return steps[stepNumber]?.canAccess || false;
  }, [steps]);

  const isStepAnimating = useCallback((stepNumber: number): boolean => {
    return steps[stepNumber]?.isAnimating || false;
  }, [steps]);

  // Minimal action dispatcher for compatibility
  const dispatch: React.Dispatch<AccordionAction> = useCallback((action) => {
    switch (action.type) {
      case 'SET_CURRENT_STEP':
        return setCurrentStep(action.payload);
      case 'COMPLETE_STEP':
        return completeStep(action.payload);
      case 'SET_STEP_STATE': {
        const { stepNumber, state: partial } = action.payload;
        setSteps((prev) => ({
          ...prev,
          [stepNumber]: {
            ...prev[stepNumber],
            ...partial,
          },
        }));
        return;
      }
      case 'SET_INTERACTION_STATE':
        return setStepInteractionState(action.payload.stepNumber, action.payload.interactionState);
      case 'SET_ERROR': {
        if (typeof action.payload.stepNumber === 'number') {
          return setStepError(action.payload.stepNumber, action.payload.error);
        }
        return setGlobalError(action.payload.error);
      }
      case 'CLEAR_ERROR': {
        if (typeof action.payload === 'number') {
          return clearStepError(action.payload);
        }
        return clearGlobalError();
      }
      case 'QUEUE_ANIMATION':
        return startAnimation(action.payload);
      case 'DEQUEUE_ANIMATION':
        return endAnimation(action.payload);
      case 'RESET_STATE': {
        setCurrentStepState(1);
        setCompletedSteps([]);
        setSteps(createInitialSteps(1, []));
        setGlobalErrorState(null);
        setAnimationQueue([]);
        return;
      }
      case 'START_TRANSITION':
      case 'END_TRANSITION':
      default:
        // No-op; maintained for parity
        return;
    }
  }, [clearGlobalError, clearStepError, completeStep, endAnimation, setGlobalError, setStepError, setStepInteractionState, setCurrentStep, startAnimation]);

  const value: AccordionContextValue = useMemo(() => ({
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
    isStepAnimating,
  }), [canProceedToStep, clearGlobalError, clearStepError, completeStep, dispatch, endAnimation, getStepState, isStepAnimating, setCurrentStep, setGlobalError, setStepError, setStepInteractionState, startAnimation, state]);

  return (
    <AccordionCompatContext.Provider value={value}>
      {children}
    </AccordionCompatContext.Provider>
  );
};

export const useAccordionState = (): AccordionContextValue => {
  const ctx = useContext(AccordionCompatContext);
  if (!ctx) {
    throw new Error('useAccordionState must be used within an AccordionCompatProvider');
  }
  return ctx;
};

// Optional helpers to mirror original exports (not required by current consumers)
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
    isAnimating: isStepAnimating(stepNumber),
  };
};
