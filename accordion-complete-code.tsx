
// ===================================
// COMPLETE ACCORDION CODE FOR E-COMMERCE PRODUCT CONFIGURATION
// ===================================
// This file contains all the code needed to replicate the accordion functionality
// from the Lovable art transformation e-commerce site

import { useState } from "react";
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown, ChevronRight, Check, Sparkles, Upload, Palette, Settings, Gift, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils" // You'll need this utility function

// ===================================
// UTILITY FUNCTION (cn - className utility)
// ===================================
// Add this if you don't have it:
/*
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
*/

// ===================================
// UI COMPONENTS (Accordion, Card, Badge, Button)
// ===================================

// Accordion Components (based on Radix UI)
const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

// Card Components
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

// Badge Component
const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline"
}>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      {
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
        "text-foreground": variant === "outline",
      },
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

// Button Component
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline"
}>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2": variant === "default",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2": variant === "outline",
      },
      className
    )}
    {...props}
  />
))
Button.displayName = "Button"

// ===================================
// STYLE PREVIEW COMPONENT
// ===================================

interface ArtStyle {
  id: number;
  name: string;
  description: string;
  popular: boolean;
  colors: string[];
  category: string;
}

interface StylePreviewProps {
  uploadedImage: string | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const StylePreview = ({ uploadedImage, onStyleSelect, onComplete }: StylePreviewProps) => {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);

  const artStyles: ArtStyle[] = [
    {
      id: 1,
      name: "Original Image",
      description: "Keep your photo exactly as it is, with high-quality printing",
      popular: false,
      colors: ["from-gray-400", "via-gray-500", "to-gray-600"],
      category: "Natural"
    },
    {
      id: 2,
      name: "Classic Oil Painting",
      description: "Rich, textured brushstrokes reminiscent of traditional oil paintings",
      popular: true,
      colors: ["from-amber-600", "via-orange-700", "to-red-800"],
      category: "Classic"
    },
    {
      id: 3,
      name: "Watercolor Dreams",
      description: "Soft, flowing watercolor effects with gentle color bleeds",
      popular: true,
      colors: ["from-blue-300", "via-purple-300", "to-pink-300"],
      category: "Artistic"
    },
    {
      id: 4,
      name: "Geometric Grace",
      description: "Modern geometric patterns with clean lines and bold shapes",
      popular: false,
      colors: ["from-teal-400", "via-blue-500", "to-indigo-600"],
      category: "Modern"
    },
    {
      id: 5,
      name: "3D Stylized",
      description: "Three-dimensional effect with depth and modern digital styling",
      popular: true,
      colors: ["from-purple-500", "via-pink-500", "to-red-500"],
      category: "Digital"
    }
    // ... add more styles as needed
  ];

  const handleStyleClick = (style: ArtStyle) => {
    setSelectedStyle(style.id);
  };

  const handleSelectStyle = () => {
    if (selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        onStyleSelect(selectedStyle, style.name);
        onComplete();
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Choose Your Art Style
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our collection of unique artistic styles. Select the one that speaks to you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artStyles.map((style) => {
          const isSelected = selectedStyle === style.id;
          
          return (
            <Card 
              key={style.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
              }`}
              onClick={() => handleStyleClick(style)}
            >
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <div className={`w-full h-full bg-gradient-to-br ${style.colors.join(' ')} opacity-80 flex items-center justify-center`}>
                    <div className="text-center text-white space-y-2">
                      <Wand2 className="w-8 h-8 mx-auto opacity-60" />
                      <p className="text-sm font-medium opacity-90">Preview Style</p>
                    </div>
                  </div>
                  
                  {style.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
                      {style.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">{style.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{style.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[0]}`}></div>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[1]}`}></div>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[2]}`}></div>
                    </div>
                    
                    {isSelected && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedStyle && (
        <div className="text-center pt-6">
          <Button 
            onClick={handleSelectStyle}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Continue with {artStyles.find(s => s.id === selectedStyle)?.name}
          </Button>
        </div>
      )}
    </div>
  );
};

// ===================================
// STEP CONTENT COMPONENT
// ===================================

interface StepContentProps {
  stepNumber: number;
  uploadedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  onPhotoUpload: (imageUrl: string) => void;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onStepComplete: (stepNumber: number) => void;
}

const StepContent = ({ 
  stepNumber, 
  uploadedImage,
  selectedStyle,
  onPhotoUpload, 
  onStyleSelect, 
  onStepComplete 
}: StepContentProps) => {
  if (stepNumber === 1) {
    return (
      <StylePreview 
        uploadedImage={null}
        onStyleSelect={onStyleSelect}
        onComplete={() => onStepComplete(1)}
      />
    );
  }

  if (stepNumber === 2) {
    if (!selectedStyle) {
      return (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Choose your style first</p>
          <p className="text-gray-400 text-sm">Complete step 1 to upload your photo for transformation</p>
        </div>
      );
    }
    // Photo upload component would go here
    return (
      <div className="text-center py-12">
        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">Upload Your Photo</p>
        <p className="text-gray-400 text-sm">Photo upload component goes here</p>
      </div>
    );
  }

  if (stepNumber === 3) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Customize Your Canvas</h3>
          <p className="text-gray-600">Choose your size, frame options, and more</p>
        </div>
        {/* Pricing section would go here */}
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-500">Customization options go here</p>
        </div>
      </div>
    );
  }

  if (stepNumber === 4) {
    return (
      <div className="text-center py-12">
        <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">Almost there!</p>
        <p className="text-gray-400 text-sm">Order summary and checkout coming next...</p>
      </div>
    );
  }

  return null;
};

