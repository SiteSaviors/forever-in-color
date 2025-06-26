
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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
    navigator.vibrate(50);
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

  const getButtonVariant = () => {
    if (currentStep === totalSteps) return "final";
    if (!canContinue) return "disabled";
    return "primary";
  };

  const buttonVariant = getButtonVariant();

  return (
    <div className="sticky bottom-0 bg-white/98 backdrop-blur-md border-t border-gray-100/80 p-4 md:p-6 mt-8 -mx-4 md:-mx-8 shadow-2xl z-50 transition-all duration-300">
      <div className="flex items-center justify-between max-w-4xl mx-auto gap-4">
        {/* Enhanced Back Button with smooth transitions */}
        {canGoBack ? (
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="text-gray-600 border-gray-300 hover:bg-gray-50 min-h-[52px] min-w-[120px] md:min-w-[140px] px-6 md:px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:-translate-y-0.5 active:scale-95"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-3 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="font-semibold">Back</span>
          </Button>
        ) : (
          <div className="w-[120px] md:w-[140px]" />
        )}

        {/* Enhanced Continue Button with state-based styling */}
        <div className="flex-1 max-w-sm">
          <Button
            onClick={handleContinueClick}
            disabled={!canContinue || isLoading}
            className={`
              w-full min-h-[60px] px-8 md:px-10 py-4 text-lg md:text-xl font-bold rounded-3xl
              transition-all duration-500 shadow-xl hover:shadow-2xl transform active:scale-95 relative overflow-hidden
              ${buttonVariant === "final" 
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white border-0 animate-pulse' 
                : buttonVariant === "primary"
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 hover:scale-[1.02]' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed border-0 shadow-none'}
            `}
            aria-disabled={!canContinue}
          >
            {/* Animated background for final step */}
            {buttonVariant === "final" && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse" />
            )}
            
            {/* Button content with enhanced loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center relative z-10">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-4" />
                <span className="font-bold tracking-wide">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center relative z-10">
                {/* Final step sparkle effect */}
                {buttonVariant === "final" && (
                  <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                )}
                
                <span className="font-bold tracking-wide text-center">
                  {getFinalStepText()}
                </span>
                
                {/* Animated arrow for continue states */}
                {currentStep < totalSteps && buttonVariant !== "disabled" && (
                  <ArrowRight className="w-6 h-6 ml-4 transition-transform duration-200 group-hover:translate-x-1" />
                )}
              </div>
            )}
            
            {/* Subtle shine effect for enabled buttons */}
            {buttonVariant !== "disabled" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;
