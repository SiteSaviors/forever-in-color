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
    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
      {/* Back Button */}
      {canGoBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[48px] px-6"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      ) : (
        <div /> // Empty div to maintain flex layout
      )}

      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={!canContinue || isLoading}
        className={`
          px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200
          min-h-[48px] min-w-[180px]
          ${canContinue 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
        `}
        aria-disabled={!canContinue}
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