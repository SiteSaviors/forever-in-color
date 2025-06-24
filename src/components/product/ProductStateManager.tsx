
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { addWatermarkToImage } from "@/utils/watermarkUtils";

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
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
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
  const [selectedOrientation, setSelectedOrientation] = useState<string>("square");
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);
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

  // Auto-generate previews for popular styles when cropped image is available
  useEffect(() => {
    if (uploadedImage && !autoGenerationComplete) {
      const popularStyleIds = [2, 4, 5]; // Classic Oil Painting, Watercolor Dreams, Pastel Bliss
      const artStyles = [
        { id: 2, name: "Classic Oil Painting" },
        { id: 4, name: "Watercolor Dreams" },
        { id: 5, name: "Pastel Bliss" }
      ];
      
      const generatePopularPreviews = async () => {
        console.log('Auto-generating previews for popular styles:', popularStyleIds);
        console.log('Current selected orientation:', selectedOrientation);
        
        // Convert orientation to aspect ratio for generation
        const getAspectRatio = (orientation: string) => {
          switch (orientation) {
            case 'vertical':
              return '3:4';
            case 'horizontal':
              return '4:3';
            case 'square':
            default:
              return '1:1';
          }
        };

        const aspectRatio = getAspectRatio(selectedOrientation);
        console.log(`Using aspect ratio ${aspectRatio} for auto-generation based on orientation ${selectedOrientation}`);
        
        for (const styleId of popularStyleIds) {
          const style = artStyles.find(s => s.id === styleId);
          if (!style) continue;

          try {
            console.log(`Auto-generating preview for ${style.name} (ID: ${styleId}) with aspect ratio: ${aspectRatio}`);
            
            const tempPhotoId = `temp_${Date.now()}_${styleId}`;
            const previewUrl = await generateStylePreview(uploadedImage, style.name, tempPhotoId, aspectRatio);

            if (previewUrl) {
              try {
                const watermarkedUrl = await addWatermarkToImage(previewUrl);
                setPreviewUrls(prev => ({ ...prev, [styleId]: watermarkedUrl }));
                console.log(`Auto-generated preview for ${style.name} completed with watermark and aspect ratio ${aspectRatio}`);
              } catch (watermarkError) {
                console.warn(`Failed to add watermark for ${style.name}, using original:`, watermarkError);
                setPreviewUrls(prev => ({ ...prev, [styleId]: previewUrl }));
              }
            }
          } catch (error) {
            console.error(`Error auto-generating preview for ${style.name}:`, error);
          }
        }
        
        setAutoGenerationComplete(true);
        console.log('Auto-generation of popular style previews completed');
      };

      generatePopularPreviews();
    }
  }, [uploadedImage, autoGenerationComplete, selectedOrientation]);

  // Reset states when uploaded image changes but preserve previews within session
  useEffect(() => {
    if (!uploadedImage) {
      setAutoGenerationComplete(false);
      setPreviewUrls({});
    }
  }, [uploadedImage]);

  const handlePhotoAndStyleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    console.log('ProductStateManager handlePhotoAndStyleComplete called with:', { imageUrl, styleId, styleName });
    
    setUploadedImage(imageUrl);
    setSelectedStyle({ id: styleId, name: styleName });
    
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
    console.log('Orientation selected:', orientation);
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
