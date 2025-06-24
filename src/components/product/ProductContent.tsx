
import PhotoUploadAndStyleSelection from "./PhotoUploadAndStyleSelection";
import OrientationSelector from "./OrientationSelector";
import CustomizationSelector from "./CustomizationSelector";
import ReviewAndOrder from "./ReviewAndOrder";
import ProductStep from "./ProductStep";
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { Accordion } from "@/components/ui/accordion";

interface ProductContentProps {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: {
      enabled: boolean;
      color: 'white' | 'black' | 'espresso';
    };
    livingMemory: boolean;
    voiceMatch: boolean;
    customMessage: string;
    aiUpscale: boolean;
  };
  uploadedImage: string | null;
  autoGenerationComplete: boolean;
  onCurrentStepChange: (step: number) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onCustomizationChange: (customizations: any) => void;
}

const ProductContent = ({
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
  onCustomizationChange
}: ProductContentProps) => {
  const canProceedToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return completedSteps.includes(1);
    if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);
    if (step === 4) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Accordion type="single" value={`step-${currentStep}`} className="space-y-8">
        {/* Step 1: Photo Upload & Style Selection - Only wrap this step with StylePreviewProvider */}
        <ProductStep
          stepNumber={1}
          title="Upload Photo & Choose Style"
          description="Upload your photo and select an art style"
          isActive={currentStep === 1}
          isCompleted={completedSteps.includes(1)}
          canAccess={canProceedToStep(1)}
          onStepClick={() => onCurrentStepChange(1)}
          selectedStyle={selectedStyle}
        >
          {currentStep === 1 && (
            <StylePreviewProvider 
              croppedImage={uploadedImage} 
              selectedOrientation={selectedOrientation}
            >
              <PhotoUploadAndStyleSelection
                selectedStyle={selectedStyle}
                uploadedImage={uploadedImage}
                selectedOrientation={selectedOrientation}
                autoGenerationComplete={autoGenerationComplete}
                onComplete={onPhotoAndStyleComplete}
                onPhotoAndStyleComplete={onPhotoAndStyleComplete}
              />
            </StylePreviewProvider>
          )}
        </ProductStep>

        {/* Step 2: Orientation & Size Selection - No StylePreviewProvider needed */}
        <ProductStep
          stepNumber={2}
          title="Choose Layout & Size"
          description="Select your canvas orientation and size"
          isActive={currentStep === 2}
          isCompleted={completedSteps.includes(2)}
          canAccess={canProceedToStep(2)}
          onStepClick={() => onCurrentStepChange(2)}
        >
          {currentStep === 2 && (
            <OrientationSelector
              selectedOrientation={selectedOrientation}
              selectedSize={selectedSize}
              userImageUrl={uploadedImage}
              onOrientationChange={onOrientationSelect}
              onSizeChange={onSizeSelect}
              onContinue={() => onCurrentStepChange(3)}
            />
          )}
        </ProductStep>

        {/* Step 3: Customization */}
        <ProductStep
          stepNumber={3}
          title="Customize Your Canvas"
          description="Add premium features and customizations"
          isActive={currentStep === 3}
          isCompleted={completedSteps.includes(3)}
          canAccess={canProceedToStep(3)}
          onStepClick={() => onCurrentStepChange(3)}
        >
          {currentStep === 3 && (
            <CustomizationSelector
              customizations={customizations}
              selectedSize={selectedSize}
              onCustomizationChange={onCustomizationChange}
            />
          )}
        </ProductStep>

        {/* Step 4: Review & Order */}
        <ProductStep
          stepNumber={4}
          title="Review & Order"
          description="Review your canvas and place your order"
          isActive={currentStep === 4}
          isCompleted={completedSteps.includes(4)}
          canAccess={canProceedToStep(4)}
          onStepClick={() => onCurrentStepChange(4)}
        >
          {currentStep === 4 && (
            <ReviewAndOrder
              uploadedImage={uploadedImage}
              selectedStyle={selectedStyle}
              selectedSize={selectedSize}
              selectedOrientation={selectedOrientation}
              customizations={customizations}
            />
          )}
        </ProductStep>
      </Accordion>
    </div>
  );
};

export default ProductContent;
