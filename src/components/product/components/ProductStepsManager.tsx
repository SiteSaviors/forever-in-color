
import { memo, lazy, Suspense } from 'react';
import StepErrorBoundary from './StepErrorBoundary';
import LoadingState from './LoadingState';
import { ProductStepData, StepHandlers, CustomizationConfig } from '../types/stepTypes';

// Lazy load step components for better code splitting
const PhotoUploadStep = lazy(() => import('./PhotoUploadStep'));
const CanvasConfigurationStep = lazy(() => import('./CanvasConfigurationStep'));
const CustomizationStep = lazy(() => import('./CustomizationStep'));
const ReviewOrderStep = lazy(() => import('./ReviewOrderStep'));

interface ProductStepsManagerProps extends ProductStepData, StepHandlers {
  currentStep: number;
  completedSteps: number[];
  onCurrentStepChange: (step: number) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onCustomizationChange: (customizations: CustomizationConfig) => void;
}

const ProductStepsManager = memo(({
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
  handleContinueToStep4
}: ProductStepsManagerProps) => {

  const handleNavigateHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <StepErrorBoundary stepNumber={1} onNavigateHome={handleNavigateHome}>
        <Suspense fallback={<LoadingState message="Loading photo upload..." />}>
          <PhotoUploadStep
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
          />
        </Suspense>
      </StepErrorBoundary>

      <StepErrorBoundary stepNumber={2} onNavigateHome={handleNavigateHome}>
        <Suspense fallback={<LoadingState message="Loading canvas configuration..." />}>
          <CanvasConfigurationStep
            currentStep={currentStep}
            isActive={currentStep === 2}
            isCompleted={completedSteps.includes(2)}
            canAccess={canProceedToStep(2)}
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            uploadedImage={uploadedImage}
            onStepClick={() => {
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
        </Suspense>
      </StepErrorBoundary>

      <StepErrorBoundary stepNumber={3} onNavigateHome={handleNavigateHome}>
        <Suspense fallback={<LoadingState message="Loading customization options..." />}>
          <CustomizationStep
            currentStep={currentStep}
            isActive={currentStep === 3}
            isCompleted={completedSteps.includes(3)}
            canAccess={canProceedToStep(3)}
            selectedSize={selectedSize}
            customizations={customizations}
            selectedOrientation={selectedOrientation}
            selectedStyle={selectedStyle}
            previewUrls={{}}
            userArtworkUrl={uploadedImage}
            onCustomizationChange={onCustomizationChange}
            onStepClick={() => {
              if (canProceedToStep(3)) {
                onCurrentStepChange(3);
              }
            }}
          />
        </Suspense>
      </StepErrorBoundary>

      <StepErrorBoundary stepNumber={4} onNavigateHome={handleNavigateHome}>
        <Suspense fallback={<LoadingState message="Loading order review..." />}>
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
              if (canProceedToStep(4)) {
                onCurrentStepChange(4);
              }
            }}
          />
        </Suspense>
      </StepErrorBoundary>
    </>
  );
});

ProductStepsManager.displayName = 'ProductStepsManager';

export default ProductStepsManager;
