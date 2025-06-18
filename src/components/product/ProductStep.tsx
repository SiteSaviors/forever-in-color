
import { LucideIcon, Check, ChevronRight, Sparkles } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ProductStepProps {
  step: {
    id: string;
    number: number;
    title: string;
    icon: LucideIcon;
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
                {step.number === 1 && selectedStyle && (
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
            {children}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProductStep;
