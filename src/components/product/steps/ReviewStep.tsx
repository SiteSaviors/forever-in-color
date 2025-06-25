
import ProductStep from "../ProductStep";
import ReviewAndOrder from "../ReviewAndOrder";

interface ReviewStepProps {
  currentStep: number;
  completedSteps: number[];
  uploadedImage: string | null;
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: any;
  canAccess: boolean;
  onStepClick: () => void;
}

const ReviewStep = ({
  currentStep,
  completedSteps,
  uploadedImage,
  selectedStyle,
  selectedSize,
  selectedOrientation,
  customizations,
  canAccess,
  onStepClick
}: ReviewStepProps) => {
  const isActive = currentStep === 4;
  const isCompleted = completedSteps.includes(4);

  return (
    <ProductStep
      stepNumber={4}
      title="Review & Order"
      description="Review your canvas and place your order"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {isActive && (
        <ReviewAndOrder
          uploadedImage={uploadedImage}
          selectedStyle={selectedStyle}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
        />
      )}
    </ProductStep>
  );
};

export default ReviewStep;
