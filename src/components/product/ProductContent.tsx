
import { useState } from "react";
import { Check, Lock, Unlock } from "lucide-react";
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

  // TESTING MODE: Allow access to all steps for easier testing
  const canAccessStep = (stepNumber: number) => {
    // Always return true during testing to unlock all steps
    return true;
    
    // Original logic (commented out for testing):
    // if (stepNumber === 1) return true;
    // for (let i = 1; i < stepNumber; i++) {
    //   if (!completedSteps.includes(i)) {
    //     return false;
    //   }
    // }
    // return true;
  };

  // Handle accordion value change - now allows all steps
  const handleAccordionChange = (value: string) => {
    const stepNumber = parseInt(value.replace('step-', ''));
    setAccordionValue(value);
    onCurrentStepChange(stepNumber);
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Simple progress text - removed the visual progress bar */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Your Progress</span>
          <span>{completedSteps.length} of 4 steps completed</span>
        </div>
        {/* Testing indicator */}
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          🧪 Testing Mode: All steps unlocked
        </div>
      </div>

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
          const wasJustUnlocked = false; // Not needed in testing mode

          return (
            <ProductStep
              key={step.id}
              step={step}
              isCompleted={isCompleted}
              isActive={isActive}
              isNextStep={isNextStep && isAccessible}
              isAccessible={isAccessible}
              wasJustUnlocked={wasJustUnlocked}
              selectedStyle={selectedStyle}
            >
              {step.content}
            </ProductStep>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ProductContent;
