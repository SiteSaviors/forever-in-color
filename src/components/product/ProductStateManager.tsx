
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface ProductState {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
}

interface ProductStateActions {
  setCurrentStep: (step: number) => void;
  handlePhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  handleSizeSelect: (size: string) => void;
  handleOrientationSelect: (orientation: string) => void;
  handleCustomizationChange: (customizations: CustomizationOptions) => void;
  canProceedToStep: (step: number) => boolean;
}

export const useProductState = (): ProductState & ProductStateActions => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<{id: number, name: string} | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("horizontal");
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

  // Handle pre-selected style from style landing pages
  useEffect(() => {
    if (location.state?.preSelectedStyle && location.state?.styleName) {
      setSelectedStyle({
        id: location.state.preSelectedStyle,
        name: location.state.styleName
      });
    }
  }, [location.state]);

  const handlePhotoAndStyleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    setUploadedImage(imageUrl);
    setSelectedStyle({ id: styleId, name: styleName });
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (!completedSteps.includes(2)) {
      setCompletedSteps([...completedSteps, 2]);
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    setSelectedOrientation(orientation);
    // Reset size when orientation changes
    setSelectedSize("");
    // Remove step 2 completion if it was completed, since we're changing orientation
    if (completedSteps.includes(2)) {
      setCompletedSteps(completedSteps.filter(step => step !== 2));
    }
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
    setCurrentStep,
    handlePhotoAndStyleComplete,
    handleSizeSelect,
    handleOrientationSelect,
    handleCustomizationChange,
    canProceedToStep
  };
};
