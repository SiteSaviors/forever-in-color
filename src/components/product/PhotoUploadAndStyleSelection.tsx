import PhotoUploadProgress from "./components/PhotoUploadProgress";
import PhotoUploadSection from "./components/PhotoUploadSection";
import StyleSelectionSection from "./components/StyleSelectionSection";
import PhotoCropperSection from "./components/PhotoCropperSection";
import SmartProgressIndicator from "./progress/SmartProgressIndicator";
import ContextualHelp from "./help/ContextualHelp";
import SocialProofFeed from "./social/SocialProofFeed";
import MobileGestureHandler from "./mobile/MobileGestureHandler";
import ConversionMomentumTracker from "./progress/ConversionMomentumTracker";
import { ProgressOrchestrator, useProgressOrchestrator } from "./progress/ProgressOrchestrator";
import { usePhotoUploadState } from "./hooks/usePhotoUploadState";
import { getAspectRatioFromOrientation } from "./cropper/data/orientationOptions";
import { useEffect } from "react";

interface PhotoUploadAndStyleSelectionProps {
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

const PhotoUploadAndStyleContent = ({
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
}: PhotoUploadAndStyleSelectionProps) => {
  const { dispatch, showContextualHelp, startAIAnalysis, completeAIAnalysis, trackClick } = useProgressOrchestrator();
  
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

  // Update progress orchestrator state
  useEffect(() => {
    dispatch({ type: 'SET_STEP', payload: currentStep });
    completedSteps.forEach(step => {
      dispatch({ type: 'COMPLETE_STEP', payload: step });
    });
  }, [currentStep, completedSteps, dispatch]);

  // Update sub-step based on progress
  useEffect(() => {
    if (!croppedImage) {
      dispatch({ type: 'SET_SUB_STEP', payload: 'upload' });
    } else if (!selectedStyle || selectedStyle.name === "temp-style") {
      dispatch({ type: 'SET_SUB_STEP', payload: 'style-selection' });
    } else {
      dispatch({ type: 'SET_SUB_STEP', payload: 'complete' });
    }
  }, [croppedImage, selectedStyle, dispatch]);

  // Enhanced image upload handler with AI analysis
  const handleEnhancedImageUpload = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {
    dispatch({ type: 'SET_SUB_STEP', payload: 'analyzing' });
    startAIAnalysis("Analyzing your photo composition and lighting...");
    
    dispatch({ 
      type: 'ADD_PERSONALIZED_MESSAGE', 
      payload: "AI is analyzing your photo to find the perfect artistic matches..."
    });

    // Simulate AI analysis with realistic timing
    setTimeout(() => {
      const imageType = imageUrl.includes('portrait') ? 'portrait' : 
                      imageUrl.includes('landscape') ? 'landscape' : 'square';
      const recommendedStyles = imageType === 'portrait' ? [1, 3, 5] : [2, 4, 6];
      
      completeAIAnalysis(imageType, recommendedStyles);
      
      showContextualHelp(
        'recommendation',
        `Perfect! Your ${imageType} photo will look amazing in our Classic Oil or Abstract Fusion styles.`,
        'moderate'
      );
    }, 3000);

    handleImageUpload(imageUrl, originalImageUrl, orientation);
  };

  // Enhanced style selection with confidence scoring
  const handleEnhancedStyleSelect = (styleId: number, styleName: string) => {
    trackClick(`style-select-${styleName.toLowerCase().replace(/\s+/g, '-')}`);
    
    dispatch({ 
      type: 'ADD_PERSONALIZED_MESSAGE', 
      payload: `Excellent choice! ${styleName} is perfect for your photo composition.`
    });
    
    showContextualHelp(
      'social',
      `${styleName} is loved by 94% of users with similar photos. You're going to love the result!`,
      'minimal'
    );

    handleStyleSelect(styleId, styleName);
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

  const hasImage = !!croppedImage;
  const hasStyle = selectedStyle && selectedStyle.name !== "temp-style";
  const cropAspectRatio = getAspectRatioFromOrientation(currentOrientation);

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
        {/* Smart Progress Indicator - Only shows after photo upload */}
        <SmartProgressIndicator uploadedImage={croppedImage} />

        {/* Show cropper if user wants to recrop */}
        <PhotoCropperSection
          showCropper={showCropper}
          originalImage={originalImage}
          currentOrientation={currentOrientation}
          onCropComplete={handleCropComplete}
          onOrientationChange={setCurrentOrientation}
        />

        {/* Photo Upload Section - Only show if no image or not showing cropper */}
        {!showCropper && (
          <>
            <PhotoUploadSection
              hasImage={hasImage}
              croppedImage={croppedImage}
              onImageUpload={handleEnhancedImageUpload}
            />

            {/* Style Selection Section - Only show after image is uploaded */}
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

const PhotoUploadAndStyleSelection = (props: PhotoUploadAndStyleSelectionProps) => {
  return (
    <ProgressOrchestrator>
      <PhotoUploadAndStyleContent {...props} />
    </ProgressOrchestrator>
  );
};

export default PhotoUploadAndStyleSelection;
