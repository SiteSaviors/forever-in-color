
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import PhotoUploadStageRenderer from "./PhotoUploadStageRenderer";
import PhotoUploadEnhancedUX from "./PhotoUploadEnhancedUX";
import { usePhotoUploadFlow } from "./hooks/usePhotoUploadFlow";

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

const PhotoUploadFlow = (props: PhotoUploadFlowProps) => {
  const {
    // State
    showAutoCrop,
    recommendedOrientation,
    isAnalyzing,
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
  } = usePhotoUploadFlow(props);

  console.log('🔍 PhotoUploadFlow Debug:', {
    uploadedImage: !!props.uploadedImage,
    isAnalyzing,
    showAutoCrop,
    showCropper,
    hasImage,
    recommendedOrientation,
    ...stageConfig
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
        {/* Enhanced UX Components */}
        <PhotoUploadEnhancedUX
          currentStep={props.currentStep}
          completedSteps={props.completedSteps}
          croppedImage={croppedImage}
          selectedStyle={props.selectedStyle}
          shouldShowProgress={stageConfig.shouldShowStyleSelection}
        />

        {/* Stage Renderer */}
        <PhotoUploadStageRenderer
          stageConfig={stageConfig}
          hasImage={hasImage}
          croppedImage={croppedImage}
          onImageUpload={handleEnhancedImageUpload}
          isAnalyzing={isAnalyzing}
          uploadedImage={props.uploadedImage}
          recommendedOrientation={recommendedOrientation}
          onAcceptAutoCrop={handleAcceptAutoCrop}
          onCustomizeAutoCrop={handleCustomizeAutoCrop}
          showCropper={showCropper}
          originalImage={originalImage}
          currentOrientation={currentOrientation}
          onCropComplete={handleCropComplete}
          onOrientationChange={setCurrentOrientation}
          selectedStyle={props.selectedStyle}
          cropAspectRatio={cropAspectRatio}
          onStyleSelect={handleEnhancedStyleSelect}
          onStyleComplete={handleStyleComplete}
          onRecropImage={handleRecropImage}
        />
      </div>
    </MobileGestureHandler>
  );
};

export default PhotoUploadFlow;
