
import React, { useState, useEffect } from "react";
import PhotoUploadAndStyleSelection from "../PhotoUploadAndStyleSelection";
import ProductStepWrapper from "./ProductStepWrapper";

interface PhotoUploadStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  selectedStyle: { id: number; name: string } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onStepClick: () => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

const PhotoUploadStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onStepClick,
  onPhotoAndStyleComplete,
  onContinue,
  completedSteps,
  onStepChange
}: PhotoUploadStepProps) => {
  // Track if step 1 has been explicitly activated (by hero button or step click)
  const [isStep1Activated, setIsStep1Activated] = useState(false);
  const [shouldTriggerFileInput, setShouldTriggerFileInput] = useState(false);
  
  // Step 1 should only be active if it's been explicitly activated AND currentStep is 1
  const shouldBeActive = currentStep === 1 && isActive && isStep1Activated;
  
  const handleStepClick = () => {
    setIsStep1Activated(true);
    onStepClick();
  };

  // Listen for hero button activation
  useEffect(() => {
    const handleHeroActivation = () => {
      console.log('🎯 Hero button activated - setting up Step 1');
      if (currentStep === 1 && isActive) {
        setIsStep1Activated(true);
        setShouldTriggerFileInput(true);
      }
    };
    
    // Custom event listener for hero button click
    window.addEventListener('heroButtonClicked', handleHeroActivation);
    
    return () => {
      window.removeEventListener('heroButtonClicked', handleHeroActivation);
    };
  }, [currentStep, isActive]);

  // Trigger file input when step becomes active via hero button
  useEffect(() => {
    if (shouldBeActive && shouldTriggerFileInput) {
      console.log('🎯 Step 1 is now active, triggering file input...');
      
      // Wait a bit for the component to fully render
      const timer = setTimeout(() => {
        const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
        if (fileInput) {
          console.log('✅ Found and clicking file input');
          fileInput.click();
          setShouldTriggerFileInput(false); // Reset flag
        } else {
          console.log('❌ File input not found yet');
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [shouldBeActive, shouldTriggerFileInput]);
  
  return (
    <ProductStepWrapper
      stepNumber={1}
      title="Upload Photo & Choose Style"
      description="Upload your photo and select an art style"
      isActive={shouldBeActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={handleStepClick}
      selectedStyle={selectedStyle}
    >
      {/* Only render content when step is truly active */}
      {shouldBeActive && (
        <PhotoUploadAndStyleSelection
          selectedStyle={selectedStyle}
          uploadedImage={uploadedImage}
          selectedOrientation={selectedOrientation}
          autoGenerationComplete={autoGenerationComplete}
          onComplete={onPhotoAndStyleComplete}
          onPhotoAndStyleComplete={onPhotoAndStyleComplete}
          onContinue={onContinue}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={onStepChange}
        />
      )}
    </ProductStepWrapper>
  );
};

export default PhotoUploadStep;
