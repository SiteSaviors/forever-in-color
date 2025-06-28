
import PhotoUploadAndStyleSelection from "../PhotoUploadAndStyleSelection";
import ProductStepWrapper from "./ProductStepWrapper";

interface PhotoUploadStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  selectedStyle: { id: number; name: string } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onStepClick: () => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

const PhotoUploadStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onStepClick,
  onPhotoAndStyleComplete,
  onContinue,
  completedSteps,
  onStepChange
}: PhotoUploadStepProps) => {
  // Step 1 should only be active if currentStep is 1 AND isActive is true
  const shouldBeActive = currentStep === 1 && isActive;
  
  return (
    <ProductStepWrapper
      stepNumber={1}
      title="Upload Photo & Choose Style"
      description="Upload your photo and select an art style"
      isActive={shouldBeActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
      selectedStyle={selectedStyle}
    >
      {/* Only render content when step is truly active */}
      {shouldBeActive && (
        <PhotoUploadAndStyleSelection
          selectedStyle={selectedStyle}
          uploadedImage={uploadedImage}
          selectedOrientation={selectedOrientation}
          autoGenerationComplete={autoGenerationComplete}
          onComplete={onPhotoAndStyleComplete}
          onPhotoAndStyleComplete={onPhotoAndStyleComplete}
          onContinue={onContinue}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={onStepChange}
        />
      )}
    </ProductStepWrapper>
  );
};

export default PhotoUploadStep;
