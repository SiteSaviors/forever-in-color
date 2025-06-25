
import { LucideIcon, Check, ChevronRight, Sparkles, Lock, Unlock, CheckCircle, Upload, Palette, Settings, ShoppingCart, Circle } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ProductStepProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
  selectedStyle?: { id: number; name: string } | null;
  children: React.ReactNode;
}

const ProductStep = ({ 
  stepNumber,
  title,
  description,
  isActive, 
  isCompleted, 
  canAccess,
  onStepClick,
  selectedStyle, 
  children 
}: ProductStepProps) => {
  
  // Get appropriate icon for each step using proper ES module imports
  const getStepIcon = (stepNum: number): LucideIcon => {
    const icons = {
      1: Upload,
      2: Palette, 
      3: Settings,
      4: ShoppingCart
    };
    return icons[stepNum as keyof typeof icons] || Circle;
  };

  const Icon = getStepIcon(stepNumber);
  const isNextStep = !isCompleted && canAccess && !isActive;

  // Enhanced step click with smooth scroll
  const handleStepClick = () => {
    if (!canAccess) return;
    
    onStepClick();
    
    // Smooth scroll to this step
    requestAnimationFrame(() => {
      setTimeout(() => {
        const targetElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (targetElement) {
          const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetTop = elementTop - 80; // Header offset
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }, 100);
    });
  };

  // Determine the lock status for gentle progression indication
  const getLockStatus = () => {
    if (isCompleted) return "complete";
    if (!canAccess) return "locked";
    return "none";
  };

  const lockStatus = getLockStatus();

  return (
    <AccordionItem 
      value={`step-${stepNumber}`}
      data-step={stepNumber}
      className={`
        relative bg-white rounded-xl md:rounded-2xl shadow-lg border-0 overflow-hidden transition-all duration-500
        ${isActive && canAccess ? 'ring-2 ring-purple-200 shadow-xl transform scale-[1.01] md:scale-[1.02]' : ''}
        ${isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}
        ${isNextStep && canAccess ? 'ring-1 ring-purple-100' : ''}
      `}
    >
      {/* Subtle gradient overlay for active state */}
      {isActive && canAccess && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
      )}
      
      {/* Success sparkle effect */}
      {isCompleted && (
        <div className="absolute top-3 md:top-4 right-3 md:right-4 text-green-500">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
        </div>
      )}

      <AccordionTrigger 
        className={`px-4 md:px-8 py-6 md:py-8 hover:no-underline group min-h-[80px] md:min-h-[100px] touch-manipulation ${!canAccess ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
        disabled={!canAccess}
        onClick={handleStepClick}
      >
        <div className="flex items-center gap-4 md:gap-6 w-full">
          {/* Step Icon/Number - Enhanced touch targets */}
          <div className="relative">
            <div className={`
              relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
              ${isCompleted 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200' 
                : isActive && canAccess
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                : !canAccess
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500'}
            `}>
              {isCompleted ? (
                <Check className="w-6 h-6 md:w-8 md:h-8 animate-in zoom-in duration-300" />
              ) : (
                <Icon className="w-6 h-6 md:w-8 md:h-8" />
              )}
              
              {/* Step number badge - Enhanced size */}
              <div className={`
                absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-bold flex items-center justify-center
                ${isCompleted ? 'bg-green-600 text-white' 
                  : isActive && canAccess ? 'bg-white text-purple-600' 
                  : !canAccess ? 'bg-gray-300 text-gray-500'
                  : 'bg-gray-300 text-gray-600'}
              `}>
                {stepNumber}
              </div>
            </div>
          </div>
          
          {/* Step Content - Enhanced typography */}
          <div className="flex-1 text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
              <div className="flex items-center gap-2">
                <h3 className={`
                  text-lg md:text-xl lg:text-2xl font-semibold transition-colors duration-300 font-poppins tracking-tight
                  ${isCompleted || (isActive && canAccess) ? 'text-gray-900' 
                    : !canAccess ? 'text-gray-500'
                    : 'text-gray-500 group-hover:text-gray-700'}
                `}>
                  {title}
                  {stepNumber === 1 && selectedStyle && (
                    <span className="text-purple-600 ml-2 font-normal text-base md:text-lg lg:text-xl">- {selectedStyle.name}</span>
                  )}
                </h3>
                
                {/* Gentle progression indicator */}
                {lockStatus === "locked" && (
                  <div className="transition-all duration-300">
                    <Lock className="w-4 h-4 text-gray-400 opacity-60" />
                  </div>
                )}
                
                {lockStatus === "complete" && (
                  <div className="animate-in zoom-in duration-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>
            
            <p className={`text-sm md:text-base hidden md:block ${!canAccess ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </p>
          </div>
          
          {/* Status Badges and Actions - Enhanced mobile visibility */}
          <div className="flex items-center gap-2 md:gap-3">
            {isCompleted && (
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 animate-in fade-in duration-500 text-xs md:text-sm px-2 py-1">
                ✓ Done
              </Badge>
            )}
            
            {isNextStep && canAccess && !isActive && (
              <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 text-xs md:text-sm animate-pulse px-2 py-1">
                Next
              </Badge>
            )}
            
            {/* Enhanced chevron with better touch feedback */}
            <ChevronRight className={`
              w-5 h-5 md:w-6 md:h-6 transition-all duration-300
              ${isActive && canAccess ? 'rotate-90 text-purple-500' 
                : !canAccess ? 'text-gray-300'
                : 'text-gray-400 group-hover:text-gray-600 group-active:scale-90'}
            `} />
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 md:px-8 pb-6 md:pb-8">
        <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-4 md:pt-6 relative">
          {/* Content area with enhanced mobile padding */}
          <div className="bg-gradient-to-r from-gray-50/50 to-purple-50/30 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-100">
            {children}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProductStep;
