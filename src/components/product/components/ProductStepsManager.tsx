
import PhotoUploadStep, { PhotoUploadStepRef } from "./PhotoUploadStep";
import OrientationStep from "./OrientationStep";
import CustomizationStep from "./CustomizationStep";
import ReviewOrderStep from "./ReviewOrderStep";
import { CustomizationOptions } from "../types/productState";
import { RefObject } from "react";

interface GlobalUploadState {
  isUploading: boolean;
  uploadProgress: number;
  processingStage: string;
}

interface ProductStepsManagerProps {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  uploadedImage: string | null;
  autoGenerationComplete: boolean;
  onCurrentStepChange: (step: number) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
  canProceedToStep: (step: number) => boolean;
  handleContinueToStep2: () => void;
  handleContinueToStep3: () => void;
  handleContinueToStep4: () => void;
  photoUploadStepRef?: RefObject<PhotoUploadStepRef>;
  globalUploadState?: GlobalUploadState;
}

const ProductStepsManager = (props: ProductStepsManagerProps) => {
  const {
    currentStep,
    completedSteps,
    selectedStyle,
    selectedSize,
    selectedOrientation,
    customizations,
    uploadedImage,
    autoGenerationComplete,
    onCurrentStepChange,
    onPhotoAndStyleComplete,
    onOrientationSelect,
    onSizeSelect,
    onCustomizationChange,
    canProceedToStep,
    handleContinueToStep2,
    handleContinueToStep3,
    handleContinueToStep4,
    photoUploadStepRef,
    globalUploadState
  } = props;

  return (
    <div className="space-y-4" data-testid="product-steps-manager">
      <PhotoUploadStep
        ref={photoUploadStepRef}
        currentStep={currentStep}
        isActive={currentStep === 1}
        isCompleted={completedSteps.includes(1)}
        canAccess={canProceedToStep(1)}
        selectedStyle={selectedStyle}
        uploadedImage={uploadedImage}
        selectedOrientation={selectedOrientation}
        autoGenerationComplete={autoGenerationComplete}
        onStepClick={() => onCurrentStepChange(1)}
        onPhotoAndStyleComplete={onPhotoAndStyleComplete}
        onContinue={handleContinueToStep2}
        completedSteps={completedSteps}
        onStepChange={onCurrentStepChange}
        globalUploadState={globalUploadState}
      />

      <OrientationStep
        currentStep={currentStep}
        isActive={currentStep === 2}
        isCompleted={completedSteps.includes(2)}
        canAccess={canProceedToStep(2)}
        selectedOrientation={selectedOrientation}
        selectedSize={selectedSize}
        uploadedImage={uploadedImage}
        onStepClick={() => onCurrentStepChange(2)}
        onOrientationSelect={onOrientationSelect}
        onSizeSelect={onSizeSelect}
        onContinue={handleContinueToStep3}
        completedSteps={completedSteps}
        onStepChange={onCurrentStepChange}
      />

      <CustomizationStep
        currentStep={currentStep}
        isActive={currentStep === 3}
        isCompleted={completedSteps.includes(3)}
        canAccess={canProceedToStep(3)}
        customizations={customizations}
        selectedOrientation={selectedOrientation}
        selectedSize={selectedSize}
        onStepClick={() => onCurrentStepChange(3)}
        onCustomizationChange={onCustomizationChange}
      />

      <ReviewOrderStep
        currentStep={currentStep}
        isActive={currentStep === 4}
        isCompleted={completedSteps.includes(4)}
        canAccess={canProceedToStep(4)}
        selectedStyle={selectedStyle}
        selectedSize={selectedSize}
        selectedOrientation={selectedOrientation}
        customizations={customizations}
        uploadedImage={uploadedImage}
        onStepClick={() => onCurrentStepChange(4)}
      />
    </div>
  );
};

export default ProductStepsManager;
