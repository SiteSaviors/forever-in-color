
import PhotoUploadSection from "./PhotoUploadSection";
import StyleSelectionSection from "./StyleSelectionSection";
import PhotoCropperSection from "./PhotoCropperSection";
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import ContextualHelp from "../help/ContextualHelp";
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import ProgressStateManager from "./ProgressStateManager";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
import { usePhotoUploadState } from "../hooks/usePhotoUploadState";
import { getAspectRatioFromOrientation } from "../cropper/data/orientationOptions";
import { useEnhancedHandlers } from "./EnhancedHandlers";

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
        {/* Progress State Manager */}
        <ProgressStateManager
          currentStep={currentStep}
          completedSteps={completedSteps}
          croppedImage={croppedImage}
          selectedStyle={selectedStyle}
        />

        {/* Smart Progress Indicator - Always render but only show content when there's an image */}
        <SmartProgressIndicator uploadedImage={croppedImage} />

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
        {!showCropper && (
          <>
            <PhotoUploadSection
              hasImage={hasImage}
              croppedImage={croppedImage}
              onImageUpload={handleEnhancedImageUpload}
            />

            {/* Style Selection Section - Only show after image is uploaded */}
            {hasImage && (
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
            )}
          </>
        )}

        {/* Enhanced UX Components */}
        <ContextualHelp />
      </div>
    </MobileGestureHandler>
  );
};

export default PhotoUploadFlow;
