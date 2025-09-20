
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
    <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 md:p-8 mt-8 -mx-4 md:-mx-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Back Button */}
        {canGoBack ? (
          <Button
            variant="outline"
            onClick={onBack}
            className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[48px] px-4 md:px-6"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        ) : (
          <div className="w-[80px] md:w-[120px]" /> // Maintain layout spacing
        )}

        {/* Continue Button - Always prominent */}
        <Button
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          className={`
            px-6 md:px-8 py-3 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200
            min-h-[48px] min-w-[140px] md:min-w-[180px]
            ${canContinue 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
          `}
          aria-disabled={!canContinue}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span className="hidden sm:inline">Processing...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span>{getFinalStepText()}</span>
              {currentStep < totalSteps && <ArrowRight className="w-5 h-5 ml-2" />}
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
