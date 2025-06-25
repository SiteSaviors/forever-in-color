
import { useCallback } from 'react';

interface UseBackNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

/**
 * useBackNavigation Hook
 * 
 * Centralized logic for step navigation and back button behavior.
 * Provides consistent navigation patterns across all product steps.
 * 
 * Features:
 * - Smart back navigation logic
 * - Step validation
 * - Consistent scroll behavior
 * - Error prevention for invalid navigation
 */
export const useBackNavigation = ({
  currentStep,
  completedSteps,
  onStepChange
}: UseBackNavigationProps) => {
  
  /**
   * Determine if user can navigate back from current step
   */
  const canGoBack = currentStep > 1;
  
  /**
   * Handle back navigation with validation and smooth scrolling
   */
  const handleBackStep = useCallback(() => {
    if (!canGoBack) {
      console.warn('Cannot go back from step 1');
      return;
    }
    
    const previousStep = currentStep - 1;
    console.log(`🔙 Navigating back from step ${currentStep} to step ${previousStep}`);
    
    // Update step
    onStepChange(previousStep);
    
    // Smooth scroll to previous step
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
      }, 150); // Allow time for DOM updates
    });
  }, [currentStep, canGoBack, onStepChange]);
  
  return {
    canGoBack,
    handleBackStep
  };
};
