
import ProductStep from "../ProductStep";
import OrientationSelector from "../OrientationSelector";

interface OrientationStepProps {
  currentStep: number;
  completedSteps: number[];
  selectedOrientation: string;
  selectedSize: string;
  uploadedImage: string | null;
  canAccess: boolean;
  onStepClick: () => void;
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinueToStep3: () => void;
  onStepChange: (step: number) => void;
}

const OrientationStep = ({
  currentStep,
  completedSteps,
  selectedOrientation,
  selectedSize,
  uploadedImage,
  canAccess,
  onStepClick,
  onOrientationChange,
  onSizeChange,
  onContinueToStep3,
  onStepChange
}: OrientationStepProps) => {
  const isActive = currentStep === 2;
  const isCompleted = completedSteps.includes(2);

  return (
    <ProductStep
      stepNumber={2}
      title="Choose Layout & Size"
      description="Select your canvas orientation and size"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {isActive && (
        <OrientationSelector
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          userImageUrl={uploadedImage}
          onOrientationChange={onOrientationChange}
          onSizeChange={onSizeChange}
          onContinue={onContinueToStep3}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={onStepChange}
        />
      )}
    </ProductStep>
  );
};

export default OrientationStep;
