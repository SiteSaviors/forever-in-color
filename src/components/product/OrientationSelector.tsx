
import OrientationHeader from "./orientation/components/OrientationHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import LayoutSelectionSection from "./orientation/components/LayoutSelectionSection";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import OrientationErrorBoundary from "./orientation/components/OrientationErrorBoundary";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { OrientationSelectorProps } from "./orientation/types";
import { useState, useCallback, useMemo } from "react";

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

  // Memoize the orientation change handler to prevent unnecessary re-renders
  const handleOrientationSelect = useCallback((orientation: string) => {
    if (isUpdating) return;
    
    console.log('🐛 Orientation change initiated:', orientation);
    setIsUpdating(true);
    
    // Batch the state updates to prevent glitches
    onOrientationChange(orientation);
    onSizeChange(""); // Reset size when orientation changes
    
    // Use requestAnimationFrame to ensure smooth transitions
    requestAnimationFrame(() => {
      setIsUpdating(false);
    });
  }, [onOrientationChange, onSizeChange, isUpdating]);

  // Memoize navigation state to prevent unnecessary calculations
  const canContinueToNext = useMemo(() => {
    return Boolean(selectedOrientation && selectedSize && !isUpdating);
  }, [selectedOrientation, selectedSize, isUpdating]);

  // Debounced continue handler
  const handleContinue = useCallback(() => {
    if (onContinue && !isUpdating && canContinueToNext) {
      console.log('🐛 Continuing to next step');
      onContinue();
    }
  }, [onContinue, isUpdating, canContinueToNext]);

  return (
    <OrientationErrorBoundary>
      <div className="space-y-8 md:space-y-10">
        <OrientationHeader selectedOrientation={selectedOrientation} />

        {/* Smart Recommendations Panel - Only show if user has image */}
        {userImageUrl && (
          <div className="relative">
            <SmartRecommendations 
              selectedOrientation={selectedOrientation} 
              userImageUrl={userImageUrl} 
            />
          </div>
        )}

        {/* Layout Selection with improved performance */}
        <LayoutSelectionSection
          selectedOrientation={selectedOrientation}
          userImageUrl={userImageUrl}
          onOrientationChange={handleOrientationSelect}
          isUpdating={isUpdating}
        />

        {/* Size Selection with glitch fixes */}
        <SizeSelectionSection
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          userImageUrl={userImageUrl}
          onSizeChange={onSizeChange}
          onContinue={handleContinue}
          isUpdating={isUpdating}
        />

        {/* Step Navigation with improved state management */}
        <StepNavigation
          canGoBack={canGoBack}
          canContinue={canContinueToNext}
          onBack={handleBackStep}
          onContinue={handleContinue}
          continueText="Continue to Customize"
          currentStep={currentStep}
          totalSteps={4}
        />
      </div>
    </OrientationErrorBoundary>
  );
};

export default OrientationSelector;
