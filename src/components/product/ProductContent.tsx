import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import ProductStep from "./ProductStep";
import { useProductStepsConfig } from "./ProductStepsConfig";

interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface ProductContentProps {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  uploadedImage: string | null;
  previewUrls: { [key: number]: string };
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
  previewUrls,
  autoGenerationComplete,
  onCurrentStepChange,
  onPhotoAndStyleComplete,
  onOrientationSelect,
  onSizeSelect,
  onCustomizationChange
}: ProductContentProps) => {
  const [accordionValue, setAccordionValue] = useState<string>(`step-${currentStep}`);

  const handleEditStep = (stepNumber: number) => {
    onCurrentStepChange(stepNumber);
    setAccordionValue(`step-${stepNumber}`);
  };

  const handleContinue = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= 4) {
      onCurrentStepChange(nextStep);
      setAccordionValue(`step-${nextStep}`);
    }
  };

  // Function to check if a step can be accessed
  const canAccessStep = (stepNumber: number) => {
    if (stepNumber === 1) return true; // First step is always accessible
    
    // For steps 2-4, all previous steps must be completed
    for (let i = 1; i < stepNumber; i++) {
      if (!completedSteps.includes(i)) {
        return false;
      }
    }
    return true;
  };

  // Handle accordion value change with access control
  const handleAccordionChange = (value: string) => {
    const stepNumber = parseInt(value.replace('step-', ''));
    
    if (canAccessStep(stepNumber)) {
      setAccordionValue(value);
      onCurrentStepChange(stepNumber);
    } else {
      // Don't allow opening steps that aren't accessible
      // Keep the current accordion value
      return;
    }
  };

  const steps = useProductStepsConfig({
    completedSteps,
    selectedStyle,
    selectedSize,
    selectedOrientation,
    customizations,
    uploadedImage,
    previewUrls,
    autoGenerationComplete,
    onPhotoAndStyleComplete,
    onOrientationSelect,
    onSizeSelect,
    onCustomizationChange,
    onEditStep: handleEditStep,
    onContinue: handleContinue
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Accordion 
        type="single" 
        value={accordionValue} 
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = completedSteps.includes(step.number);
          const isNextStep = step.number === currentStep + 1;
          const isAccessible = canAccessStep(step.number);

          return (
            <div key={step.id} className={!isAccessible ? 'opacity-50 pointer-events-none' : ''}>
              <ProductStep
                step={step}
                isCompleted={isCompleted}
                isActive={isActive}
                isNextStep={isNextStep && isAccessible}
                selectedStyle={selectedStyle}
              >
                {isAccessible ? step.content : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-medium">Complete previous steps to unlock this section</p>
                    <p className="text-sm mt-2">Please finish step {step.number - 1} before proceeding</p>
                  </div>
                )}
              </ProductStep>
            </div>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ProductContent;
