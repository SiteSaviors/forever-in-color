
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductStep from "@/components/product/ProductStep";
import StepContent from "@/components/product/StepContent";
import { Accordion } from "@/components/ui/accordion";
import { Upload, Palette, Settings, Gift } from "lucide-react";

const Product = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState("step-1");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<{ id: number; name: string } | null>(null);

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
      // Auto-advance to next step
      if (stepNumber < 4) {
        setActiveStep(`step-${stepNumber + 1}`);
      }
    }
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    setSelectedStyle({ id: styleId, name: styleName });
    handleStepComplete(1);
  };

  const handlePhotoUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    handleStepComplete(2);
  };

  const totalSteps = 4;

  const steps = [
    {
      id: "step-1",
      number: 1,
      title: "Choose Your Style",
      icon: Palette,
      description: "Select from 15 unique artistic styles",
      required: true,
      estimatedTime: "1-2 minutes"
    },
    {
      id: "step-2", 
      number: 2,
      title: "Upload Your Photo",
      icon: Upload,
      description: "Choose a clear photo with good lighting",
      required: true,
      estimatedTime: "30 seconds"
    },
    {
      id: "step-3",
      number: 3, 
      title: "Add Customizations & AR",
      icon: Settings,
      description: "Size, frame, AR experience, and more",
      required: false,
      estimatedTime: "2-3 minutes"
    },
    {
      id: "step-4",
      number: 4,
      title: "Receive Your Art", 
      icon: Gift,
      description: "Review and complete your order",
      required: true,
      estimatedTime: "1 minute"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      
      <ProductHeader completedSteps={completedSteps} totalSteps={totalSteps} />

      {/* Enhanced Product Configuration */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion 
            type="single" 
            value={activeStep} 
            onValueChange={setActiveStep}
            className="space-y-6"
          >
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.number);
              const isActive = activeStep === step.id;
              const isNextStep = !isCompleted && !isActive && (index === 0 || completedSteps.includes(index));
              
              return (
                <ProductStep
                  key={step.id}
                  step={step}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  isNextStep={isNextStep}
                  selectedStyle={selectedStyle}
                >
                  <StepContent
                    stepNumber={step.number}
                    uploadedImage={uploadedImage}
                    selectedStyle={selectedStyle}
                    onPhotoUpload={handlePhotoUpload}
                    onStyleSelect={handleStyleSelect}
                    onStepComplete={handleStepComplete}
                  />
                </ProductStep>
              );
            })}
          </Accordion>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Product;
