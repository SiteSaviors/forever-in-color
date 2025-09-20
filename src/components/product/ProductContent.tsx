
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { CustomizationOptions } from "./types/productState";
import { useProductSteps } from "./hooks/useProductSteps";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingState from "./components/LoadingState";
import ProductContentContainer from "./components/ProductContentContainer";
import StepAccordion from "./components/StepAccordion";
import ProductStepsManager from "./components/ProductStepsManager";

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

  if (typeof currentStep !== 'number' || !Array.isArray(completedSteps)) {
    return <LoadingState message="Loading product configuration..." />;
  }

  return (
    <ErrorBoundary>
      <StylePreviewProvider 
        croppedImage={uploadedImage} 
        selectedOrientation={selectedOrientation}
      >
        <ProductContentContainer>
          <StepAccordion currentStep={currentStep}>
            <ProductStepsManager
              currentStep={currentStep}
              completedSteps={completedSteps}
              selectedStyle={selectedStyle}
              selectedSize={selectedSize}
              selectedOrientation={selectedOrientation}
              customizations={customizations}
              uploadedImage={uploadedImage}
              autoGenerationComplete={autoGenerationComplete}
              onCurrentStepChange={onCurrentStepChange}
              onPhotoAndStyleComplete={onPhotoAndStyleComplete}
              onOrientationSelect={onOrientationSelect}
              onSizeSelect={onSizeSelect}
              onCustomizationChange={onCustomizationChange}
              canProceedToStep={canProceedToStep}
              handleContinueToStep2={handleContinueToStep2}
              handleContinueToStep3={handleContinueToStep3}
              handleContinueToStep4={handleContinueToStep4}
            />
          </StepAccordion>
        </ProductContentContainer>
      </StylePreviewProvider>
    </ErrorBoundary>
  );
};

export default ProductContent;
