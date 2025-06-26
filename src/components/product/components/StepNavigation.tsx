
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

  return (
    <div className="flex items-center justify-between pt-6 sm:pt-8 border-t border-gray-100 px-4 sm:px-0">
      {/* Back Button - Enhanced for mobile */}
      {canGoBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[48px] px-4 sm:px-6 text-sm sm:text-base touch-manipulation"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      ) : (
        <div /> // Empty div to maintain flex layout
      )}

      {/* Continue Button - Mobile-optimized */}
      <Button
        onClick={onContinue}
        disabled={!canContinue || isLoading}
        className={`
          px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200
          min-h-[48px] min-w-[140px] sm:min-w-[180px] touch-manipulation
          ${canContinue 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
        `}
        aria-disabled={!canContinue}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-sm sm:text-base">Processing...</span>
          </div>
        ) : (
          <>
            <span className="text-sm sm:text-base">{getFinalStepText()}</span>
            {currentStep < totalSteps && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />}
          </>
        )}
      </Button>
    </div>
  );
};

export default StepNavigation;
