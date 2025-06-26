
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

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // Light haptic feedback
  }
};

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

  const handleBackClick = () => {
    triggerHapticFeedback();
    onBack();
  };

  const handleContinueClick = () => {
    triggerHapticFeedback();
    onContinue();
  };

  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 mt-8 -mx-4 md:-mx-8 shadow-lg">
      <div className="flex items-center justify-between max-w-4xl mx-auto gap-4">
        {/* Back Button - Enhanced touch target */}
        {canGoBack ? (
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[48px] min-w-[100px] md:min-w-[120px] px-4 md:px-6 rounded-xl transition-all duration-200 hover:shadow-md"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">Back</span>
          </Button>
        ) : (
          <div className="w-[100px] md:w-[120px]" />
        )}

        {/* Continue Button - Premium card-style with enhanced touch target */}
        <div className="flex-1 max-w-xs">
          <Button
            onClick={handleContinueClick}
            disabled={!canContinue || isLoading}
            className={`
              w-full min-h-[56px] px-6 md:px-8 py-4 text-base md:text-lg font-semibold rounded-2xl
              transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
              ${canContinue 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed border-0'}
            `}
            aria-disabled={!canContinue}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="font-semibold tracking-wide">{getFinalStepText()}</span>
                {currentStep < totalSteps && <ArrowRight className="w-5 h-5 ml-3" />}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;
