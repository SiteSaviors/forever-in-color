
import OrientationSelector from "../OrientationSelector";
import ProductStepWrapper from "./ProductStepWrapper";

interface OrientationStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  selectedOrientation: string;
  selectedSize: string;
  uploadedImage: string | null;
  onStepClick: () => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onContinue: () => void;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

const OrientationStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  selectedOrientation,
  selectedSize,
  uploadedImage,
  onStepClick,
  onOrientationSelect,
  onSizeSelect,
  onContinue,
  completedSteps,
  onStepChange
}: OrientationStepProps) => {
  return (
    <ProductStepWrapper
      stepNumber={2}
      title="Choose Size"
      description={`Perfect! Your ${selectedOrientation} canvas is ready. Now select the ideal size.`}
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {currentStep === 2 && (
        <OrientationSelector
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          userImageUrl={uploadedImage}
          onOrientationChange={onOrientationSelect}
          onSizeChange={(size) => {
            console.log('🐛 Size changed to:', size);
            onSizeSelect(size);
          }}
          onContinue={onContinue}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={onStepChange}
        />
      )}
    </ProductStepWrapper>
  );
};

export default OrientationStep;
