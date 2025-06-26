
import CustomizationSelector from "../CustomizationSelector";
import ProductStepWrapper from "./ProductStepWrapper";
import { CustomizationOptions } from "../types/productState";

interface CustomizationStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  customizations: CustomizationOptions;
  selectedSize: string;
  onStepClick: () => void;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
}

const CustomizationStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  customizations,
  selectedSize,
  onStepClick,
  onCustomizationChange
}: CustomizationStepProps) => {
  return (
    <ProductStepWrapper
      stepNumber={3}
      title="Customize Your Canvas"
      description="Add premium features and customizations"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {currentStep === 3 && (
        <CustomizationSelector
          customizations={customizations}
          selectedSize={selectedSize}
          onCustomizationChange={onCustomizationChange}
        />
      )}
    </ProductStepWrapper>
  );
};

export default CustomizationStep;
