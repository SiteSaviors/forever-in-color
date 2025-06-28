
import React, { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import PhotoUploadSection from "./PhotoUploadSection";
import StyleSelectionSection from "./StyleSelectionSection";
import PopularChoices from "./PopularChoices";
import { usePhotoUploadState } from "../hooks/usePhotoUploadState";

interface GlobalUploadState {
  isUploading: boolean;
  uploadProgress: number;
  processingStage: string;
}

interface PhotoUploadFlowProps {
  selectedStyle: { id: number; name: string } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
  onFileInputTriggerReady?: (triggerFn: () => boolean) => void;
  globalUploadState?: GlobalUploadState;
}

const PhotoUploadFlow = (props: PhotoUploadFlowProps) => {
  const { 
    selectedStyle, 
    uploadedImage, 
    selectedOrientation,
    onPhotoAndStyleComplete,
    onFileInputTriggerReady,
    globalUploadState
  } = props;

  const fileInputTriggerRef = useRef<(() => boolean) | null>(null);

  // Register the trigger function when it becomes available (legacy support)
  const handleFileInputTriggerReady = useCallback((triggerFn: () => boolean) => {
    console.log('🎯 PhotoUploadFlow: File input trigger registered (legacy)');
    fileInputTriggerRef.current = triggerFn;
    onFileInputTriggerReady?.(triggerFn);
  }, [onFileInputTriggerReady]);

  const {
    croppedImage,
    hasValidImage,
    handleImageUpload,
    handleStyleSelect,
    handleRecropImage
  } = usePhotoUploadState({
    selectedStyle,
    onComplete: onPhotoAndStyleComplete
  });

  // Use the uploaded image from props (from global state) if available, otherwise use cropped image
  const imageToDisplay = uploadedImage || croppedImage;
  const shouldShowImage = !!uploadedImage || hasValidImage;

  console.log('🎯 PhotoUploadFlow Debug:', {
    uploadedImage: !!uploadedImage,
    croppedImage: !!croppedImage,
    hasValidImage,
    shouldShowImage,
    imageToDisplay: !!imageToDisplay
  });

  return (
    <div className="space-y-8">
      <PhotoUploadSection
        hasImage={shouldShowImage}
        croppedImage={imageToDisplay}
        onImageUpload={handleImageUpload}
        onFileInputTriggerReady={handleFileInputTriggerReady}
        globalUploadState={globalUploadState}
      />
      
      {shouldShowImage && imageToDisplay && (
        <>
          <StyleSelectionSection
            hasImage={shouldShowImage}
            croppedImage={imageToDisplay}
            selectedStyle={selectedStyle}
            cropAspectRatio={1}
            selectedOrientation={selectedOrientation}
            onStyleSelect={handleStyleSelect}
            onStyleComplete={onPhotoAndStyleComplete}
            onRecropImage={handleRecropImage}
          />
          
          <PopularChoices 
            recommendations={[]}
            croppedImage={imageToDisplay}
            selectedStyle={selectedStyle?.id || null}
            cropAspectRatio={1}
            selectedOrientation={selectedOrientation}
            onStyleSelect={handleStyleSelect}
            onComplete={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default PhotoUploadFlow;
