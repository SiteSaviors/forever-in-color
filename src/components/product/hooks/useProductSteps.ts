
export const useProductSteps = (completedSteps: number[]) => {
  const canProceedToStep = (step: number) => {
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
  };

  const handleStepTransition = (targetStep: number, onCurrentStepChange: (step: number) => void) => {
    console.log(`🐛 Transitioning to step ${targetStep}`);
    
    onCurrentStepChange(targetStep);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        const targetElement = document.querySelector(`[data-step="${targetStep}"]`);
        if (targetElement) {
          const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetTop = elementTop - 100;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }, 100);
    });
  };

  return {
    canProceedToStep,
    handleStepTransition
  };
};
