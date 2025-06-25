
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { Accordion } from "@/components/ui/accordion";
import { useProductSteps } from "./hooks/useProductSteps";
import PhotoUploadStep from "./steps/PhotoUploadStep";
import OrientationStep from "./steps/OrientationStep";
import CustomizationStep from "./steps/CustomizationStep";
import ReviewStep from "./steps/ReviewStep";

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
  
  console.log('🐛 ProductContent Debug:', {
    currentStep,
    completedSteps,
    selectedStyle,
    selectedSize,
    selectedOrientation,
    uploadedImage: !!uploadedImage,
    autoGenerationComplete
  });

  const { canProceedToStep, handleStepTransition } = useProductSteps(completedSteps);

  const createStepHandler = (targetStep: number) => () => {
    console.log(`🐛 User clicked continue to step ${targetStep}`);
    handleStepTransition(targetStep, onCurrentStepChange);
  };

  return (
    <StylePreviewProvider 
      croppedImage={uploadedImage} 
      selectedOrientation={selectedOrientation}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            completedSteps={completedSteps}
            selectedStyle={selectedStyle}
            uploadedImage={uploadedImage}
            selectedOrientation={selectedOrientation}
            autoGenerationComplete={autoGenerationComplete}
            onStepClick={() => {
              console.log('🐛 Clicked on step 1');
              onCurrentStepChange(1);
            }}
            onPhotoAndStyleComplete={onPhotoAndStyleComplete}
            onContinueToStep2={createStepHandler(2)}
            onStepChange={onCurrentStepChange}
          />

          <OrientationStep
            currentStep={currentStep}
            completedSteps={completedSteps}
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            uploadedImage={uploadedImage}
            canAccess={canProceedToStep(2)}
            onStepClick={() => {
              console.log('🐛 Clicked on step 2, canAccess:', canProceedToStep(2));
              if (canProceedToStep(2)) {
                onCurrentStepChange(2);
              }
            }}
            onOrientationChange={(orientation) => {
              console.log('🐛 Orientation changed to:', orientation);
              onOrientationSelect(orientation);
            }}
            onSizeChange={(size) => {
              console.log('🐛 Size changed to:', size);
              onSizeSelect(size);
            }}
            onContinueToStep3={createStepHandler(3)}
            onStepChange={onCurrentStepChange}
          />

          <CustomizationStep
            currentStep={currentStep}
            completedSteps={completedSteps}
            selectedSize={selectedSize}
            customizations={customizations}
            canAccess={canProceedToStep(3)}
            onStepClick={() => {
              console.log('🐛 Clicked on step 3, canAccess:', canProceedToStep(3));
              if (canProceedToStep(3)) {
                onCurrentStepChange(3);
              }
            }}
            onCustomizationChange={onCustomizationChange}
          />

          <ReviewStep
            currentStep={currentStep}
            completedSteps={completedSteps}
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
            canAccess={canProceedToStep(4)}
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
