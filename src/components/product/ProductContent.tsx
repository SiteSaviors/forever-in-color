
import { useState } from "react";
import { Check, Lock } from "lucide-react";
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

  // Handle accordion value change with access control and visual feedback
  const handleAccordionChange = (value: string) => {
    const stepNumber = parseInt(value.replace('step-', ''));
    
    if (canAccessStep(stepNumber)) {
      setAccordionValue(value);
      onCurrentStepChange(stepNumber);
    } else {
      // Provide visual feedback for locked steps (could add toast notification here)
      console.log(`Step ${stepNumber} is locked. Complete previous steps first.`);
      // Keep the current accordion value - don't change it
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
      {/* Progress indicator with lock states */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Your Progress</span>
          <span>{completedSteps.length} of 4 steps completed</span>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isAccessible = canAccessStep(step.number);
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent && isAccessible
                    ? 'bg-purple-500 text-white'
                    : !isAccessible
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-300 text-gray-600'}
                `}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 mx-1 transition-colors duration-300
                    ${completedSteps.includes(step.number) ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            );
          })}
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

          return (
            <div key={step.id} className={!isAccessible ? 'opacity-50 pointer-events-none' : ''}>
              <ProductStep
                step={step}
                isCompleted={isCompleted}
                isActive={isActive}
                isNextStep={isNextStep && isAccessible}
                isAccessible={isAccessible}
                selectedStyle={selectedStyle}
              >
                {isAccessible ? step.content : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="mb-4">
                      <Lock className="w-12 h-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-lg font-medium">Complete previous steps to unlock this section</p>
                    <p className="text-sm mt-2">Please finish step {step.number - 1} before proceeding</p>
                    <div className="mt-4 text-xs text-gray-400">
                      Steps must be completed in order to ensure the best experience
                    </div>
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
