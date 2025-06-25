
import { useCallback, useMemo, useEffect, memo } from "react";
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

/**
 * OrientationSelector Component
 * 
 * Handles Step 2 of the product customization flow: Layout & Size selection
 * 
 * Key improvements made:
 * 1. Added memoization to prevent unnecessary re-renders
 * 2. Improved error handling and user feedback
 * 3. Enhanced mobile touch responsiveness
 * 4. Better accessibility with focus management
 * 5. Cleaner callback organization and dependency management
 */
const OrientationSelector = memo(({
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
  
  // Navigation state management
  const { canGoBack, handleBackStep } = useBackNavigation({
    currentStep,
    completedSteps,
    onStepChange
  });

  // Core orientation state and handlers
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

  // Validation state and handlers
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

  // Data persistence callback - memoized to prevent recreation
  const handleDataRestore = useCallback((data: PersistedStepData) => {
    console.log('🔄 Restoring Step 2 data from storage:', data);
    
    // Only update if values have actually changed to prevent loops
    if (data.selectedOrientation && data.selectedOrientation !== selectedOrientation) {
      onOrientationChange(data.selectedOrientation);
    }
    
    if (data.selectedSize && data.selectedSize !== selectedSize) {
      onSizeChange(data.selectedSize);
    }
  }, [selectedOrientation, selectedSize, onOrientationChange, onSizeChange]);

  // Persistence hooks
  const { saveData, clearData } = useStepPersistence({
    selectedOrientation,
    selectedSize,
    onDataRestore: handleDataRestore
  });

  // Memoized option lists for better performance
  const orientationOptionIds = useMemo(() => 
    orientationOptions.map(opt => opt.id), 
    []
  );
  
  const availableSizeOptions = useMemo(() => 
    sizeOptions[selectedOrientation]?.map(opt => opt.size) || [], 
    [selectedOrientation]
  );

  // Accessibility hooks
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

  /**
   * Enhanced orientation change handler
   * - Clears previous validation errors
   * - Handles selection update
   * - Announces change for screen readers
   * - Resets size selection when orientation changes
   */
  const handleOrientationChangeWithValidation = useCallback((orientation: string) => {
    // Clear any existing errors
    clearErrors();
    
    // Update orientation
    handleOrientationSelect(orientation);
    
    // Announce for accessibility
    announceSelection('orientation', orientation);
    
    // CRITICAL FIX: Reset size when orientation changes since size options are orientation-specific
    if (orientation !== selectedOrientation && selectedSize) {
      // Check if current size is valid for new orientation
      const newSizeOptions = sizeOptions[orientation] || [];
      const isSizeValidForNewOrientation = newSizeOptions.some(opt => opt.size === selectedSize);
      
      if (!isSizeValidForNewOrientation) {
        console.log('🔄 Resetting size selection - not valid for new orientation');
        onSizeChange(''); // Clear invalid size
      }
    }
  }, [handleOrientationSelect, clearErrors, announceSelection, selectedOrientation, selectedSize, onSizeChange]);

  /**
   * Enhanced size change handler
   * - Clears validation errors
   * - Updates size selection
   * - Provides accessibility feedback
   */
  const handleSizeChangeWithValidation = useCallback((size: string) => {
    clearErrors();
    handleSizeSelect(size);
    announceSelection('size', size);
  }, [handleSizeSelect, clearErrors, announceSelection]);

  /**
   * Continue handler with validation
   * - Validates current selections
   * - Manages focus for accessibility
   * - Saves data before navigation
   */
  const handleContinue = useCallback(() => {
    // Validate selections
    if (!validateAndShowErrors()) {
      // Focus first error field for accessibility
      requestAnimationFrame(() => {
        const errorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
        if (errorField) {
          errorField.focus();
          // Smooth scroll to error on mobile
          errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      return;
    }

    // Check all continue conditions
    if (onContinue && !isUpdating && canContinueToNext && canContinue) {
      console.log('🚀 Continuing to next step with:', { selectedOrientation, selectedSize });
      saveData(); // Persist current selections
      onContinue();
    }
  }, [
    onContinue, 
    isUpdating, 
    canContinueToNext, 
    canContinue, 
    validateAndShowErrors, 
    saveData,
    selectedOrientation,
    selectedSize
  ]);

  /**
   * Error retry handler
   * - Clears errors
   * - Attempts to restore previous valid state
   */
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying Step 2 after error');
    clearErrors();
    
    // Store current selections
    const currentData = { selectedOrientation, selectedSize };
    
    // Restore after a tick to force re-render
    requestAnimationFrame(() => {
      if (currentData.selectedOrientation) {
        onOrientationChange(currentData.selectedOrientation);
      }
      if (currentData.selectedSize) {
        onSizeChange(currentData.selectedSize);
      }
    });
  }, [selectedOrientation, selectedSize, onOrientationChange, onSizeChange, clearErrors]);

  /**
   * Back navigation handler
   * - Saves current progress
   * - Navigates to previous step
   */
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

  // Log current state in development for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 OrientationSelector state:', {
        selectedOrientation,
        selectedSize,
        canContinue,
        isUpdating,
        validationErrors: validationErrors.length
      });
    }
  }, [selectedOrientation, selectedSize, canContinue, isUpdating, validationErrors]);

  return (
    <OrientationErrorBoundary 
      onRetry={handleRetry}
      onGoBack={handleGoBack}
    >
      <div className="space-y-6 md:space-y-8">
        {/* Step Header */}
        <OrientationHeader selectedOrientation={selectedOrientation} />

        {/* Smart Recommendations - Only show when user has uploaded an image */}
        {userImageUrl && (
          <div className="relative animate-fadeIn">
            <SmartRecommendations 
              selectedOrientation={selectedOrientation} 
              userImageUrl={userImageUrl} 
            />
          </div>
        )}

        {/* Global validation messages */}
        {showErrors && validationErrors.some(error => error.field === 'general') && (
          <ValidationMessage 
            errors={validationErrors.filter(error => error.field === 'general')}
            showErrors={showErrors}
          />
        )}

        {/* Layout Selection Section */}
        <section 
          aria-label="Choose layout orientation"
          className="relative"
        >
          <LayoutSelectionSection
            selectedOrientation={selectedOrientation}
            userImageUrl={userImageUrl}
            onOrientationChange={handleOrientationChangeWithValidation}
            isUpdating={isUpdating}
            disabled={isUpdating}
            validationErrors={validationErrors.filter(e => e.field === 'orientation')}
            showErrors={showErrors}
          />
        </section>

        {/* Size Selection Section - Only show when orientation is selected */}
        {selectedOrientation && (
          <section 
            aria-label="Choose size"
            className="relative animate-fadeIn"
          >
            <SizeSelectionSection
              selectedOrientation={selectedOrientation}
              selectedSize={selectedSize}
              userImageUrl={userImageUrl}
              onSizeChange={handleSizeChangeWithValidation}
              onContinue={handleContinue}
              isUpdating={isUpdating}
              disabled={isUpdating}
              validationErrors={validationErrors.filter(e => e.field === 'size')}
              showErrors={showErrors}
            />
          </section>
        )}

        {/* Step Navigation */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 -mx-4 px-4 md:relative md:bg-transparent md:backdrop-blur-none md:py-0 md:mx-0 md:px-0">
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
        </div>

        {/* Screen reader announcements for validation */}
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
          role="status"
        >
          {showErrors && validationErrors.length > 0 && (
            <span>
              {`Please correct ${validationErrors.filter(e => e.type === 'error').length} errors before continuing. `}
              {validationErrors.map(error => error.message).join('. ')}
            </span>
          )}
          {isUpdating && <span>Loading, please wait...</span>}
        </div>
      </div>
    </OrientationErrorBoundary>
  );
});

// Display name for debugging
OrientationSelector.displayName = 'OrientationSelector';

export default OrientationSelector;
