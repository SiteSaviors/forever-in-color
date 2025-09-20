
import { LucideIcon, Check, ChevronRight, Sparkles, Lock, Unlock, CheckCircle, Upload, Palette, Settings, ShoppingCart, Circle, Edit3 } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  // Determine the lock status for gentle progression indication
  const getLockStatus = () => {
    if (isCompleted) return "complete";
    if (!canAccess) return "locked";
    return "none";
  };

  const lockStatus = getLockStatus();

  const handleEditSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStepClick();
  };

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
        className={`px-4 md:px-8 py-4 md:py-6 hover:no-underline group ${!canAccess ? 'cursor-default' : ''}`}
        disabled={!canAccess}
        onClick={onStepClick}
      >
        <div className="flex items-center gap-3 md:gap-6 w-full">
          {/* Step Icon - Simplified without number badge */}
          <div className="relative">
            <div className={`
              relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg
              ${isCompleted 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200' 
                : isActive && canAccess
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                : !canAccess
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500'}
            `}>
              {isCompleted ? (
                <Check className="w-5 h-5 md:w-7 md:h-7 animate-in zoom-in duration-300" />
              ) : (
                <Icon className="w-5 h-5 md:w-7 md:h-7" />
              )}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="flex-1 text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
              <div className="flex items-center gap-2">
                <h3 className={`
                  text-lg md:text-xl font-semibold transition-colors duration-300 font-poppins tracking-tight
                  ${isCompleted || (isActive && canAccess) ? 'text-gray-900' 
                    : !canAccess ? 'text-gray-500'
                    : 'text-gray-500 group-hover:text-gray-700'}
                `}>
                  {title}
                  {stepNumber === 1 && selectedStyle && (
                    <span className="text-purple-600 ml-2 font-normal text-base md:text-lg">- {selectedStyle.name}</span>
                  )}
                </h3>
                
                {/* Status Indicators */}
                {lockStatus === "locked" && (
                  <div className="transition-all duration-300">
                    <Lock className="w-4 h-4 text-gray-400 opacity-60" />
                  </div>
                )}
                
                {lockStatus === "complete" && (
                  <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {/* Enhanced Edit Selection Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditSelection}
                      className="h-8 px-3 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-200 opacity-80 hover:opacity-100 min-h-[44px] md:min-h-[32px]"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Edit Selection</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description - Hidden on mobile when completed to reduce clutter */}
            <p className={`text-sm ${
              !canAccess ? 'text-gray-400' : 'text-gray-500'
            } ${isCompleted ? 'hidden md:block' : 'hidden md:block'}`}>
              {description}
            </p>
          </div>
          
          {/* Status Badges and Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {isCompleted && (
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 animate-in fade-in duration-500 text-xs">
                ✓ Done
              </Badge>
            )}
            
            {isNextStep && canAccess && !isActive && (
              <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 text-xs hidden md:inline-flex animate-pulse">
                Next
              </Badge>
            )}
            
            {/* Enhanced chevron */}
            <ChevronRight className={`
              w-4 h-4 md:w-5 md:h-5 transition-all duration-300
              ${isActive && canAccess ? 'rotate-90 text-purple-500' 
                : !canAccess ? 'text-gray-300'
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
