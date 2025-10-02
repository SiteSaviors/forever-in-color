
import { useEffect } from "react";
import PhotoUploadContainer from "../photo-upload/PhotoUploadContainer";
import StyleSelector from "../StyleSelector";
import PhotoCropperSection from "./PhotoCropperSection";
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import ContextualHelp from "../help/ContextualHelp";
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import { StepOneExperienceProvider, useStepOneExperienceContext } from "../progress/StepOneExperienceContext";
import { usePhotoUploadState } from "../hooks/usePhotoUploadState";
import { getAspectRatioFromOrientation } from "../cropper/data/orientationOptions";
import { useEnhancedHandlers } from "./EnhancedHandlers";

interface PhotoAndStyleStepProps {
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

const PhotoAndStyleStepContent = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue,
  completedSteps
}: PhotoAndStyleStepProps) => {
  const experience = useStepOneExperienceContext();

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
    handleStyleSelect,
    experience
  );

  // Update sub-step based on upload/crop progress (replaces ProgressStateManager logic)
  useEffect(() => {
    if (!croppedImage) {
      experience.setSubStep('upload');
    } else if (!selectedStyle || selectedStyle.name === "temp-style") {
      experience.setSubStep('style-selection');
    } else {
      experience.setSubStep('complete');
    }
  }, [croppedImage, selectedStyle, experience]);

  const handleStyleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    experience.markInteraction();
    onComplete(imageUrl, styleId, styleName);
    onContinue();
  };

  const hasImage = !!croppedImage;
  const cropAspectRatio = getAspectRatioFromOrientation(currentOrientation);

  return (
    <MobileGestureHandler
      onSwipeLeft={() => {
        // Mobile swipe gesture handled
      }}
      enableHaptic={true}
      showGestureHints={true}
    >
      <div className="space-y-8">
        {/* Smart Progress Indicator - Always render but only show content when there's an image */}
        <SmartProgressIndicator uploadedImage={croppedImage} completedSteps={completedSteps} />

        {/* Show cropper if user wants to recrop */}
        {showCropper && (
          <PhotoCropperSection
            showCropper={showCropper}
            originalImage={originalImage}
            currentOrientation={currentOrientation}
            onCropComplete={handleCropComplete}
            onOrientationChange={setCurrentOrientation}
          />
        )}

        {/* Photo Upload Section - Only show if no image or not showing cropper */}
        {!showCropper && !hasImage && (
          <div className="space-y-6">
            <div className="text-center">
              {/* Upload section header content can be added here if needed */}
            </div>

            <PhotoUploadContainer
              onImageUpload={handleEnhancedImageUpload}
              initialImage={croppedImage}
            />
          </div>
        )}

        {/* Style Selection Section - Only show after image is uploaded */}
        {!showCropper && hasImage && (
          <div className="space-y-6">
            <div className="text-center">
              {/* Style selection header content can be added here if needed */}
            </div>

            <StyleSelector
              croppedImage={croppedImage}
              selectedStyle={selectedStyle?.id || null}
              cropAspectRatio={cropAspectRatio}
              selectedOrientation={currentOrientation}
              onStyleSelect={handleEnhancedStyleSelect}
              onComplete={handleStyleComplete}
              onRecropImage={handleRecropImage}
            />
          </div>
        )}

        {/* Enhanced UX Components */}
        <ContextualHelp />
      </div>
    </MobileGestureHandler>
  );
};

const PhotoAndStyleStep = (props: PhotoAndStyleStepProps) => {
  return (
    <StepOneExperienceProvider>
      <PhotoAndStyleStepContent {...props} />
    </StepOneExperienceProvider>
  );
};

export default PhotoAndStyleStep;
