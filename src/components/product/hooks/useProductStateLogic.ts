
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CustomizationOptions } from "../types/productState";
import { detectOrientationFromImage } from "../utils/orientationDetection";
import { usePreviewGeneration } from "./usePreviewGeneration";

export const useProductStateLogic = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<{id: number, name: string} | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("square");
  const [customizations, setCustomizations] = useState<CustomizationOptions>({
    floatingFrame: {
      enabled: false,
      color: 'white'
    },
    livingMemory: false,
    voiceMatch: false,
    customMessage: '',
    aiUpscale: false
  });

  const {
    previewUrls,
    autoGenerationComplete,
    setPreviewUrls,
    setAutoGenerationComplete
  } = usePreviewGeneration(uploadedImage, selectedOrientation);

  // Handle pre-selected style from style landing pages
  useEffect(() => {
    if (location.state?.preSelectedStyle && location.state?.styleName) {
      setSelectedStyle({
        id: location.state.preSelectedStyle,
        name: location.state.styleName
      });
    }
  }, [location.state]);

  const handlePhotoAndStyleComplete = async (imageUrl: string, styleId: number, styleName: string) => {
    console.log('ProductStateManager handlePhotoAndStyleComplete called with:', { imageUrl, styleId, styleName });
    
    setUploadedImage(imageUrl);
    setSelectedStyle({ id: styleId, name: styleName });
    
    // 🎯 GENIUS FEATURE: Auto-detect canvas orientation from image dimensions
    try {
      const detectedOrientation = await detectOrientationFromImage(imageUrl);
      setSelectedOrientation(detectedOrientation);
    } catch (error) {
      console.error('Error detecting orientation:', error);
    }
    
    // Mark step 1 as completed
    if (!completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
    }
    
    // Advance to step 2
    console.log('Advancing to step 2');
    setCurrentStep(2);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (!completedSteps.includes(2)) {
      setCompletedSteps([...completedSteps, 2]);
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    console.log('Orientation manually changed to:', orientation);
    setSelectedOrientation(orientation);
    // Reset size when orientation changes
    setSelectedSize("");
    // Remove step 2 completion if it was completed, since we're changing orientation
    if (completedSteps.includes(2)) {
      setCompletedSteps(completedSteps.filter(step => step !== 2));
    }
    
    // Clear existing previews when orientation changes to regenerate with new aspect ratio
    console.log('Clearing existing previews due to orientation change');
    setPreviewUrls({});
    setAutoGenerationComplete(false);
    
    // Go back to step 1 to allow re-cropping if needed
    setCurrentStep(1);
    
    // Clear completed step 1 so user can recrop if needed
    setCompletedSteps(prev => prev.filter(step => step !== 1));
  };

  const handleCustomizationChange = (newCustomizations: CustomizationOptions) => {
    setCustomizations(newCustomizations);
    if (!completedSteps.includes(3)) {
      setCompletedSteps([...completedSteps, 3]);
    }
  };

  const canProceedToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return completedSteps.includes(1);
    if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);
    if (step === 4) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
    return false;
  };

  return {
    currentStep,
    completedSteps,
    selectedStyle,
    uploadedImage,
    selectedSize,
    selectedOrientation,
    customizations,
    previewUrls,
    autoGenerationComplete,
    setCurrentStep,
    handlePhotoAndStyleComplete,
    handleSizeSelect,
    handleOrientationSelect,
    handleCustomizationChange,
    canProceedToStep
  };
};
