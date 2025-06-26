
import { useCallback } from "react";

interface UseProductStepsProps {
  currentStep: number;
  completedSteps: number[];
  onCurrentStepChange: (step: number) => void;
}

export const useProductSteps = ({
  currentStep,
  completedSteps,
  onCurrentStepChange
}: UseProductStepsProps) => {
  const canProceedToStep = useCallback((step: number) => {
    console.log(`🐛 Checking access to step ${step}:`, {
      step1Complete: completedSteps.includes(1),
      step2Complete: completedSteps.includes(2),
      step3Complete: completedSteps.includes(3),
      completedSteps
    });
    
    if (step === 1) return true;
    if (step === 2) return completedSteps.includes(1);
    if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);
    if (step === 4) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
    return false;
  }, [completedSteps]);

  const handleStepTransition = useCallback((targetStep: number) => {
    console.log(`🐛 Transitioning to step ${targetStep}`);
    
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
    console.log('🐛 User clicked continue to step 2');
    handleStepTransition(2);
  }, [handleStepTransition]);

  const handleContinueToStep3 = useCallback(() => {
    console.log('🐛 User clicked continue to step 3');
    handleStepTransition(3);
  }, [handleStepTransition]);

  const handleContinueToStep4 = useCallback(() => {
    console.log('🐛 User clicked continue to step 4');
    handleStepTransition(4);
  }, [handleStepTransition]);

  return {
    canProceedToStep,
    handleContinueToStep2,
    handleContinueToStep3,
    handleContinueToStep4
  };
};
