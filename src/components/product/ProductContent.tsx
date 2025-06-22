
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
  onCurrentStepChange,
  onPhotoAndStyleComplete,
  onOrientationSelect,
  onSizeSelect,
  onCustomizationChange
}: ProductContentProps) => {
  const steps = useProductStepsConfig({
    completedSteps,
    selectedStyle,
    selectedSize,
    selectedOrientation,
    customizations,
    uploadedImage,
    onPhotoAndStyleComplete,
    onOrientationSelect,
    onSizeSelect,
    onCustomizationChange,
    onEditStep: onCurrentStepChange
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 pb-24 md:pb-32">
      <Accordion 
        type="single" 
        value={`step-${currentStep}`} 
        onValueChange={(value) => {
          if (value) {
            const stepNumber = parseInt(value.replace('step-', ''));
            onCurrentStepChange(stepNumber);
          }
        }}
        className="space-y-4 md:space-y-8"
      >
        {steps.map((step) => (
          <ProductStep
            key={step.id}
            step={step}
            isCompleted={step.isCompleted}
            isActive={currentStep === step.number}
            isNextStep={currentStep + 1 === step.number}
            selectedStyle={selectedStyle}
          >
            {step.content}
          </ProductStep>
        ))}
      </Accordion>
    </div>
  );
};

export default ProductContent;
