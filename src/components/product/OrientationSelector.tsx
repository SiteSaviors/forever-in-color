
import OrientationHeader from "./orientation/components/OrientationHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import LayoutSelectionSection from "./orientation/components/LayoutSelectionSection";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import OrientationErrorBoundary from "./orientation/components/OrientationErrorBoundary";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { OrientationSelectorProps } from "./orientation/types";
import { useState, useCallback } from "react";

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

  const [isUpdating, setIsUpdating] = useState(false);

  const handleOrientationSelect = useCallback((orientation: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    onOrientationChange(orientation);
    onSizeChange(""); // Reset size when orientation changes
    
    setTimeout(() => setIsUpdating(false), 200);
  }, [onOrientationChange, onSizeChange, isUpdating]);

  const canContinueToNext = Boolean(selectedOrientation && selectedSize && !isUpdating);

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
        />

        {/* Size Selection */}
        <SizeSelectionSection
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          userImageUrl={userImageUrl}
          onSizeChange={onSizeChange}
          onContinue={onContinue}
          isUpdating={isUpdating}
        />

        {/* Step Navigation */}
        <StepNavigation
          canGoBack={canGoBack}
          canContinue={canContinueToNext}
          onBack={handleBackStep}
          onContinue={() => {
            if (onContinue && !isUpdating) onContinue();
          }}
          continueText="Continue to Customize"
          currentStep={currentStep}
          totalSteps={4}
        />
      </div>
    </OrientationErrorBoundary>
  );
};

export default OrientationSelector;
