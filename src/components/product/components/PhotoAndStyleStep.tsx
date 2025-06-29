
import PhotoUploadContainer from "../photo-upload/PhotoUploadContainer";
import StyleSelector from "../StyleSelector";
import PhotoCropperSection from "./PhotoCropperSection";
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import ContextualHelp from "../help/ContextualHelp";
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import ConversionMomentumTracker from "../progress/ConversionMomentumTracker";
import ProgressStateManager from "./ProgressStateManager";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
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

const PhotoAndStyleStep = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue,
  currentStep,
  completedSteps
}: PhotoAndStyleStepProps) => {
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
        <ConversionMomentumTracker />
      </div>
    </MobileGestureHandler>
  );
};

export default PhotoAndStyleStep;
