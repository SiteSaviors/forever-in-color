
import OrientationHeader from "./orientation/components/OrientationHeader";
import ValidationErrorAlert from "./orientation/components/ValidationErrorAlert";
import LivePreviewAlert from "./orientation/components/LivePreviewAlert";
import OrientationSelectionSection from "./orientation/components/OrientationSelectionSection";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { useOrientationSelector } from "./orientation/hooks/useOrientationSelector";
import { OrientationSelectorProps } from "./orientation/types";

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
    orientationSectionRef,
    sizeSectionRef,
    handleOrientationSelect,
    handleSizeSelect,
    handleContinueWithSize,
    handleContinueClick,
    recommendedOrientation,
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
      <OrientationHeader selectedOrientation={selectedOrientation} />

      {/* Validation Error Alert */}
      <ValidationErrorAlert validationError={validationError} />

      {/* Visual Connection Helper */}
      <LivePreviewAlert userImageUrl={userImageUrl} />

      {/* Orientation Selection Section */}
      <OrientationSelectionSection
        ref={orientationSectionRef}
        selectedOrientation={selectedOrientation}
        userImageUrl={userImageUrl}
        recommendedOrientation={recommendedOrientation}
        onOrientationSelect={handleOrientationSelect}
      />

      {/* Size Selection Section */}
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
