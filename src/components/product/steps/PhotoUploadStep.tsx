
import ProductStep from "../ProductStep";
import PhotoUploadAndStyleSelection from "../PhotoUploadAndStyleSelection";

interface PhotoUploadStepProps {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onStepClick: () => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinueToStep2: () => void;
  onStepChange: (step: number) => void;
}

const PhotoUploadStep = ({
  currentStep,
  completedSteps,
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onStepClick,
  onPhotoAndStyleComplete,
  onContinueToStep2,
  onStepChange
}: PhotoUploadStepProps) => {
  const canAccess = true;
  const isActive = currentStep === 1;
  const isCompleted = completedSteps.includes(1);

  return (
    <ProductStep
      stepNumber={1}
      title="Upload Photo & Choose Style"
      description="Upload your photo and select an art style"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
      selectedStyle={selectedStyle}
    >
      {isActive && (
        <PhotoUploadAndStyleSelection
          selectedStyle={selectedStyle}
          uploadedImage={uploadedImage}
          selectedOrientation={selectedOrientation}
          autoGenerationComplete={autoGenerationComplete}
          onComplete={onPhotoAndStyleComplete}
          onPhotoAndStyleComplete={onPhotoAndStyleComplete}
          onContinue={onContinueToStep2}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={onStepChange}
        />
      )}
    </ProductStep>
  );
};

export default PhotoUploadStep;
