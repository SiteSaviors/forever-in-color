
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
      className={`px-3 py-2 sm:px-8 sm:py-8 md:px-12 md:py-12 hover:no-underline group min-h-[40px] sm:min-h-[120px] md:min-h-[140px] transition-all duration-500 hover:scale-105 hover:backdrop-blur-sm ${!canAccess ? 'cursor-default' : 'hover:shadow-2xl hover:shadow-cyan-500/20'}`}
      disabled={!canAccess}
      onClick={handleStepClick}
    >
      <div className="flex items-center gap-1 sm:gap-4 md:gap-6 w-full">
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
