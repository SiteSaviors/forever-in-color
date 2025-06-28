
import React, { useImperativeHandle, forwardRef } from "react";
import PhotoUploadAndStyleSelection from "../PhotoUploadAndStyleSelection";
import ProductStepWrapper from "./ProductStepWrapper";
import { fileInputManager } from "@/utils/fileInputManager";

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
  
  // Expose direct global trigger to parent - no complex registration needed
  useImperativeHandle(ref, () => ({
    triggerFileInput: () => {
      console.log('🎯 PhotoUploadStep: Direct global trigger called');
      return fileInputManager.triggerFileInput();
    }
  }), []);
  
  // Step should be active when currentStep is 1
  const shouldBeActive = currentStep === 1;
  
  const handleStepClick = () => {
    console.log('🎯 PhotoUploadStep clicked');
    onStepClick();
  };
  
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
          onFileInputTriggerReady={() => {}} // No longer needed with global system
        />
      )}
    </ProductStepWrapper>
  );
});

PhotoUploadStep.displayName = 'PhotoUploadStep';

export default PhotoUploadStep;
