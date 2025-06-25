
import ProductStep from "../ProductStep";
import CustomizationSelector from "../CustomizationSelector";

interface CustomizationStepProps {
  currentStep: number;
  completedSteps: number[];
  selectedSize: string;
  customizations: any;
  canAccess: boolean;
  onStepClick: () => void;
  onCustomizationChange: (customizations: any) => void;
}

const CustomizationStep = ({
  currentStep,
  completedSteps,
  selectedSize,
  customizations,
  canAccess,
  onStepClick,
  onCustomizationChange
}: CustomizationStepProps) => {
  const isActive = currentStep === 3;
  const isCompleted = completedSteps.includes(3);

  return (
    <ProductStep
      stepNumber={3}
      title="Customize Your Canvas"
      description="Add premium features and customizations"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {isActive && (
        <CustomizationSelector
          customizations={customizations}
          selectedSize={selectedSize}
          onCustomizationChange={onCustomizationChange}
        />
      )}
    </ProductStep>
  );
};

export default CustomizationStep;
