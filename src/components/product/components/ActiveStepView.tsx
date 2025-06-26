
import { LucideIcon, Check, ChevronRight, Sparkles, Lock } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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

  // Safely render style name
  const renderStyleName = () => {
    if (stepNumber === 1 && selectedStyle?.name) {
      return (
        <span className={`ml-3 font-medium text-lg md:text-xl transition-colors duration-300 ${
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
                    {renderStyleName()}
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
              <ErrorBoundary fallback={
                <div className="text-center py-4">
                  <p className="text-gray-600">Unable to load step content. Please refresh the page.</p>
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
