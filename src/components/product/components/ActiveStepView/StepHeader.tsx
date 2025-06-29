
import React from "react";
import { AccordionTrigger } from "@/components/ui/accordion";
import StepIcon from "./StepIcon";
import { triggerHapticFeedback } from "../ProductStepUtils";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
  selectedStyle?: { id: number; name: string } | null;
}

const StepHeader = React.memo(({
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  canAccess,
  onStepClick,
  selectedStyle
}: StepHeaderProps) => {
  const handleStepClick = React.useCallback(() => {
    try {
      if (canAccess) {
        triggerHapticFeedback();
        onStepClick();
      }
    } catch (error) {
      console.error('Error in step click handler:', error);
    }
  }, [canAccess, onStepClick]);

  return (
    <AccordionTrigger 
      className={`px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 hover:no-underline group min-h-[60px] sm:min-h-[80px] transition-all duration-300 ${!canAccess ? 'cursor-default' : ''}`}
      disabled={!canAccess}
      onClick={handleStepClick}
    >
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full">
        <StepIcon
          isCompleted={isCompleted}
        >
          {stepNumber}
        </StepIcon>
        
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          {selectedStyle && (
            <p className="text-xs text-purple-600 mt-1">Style: {selectedStyle.name}</p>
          )}
        </div>
      </div>
    </AccordionTrigger>
  );
});

StepHeader.displayName = 'StepHeader';

export default StepHeader;
