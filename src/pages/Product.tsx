
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoUpload from "@/components/product/PhotoUpload";
import StylePreview from "@/components/product/StylePreview";
import PricingSection from "@/components/product/PricingSection";
import { Progress } from "@/components/ui/progress";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Check, Upload, Palette, Settings, Gift, ChevronRight, Sparkles } from "lucide-react";

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

  const handlePhotoUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    handleStepComplete(1);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    setSelectedStyle({ id: styleId, name: styleName });
    handleStepComplete(2);
  };

  // Calculate progress percentage
  const totalSteps = 4;
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  const steps = [
    {
      id: "step-1",
      number: 1,
      title: "Upload Your Photo",
      icon: Upload,
      description: "Choose a clear photo with good lighting",
      required: true,
      estimatedTime: "30 seconds"
    },
    {
      id: "step-2", 
      number: 2,
      title: "Choose Your Style",
      icon: Palette,
      description: "Select from 15 unique artistic styles",
      required: true,
      estimatedTime: "1-2 minutes"
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
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              AI-Powered Art Creation
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Create Your Masterpiece
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your precious memories into stunning canvas art with AI-powered artistic styles and magical AR experiences.
          </p>
          
          {/* Enhanced Progress Indicator */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">Your Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-purple-600">{Math.round(progressPercentage)}%</span>
                <span className="text-xs text-gray-500">Complete</span>
              </div>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-3 bg-gray-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
                   style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">{completedSteps.length} of {totalSteps} steps</span>
              <span className="text-xs text-purple-600 font-medium">
                {progressPercentage === 100 ? "🎉 Ready to order!" : "Keep going!"}
              </span>
            </div>
          </div>
        </div>
      </section>

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
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.number);
              const isActive = activeStep === step.id;
              const isNextStep = !isCompleted && !isActive && (index === 0 || completedSteps.includes(index));
              
              return (
                <AccordionItem 
                  key={step.id}
                  value={step.id}
                  className={`
                    relative bg-white rounded-2xl shadow-lg border-0 overflow-hidden transition-all duration-500
                    ${isActive ? 'ring-2 ring-purple-200 shadow-xl transform scale-[1.02]' : ''}
                    ${isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}
                    ${isNextStep ? 'ring-1 ring-purple-100' : ''}
                  `}
                >
                  {/* Subtle gradient overlay for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
                  )}
                  
                  {/* Success sparkle effect */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 text-green-500">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                  )}

                  <AccordionTrigger className="px-8 py-6 hover:no-underline group">
                    <div className="flex items-center gap-6 w-full">
                      {/* Enhanced Step Icon/Number */}
                      <div className={`
                        relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg
                        ${isCompleted 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200' 
                          : isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200 animate-pulse'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500'
                        }
                      `}>
                        {isCompleted ? (
                          <Check className="w-7 h-7 animate-in zoom-in duration-300" />
                        ) : (
                          <Icon className="w-7 h-7" />
                        )}
                        
                        {/* Step number badge */}
                        <div className={`
                          absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                          ${isCompleted ? 'bg-green-600 text-white' : isActive ? 'bg-white text-purple-600' : 'bg-gray-300 text-gray-600'}
                        `}>
                          {step.number}
                        </div>
                      </div>
                      
                      {/* Enhanced Step Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`
                            text-xl font-semibold transition-colors duration-300
                            ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}
                          `}>
                            {step.title}
                            {step.number === 2 && selectedStyle && (
                              <span className="text-purple-600 ml-2 font-normal">- {selectedStyle.name}</span>
                            )}
                          </h3>
                          
                          {/* Time estimate */}
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            ~{step.estimatedTime}
                          </span>
                        </div>
                        
                        <p className="text-gray-500 text-sm">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Enhanced Status Badges */}
                      <div className="flex items-center gap-3">
                        {step.required && !isCompleted && (
                          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium border border-purple-200">
                            Required
                          </span>
                        )}
                        
                        {isCompleted && (
                          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium border border-green-200 animate-in fade-in duration-500">
                            ✓ Complete
                          </span>
                        )}
                        
                        {isNextStep && !isActive && (
                          <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium border border-amber-200">
                            Next
                          </span>
                        )}
                        
                        {/* Subtle chevron */}
                        <ChevronRight className={`
                          w-5 h-5 transition-all duration-300
                          ${isActive ? 'rotate-90 text-purple-500' : 'text-gray-400 group-hover:text-gray-600'}
                        `} />
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-8 pb-8">
                    <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-6 relative">
                      {/* Content area with subtle background */}
                      <div className="bg-gradient-to-r from-gray-50/50 to-purple-50/30 rounded-xl p-6 border border-gray-100">
                        {step.number === 1 && (
                          <PhotoUpload onUploadComplete={handlePhotoUpload} />
                        )}
                        {step.number === 2 && uploadedImage && (
                          <StylePreview 
                            uploadedImage={uploadedImage}
                            onStyleSelect={handleStyleSelect}
                            onComplete={() => handleStepComplete(2)}
                          />
                        )}
                        {step.number === 2 && !uploadedImage && (
                          <div className="text-center py-12">
                            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">Upload your photo first</p>
                            <p className="text-gray-400 text-sm">Complete step 1 to see beautiful style previews</p>
                          </div>
                        )}
                        {step.number === 3 && (
                          <div className="space-y-6">
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Customize Your Canvas</h3>
                              <p className="text-gray-600">Choose your size, frame options, and more</p>
                            </div>
                            <PricingSection />
                          </div>
                        )}
                        {step.number === 4 && (
                          <div className="text-center py-12">
                            <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">Almost there!</p>
                            <p className="text-gray-400 text-sm">Order summary and checkout coming next...</p>
                          </div>
                        )}
                      </div>
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
