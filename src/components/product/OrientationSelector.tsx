
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
import { useStepPersistence } from "./orientation/hooks/useStepPersistence";
import { ExtendedOrientationSelectorProps, PersistedStepData } from "./orientation/types/interfaces";
import { orientationOptions } from "./orientation/data/orientationOptions";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { useCallback, useMemo, useEffect } from "react";

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
    handleSizeSelect,
    canContinueToNext,
    cleanup
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

  // Data persistence handling
  const handleDataRestore = useCallback((data: PersistedStepData) => {
    console.log('🔄 Restoring Step 2 data from storage:', data);
    
    if (data.selectedOrientation && data.selectedOrientation !== selectedOrientation) {
      onOrientationChange(data.selectedOrientation);
    }
    
    if (data.selectedSize && data.selectedSize !== selectedSize) {
      onSizeChange(data.selectedSize);
    }
  }, [selectedOrientation, selectedSize, onOrientationChange, onSizeChange]);

  const { saveData, clearData } = useStepPersistence({
    selectedOrientation,
    selectedSize,
    onDataRestore: handleDataRestore
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
    onSizeChange: handleSizeSelect,
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
    handleSizeSelect(size);
    announceSelection('size', size);
  }, [handleSizeSelect, clearErrors, announceSelection]);

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
      saveData(); // Ensure data is saved before continuing
      onContinue();
    }
  }, [onContinue, isUpdating, canContinueToNext, canContinue, validateAndShowErrors, saveData]);

  // Error boundary handlers
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying Step 2 after error');
    clearErrors();
    // Force re-render by clearing and restoring data
    const currentData = { selectedOrientation, selectedSize };
    setTimeout(() => {
      if (currentData.selectedOrientation) {
        onOrientationChange(currentData.selectedOrientation);
      }
      if (currentData.selectedSize) {
        onSizeChange(currentData.selectedSize);
      }
    }, 100);
  }, [selectedOrientation, selectedSize, onOrientationChange, onSizeChange, clearErrors]);

  const handleGoBack = useCallback(() => {
    console.log('🔙 Going back from Step 2');
    saveData(); // Save current progress
    handleBackStep();
  }, [saveData, handleBackStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <OrientationErrorBoundary 
      onRetry={handleRetry}
      onGoBack={handleGoBack}
    >
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
          onBack={handleGoBack}
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
