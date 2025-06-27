
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { LucideIcon, Check, ChevronRight, Sparkles, Lock } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MobileTypography } from "@/components/ui/mobile-typography";
import { TouchTarget } from "@/components/ui/mobile-touch-target";
import { getStepIcon, getLockStatus, triggerHapticFeedback } from "./ProductStepUtils";
import ErrorBoundary from "./ErrorBoundary";

interface ActiveStepViewProps {
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

const ActiveStepView = ({
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  canAccess,
  onStepClick,
  selectedStyle,
  children
}: ActiveStepViewProps) => {
  // Debounced hover state to prevent rapid re-renders
  const [isHovered, setIsHovered] = useState(false);
  const [debouncedHover, setDebouncedHover] = useState(false);

  // Debounce hover state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHover(isHovered);
    }, 100);

    return () => clearTimeout(timer);
  }, [isHovered]);

  // Memoized expensive calculations
  const computedStyles = useMemo(() => {
    const isNextStep = !isCompleted && canAccess && !isActive;
    
    const containerClasses = `
      relative bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden 
      transition-all duration-500 ease-out hover:shadow-xl mx-2 sm:mx-0
      ${isActive && canAccess ? 'ring-2 ring-purple-200 shadow-xl transform scale-[1.01] animate-fade-in' : ''}
      ${isNextStep && canAccess ? 'ring-1 ring-purple-100 hover:ring-2 hover:ring-purple-200 animate-pulse' : ''}
    `;

    const iconClasses = `
      relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center 
      transition-all duration-500 shadow-lg transform
      ${isCompleted 
        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200/50 scale-105' 
        : isActive && canAccess
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 scale-105 animate-pulse'
        : !canAccess
        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500 group-hover:scale-105'}
    `;

    const titleClasses = `
      font-bold transition-colors duration-300 font-poppins tracking-tight
      ${isCompleted || (isActive && canAccess) ? 'text-gray-900' 
        : !canAccess ? 'text-gray-500'
        : 'text-gray-600 group-hover:text-gray-800'}
    `;

    const chevronClasses = `
      w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ease-out
      ${isActive && canAccess ? 'rotate-90 text-purple-500 scale-110' 
        : !canAccess ? 'text-gray-300'
        : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:scale-110'}
    `;

    return {
      containerClasses,
      iconClasses,
      titleClasses,
      chevronClasses,
      isNextStep
    };
  }, [isActive, isCompleted, canAccess, debouncedHover]);

  // Memoized icon component
  const Icon = useMemo(() => {
    try {
      return getStepIcon(stepNumber);
    } catch (error) {
      console.error('Error getting step icon:', error);
      return ChevronRight;
    }
  }, [stepNumber]);

  // Memoized lock status
  const lockStatus = useMemo(() => {
    return getLockStatus(isCompleted, canAccess);
  }, [isCompleted, canAccess]);

  // Memoized style name rendering
  const styleNameElement = useMemo(() => {
    if (stepNumber === 1 && selectedStyle?.name) {
      return (
        <span className={`ml-2 sm:ml-3 font-medium text-base sm:text-lg md:text-xl transition-colors duration-300 ${
          isActive ? 'text-purple-600' : 'text-gray-600'
        }`}>
          - {selectedStyle.name}
        </span>
      );
    }
    return null;
  }, [stepNumber, selectedStyle?.name, isActive]);

  // Optimized event handlers with useCallback
  const handleStepClick = useCallback(() => {
    try {
      if (canAccess) {
        triggerHapticFeedback();
        onStepClick();
      }
    } catch (error) {
      console.error('Error in step click handler:', error);
    }
  }, [canAccess, onStepClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <ErrorBoundary>
      <AccordionItem 
        value={`step-${stepNumber}`}
        data-step={stepNumber}
        className={computedStyles.containerClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Premium gradient overlay for active state */}
        {isActive && canAccess && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none animate-fade-in" />
        )}
        
        {/* Success sparkle effect */}
        {isCompleted && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-green-500 animate-pulse">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}

        <AccordionTrigger 
          className={`px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 hover:no-underline group min-h-[60px] sm:min-h-[80px] transition-all duration-300 ${!canAccess ? 'cursor-default' : ''}`}
          disabled={!canAccess}
          onClick={handleStepClick}
        >
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full">
            {/* Enhanced Step Icon with mobile-optimized sizing */}
            <TouchTarget size="lg" className="flex-shrink-0">
              <div className={computedStyles.iconClasses}>
                {isCompleted ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-in zoom-in duration-500" />
                ) : (
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform duration-300" />
                )}
              </div>
            </TouchTarget>
            
            {/* Enhanced Step Content with mobile-first typography */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex flex-col gap-1 sm:gap-2 mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-wrap">
                  <MobileTypography
                    variant="h3"
                    className={computedStyles.titleClasses}
                  >
                    {title}
                    {styleNameElement}
                  </MobileTypography>
                  
                  {/* Enhanced Status Indicators */}
                  {lockStatus === "locked" && (
                    <div className="transition-all duration-300 opacity-60 sm:self-center">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile-optimized description */}
              <MobileTypography
                variant="body"
                className={`transition-all duration-300 ${
                  !canAccess ? 'text-gray-400' : 'text-gray-600'
                } ${isActive ? 'block' : 'hidden sm:block'}`}
              >
                {description}
              </MobileTypography>
            </div>
            
            {/* Mobile-optimized status badges and actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {computedStyles.isNextStep && canAccess && !isActive && (
                <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 px-2 py-1 text-xs sm:text-sm font-medium rounded-full hidden sm:inline-flex animate-pulse">
                  Next Step
                </Badge>
              )}
              
              {/* Enhanced chevron with mobile-optimized sizing */}
              <TouchTarget size="sm" interactive={false}>
                <ChevronRight className={computedStyles.chevronClasses} />
              </TouchTarget>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 animate-accordion-down">
          <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-4 sm:pt-6 relative">
            {/* Enhanced content area with mobile-optimized spacing */}
            <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-8 border border-gray-100/50 shadow-inner animate-fade-in">
              <ErrorBoundary fallback={
                <div className="text-center py-4">
                  <MobileTypography variant="body" className="text-gray-600">
                    Unable to load step content. Please refresh the page.
                  </MobileTypography>
                </div>
              }>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </ErrorBoundary>
  );
};

export default ActiveStepView;