// ===================================
// PRODUCT STEP COMPONENT
// ===================================

interface ProductStepProps {
  step: {
    id: string;
    number: number;
    title: string;
    icon: React.ComponentType<any>;
    description: string;
    required: boolean;
    estimatedTime: string;
  };
  isCompleted: boolean;
  isActive: boolean;
  isNextStep: boolean;
  selectedStyle?: { id: number; name: string } | null;
  children: React.ReactNode;
}

const ProductStep = ({ 
  step, 
  isCompleted, 
  isActive, 
  isNextStep, 
  selectedStyle, 
  children 
}: ProductStepProps) => {
  const Icon = step.icon;

  return (
    <AccordionItem 
      value={step.id}
      className={`
        relative bg-white rounded-2xl shadow-lg border-0 overflow-hidden transition-all duration-500
        ${isActive ? 'ring-2 ring-purple-200 shadow-xl transform scale-[1.02]' : ''}
        ${isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}
        ${isNextStep ? 'ring-1 ring-purple-100' : ''}
      `}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
      )}
      
      {isCompleted && (
        <div className="absolute top-4 right-4 text-green-500">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      )}

      <AccordionTrigger className="px-8 py-6 hover:no-underline group">
        <div className="flex items-center gap-6 w-full">
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
            
            <div className={`
              absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
              ${isCompleted ? 'bg-green-600 text-white' : isActive ? 'bg-white text-purple-600' : 'bg-gray-300 text-gray-600'}
            `}>
              {step.number}
            </div>
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`
                text-xl font-semibold transition-colors duration-300
                ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}
              `}>
                {step.title}
                {step.number === 1 && selectedStyle && (
                  <span className="text-purple-600 ml-2 font-normal">- {selectedStyle.name}</span>
                )}
              </h3>
              
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                ~{step.estimatedTime}
              </span>
            </div>
            
            <p className="text-gray-500 text-sm">{step.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {step.required && !isCompleted && (
              <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                Required
              </Badge>
            )}
            
            {isCompleted && (
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 animate-in fade-in duration-500">
                ✓ Complete
              </Badge>
            )}
            
            {isNextStep && !isActive && (
              <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200">
                Next
              </Badge>
            )}
            
            <ChevronRight className={`
              w-5 h-5 transition-all duration-300
              ${isActive ? 'rotate-90 text-purple-500' : 'text-gray-400 group-hover:text-gray-600'}
            `} />
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-8 pb-8">
        <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-6 relative">
          <div className="bg-gradient-to-r from-gray-50/50 to-purple-50/30 rounded-xl p-6 border border-gray-100">
            {children}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// ===================================
// MAIN PRODUCT COMPONENT
// ===================================

const Product = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState("step-1");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<{ id: number; name: string } | null>(null);

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
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
    </div>
  );
};

export default Product;

// ===================================
// REQUIRED TAILWIND CSS ANIMATIONS
// ===================================
/*
Add these to your tailwind.config.js:

module.exports = {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
}
*/

// ===================================
// REQUIRED DEPENDENCIES
// ===================================
/*
npm install @radix-ui/react-accordion lucide-react clsx tailwind-merge class-variance-authority
*/
