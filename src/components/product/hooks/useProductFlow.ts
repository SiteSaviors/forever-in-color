
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CustomizationOptions } from "../types/productState";
import { detectOrientationFromImage } from "../utils/orientationDetection";
import { usePreviewGeneration } from "./usePreviewGeneration";

export const useProductFlow = () => {
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
      console.log('🐛 Pre-selected style detected:', location.state);
      setSelectedStyle({
        id: location.state.preSelectedStyle,
        name: location.state.styleName
      });
    }
  }, [location.state]);

  const handlePhotoAndStyleComplete = async (imageUrl: string, styleId: number, styleName: string, orientation?: string) => {
    console.log('🐛 ProductFlow handlePhotoAndStyleComplete called with:', { imageUrl, styleId, styleName, orientation });
    
    setUploadedImage(imageUrl);
    
    // Set orientation if provided (from unified canvas selection)
    if (orientation) {
      console.log('🎯 Setting orientation from unified selection:', orientation);
      setSelectedOrientation(orientation);
    } else {
      // Fallback to auto-detection for backward compatibility
      try {
        const detectedOrientation = await detectOrientationFromImage(imageUrl);
        console.log('🐛 Auto-detected orientation (fallback):', detectedOrientation);
        setSelectedOrientation(detectedOrientation);
      } catch (error) {
        console.error('🐛 Error detecting orientation:', error);
      }
    }
    
    // Only set the style if it's not a temporary style from photo upload
    if (styleName !== "temp-style") {
      setSelectedStyle({ id: styleId, name: styleName });
    }
    
    // Mark step 1 as completed when user has both image AND style
    if (styleName !== "temp-style" && imageUrl) {
      console.log('🐛 Marking step 1 as completed');
      setCompletedSteps(prev => {
        const newCompleted = prev.includes(1) ? prev : [...prev, 1];
        console.log('🐛 New completed steps:', newCompleted);
        return newCompleted;
      });
    } else {
      console.log('🐛 Photo uploaded but no style selected yet, staying on step 1');
    }
  };

  const handleSizeSelect = (size: string) => {
    console.log('🐛 Size selected:', size);
    setSelectedSize(size);
    
    // Mark step 2 as completed when size is selected (orientation already set in step 1)
    if (selectedOrientation && size) {
      console.log('🐛 Marking step 2 as completed');
      setCompletedSteps(prev => {
        const newCompleted = prev.includes(2) ? prev : [...prev, 2];
        console.log('🐛 New completed steps after size select:', newCompleted);
        return newCompleted;
      });
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    console.log('🐛 Orientation manually changed to (should be rare now):', orientation);
    setSelectedOrientation(orientation);
    
    // Reset size when orientation changes
    setSelectedSize("");
    
    // Remove step 2 completion if it was completed, since we're changing orientation
    setCompletedSteps(prev => {
      const filtered = prev.filter(step => step !== 2);
      console.log('🐛 Removed step 2 completion due to orientation change:', filtered);
      return filtered;
    });
    
    // Clear existing previews when orientation changes to regenerate with new aspect ratio
    console.log('🐛 Clearing existing previews due to orientation change');
    setPreviewUrls({});
    setAutoGenerationComplete(false);
  };

  const handleCustomizationChange = (newCustomizations: CustomizationOptions) => {
    console.log('🐛 Customizations changed:', newCustomizations);
    setCustomizations(newCustomizations);
    
    // Mark step 3 as completed
    setCompletedSteps(prev => {
      const newCompleted = prev.includes(3) ? prev : [...prev, 3];
      console.log('🐛 New completed steps after customization:', newCompleted);
      return newCompleted;
    });
  };

  const canProceedToStep = (step: number) => {
    const canProceed = (() => {
      if (step === 1) return true;
      if (step === 2) return completedSteps.includes(1);
      if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);
      if (step === 4) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
      return false;
    })();
    
    console.log(`🐛 canProceedToStep(${step}):`, canProceed, 'completedSteps:', completedSteps);
    return canProceed;
  };

  // Debug log whenever state changes
  useEffect(() => {
    console.log('🐛 State update:', {
      currentStep,
      completedSteps,
      selectedStyle: selectedStyle?.name,
      uploadedImage: !!uploadedImage,
      selectedSize,
      selectedOrientation
    });
  }, [currentStep, completedSteps, selectedStyle, uploadedImage, selectedSize, selectedOrientation]);

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
