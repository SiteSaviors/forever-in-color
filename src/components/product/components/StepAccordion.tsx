
import { memo } from 'react';
import { Accordion } from "@/components/ui/accordion";

interface StepAccordionProps {
  currentStep: number;
  children: React.ReactNode;
}

const StepAccordion = memo(({ currentStep, children }: StepAccordionProps) => {
  return (
    <Accordion 
      type="single" 
      value={`step-${currentStep}`} 
      className="space-y-8"
      onValueChange={() => {
        // Prevent default accordion scroll behavior for performance
      }}
    >
      {children}
    </Accordion>
  );
});

StepAccordion.displayName = 'StepAccordion';

export default StepAccordion;
