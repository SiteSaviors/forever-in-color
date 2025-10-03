
import { useState, useEffect, useCallback, useMemo } from "react";
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
    generationErrors,
    isGenerating,
    setPreviewUrls,
    setAutoGenerationComplete,
    generatePreviewForStyle
  } = usePreviewGeneration(uploadedImage, selectedOrientation);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.count('[dev] usePreviewGeneration mount');
    }
  }, []);

  const startPreview = useCallback(
    (styleId: number, styleName: string) => generatePreviewForStyle(styleId, styleName),
    [generatePreviewForStyle]
  );

  const cancelPreview = useCallback(() => {
    setPreviewUrls({});
    setAutoGenerationComplete(false);
  }, [setPreviewUrls, setAutoGenerationComplete]);

  const preview = useMemo(
    () => ({
      previewUrls,
      status: {
        autoGenerationComplete,
        isGenerating
      },
      error: generationErrors
    }),
    [previewUrls, autoGenerationComplete, isGenerating, generationErrors]
  );

  // Handle pre-selected style from style landing pages
  useEffect(() => {
    if (location.state?.preSelectedStyle && location.state?.styleName) {
      setSelectedStyle({
        id: location.state.preSelectedStyle,
        name: location.state.styleName
      });
    }
  }, [location.state]);

  const handlePhotoAndStyleComplete = async (imageUrl: string, styleId: number, styleName: string, orientation?: string) => {
    setUploadedImage(imageUrl);
    
    // Set orientation if provided (from unified canvas selection)
    if (orientation) {
      setSelectedOrientation(orientation);
    } else {
      // Fallback to auto-detection for backward compatibility
      try {
        const detectedOrientation = await detectOrientationFromImage(imageUrl);
        setSelectedOrientation(detectedOrientation);
      } catch (_error) {
        // Error handling without logging
      }
    }
    
    // Only set the style if it's not a temporary style from photo upload
    if (styleName !== "temp-style") {
      setSelectedStyle({ id: styleId, name: styleName });
    }
    
    // Mark step 1 as completed when user has both image AND style
    if (styleName !== "temp-style" && imageUrl) {
      setCompletedSteps(prev => {
        const newCompleted = prev.includes(1) ? prev : [...prev, 1];
        return newCompleted;
      });
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Mark step 2 as completed when size is selected (orientation already set in step 1)
    if (selectedOrientation && size) {
      setCompletedSteps(prev => {
        const newCompleted = prev.includes(2) ? prev : [...prev, 2];
        return newCompleted;
      });
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    setSelectedOrientation(orientation);
    
    // Reset size when orientation changes
    setSelectedSize("");
    
    // Remove step 2 completion if it was completed, since we're changing orientation
    setCompletedSteps(prev => {
      const filtered = prev.filter(step => step !== 2);
      return filtered;
    });
    
    // Clear existing previews when orientation changes to regenerate with new aspect ratio
    setPreviewUrls({});
    setAutoGenerationComplete(false);
  };

  const handleCustomizationChange = (newCustomizations: CustomizationOptions) => {
    setCustomizations(newCustomizations);
    
    // Mark step 3 as completed
    setCompletedSteps(prev => {
      const newCompleted = prev.includes(3) ? prev : [...prev, 3];
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
    
    return canProceed;
  };


  return {
    currentStep,
    completedSteps,
    selectedStyle,
    uploadedImage,
    selectedSize,
    selectedOrientation,
    customizations,
    preview,
    startPreview,
    cancelPreview,
    isGenerating,
    generationErrors,
    autoGenerationComplete,
    setCurrentStep,
    handlePhotoAndStyleComplete,
    handleSizeSelect,
    handleOrientationSelect,
    handleCustomizationChange,
    canProceedToStep
  };
};
