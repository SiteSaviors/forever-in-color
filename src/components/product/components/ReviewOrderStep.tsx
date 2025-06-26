
import ReviewAndOrder from "../ReviewAndOrder";
import ProductStepWrapper from "./ProductStepWrapper";
import { CustomizationOptions } from "../types/productState";

interface ReviewOrderStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  uploadedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  onStepClick: () => void;
}

const ReviewOrderStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  uploadedImage,
  selectedStyle,
  selectedSize,
  selectedOrientation,
  customizations,
  onStepClick
}: ReviewOrderStepProps) => {
  return (
    <ProductStepWrapper
      stepNumber={4}
      title="Review & Order"
      description="Review your canvas and place your order"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {currentStep === 4 && (
        <ReviewAndOrder
          uploadedImage={uploadedImage}
          selectedStyle={selectedStyle}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
        />
      )}
    </ProductStepWrapper>
  );
};

export default ReviewOrderStep;
