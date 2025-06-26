
import PhotoUploadSection from "./PhotoUploadSection";
import StyleSelectionSection from "./StyleSelectionSection";
import PhotoCropperSection from "./PhotoCropperSection";
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import ContextualHelp from "../help/ContextualHelp";
import SocialProofFeed from "../social/SocialProofFeed";
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import ConversionMomentumTracker from "../progress/ConversionMomentumTracker";
import ProgressStateManager from "./ProgressStateManager";
import AIAnalysisStatus from "./intelligence/AIAnalysisStatus";
import AutoCropPreview from "./AutoCropPreview";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
import { usePhotoUploadState } from "../hooks/usePhotoUploadState";
import { getAspectRatioFromOrientation } from "../cropper/data/orientationOptions";
import { useEnhancedHandlers } from "./EnhancedHandlers";
import { usePhotoAnalysis } from "../../../hooks/usePhotoAnalysis";
import { detectOrientationFromImage } from "../utils/orientationDetection";
import { useState, useEffect } from "react";

interface PhotoUploadFlowProps {
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

const PhotoUploadFlow = ({
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
}: PhotoUploadFlowProps) => {
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
  const shouldShowUpload = !uploadedImage;
  const shouldShowAnalysis = uploadedImage && isAnalyzing;
  const shouldShowAutoCrop = uploadedImage && !isAnalyzing && showAutoCrop && !showCropper;
  const shouldShowCropper = showCropper;
  const shouldShowStyleSelection = !isAnalyzing && !showAutoCrop && !showCropper && hasImage;

  console.log('🔍 PhotoUploadFlow Debug:', {
    uploadedImage: !!uploadedImage,
    isAnalyzing,
    analysisResult: !!analysisResult,
    showAutoCrop,
    showCropper,
    hasImage,
    recommendedOrientation,
    shouldShowUpload,
    shouldShowAnalysis,
    shouldShowAutoCrop,
    shouldShowCropper,
    shouldShowStyleSelection
  });

  return (
    <MobileGestureHandler
      onSwipeLeft={() => {
        if (hasImage && !hasStyle) {
          showContextualHelp('hesitation', 'Swipe through the style gallery above to find your perfect match!');
        }
      }}
      enableHaptic={true}
      showGestureHints={true}
    >
      <div className="space-y-8">
        {/* Progress State Manager */}
        <ProgressStateManager
          currentStep={currentStep}
          completedSteps={completedSteps}
          croppedImage={croppedImage}
          selectedStyle={selectedStyle}
        />

        {/* Photo Upload Section - Only show if no image uploaded yet */}
        {shouldShowUpload && (
          <PhotoUploadSection
            hasImage={hasImage}
            croppedImage={croppedImage}
            onImageUpload={handleEnhancedImageUpload}
          />
        )}

        {/* AI Analysis Status - Show immediately when image is uploaded and being analyzed */}
        {shouldShowAnalysis && (
          <AIAnalysisStatus isAnalyzing={isAnalyzing} />
        )}

        {/* Auto Crop Preview - Show after analysis completes */}
        {shouldShowAutoCrop && (
          <AutoCropPreview
            imageUrl={uploadedImage}
            onAcceptCrop={handleAcceptAutoCrop}
            onCustomizeCrop={handleCustomizeAutoCrop}
            recommendedOrientation={recommendedOrientation}
          />
        )}

        {/* Manual Photo Cropper - Show when user wants to customize crop */}
        {shouldShowCropper && (
          <PhotoCropperSection
            showCropper={showCropper}
            originalImage={originalImage}
            currentOrientation={currentOrientation}
            onCropComplete={handleCropComplete}
            onOrientationChange={setCurrentOrientation}
          />
        )}

        {/* Style Selection Section - Only show after image processing is complete */}
        {shouldShowStyleSelection && (
          <>
            {/* Smart Progress Indicator */}
            <SmartProgressIndicator uploadedImage={croppedImage} />

            <StyleSelectionSection
              hasImage={hasImage}
              croppedImage={croppedImage}
              selectedStyle={selectedStyle}
              cropAspectRatio={cropAspectRatio}
              selectedOrientation={currentOrientation}
              onStyleSelect={handleEnhancedStyleSelect}
              onStyleComplete={handleStyleComplete}
              onRecropImage={handleRecropImage}
            />
          </>
        )}

        {/* Enhanced UX Components */}
        <ContextualHelp />
        <SocialProofFeed />
        <ConversionMomentumTracker />
      </div>
    </MobileGestureHandler>
  );
};

export default PhotoUploadFlow;
