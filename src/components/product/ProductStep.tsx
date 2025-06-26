
import { LucideIcon, Check, ChevronRight, ChevronDown, Sparkles, Lock, CheckCircle, Upload, Palette, Settings, ShoppingCart, Circle, Edit3 } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";

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
  completedPreview?: React.ReactNode;
}

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator vibrate(50);
  }
};

const ProductStep = ({ 
  stepNumber,
  title,
  description,
  isActive, 
  isCompleted, 
  canAccess,
  onStepClick,
  selectedStyle, 
  children,
  completedPreview
}: ProductStepProps) => {
  
  const [isCollapsedOpen, setIsCollapsedOpen] = useState(false);
  
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

  const getLockStatus = () => {
    if (isCompleted) return "complete";
    if (!canAccess) return "locked";
    return "none";
  };

  const lockStatus = getLockStatus();

  const handleStepClick = () => {
    if (canAccess) {
      triggerHapticFeedback();
      onStepClick();
    }
  };

  const handleEditSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback();
    onStepClick();
  };

  const toggleCollapsedPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsedOpen(!isCollapsedOpen);
  };

  // Render completed step in collapsed state when not active
  if (isCompleted && !isActive) {
    return (
      <div className="relative bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden transition-all duration-300 hover:shadow-md mb-4">
        {/* Success gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/30 pointer-events-none" />
        
        {/* Collapsed Header */}
        <div className="px-6 md:px-8 py-4 md:py-5">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Success Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg flex items-center justify-center">
                <Check className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            
            {/* Collapsed Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 font-poppins">
                  {title}
                  {stepNumber === 1 && selectedStyle && (
                    <span className="text-green-600 ml-3 font-medium text-base md:text-lg">- {selectedStyle.name}</span>
                  )}
                </h3>
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              </div>
              
              {/* Completed preview summary */}
              {completedPreview && (
                <div className="text-sm text-gray-600 mb-2">
                  Step completed successfully
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-3 py-1 text-sm font-medium rounded-full">
                ✓ Complete
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditSelection}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 rounded-xl border border-green-200 hover:border-green-300 hover:shadow-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              
              {/* Expand/Collapse Button */}
              {completedPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCollapsedPreview}
                  className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                >
                  {isCollapsedOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
          
          {/* Collapsible Preview */}
          {completedPreview && (
            <Collapsible open={isCollapsedOpen}>
              <CollapsibleContent className="animate-accordion-down">
                <div className="mt-4 pt-4 border-t border-green-100">
                  <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-xl p-4 border border-green-100">
                    {completedPreview}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    );
  }

  return (
    <AccordionItem 
      value={`step-${stepNumber}`}
      data-step={stepNumber}
      className={`
        relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden 
        transition-all duration-500 ease-out hover:shadow-xl
        ${isActive && canAccess ? 'ring-2 ring-purple-200 shadow-xl transform scale-[1.01] animate-fade-in' : ''}
        ${isNextStep && canAccess ? 'ring-1 ring-purple-100 hover:ring-2 hover:ring-purple-200 animate-pulse' : ''}
      `}
    >
      {/* Premium gradient overlay for active state */}
      {isActive && canAccess && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none animate-fade-in" />
      )}
      
      {/* Success sparkle effect */}
      {isCompleted && (
        <div className="absolute top-4 right-4 text-green-500 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      <AccordionTrigger 
        className={`px-6 md:px-8 py-6 md:py-8 hover:no-underline group min-h-[80px] transition-all duration-300 ${!canAccess ? 'cursor-default' : ''}`}
        disabled={!canAccess}
        onClick={handleStepClick}
      >
        <div className="flex items-center gap-4 md:gap-6 w-full">
          {/* Enhanced Step Icon with smooth transitions */}
          <div className="relative flex-shrink-0">
            <div className={`
              relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center 
              transition-all duration-500 shadow-lg transform
              ${isCompleted 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200/50 scale-105' 
                : isActive && canAccess
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 scale-105 animate-pulse'
                : !canAccess
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500 group-hover:scale-105'}
            `}>
              {isCompleted ? (
                <Check className="w-6 h-6 md:w-7 md:h-7 animate-in zoom-in duration-500" />
              ) : (
                <Icon className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-300" />
              )}
            </div>
          </div>
          
          {/* Enhanced Step Content with better visual hierarchy */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className={`
                  text-xl md:text-2xl font-bold transition-colors duration-300 font-poppins tracking-tight
                  ${isCompleted || (isActive && canAccess) ? 'text-gray-900' 
                    : !canAccess ? 'text-gray-500'
                    : 'text-gray-600 group-hover:text-gray-800'}
                `}>
                  {title}
                  {stepNumber === 1 && selectedStyle && (
                    <span className={`ml-3 font-medium text-lg md:text-xl transition-colors duration-300 ${
                      isActive ? 'text-purple-600' : 'text-gray-600'
                    }`}>- {selectedStyle.name}</span>
                  )}
                </h3>
                
                {/* Enhanced Status Indicators with smooth transitions */}
                {lockStatus === "locked" && (
                  <div className="transition-all duration-300 opacity-60">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Context-aware description visibility */}
            <p className={`text-base md:text-lg leading-relaxed transition-all duration-300 ${
              !canAccess ? 'text-gray-400' : 'text-gray-600'
            } ${isActive ? 'block' : 'hidden md:block'}`}>
              {description}
            </p>
          </div>
          
          {/* Enhanced Status Badges and Actions with smooth animations */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isNextStep && canAccess && !isActive && (
              <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 px-3 py-1 text-sm font-medium rounded-full hidden md:inline-flex animate-pulse">
                Next Step
              </Badge>
            )}
            
            {/* Enhanced chevron with smooth transitions */}
            <ChevronRight className={`
              w-6 h-6 transition-all duration-500 ease-out
              ${isActive && canAccess ? 'rotate-90 text-purple-500 scale-110' 
                : !canAccess ? 'text-gray-300'
                : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:scale-110'}
            `} />
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-6 md:px-8 pb-6 md:pb-8 animate-accordion-down">
        <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-6 relative">
          {/* Enhanced content area with premium styling and animations */}
          <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/40 rounded-2xl p-4 md:p-8 border border-gray-100/50 shadow-inner animate-fade-in">
            {children}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProductStep;
