
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
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

export interface PhotoUploadStepRef {
  triggerFileInput: () => boolean;
}

const PhotoUploadStep = forwardRef<PhotoUploadStepRef, PhotoUploadStepProps>(({
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
}, ref) => {
  const [isStep1Activated, setIsStep1Activated] = useState(false);
  const [isTriggerReady, setIsTriggerReady] = useState(false);
  const fileInputTriggerRef = useRef<(() => boolean) | null>(null);
  
  // Expose triggerFileInput method to parent
  useImperativeHandle(ref, () => ({
    triggerFileInput: () => {
      console.log('🎯 PhotoUploadStep triggerFileInput called', {
        hasTrigger: !!fileInputTriggerRef.current,
        isReady: isTriggerReady,
        isActive: shouldBeActive
      });
      
      if (fileInputTriggerRef.current) {
        const result = fileInputTriggerRef.current();
        console.log('🎯 File input trigger result:', result);
        return result;
      }
      
      console.log('❌ File input trigger not ready yet');
      return false;
    }
  }), [isTriggerReady]);

  // Handle file input trigger registration
  const handleFileInputTriggerReady = (triggerFn: () => boolean) => {
    console.log('🎯 File input trigger function registered and ready');
    fileInputTriggerRef.current = triggerFn;
    setIsTriggerReady(true);
  };
  
  const shouldBeActive = currentStep === 1 && isActive && isStep1Activated;
  
  const handleStepClick = () => {
    console.log('🎯 PhotoUploadStep clicked, activating step 1');
    setIsStep1Activated(true);
    onStepClick();
  };

  // Auto-activate when currentStep is 1 and isActive is true
  useEffect(() => {
    if (currentStep === 1 && isActive) {
      console.log('🎯 Auto-activating Step 1');
      setIsStep1Activated(true);
    }
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
          onFileInputTriggerReady={handleFileInputTriggerReady}
        />
      )}
    </ProductStepWrapper>
  );
});

PhotoUploadStep.displayName = 'PhotoUploadStep';

export default PhotoUploadStep;
