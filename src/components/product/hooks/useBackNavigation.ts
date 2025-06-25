
import { useCallback } from 'react';

interface UseBackNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

export const useBackNavigation = ({
  currentStep,
  completedSteps,
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
      console.log(`Navigating back from step ${currentStep} to step ${previousStep}`);
      
      // Enhanced smooth scroll for back navigation
      onStepChange(previousStep);
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          const targetElement = document.querySelector(`[data-step="${previousStep}"]`);
          if (targetElement) {
            const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetTop = elementTop - 80; // Header offset
            
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }, 100);
      });
    }
  }, [currentStep, canGoBack, getPreviousStep, onStepChange]);

  return {
    canGoBack: canGoBack(),
    handleBackStep,
    previousStep: getPreviousStep()
  };
};
