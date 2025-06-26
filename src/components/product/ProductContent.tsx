
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { Accordion } from "@/components/ui/accordion";
import { CustomizationOptions } from "./types/productState";
import { useProductSteps } from "./hooks/useProductSteps";
import PhotoUploadStep from "./components/PhotoUploadStep";
import OrientationStep from "./components/OrientationStep";
import CustomizationStep from "./components/CustomizationStep";
import ReviewOrderStep from "./components/ReviewOrderStep";

interface ProductContentProps {
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
  
  console.log('🐛 ProductContent Debug:', {
    currentStep,
    completedSteps,
    selectedStyle,
    selectedSize,
    selectedOrientation,
    uploadedImage: !!uploadedImage,
    autoGenerationComplete
  });

  const {
    canProceedToStep,
    handleContinueToStep2,
    handleContinueToStep3,
    handleContinueToStep4
  } = useProductSteps({
    currentStep,
    completedSteps,
    onCurrentStepChange
  });

  return (
    <StylePreviewProvider 
      croppedImage={uploadedImage} 
      selectedOrientation={selectedOrientation}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Accordion 
          type="single" 
          value={`step-${currentStep}`} 
          className="space-y-8"
          onValueChange={() => {
            // Prevent default accordion scroll behavior
          }}
        >
          <PhotoUploadStep
            currentStep={currentStep}
            isActive={currentStep === 1}
            isCompleted={completedSteps.includes(1)}
            canAccess={canProceedToStep(1)}
            selectedStyle={selectedStyle}
            uploadedImage={uploadedImage}
            selectedOrientation={selectedOrientation}
            autoGenerationComplete={autoGenerationComplete}
            onStepClick={() => {
              console.log('🐛 Clicked on step 1');
              onCurrentStepChange(1);
            }}
            onPhotoAndStyleComplete={onPhotoAndStyleComplete}
            onContinue={handleContinueToStep2}
            completedSteps={completedSteps}
            onStepChange={onCurrentStepChange}
          />

          <OrientationStep
            currentStep={currentStep}
            isActive={currentStep === 2}
            isCompleted={completedSteps.includes(2)}
            canAccess={canProceedToStep(2)}
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            uploadedImage={uploadedImage}
            onStepClick={() => {
              console.log('🐛 Clicked on step 2, canAccess:', canProceedToStep(2));
              if (canProceedToStep(2)) {
                onCurrentStepChange(2);
              }
            }}
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
            selectedSize={selectedSize}
            onStepClick={() => {
              console.log('🐛 Clicked on step 3, canAccess:', canProceedToStep(3));
              if (canProceedToStep(3)) {
                onCurrentStepChange(3);
              }
            }}
            onCustomizationChange={onCustomizationChange}
          />

          <ReviewOrderStep
            currentStep={currentStep}
            isActive={currentStep === 4}
            isCompleted={completedSteps.includes(4)}
            canAccess={canProceedToStep(4)}
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
            onStepClick={() => {
              console.log('🐛 Clicked on step 4, canAccess:', canProceedToStep(4));
              if (canProceedToStep(4)) {
                onCurrentStepChange(4);
              }
            }}
          />
        </Accordion>
      </div>
    </StylePreviewProvider>
  );
};

export default ProductContent;
