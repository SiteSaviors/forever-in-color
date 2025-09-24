
import { CustomizationOptions, PreviewState } from "./types/productState";
import { useProductSteps } from "./hooks/useProductSteps";
import CascadeErrorBoundary from "./components/ErrorBoundaries/CascadeErrorBoundary";
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
  preview: PreviewState;
  startPreview: (styleId: number, styleName: string) => Promise<string | null>;
  cancelPreview: () => void;
  isGenerating: boolean;
  generationErrors: { [key: number]: string };
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
  preview,
  startPreview,
  cancelPreview,
  isGenerating,
  generationErrors,
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

  // Add validation for required props
  if (typeof currentStep !== 'number' || !Array.isArray(completedSteps)) {
    return <LoadingState message="Loading product configuration..." />;
  }

  return (
    <CascadeErrorBoundary
      enableAnalytics={true}
      maxRetries={2}
      onNavigateHome={() => window.location.href = '/'}
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
            preview={preview}
            startPreview={startPreview}
            cancelPreview={cancelPreview}
            isGenerating={isGenerating}
            generationErrors={generationErrors}
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
    </CascadeErrorBoundary>
 );
} // end of function

export default ProductContent;
