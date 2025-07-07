
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
      console.error('Error in step click handler:', error);
    }
  }, [canAccess, onStepClick]);

  return (
    <AccordionTrigger 
      className={`px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 hover:no-underline group min-h-[68px] sm:min-h-[88px] transition-all duration-300 touch-manipulation ${!canAccess ? 'cursor-default' : ''}`}
      disabled={!canAccess}
      onClick={handleStepClick}
    >
      <div className="flex items-center gap-4 sm:gap-5 md:gap-6 w-full">
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
