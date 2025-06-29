
import React from "react";
import { AccordionTrigger } from "@/components/ui/accordion";
import StepIcon from "./StepIcon";
import StepContent from "./StepContent";
import StepActions from "./StepActions";
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
      // Error handled silently
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
          stepNumber={stepNumber}
          isCompleted={isCompleted}
          isActive={isActive}
          canAccess={canAccess}
        />
        
        <StepContent
          title={title}
          description={description}
          isCompleted={isCompleted}
          canAccess={canAccess}
          isActive={isActive}
          stepNumber={stepNumber}
          selectedStyle={selectedStyle}
        />
        
        <StepActions
          isActive={isActive}
          canAccess={canAccess}
          isCompleted={isCompleted}
        />
      </div>
    </AccordionTrigger>
  );
});

StepHeader.displayName = 'StepHeader';

export default StepHeader;
