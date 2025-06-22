
import ProductStep from "./ProductStep";
import StepContent from "./StepContent";

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
  const handleStepComplete = (stepNumber: number) => {
    // Mark step as complete and move to next step if not at the end
    if (stepNumber < 4) {
      onCurrentStepChange(stepNumber + 1);
    }
  };

  const handlePhotoUpload = (imageUrl: string) => {
    // This will be handled by the combined onPhotoAndStyleComplete
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    // This will be handled by the combined onPhotoAndStyleComplete
  };

  const handleEditStep = (step: number) => {
    onCurrentStepChange(step);
  };

  const steps = [
    { 
      number: 1, 
      title: "Choose Your Style", 
      description: "Select the perfect artistic transformation" 
    },
    { 
      number: 2, 
      title: "Upload Your Photo", 
      description: "Upload and crop your special moment" 
    },
    { 
      number: 3, 
      title: "Customize Canvas", 
      description: "Size, frame, and special features" 
    },
    { 
      number: 4, 
      title: "Review & Order", 
      description: "Finalize your masterpiece" 
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          {steps.map((step, index) => (
            <ProductStep
              key={step.number}
              stepNumber={step.number}
              title={step.title}
              description={step.description}
              isActive={currentStep === step.number}
              isCompleted={completedSteps.includes(step.number)}
              isLast={index === steps.length - 1}
              onClick={() => onCurrentStepChange(step.number)}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <StepContent
          stepNumber={currentStep}
          uploadedImage={uploadedImage}
          selectedStyle={selectedStyle}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
          onPhotoUpload={handlePhotoUpload}
          onStyleSelect={handleStyleSelect}
          onStepComplete={handleStepComplete}
          onEditStep={handleEditStep}
        />
      </div>
    </div>
  );
};

export default ProductContent;
