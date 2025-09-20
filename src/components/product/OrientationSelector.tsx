
import OrientationHeader from "./orientation/components/OrientationHeader";
import ValidationErrorAlert from "./orientation/components/ValidationErrorAlert";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { useOrientationSelector } from "./orientation/hooks/useOrientationSelector";
import { OrientationSelectorProps } from "./orientation/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface ExtendedOrientationSelectorProps extends OrientationSelectorProps {
  userImageUrl?: string | null;
  currentStep?: number;
  completedSteps?: number[];
  onStepChange?: (step: number) => void;
}

const OrientationSelector = ({
  selectedOrientation,
  selectedSize,
  userImageUrl = null,
  onOrientationChange,
  onSizeChange,
  onContinue,
  currentStep = 2,
  completedSteps = [],
  onStepChange = () => {}
}: ExtendedOrientationSelectorProps) => {
  
  const { canGoBack, handleBackStep } = useBackNavigation({
    currentStep,
    completedSteps,
    onStepChange
  });

  const {
    validationError,
    sizeSectionRef,
    handleSizeSelect,
    handleContinueWithSize,
    handleContinueClick,
    recommendedSize,
    canContinueToNext,
    currentSizeOption
  } = useOrientationSelector({
    selectedOrientation,
    selectedSize,
    userImageUrl,
    onOrientationChange,
    onSizeChange,
    onContinue
  });

  return (
    <div className="space-y-10">
      {/* Confirmation Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-green-100 text-green-700 font-medium">
          <CheckCircle className="w-4 h-4 mr-2" />
          Canvas Orientation Selected: {selectedOrientation}
        </Badge>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Perfect! Now Choose Your Size</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your {selectedOrientation} canvas orientation has been locked in from Step 1. 
            Now select the perfect size for your artwork.
          </p>
        </div>
      </div>

      {/* Validation Error Alert */}
      <ValidationErrorAlert validationError={validationError} />

      {/* Size Selection Section - This is now the main focus */}
      <SizeSelectionSection
        ref={sizeSectionRef}
        selectedOrientation={selectedOrientation}
        selectedSize={selectedSize}
        recommendedSize={recommendedSize}
        currentSizeOption={currentSizeOption}
        onSizeSelect={handleSizeSelect}
        onContinueWithSize={handleContinueWithSize}
      />

      {/* Step Navigation */}
      <StepNavigation
        canGoBack={canGoBack}
        canContinue={canContinueToNext}
        onBack={handleBackStep}
        onContinue={handleContinueClick}
        continueText="Continue to Customize"
        currentStep={currentStep}
        totalSteps={4}
      />
    </div>
  );
};

export default OrientationSelector;
