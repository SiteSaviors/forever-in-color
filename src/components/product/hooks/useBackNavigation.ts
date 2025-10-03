
import { useCallback } from 'react';

interface UseBackNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

export const useBackNavigation = ({
  currentStep,
  completedSteps: _completedSteps,
  onStepChange
}: UseBackNavigationProps) => {
  
  const canGoBack = useCallback(() => {
    return currentStep > 1;
  }, [currentStep]);

  const getPreviousStep = useCallback(() => {
    if (currentStep <= 1) return 1;
    return currentStep - 1;
  }, [currentStep]);

  const handleBackStep = useCallback(() => {
    if (canGoBack()) {
      const previousStep = getPreviousStep();
      onStepChange(previousStep);
    }
  }, [canGoBack, getPreviousStep, onStepChange]);

  return {
    canGoBack: canGoBack(),
    handleBackStep,
    previousStep: getPreviousStep()
  };
};
