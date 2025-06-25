
import OrientationHeader from "./orientation/components/OrientationHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import LayoutSelectionSection from "./orientation/components/LayoutSelectionSection";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import OrientationErrorBoundary from "./orientation/components/OrientationErrorBoundary";
import ValidationMessage from "./orientation/components/ValidationMessage";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { useOrientationState } from "./orientation/hooks/useOrientationState";
import { useValidation } from "./orientation/hooks/useValidation";
import { useAccessibility } from "./orientation/hooks/useAccessibility";
import { ExtendedOrientationSelectorProps } from "./orientation/types/interfaces";
import { orientationOptions } from "./orientation/data/orientationOptions";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { useCallback, useMemo } from "react";

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

  const {
    validationErrors,
    isValid,
    canContinue,
    showErrors,
    validateAndShowErrors,
    clearErrors
  } = useValidation({
    selectedOrientation,
    selectedSize,
    isRequired: true
  });

  // Get available options for accessibility
  const orientationOptionIds = useMemo(() => 
    orientationOptions.map(opt => opt.id), 
    []
  );
  
  const availableSizeOptions = useMemo(() => 
    sizeOptions[selectedOrientation]?.map(opt => opt.size) || [], 
    [selectedOrientation]
  );

  const { announceSelection } = useAccessibility({
    selectedOrientation,
    selectedSize,
    orientationOptions: orientationOptionIds,
    sizeOptions: availableSizeOptions,
    onOrientationChange: handleOrientationSelect,
    onSizeChange,
    onContinue,
    disabled: isUpdating
  });

  // Enhanced orientation change handler with validation clearing
  const handleOrientationChangeWithValidation = useCallback((orientation: string) => {
    clearErrors();
    handleOrientationSelect(orientation);
    announceSelection('orientation', orientation);
  }, [handleOrientationSelect, clearErrors, announceSelection]);

  // Enhanced size change handler with validation clearing
  const handleSizeChangeWithValidation = useCallback((size: string) => {
    clearErrors();
    onSizeChange(size);
    announceSelection('size', size);
  }, [onSizeChange, clearErrors, announceSelection]);

  // Optimized continue handler with validation
  const handleContinue = useCallback(() => {
    if (!validateAndShowErrors()) {
      // Focus first error field for accessibility
      setTimeout(() => {
        const errorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
        errorField?.focus();
      }, 100);
      return;
    }

    if (onContinue && !isUpdating && canContinueToNext && canContinue) {
      console.log('🚀 Continuing to next step');
      onContinue();
    }
  }, [onContinue, isUpdating, canContinueToNext, canContinue, validateAndShowErrors]);

  return (
    <OrientationErrorBoundary>
      <div className="space-y-6 md:space-y-8">
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

        {/* Main validation messages */}
        <ValidationMessage 
          errors={validationErrors.filter(error => error.field === 'general')}
          showErrors={showErrors}
        />

        {/* Layout Selection */}
        <LayoutSelectionSection
          selectedOrientation={selectedOrientation}
          userImageUrl={userImageUrl}
          onOrientationChange={handleOrientationChangeWithValidation}
          isUpdating={isUpdating}
          disabled={isUpdating}
          validationErrors={validationErrors}
          showErrors={showErrors}
        />

        {/* Size Selection */}
        <SizeSelectionSection
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          userImageUrl={userImageUrl}
          onSizeChange={handleSizeChangeWithValidation}
          onContinue={handleContinue}
          isUpdating={isUpdating}
          disabled={isUpdating}
          validationErrors={validationErrors}
          showErrors={showErrors}
        />

        {/* Step Navigation */}
        <StepNavigation
          canGoBack={canGoBack}
          canContinue={canContinue && !isUpdating}
          onBack={handleBackStep}
          onContinue={handleContinue}
          continueText="Continue to Customize"
          currentStep={currentStep}
          totalSteps={4}
          isLoading={isUpdating}
        />

        {/* Screen reader announcements for validation */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {showErrors && validationErrors.length > 0 && (
            `Please correct ${validationErrors.filter(e => e.type === 'error').length} errors before continuing.`
          )}
        </div>
      </div>
    </OrientationErrorBoundary>
  );
};

export default OrientationSelector;
