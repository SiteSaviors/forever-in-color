
import React, { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import PhotoUploadSection from "./PhotoUploadSection";
import StyleSelectionSection from "./StyleSelectionSection";
import PopularChoices from "./PopularChoices";
import { usePhotoUploadState } from "../hooks/usePhotoUploadState";

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
}

const PhotoUploadFlow = (props: PhotoUploadFlowProps) => {
  const { 
    selectedStyle, 
    uploadedImage, 
    selectedOrientation,
    onPhotoAndStyleComplete,
    onFileInputTriggerReady
  } = props;

  const fileInputTriggerRef = useRef<(() => boolean) | null>(null);

  // Register the trigger function when it becomes available
  const handleFileInputTriggerReady = useCallback((triggerFn: () => boolean) => {
    console.log('🎯 PhotoUploadFlow: File input trigger registered');
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

  const imageToDisplay = croppedImage || uploadedImage;

  return (
    <div className="space-y-8">
      <PhotoUploadSection
        hasImage={hasValidImage}
        croppedImage={imageToDisplay}
        onImageUpload={handleImageUpload}
        onFileInputTriggerReady={handleFileInputTriggerReady}
      />
      
      {hasValidImage && imageToDisplay && (
        <>
          <StyleSelectionSection
            hasImage={hasValidImage}
            croppedImage={imageToDisplay}
            selectedStyle={selectedStyle}
            cropAspectRatio={1}
            selectedOrientation={selectedOrientation}
            onStyleSelect={handleStyleSelect}
            onStyleComplete={onPhotoAndStyleComplete}
            onRecropImage={handleRecropImage}
          />
          
          <PopularChoices 
            selectedStyle={selectedStyle?.id || null}
            onStyleSelect={handleStyleSelect}
          />
        </>
      )}
    </div>
  );
};

export default PhotoUploadFlow;
