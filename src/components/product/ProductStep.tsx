
import { LucideIcon, Check, ChevronRight, Sparkles, Lock, Unlock } from "lucide-react";
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
  isAccessible?: boolean;
  wasJustUnlocked?: boolean;
  selectedStyle?: { id: number; name: string } | null;
  children: React.ReactNode;
}

const ProductStep = ({ 
  step, 
  isCompleted, 
  isActive, 
  isNextStep,
  isAccessible = true,
  wasJustUnlocked = false,
  selectedStyle, 
  children 
}: ProductStepProps) => {
  const Icon = step.icon;

  return (
    <AccordionItem 
      value={`step-${step.number}`}
      className={`
        relative bg-white rounded-xl md:rounded-2xl shadow-lg border-0 overflow-hidden transition-all duration-500
        ${isActive && isAccessible ? 'ring-2 ring-purple-200 shadow-xl transform scale-[1.01] md:scale-[1.02]' : ''}
        ${isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}
        ${isNextStep && isAccessible ? 'ring-1 ring-purple-100' : ''}
        ${!isAccessible ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      {/* Subtle gradient overlay for active state */}
      {isActive && isAccessible && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
      )}
      
      {/* Success sparkle effect */}
      {isCompleted && (
        <div className="absolute top-3 md:top-4 right-3 md:right-4 text-green-500">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
        </div>
      )}

      <AccordionTrigger 
        className={`px-4 md:px-8 py-4 md:py-6 hover:no-underline group ${!isAccessible ? 'cursor-not-allowed' : ''}`}
        disabled={!isAccessible}
      >
        <div className="flex items-center gap-3 md:gap-6 w-full">
          {/* Step Icon/Number with lock/unlock indicators */}
          <div className="relative">
            <div className={`
              relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg
              ${isCompleted 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200' 
                : isActive && isAccessible
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                : !isAccessible
                ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500'}
            `}>
              {isCompleted ? (
                <Check className="w-5 h-5 md:w-7 md:h-7 animate-in zoom-in duration-300" />
              ) : !isAccessible ? (
                <Icon className="w-5 h-5 md:w-7 md:h-7 opacity-50" />
              ) : (
                <Icon className="w-5 h-5 md:w-7 md:h-7" />
              )}
              
              {/* Step number badge */}
              <div className={`
                absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 rounded-full text-xs font-bold flex items-center justify-center
                ${isCompleted ? 'bg-green-600 text-white' 
                  : isActive && isAccessible ? 'bg-white text-purple-600' 
                  : !isAccessible ? 'bg-gray-400 text-gray-600'
                  : 'bg-gray-300 text-gray-600'}
              `}>
                {step.number}
              </div>
            </div>

            {/* Lock/Unlock Animation positioned next to the main icon */}
            {!isAccessible && !isCompleted && (
              <div className="absolute -right-2 -bottom-1 md:-right-3 md:-bottom-2">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center shadow-sm">
                  <Lock className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                </div>
              </div>
            )}
            
            {wasJustUnlocked && (
              <div className="absolute -right-2 -bottom-1 md:-right-3 md:-bottom-2 animate-in zoom-in duration-700">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center shadow-sm">
                  <Unlock className="w-3 h-3 md:w-4 md:h-4 text-green-600 animate-pulse" />
                </div>
              </div>
            )}
          </div>
          
          {/* Step Content */}
          <div className="flex-1 text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
              <div className="flex items-center gap-2">
                <h3 className={`
                  text-lg md:text-xl font-semibold transition-colors duration-300 font-poppins tracking-tight
                  ${isCompleted || (isActive && isAccessible) ? 'text-gray-900' 
                    : !isAccessible ? 'text-gray-400'
                    : 'text-gray-500 group-hover:text-gray-700'}
                `}>
                  {step.title}
                  {step.number === 1 && selectedStyle && (
                    <span className="text-purple-600 ml-2 font-normal text-base md:text-lg">- {selectedStyle.name}</span>
                  )}
                </h3>
                
                {/* Only lock indicator next to step title */}
                {!isAccessible && (
                  <Lock className="w-4 h-4 text-red-500" />
                )}
                
                {wasJustUnlocked && (
                  <Unlock className="w-4 h-4 text-green-600 animate-pulse" />
                )}
              </div>
              
              {/* Time estimate - hidden on mobile to save space */}
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full hidden md:inline">
                ~{step.estimatedTime}
              </span>
            </div>
            
            <p className={`text-sm hidden md:block ${!isAccessible ? 'text-gray-400' : 'text-gray-500'}`}>
              {step.description}
            </p>
          </div>
          
          {/* Status Badges and Actions - removed duplicate locked indicators */}
          <div className="flex items-center gap-2 md:gap-3">
            {step.required && !isCompleted && isAccessible && (
              <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-xs hidden md:inline-flex">
                Required
              </Badge>
            )}
            
            {isCompleted && (
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 animate-in fade-in duration-500 text-xs">
                ✓ Done
              </Badge>
            )}
            
            {isNextStep && isAccessible && !isActive && (
              <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 text-xs hidden md:inline-flex animate-pulse">
                Next
              </Badge>
            )}
            
            {/* Enhanced chevron */}
            <ChevronRight className={`
              w-4 h-4 md:w-5 md:h-5 transition-all duration-300
              ${isActive && isAccessible ? 'rotate-90 text-purple-500' 
                : !isAccessible ? 'text-gray-300'
                : 'text-gray-400 group-hover:text-gray-600'}
            `} />
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 md:px-8 pb-4 md:pb-8">
        <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-3 md:pt-6 relative">
          {/* Content area with reduced padding on mobile */}
          <div className="bg-gradient-to-r from-gray-50/50 to-purple-50/30 rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-100">
            {children}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProductStep;
