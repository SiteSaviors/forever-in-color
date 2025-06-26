
import OrientationHeader from "./orientation/components/OrientationHeader";
import SizeHeader from "./orientation/components/SizeHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import StepNavigation from "./components/StepNavigation";
import ValidationErrorAlert from "./orientation/components/ValidationErrorAlert";
import LivePreviewAlert from "./orientation/components/LivePreviewAlert";
import OrientationGrid from "./orientation/components/OrientationGrid";
import SizeTransitionIndicator from "./orientation/components/SizeTransitionIndicator";
import SizeGrid from "./orientation/components/SizeGrid";
import PriceUpdateDisplay from "./orientation/components/PriceUpdateDisplay";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { OrientationSelectorProps } from "./orientation/types";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

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

  const [validationError, setValidationError] = useState<string | null>(null);
  const orientationSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);

  // Reset validation error when selections change
  useEffect(() => {
    if (selectedOrientation && selectedSize) {
      setValidationError(null);
    }
  }, [selectedOrientation, selectedSize]);

  // Optimized handlers with useCallback to prevent re-renders
  const handleOrientationSelect = useCallback((orientation: string) => {
    setValidationError(null);
    onOrientationChange(orientation);
    // Reset size when orientation changes
    onSizeChange("");
    
    // Scroll to size section after orientation is selected
    if (sizeSectionRef.current) {
      setTimeout(() => {
        sizeSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }
  }, [onOrientationChange, onSizeChange]);
  
  const handleSizeSelect = useCallback((size: string) => {
    setValidationError(null);
    onSizeChange(size);
  }, [onSizeChange]);
  
  const handleContinueWithSize = useCallback((size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSizeChange(size);
    handleContinueClick();
  }, [onSizeChange]);

  const handleContinueClick = useCallback(() => {
    if (!selectedOrientation) {
      setValidationError("Please select an orientation before continuing");
      // Scroll to orientation section
      if (orientationSectionRef.current) {
        orientationSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }
    
    if (!selectedSize) {
      setValidationError("Please select a size before continuing");
      // Scroll to size section
      if (sizeSectionRef.current) {
        sizeSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }
    
    setValidationError(null);
    if (onContinue) {
      onContinue();
    }
  }, [selectedOrientation, selectedSize, onContinue]);

  // Memoize expensive calculations
  const getRecommendedOrientation = useCallback(() => {
    if (!userImageUrl) return 'square';
    // This would analyze the image aspect ratio in a real implementation
    return 'square';
  }, [userImageUrl]);

  const getRecommendedSize = useCallback((orientation: string) => {
    const recommendations = {
      'square': '16" x 16"',
      'horizontal': '18" x 24"',
      'vertical': '16" x 20"'
    };
    return recommendations[orientation as keyof typeof recommendations] || '';
  }, []);
  
  const recommendedOrientation = useMemo(() => getRecommendedOrientation(), [getRecommendedOrientation]);
  const recommendedSize = useMemo(() => getRecommendedSize(selectedOrientation), [getRecommendedSize, selectedOrientation]);

  const canContinueToNext = useMemo(() => Boolean(selectedOrientation && selectedSize), [selectedOrientation, selectedSize]);

  // Get the current size option details for price display
  const getCurrentSizeOption = useCallback(() => {
    if (!selectedOrientation || !selectedSize) return null;
    return sizeOptions[selectedOrientation]?.find(opt => opt.size === selectedSize);
  }, [selectedOrientation, selectedSize]);

  const currentSizeOption = useMemo(() => getCurrentSizeOption(), [getCurrentSizeOption]);

  return (
    <div className="space-y-10">
      <OrientationHeader selectedOrientation={selectedOrientation} />

      {/* Validation Error Alert */}
      <ValidationErrorAlert validationError={validationError} />

      {/* Visual Connection Helper */}
      <LivePreviewAlert userImageUrl={userImageUrl} />

      {/* Smart Recommendations Panel */}
      {userImageUrl && (
        <div className="relative">
          <SmartRecommendations selectedOrientation={selectedOrientation} userImageUrl={userImageUrl} />
        </div>
      )}

      {/* Orientation Selection Section */}
      <div ref={orientationSectionRef}>
        <OrientationGrid
          selectedOrientation={selectedOrientation}
          userImageUrl={userImageUrl}
          onOrientationSelect={handleOrientationSelect}
          recommendedOrientation={recommendedOrientation}
        />
      </div>

      {/* Smooth transition indicator */}
      <SizeTransitionIndicator selectedOrientation={selectedOrientation} />

      {/* Size Selection Section - Optimized grid */}
      {selectedOrientation && (
        <>
          <SizeHeader />
          <div ref={sizeSectionRef}>
            <SizeGrid
              selectedOrientation={selectedOrientation}
              selectedSize={selectedSize}
              recommendedSize={recommendedSize}
              onSizeSelect={handleSizeSelect}
              onContinueWithSize={handleContinueWithSize}
            />
          </div>

          {/* Real-time Price Update */}
          <PriceUpdateDisplay
            selectedSize={selectedSize}
            currentSizeOption={currentSizeOption}
          />
        </>
      )}

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
