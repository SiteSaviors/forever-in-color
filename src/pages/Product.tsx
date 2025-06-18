
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoUpload from "@/components/product/PhotoUpload";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Check, Upload, Palette, Settings, Gift } from "lucide-react";

const Product = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState("step-1");

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
      // Auto-advance to next step
      if (stepNumber < 4) {
        setActiveStep(`step-${stepNumber + 1}`);
      }
    }
  };

  const steps = [
    {
      id: "step-1",
      number: 1,
      title: "Upload Your Photo",
      icon: Upload,
      description: "Choose a clear photo with good lighting",
      required: true
    },
    {
      id: "step-2", 
      number: 2,
      title: "Choose Your Style",
      icon: Palette,
      description: "Select from 15 unique artistic styles",
      required: true
    },
    {
      id: "step-3",
      number: 3, 
      title: "Add Customizations & AR",
      icon: Settings,
      description: "Size, frame, AR experience, and more",
      required: false
    },
    {
      id: "step-4",
      number: 4,
      title: "Receive Your Art", 
      icon: Gift,
      description: "Review and complete your order",
      required: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Create Your Masterpiece
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your precious memories into stunning canvas art with AI-powered artistic styles and magical AR experiences.
          </p>
        </div>
      </section>

      {/* Product Configuration */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion 
            type="single" 
            value={activeStep} 
            onValueChange={setActiveStep}
            className="space-y-6"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.number);
              const isActive = activeStep === step.id;
              
              return (
                <AccordionItem 
                  key={step.id}
                  value={step.id}
                  className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden"
                >
                  <AccordionTrigger className="px-8 py-6 hover:no-underline group">
                    <div className="flex items-center gap-6 w-full">
                      {/* Step Icon/Number */}
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}>
                        {isCompleted ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1 text-left">
                        <h3 className={`
                          text-xl font-semibold transition-colors duration-300
                          ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}
                        `}>
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Required Badge */}
                      {step.required && !isCompleted && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                          Required
                        </span>
                      )}
                      
                      {/* Completed Badge */}
                      {isCompleted && (
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                          Complete
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-8 pb-8">
                    <div className="border-t border-gray-100 pt-6">
                      {step.number === 1 && (
                        <PhotoUpload onUploadComplete={() => handleStepComplete(1)} />
                      )}
                      {step.number === 2 && (
                        <div className="text-center py-8 text-gray-500">
                          Style selection coming next...
                        </div>
                      )}
                      {step.number === 3 && (
                        <div className="text-center py-8 text-gray-500">
                          Customization options coming next...
                        </div>
                      )}
                      {step.number === 4 && (
                        <div className="text-center py-8 text-gray-500">
                          Order summary coming next...
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
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
