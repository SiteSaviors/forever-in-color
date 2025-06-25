
import OrientationHeader from "./orientation/components/OrientationHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import LayoutSelectionSection from "./orientation/components/LayoutSelectionSection";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import OrientationErrorBoundary from "./orientation/components/OrientationErrorBoundary";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { useOrientationState } from "./orientation/hooks/useOrientationState";
import { ExtendedOrientationSelectorProps } from "./orientation/types/interfaces";
import { useCallback } from "react";

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
    isUpdating,
    handleOrientationSelect,
    canContinueToNext
  } = useOrientationState({
    initialOrientation: selectedOrientation,
    initialSize: selectedSize,
    onOrientationChange,
    onSizeChange
  });

  // Optimized continue handler
  const handleContinue = useCallback(() => {
    if (onContinue && !isUpdating && canContinueToNext) {
      console.log('🚀 Continuing to next step');
      onContinue();
    }
  }, [onContinue, isUpdating, canContinueToNext]);

  return (
    <OrientationErrorBoundary>
      <div className="space-y-8 md:space-y-10">
        <OrientationHeader selectedOrientation={selectedOrientation} />

        {/* Smart Recommendations Panel */}
        {userImageUrl && (
          <div className="relative">
            <SmartRecommendations 
              selectedOrientation={selectedOrientation} 
              userImageUrl={userImageUrl} 
            />
          </div>
        )}

        {/* Layout Selection */}
        <LayoutSelectionSection
          selectedOrientation={selectedOrientation}
          userImageUrl={userImageUrl}
          onOrientationChange={handleOrientationSelect}
          isUpdating={isUpdating}
          disabled={isUpdating}
        />

        {/* Size Selection */}
        <SizeSelectionSection
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          userImageUrl={userImageUrl}
          onSizeChange={onSizeChange}
          onContinue={handleContinue}
          isUpdating={isUpdating}
          disabled={isUpdating}
        />

        {/* Step Navigation */}
        <StepNavigation
          canGoBack={canGoBack}
          canContinue={canContinueToNext}
          onBack={handleBackStep}
          onContinue={handleContinue}
          continueText="Continue to Customize"
          currentStep={currentStep}
          totalSteps={4}
          isLoading={isUpdating}
        />
      </div>
    </OrientationErrorBoundary>
  );
};

export default OrientationSelector;
