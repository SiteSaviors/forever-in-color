
import { memo, lazy, Suspense, useMemo } from 'react';
import StepErrorBoundary from './StepErrorBoundary';
import LoadingState from './LoadingState';
import { PreviewState } from '../types/productState';

// Lazy load step components for better code splitting
const PhotoUploadStep = lazy(() => import('./PhotoUploadStep'));
const CanvasConfigurationStep = lazy(() => import('./CanvasConfigurationStep'));
const CustomizationStep = lazy(() => import('./CustomizationStep'));
const ReviewOrderStep = lazy(() => import('./ReviewOrderStep'));

interface ProductStepsManagerProps {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: any;
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
  onCustomizationChange: (customizations: any) => void;
  canProceedToStep: (step: number) => boolean;
  handleContinueToStep2: () => void;
  handleContinueToStep3: () => void;
  handleContinueToStep4: () => void;
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
  preview,
  startPreview,
  cancelPreview,
  isGenerating,
  generationErrors,
  onCurrentStepChange,
  onPhotoAndStyleComplete,
  onOrientationSelect,
  onSizeSelect,
  onCustomizationChange,
  canProceedToStep,
  handleContinueToStep2,
  handleContinueToStep3,
  handleContinueToStep4: _handleContinueToStep4
}: ProductStepsManagerProps) => {

  const previewError = useMemo(() => {
    const errors = Object.values(generationErrors || {});
    return errors.length > 0 ? errors[0] ?? null : null;
  }, [generationErrors]);

  if (process.env.NODE_ENV !== 'production') {
    void startPreview;
    void cancelPreview;
  }

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
            previewUrls={preview.previewUrls}
            isGeneratingPreviews={isGenerating}
            previewError={previewError}
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
