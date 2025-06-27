
import React, { useCallback } from "react";
import { AccordionTrigger } from "@/components/ui/accordion";
import { triggerHapticFeedback } from "../ProductStepUtils";
import StepIcon from "./StepIcon";
import StepContent from "./StepContent";
import StepActions from "./StepActions";

interface StepTriggerProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
  selectedStyle?: { id: number; name: string } | null;
}

const StepTrigger = ({
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  canAccess,
  onStepClick,
  selectedStyle
}: StepTriggerProps) => {
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
};

export default StepTrigger;
