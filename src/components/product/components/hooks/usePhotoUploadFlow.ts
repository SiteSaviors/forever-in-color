
import { useState, useEffect } from "react";
import { useProgressOrchestrator } from "../../progress/ProgressOrchestrator";
import { usePhotoUploadState } from "../../hooks/usePhotoUploadState";
import { useEnhancedHandlers } from "../EnhancedHandlers";
import { usePhotoAnalysis } from "../../../../hooks/usePhotoAnalysis";
import { detectOrientationFromImage } from "../../utils/orientationDetection";
import { getAspectRatioFromOrientation } from "../../cropper/data/orientationOptions";

interface UsePhotoUploadFlowProps {
  selectedStyle: {
    id: number;
    name: string;
  } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

export const usePhotoUploadFlow = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue,
  currentStep,
  completedSteps,
  onStepChange
}: UsePhotoUploadFlowProps) => {
  const { dispatch, showContextualHelp } = useProgressOrchestrator();
  const [showAutoCrop, setShowAutoCrop] = useState(false);
  const [recommendedOrientation, setRecommendedOrientation] = useState<string>("");
  
  // Track photo analysis for the originally uploaded image
  const { isAnalyzing, analysisResult } = usePhotoAnalysis(uploadedImage);
  
  const {
    currentOrientation,
    showCropper,
    originalImage,
    croppedImage,
    setCurrentOrientation,
    handleImageUpload,
    handleCropComplete,
    handleRecropImage,
    handleStyleSelect
  } = usePhotoUploadState({
    selectedStyle,
    uploadedImage,
    selectedOrientation,
    onPhotoAndStyleComplete
  });

  const { handleEnhancedImageUpload, handleEnhancedStyleSelect } = useEnhancedHandlers(
    handleImageUpload,
    handleStyleSelect
  );

  // Detect orientation and trigger auto-crop when analysis completes
  useEffect(() => {
    if (analysisResult && uploadedImage && !showCropper) {
      console.log('🎯 Analysis completed, detecting orientation for auto-crop...');
      
      detectOrientationFromImage(uploadedImage).then(detected => {
        console.log('🎯 Detected orientation:', detected);
        setRecommendedOrientation(detected);
        setShowAutoCrop(true);
      });
    }
  }, [analysisResult, uploadedImage, showCropper]);

  const handleAcceptAutoCrop = (croppedImageUrl: string) => {
    console.log('✅ User accepted auto crop');
    setShowAutoCrop(false);
    
    // Update the state with the auto-cropped image
    if (selectedStyle) {
      onPhotoAndStyleComplete(croppedImageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      onPhotoAndStyleComplete(croppedImageUrl, 0, "temp-style");
    }
  };

  const handleCustomizeAutoCrop = () => {
    console.log('🎨 User wants to customize crop');
    setShowAutoCrop(false);
    handleRecropImage();
  };

  const handleStyleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    console.log('🎨 Style selection completed:', {
      imageUrl,
      styleId,
      styleName
    });
    dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    onComplete(imageUrl, styleId, styleName);
    onContinue();
  };

  // Calculate current state
  const hasImage = !!croppedImage;
  const hasStyle = selectedStyle && selectedStyle.name !== "temp-style";
  const cropAspectRatio = getAspectRatioFromOrientation(currentOrientation);
  
  // Determine what should be shown
  const stageConfig = {
    shouldShowUpload: !uploadedImage,
    shouldShowAnalysis: uploadedImage && isAnalyzing,
    shouldShowAutoCrop: uploadedImage && !isAnalyzing && showAutoCrop && !showCropper,
    shouldShowCropper: showCropper,
    shouldShowStyleSelection: !isAnalyzing && !showAutoCrop && !showCropper && hasImage
  };

  return {
    // State
    showAutoCrop,
    recommendedOrientation,
    isAnalyzing,
    analysisResult,
    currentOrientation,
    showCropper,
    originalImage,
    croppedImage,
    hasImage,
    hasStyle,
    cropAspectRatio,
    stageConfig,
    
    // Handlers
    setCurrentOrientation,
    handleEnhancedImageUpload,
    handleCropComplete,
    handleRecropImage,
    handleEnhancedStyleSelect,
    handleAcceptAutoCrop,
    handleCustomizeAutoCrop,
    handleStyleComplete,
    
    // Context functions
    showContextualHelp
  };
};
