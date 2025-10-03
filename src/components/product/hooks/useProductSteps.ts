
import { useCallback } from "react";

interface UseProductStepsProps {
  currentStep: number;
  completedSteps: number[];
  onCurrentStepChange: (step: number) => void;
}

export const useProductSteps = ({
  currentStep: _currentStep,
  completedSteps,
  onCurrentStepChange
}: UseProductStepsProps) => {
  const canProceedToStep = useCallback((step: number) => {
    if (step === 1) return true;
    if (step === 2) return completedSteps.includes(1);
    if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);
    if (step === 4) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
    return false;
  }, [completedSteps]);

  const handleStepTransition = useCallback((targetStep: number) => {
    // Change the step first
    onCurrentStepChange(targetStep);
    
    // Use requestAnimationFrame to ensure the DOM has updated before scrolling
    requestAnimationFrame(() => {
      setTimeout(() => {
        const targetElement = document.querySelector(`[data-step="${targetStep}"]`);
        if (targetElement) {
          // Scroll to the top of the target step with some offset
          const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetTop = elementTop - 100; // 100px offset from top
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }, 100); // Reduced timeout to minimize delay
    });
  }, [onCurrentStepChange]);

  const handleContinueToStep2 = useCallback(() => {
    handleStepTransition(2);
  }, [handleStepTransition]);

  const handleContinueToStep3 = useCallback(() => {
    handleStepTransition(3);
  }, [handleStepTransition]);

  const handleContinueToStep4 = useCallback(() => {
    handleStepTransition(4);
  }, [handleStepTransition]);

  return {
    canProceedToStep,
    handleContinueToStep2,
    handleContinueToStep3,
    handleContinueToStep4
  };
};
