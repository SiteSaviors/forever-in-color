
import React from "react";
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
  // Safely get the icon with error handling
  const Icon = React.useMemo(() => {
    try {
      return getStepIcon(stepNumber);
    } catch (error) {
      console.error('Error getting step icon:', error);
      return ChevronRight; // fallback icon
    }
  }, [stepNumber]);

  const isNextStep = !isCompleted && canAccess && !isActive;
  const lockStatus = getLockStatus(isCompleted, canAccess);

  const handleStepClick = () => {
    try {
      if (canAccess) {
        triggerHapticFeedback();
        onStepClick();
      }
    } catch (error) {
      console.error('Error in step click handler:', error);
    }
  };

  // Safely render style name with improved mobile typography
  const renderStyleName = () => {
    if (stepNumber === 1 && selectedStyle?.name) {
      return (
        <span className={`ml-1 sm:ml-2 font-medium text-sm sm:text-base transition-colors duration-300 ${
          isActive ? 'text-purple-600' : 'text-gray-600'
        }`}>
          - {selectedStyle.name}
        </span>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary>
      <AccordionItem 
        value={`step-${stepNumber}`}
        data-step={stepNumber}
        className={`
          relative bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden 
          transition-all duration-300 ease-out hover:shadow-lg mx-1 sm:mx-0 mb-2 sm:mb-4
          ${isActive && canAccess ? 'ring-2 ring-purple-200 shadow-lg transform scale-[1.005] animate-fade-in' : ''}
          ${isNextStep && canAccess ? 'ring-1 ring-purple-100 hover:ring-2 hover:ring-purple-200' : ''}
        `}
      >
        {/* Premium gradient overlay for active state */}
        {isActive && canAccess && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 to-pink-500/3 pointer-events-none animate-fade-in" />
        )}
        
        {/* Success indicator */}
        {isCompleted && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-green-500">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        )}

        <AccordionTrigger 
          className={`px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 hover:no-underline group min-h-[56px] transition-all duration-300 ${!canAccess ? 'cursor-default' : ''}`}
          disabled={!canAccess}
          onClick={handleStepClick}
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full">
            {/* Mobile-optimized Step Icon */}
            <TouchTarget size="sm" className="flex-shrink-0">
              <div className={`
                relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center 
                transition-all duration-300 shadow-sm
                ${isCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200/30' 
                  : isActive && canAccess
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/30'
                  : !canAccess
                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500'}
              `}>
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                )}
              </div>
            </TouchTarget>
            
            {/* Mobile-first Step Content */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                  <MobileTypography
                    variant="h4"
                    className={`
                      font-semibold transition-colors duration-300 font-poppins tracking-tight leading-tight
                      ${isCompleted || (isActive && canAccess) ? 'text-gray-900' 
                        : !canAccess ? 'text-gray-500'
                        : 'text-gray-600 group-hover:text-gray-800'}
                    `}
                  >
                    {title}
                    {renderStyleName()}
                  </MobileTypography>
                  
                  {/* Lock Status Indicator */}
                  {lockStatus === "locked" && (
                    <div className="transition-all duration-300 opacity-60 self-start sm:self-center">
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile-optimized description - only show when active or on larger screens */}
              <MobileTypography
                variant="caption"
                className={`transition-all duration-300 mt-0.5 sm:mt-1 ${
                  !canAccess ? 'text-gray-400' : 'text-gray-600'
                } ${isActive ? 'block' : 'hidden sm:block'}`}
              >
                {description}
              </MobileTypography>
            </div>
            
            {/* Mobile-optimized status and chevron */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isNextStep && canAccess && !isActive && (
                <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 px-1.5 py-0.5 text-xs font-medium rounded-full hidden sm:inline-flex">
                  Next
                </Badge>
              )}
              
              <TouchTarget size="sm" interactive={false}>
                <ChevronRight className={`
                  w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ease-out
                  ${isActive && canAccess ? 'rotate-90 text-purple-500' 
                    : !canAccess ? 'text-gray-300'
                    : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5'}
                `} />
              </TouchTarget>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
          <div className="border-t border-gray-100 pt-3 sm:pt-4 relative">
            {/* Mobile-optimized content area */}
            <div className="bg-gradient-to-r from-gray-50/60 to-purple-50/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-100/30 shadow-inner">
              <ErrorBoundary fallback={
                <div className="text-center py-3 sm:py-4">
                  <MobileTypography variant="caption" className="text-gray-600">
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
