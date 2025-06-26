
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { Accordion } from "@/components/ui/accordion";
import { CustomizationOptions } from "./types/productState";
import { useProductSteps } from "./hooks/useProductSteps";
import { usePreviewGeneration } from "./hooks/usePreviewGeneration";
import PhotoUploadStep from "./components/PhotoUploadStep";
import OrientationStep from "./components/OrientationStep";
import CustomizationStep from "./components/CustomizationStep";
import ReviewOrderStep from "./components/ReviewOrderStep";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingState from "./components/LoadingState";

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

  // Enhanced validation for required props
  if (typeof currentStep !== 'number' || !Array.isArray(completedSteps)) {
    console.error('❌ ProductContent: Invalid props received', { currentStep, completedSteps });
    return <LoadingState message="Loading product configuration..." />;
  }

  // Get the actual preview URLs with error handling
  const { previewUrls, autoGenerationComplete: previewGenerationComplete, error: previewError } = usePreviewGeneration(uploadedImage, selectedOrientation);
  
  console.log('🖼️ ProductContent Preview Debug:', {
    previewUrls,
    previewUrlsKeys: Object.keys(previewUrls || {}),
    previewGenerationComplete,
    selectedStyleId: selectedStyle?.id,
    previewError
  });

  // Handle preview generation errors
  if (previewError) {
    console.error('❌ Preview generation error:', previewError);
  }

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

  // Enhanced step access validation
  const stepAccessValidation = {
    step1: canProceedToStep(1),
    step2: canProceedToStep(2),
    step3: canProceedToStep(3),
    step4: canProceedToStep(4)
  };

  console.log('🔒 Step Access Validation:', stepAccessValidation);

  return (
    <ErrorBoundary>
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
            <ErrorBoundary>
              <PhotoUploadStep
                currentStep={currentStep}
                isActive={currentStep === 1}
                isCompleted={completedSteps.includes(1)}
                canAccess={stepAccessValidation.step1}
                selectedStyle={selectedStyle}
                uploadedImage={uploadedImage}
                selectedOrientation={selectedOrientation}
                autoGenerationComplete={autoGenerationComplete}
                onStepClick={() => {
                  console.log('🐛 Clicked on step 1');
                  if (stepAccessValidation.step1) {
                    onCurrentStepChange(1);
                  } else {
                    console.warn('⚠️ Step 1 access denied');
                  }
                }}
                onPhotoAndStyleComplete={onPhotoAndStyleComplete}
                onContinue={handleContinueToStep2}
                completedSteps={completedSteps}
                onStepChange={onCurrentStepChange}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <OrientationStep
                currentStep={currentStep}
                isActive={currentStep === 2}
                isCompleted={completedSteps.includes(2)}
                canAccess={stepAccessValidation.step2}
                selectedOrientation={selectedOrientation}
                selectedSize={selectedSize}
                uploadedImage={uploadedImage}
                onStepClick={() => {
                  console.log('🐛 Clicked on step 2, canAccess:', stepAccessValidation.step2);
                  if (stepAccessValidation.step2) {
                    onCurrentStepChange(2);
                  } else {
                    console.warn('⚠️ Step 2 access denied');
                  }
                }}
                onOrientationSelect={onOrientationSelect}
                onSizeSelect={onSizeSelect}
                onContinue={handleContinueToStep3}
                completedSteps={completedSteps}
                onStepChange={onCurrentStepChange}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <CustomizationStep
                currentStep={currentStep}
                isActive={currentStep === 3}
                isCompleted={completedSteps.includes(3)}
                canAccess={stepAccessValidation.step3}
                selectedSize={selectedSize}
                customizations={customizations}
                selectedOrientation={selectedOrientation}
                selectedStyle={selectedStyle}
                previewUrls={previewUrls}
                userArtworkUrl={uploadedImage}
                onCustomizationChange={onCustomizationChange}
                onStepClick={() => {
                  console.log('🐛 Clicked on step 3, canAccess:', stepAccessValidation.step3);
                  if (stepAccessValidation.step3) {
                    onCurrentStepChange(3);
                  } else {
                    console.warn('⚠️ Step 3 access denied');
                  }
                }}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <ReviewOrderStep
                currentStep={currentStep}
                isActive={currentStep === 4}
                isCompleted={completedSteps.includes(4)}
                canAccess={stepAccessValidation.step4}
                uploadedImage={uploadedImage}
                selectedStyle={selectedStyle}
                selectedSize={selectedSize}
                selectedOrientation={selectedOrientation}
                customizations={customizations}
                onStepClick={() => {
                  console.log('🐛 Clicked on step 4, canAccess:', stepAccessValidation.step4);
                  if (stepAccessValidation.step4) {
                    onCurrentStepChange(4);
                  } else {
                    console.warn('⚠️ Step 4 access denied');
                  }
                }}
              />
            </ErrorBoundary>
          </Accordion>
        </div>
      </StylePreviewProvider>
    </ErrorBoundary>
  );
};

export default ProductContent;
