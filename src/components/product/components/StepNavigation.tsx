
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  canGoBack: boolean;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  continueText?: string;
  isLoading?: boolean;
  currentStep: number;
  totalSteps: number;
}

const StepNavigation = ({ 
  canGoBack, 
  canContinue, 
  onBack, 
  onContinue,
  continueText = "Continue",
  isLoading = false,
  currentStep,
  totalSteps
}: StepNavigationProps) => {
  
  const getFinalStepText = () => {
    if (currentStep === totalSteps) return "Place Order";
    return continueText;
  };

  // Enhanced smooth scroll to next step
  const handleContinue = () => {
    onContinue();
    
    // Smooth scroll to next step after state update
    requestAnimationFrame(() => {
      setTimeout(() => {
        const nextStep = currentStep + 1;
        const targetElement = document.querySelector(`[data-step="${nextStep}"]`);
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
  };

  return (
    <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-gray-100">
      {/* Back Button - Enhanced touch targets */}
      {canGoBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[48px] px-6 py-3 text-base font-medium transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      ) : (
        <div /> // Empty div to maintain flex layout
      )}

      {/* Continue Button - Enhanced for mobile */}
      <Button
        onClick={handleContinue}
        disabled={!canContinue || isLoading}
        className={`
          min-h-[48px] px-8 py-3 text-base md:text-lg font-semibold 
          shadow-lg hover:shadow-xl transition-all duration-200 
          rounded-lg active:scale-95 touch-manipulation
          ${canContinue 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
        `}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          <>
            {getFinalStepText()}
            {currentStep < totalSteps && <ArrowRight className="w-5 h-5 ml-2" />}
          </>
        )}
      </Button>
    </div>
  );
};

export default StepNavigation;
