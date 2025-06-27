
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStepIcon, getStepTitle, getStepDescription, getLockStatus, triggerHapticFeedback } from "./ProductStepUtils";

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
  const Icon = getStepIcon(stepNumber);
  const lockStatus = getLockStatus(isCompleted, canAccess);

  const handleStepClick = () => {
    if (canAccess) {
      triggerHapticFeedback();
      onStepClick();
    }
  };

  // Enhanced step header with better visual hierarchy
  const StepHeader = () => (
    <div className="flex items-center justify-between w-full py-6">
      <div className="flex items-center space-x-4">
        {/* Step number with enhanced states */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
          isCompleted && "bg-green-500 border-green-500 text-white",
          isActive && !isCompleted && "bg-blue-500 border-blue-500 text-white shadow-lg",
          !isActive && !isCompleted && canAccess && "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600",
          !canAccess && "border-gray-200 text-gray-400"
        )}>
          {isCompleted ? (
            <Check className="w-6 h-6" />
          ) : lockStatus === 'locked' ? (
            <Lock className="w-5 h-5" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>

        {/* Step content with improved typography */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className={cn(
              "text-lg font-semibold transition-colors duration-200",
              isActive && "text-blue-600",
              isCompleted && "text-green-600",
              !canAccess && "text-gray-400"
            )}>
              {title}
            </h3>
            
            {/* Enhanced step badges */}
            {isCompleted && (
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Completed
              </span>
            )}
            {isActive && !isCompleted && (
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full animate-pulse">
                Current Step
              </span>
            )}
            {selectedStyle && stepNumber === 1 && (
              <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                {selectedStyle.name}
              </span>
            )}
          </div>
          
          <p className={cn(
            "text-sm mt-1 transition-colors duration-200",
            isActive && "text-gray-700",
            !isActive && "text-gray-500"
          )}>
            {description}
          </p>
        </div>
      </div>

      {/* Interactive step indicator */}
      <div className="flex items-center space-x-2">
        {canAccess && !isActive && (
          <ChevronRight className={cn(
            "w-5 h-5 transition-all duration-200",
            "text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1"
          )} />
        )}
      </div>
    </div>
  );

  return (
    <AccordionItem 
      value={`step-${stepNumber}`} 
      className={cn(
        "border rounded-lg transition-all duration-300 mb-6",
        isActive && "border-blue-200 bg-blue-50/30 shadow-md",
        isCompleted && "border-green-200 bg-green-50/20",
        !canAccess && "border-gray-100 bg-gray-50/50"
      )}
      data-step={stepNumber}
    >
      <AccordionTrigger
        onClick={handleStepClick}
        className={cn(
          "hover:no-underline px-6 group transition-all duration-200",
          canAccess && "hover:bg-white/50 cursor-pointer",
          !canAccess && "cursor-not-allowed opacity-60",
          "[&[data-state=open]>div>div:last-child>svg]:rotate-90"
        )}
        disabled={!canAccess}
      >
        <StepHeader />
      </AccordionTrigger>

      <AccordionContent className="px-6 pb-6">
        {/* Enhanced content wrapper with better spacing */}
        <div className={cn(
          "transition-all duration-300",
          isActive && "animate-in slide-in-from-top-2 fade-in duration-500"
        )}>
          {/* Step progress indicator for multi-part steps */}
          {stepNumber === 1 && (
            <div className="mb-6 p-4 bg-white/80 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Step Progress:</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Upload</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Smart Crop</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">Orientation</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">Style</span>
              </div>
            </div>
          )}
          
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ActiveStepView;
