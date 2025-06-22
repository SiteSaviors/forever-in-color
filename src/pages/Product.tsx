
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Upload, Image as ImageIcon, Palette, Gift, Settings } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductStep from "@/components/product/ProductStep";
import StylePreview from "@/components/product/StylePreview";
import PhotoUpload from "@/components/product/PhotoUpload";
import OrientationSelector from "@/components/product/OrientationSelector";
import CustomizationSelector from "@/components/product/CustomizationSelector";
import PricingSection from "@/components/product/PricingSection";
import TrustElements from "@/components/product/TrustElements";
import PriceCalculator from "@/components/product/PriceCalculator";

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

const Product = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<{id: number, name: string} | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("horizontal");
  const [customizations, setCustomizations] = useState<CustomizationOptions>({
    floatingFrame: {
      enabled: false,
      color: 'white'
    },
    livingMemory: false,
    voiceMatch: false,
    customMessage: '',
    aiUpscale: false
  });

  // Handle pre-selected style from style landing pages
  useEffect(() => {
    if (location.state?.preSelectedStyle && location.state?.styleName) {
      setSelectedStyle({
        id: location.state.preSelectedStyle,
        name: location.state.styleName
      });
      setCompletedSteps([1]);
      setCurrentStep(2);
    }
  }, [location.state]);

  const handleStyleSelect = (styleId: number, styleName: string) => {
    setSelectedStyle({ id: styleId, name: styleName });
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    if (!completedSteps.includes(2)) {
      setCompletedSteps([...completedSteps, 2]);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (!completedSteps.includes(3)) {
      setCompletedSteps([...completedSteps, 3]);
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    setSelectedOrientation(orientation);
    // Reset size when orientation changes
    setSelectedSize("");
    // Remove step 3 completion if it was completed, since we're changing orientation
    if (completedSteps.includes(3)) {
      setCompletedSteps(completedSteps.filter(step => step !== 3));
    }
  };

  const handleCustomizationChange = (newCustomizations: CustomizationOptions) => {
    setCustomizations(newCustomizations);
    if (!completedSteps.includes(4)) {
      setCompletedSteps([...completedSteps, 4]);
    }
  };

  const canProceedToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return completedSteps.includes(1);
    if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);
    if (step === 4) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
    if (step === 5) return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3) && completedSteps.includes(4);
    return false;
  };

  const steps = [
    {
      id: "style",
      number: 1,
      title: "Choose Your Style",
      icon: Palette,
      description: "Browse our collection of 15 unique artistic styles",
      required: true,
      estimatedTime: "2 min",
      isCompleted: completedSteps.includes(1),
      content: (
        <StylePreview
          uploadedImage={uploadedImage}
          onStyleSelect={handleStyleSelect}
          onComplete={() => setCurrentStep(2)}
          preSelectedStyle={selectedStyle}
        />
      )
    },
    {
      id: "photo",
      number: 2,
      title: "Upload Your Photo",
      icon: Upload,
      description: "Share the memory you'd like to transform into art",
      required: true,
      estimatedTime: "1 min",
      isCompleted: completedSteps.includes(2),
      content: (
        <PhotoUpload
          onUploadComplete={handleImageUpload}
        />
      )
    },
    {
      id: "customize",
      number: 3,
      title: "Choose Size & Layout",
      icon: ImageIcon,
      description: "Select your canvas orientation and size",
      required: true,
      estimatedTime: "2 min",
      isCompleted: completedSteps.includes(3),
      content: (
        <div className="space-y-4 md:space-y-8">
          <OrientationSelector
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            onOrientationChange={handleOrientationSelect}
            onSizeChange={handleSizeSelect}
          />
        </div>
      )
    },
    {
      id: "customizations",
      number: 4,
      title: "Add Customizations & AR",
      icon: Settings,
      description: "Choose optional add-ons and personalization features",
      required: false,
      estimatedTime: "3 min",
      isCompleted: completedSteps.includes(4),
      content: (
        <CustomizationSelector
          selectedSize={selectedSize}
          customizations={customizations}
          onCustomizationChange={handleCustomizationChange}
        />
      )
    },
    {
      id: "order",
      number: 5,
      title: "Review & Order",
      icon: Gift,
      description: "Review your order and complete your purchase",
      required: true,
      estimatedTime: "2 min",
      isCompleted: false,
      content: (
        <PricingSection />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <ProductHeader 
          completedSteps={completedSteps}
          totalSteps={steps.length}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 pb-24 md:pb-32">
          <Accordion 
            type="single" 
            value={`step-${currentStep}`} 
            onValueChange={(value) => {
              if (value) {
                const stepNumber = parseInt(value.replace('step-', ''));
                setCurrentStep(stepNumber);
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

        <TrustElements />
      </div>

      <PriceCalculator
        selectedSize={selectedSize}
        selectedOrientation={selectedOrientation}
        customizations={customizations}
      />

      <Footer />
    </div>
  );
};

export default Product;
