
import PhotoUploadProgress from "./components/PhotoUploadProgress";
import PhotoUploadSection from "./components/PhotoUploadSection";
import StyleSelectionSection from "./components/StyleSelectionSection";
import PhotoCropperSection from "./components/PhotoCropperSection";
import { usePhotoUploadState } from "./hooks/usePhotoUploadState";

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

const PhotoUploadAndStyleSelection = ({
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

  const handleStyleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    console.log('🎨 Style selection completed:', {
      imageUrl,
      styleId,
      styleName
    });
    onComplete(imageUrl, styleId, styleName);
    onContinue();
  };

  const hasImage = !!croppedImage;
  const hasStyle = selectedStyle && selectedStyle.name !== "temp-style";

  return (
    <div className="space-y-8">
      {/* Progress Indicators */}
      <PhotoUploadProgress
        hasImage={hasImage}
        hasStyle={hasStyle}
        currentOrientation={currentOrientation}
        selectedStyle={selectedStyle}
      />

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
            onImageUpload={handleImageUpload}
          />

          {/* Style Selection Section - Only show after image is uploaded */}
          <StyleSelectionSection
            hasImage={hasImage}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            onStyleSelect={handleStyleSelect}
            onStyleComplete={handleStyleComplete}
            onRecropImage={handleRecropImage}
          />
        </>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
