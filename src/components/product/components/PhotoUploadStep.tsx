
import React, { useState } from "react";
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
  
  // Step 1 should only be active if it's been explicitly activated AND currentStep is 1
  const shouldBeActive = currentStep === 1 && isActive && isStep1Activated;
  
  const handleStepClick = () => {
    setIsStep1Activated(true);
    onStepClick();
  };

  // Listen for hero button activation
  React.useEffect(() => {
    const handleHeroActivation = () => {
      if (currentStep === 1 && isActive) {
        setIsStep1Activated(true);
      }
    };
    
    // Custom event listener for hero button click
    window.addEventListener('heroButtonClicked', handleHeroActivation);
    
    return () => {
      window.removeEventListener('heroButtonClicked', handleHeroActivation);
    };
  }, [currentStep, isActive]);
  
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
