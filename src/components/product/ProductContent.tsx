
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { Accordion } from "@/components/ui/accordion";
import { CustomizationOptions } from "./types/productState";
import { useProductSteps } from "./hooks/useProductSteps";
import { usePreviewGeneration } from "./hooks/usePreviewGeneration";
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

  // Get the actual preview URLs from the state management system
  const { previewUrls, autoGenerationComplete: previewGenerationComplete } = usePreviewGeneration(uploadedImage, selectedOrientation);
  
  console.log('🖼️ ProductContent Preview Debug:', {
    previewUrls,
    previewUrlsKeys: Object.keys(previewUrls || {}),
    previewGenerationComplete,
    selectedStyleId: selectedStyle?.id
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
      {/* Enhanced mobile-responsive container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Accordion 
          type="single" 
          value={`step-${currentStep}`} 
          className="space-y-6 sm:space-y-8"
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
            selectedSize={selectedSize}
            customizations={customizations}
            selectedOrientation={selectedOrientation}
            selectedStyle={selectedStyle}
            previewUrls={previewUrls}
            userArtworkUrl={uploadedImage}
            onCustomizationChange={onCustomizationChange}
            onStepClick={() => {
              console.log('🐛 Clicked on step 3, canAccess:', canProceedToStep(3));
              if (canProceedToStep(3)) {
                onCurrentStepChange(3);
              }
            }}
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
        
        {/* Add bottom padding for mobile sticky elements */}
        <div className="h-20 sm:h-0" />
      </div>
    </StylePreviewProvider>
  );
};

export default ProductContent;
