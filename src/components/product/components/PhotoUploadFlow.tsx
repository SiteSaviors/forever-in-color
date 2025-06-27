
import PhotoUploadSection from "./PhotoUploadSection";
import StyleSelectionSection from "./StyleSelectionSection";
import PhotoCropperSection from "./PhotoCropperSection";
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import ContextualHelp from "../help/ContextualHelp";
import SocialProofFeed from "../social/SocialProofFeed";
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import ConversionMomentumTracker from "../progress/ConversionMomentumTracker";
import ProgressStateManager from "./ProgressStateManager";
import { MobileContainer } from "@/components/ui/mobile-grid";
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
    <div className="prevent-overflow">
      <MobileGestureHandler
        onSwipeLeft={() => {
          if (hasImage && !hasStyle) {
            showContextualHelp('hesitation', 'Swipe through the style gallery above to find your perfect match!');
          }
        }}
        enableHaptic={true}
        showGestureHints={true}
      >
        <MobileContainer size="lg" padding="sm">
          <div className="mobile-spacing">
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
              <div className="prevent-overflow">
                <PhotoCropperSection
                  showCropper={showCropper}
                  originalImage={originalImage}
                  currentOrientation={currentOrientation}
                  onCropComplete={handleCropComplete}
                  onOrientationChange={setCurrentOrientation}
                />
              </div>
            )}

            {/* Photo Upload Section - Only show if no image or not showing cropper */}
            {!showCropper && (
              <div className="prevent-overflow space-y-6 sm:space-y-8">
                <PhotoUploadSection
                  hasImage={hasImage}
                  croppedImage={croppedImage}
                  onImageUpload={handleEnhancedImageUpload}
                />

                {/* Style Selection Section - Only show after image is uploaded */}
                {hasImage && (
                  <div className="prevent-overflow">
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
                  </div>
                )}
              </div>
            )}

            {/* Enhanced UX Components */}
            <div className="prevent-overflow space-y-4 sm:space-y-6">
              <ContextualHelp />
              <SocialProofFeed />
              <ConversionMomentumTracker />
            </div>
          </div>
        </MobileContainer>
      </MobileGestureHandler>
    </div>
  );
};

export default PhotoUploadFlow;
