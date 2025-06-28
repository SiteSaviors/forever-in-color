
import { memo } from 'react';
import { Accordion } from "@/components/ui/accordion";

interface StepAccordionProps {
  currentStep: number;
  children: React.ReactNode;
}

const StepAccordion = memo(({ currentStep, children }: StepAccordionProps) => {
  // Only show accordion value if currentStep > 1 OR if step 1 has been explicitly activated
  // For step 1, we need to check if it's been clicked via hero button
  const accordionValue = currentStep > 1 ? `step-${currentStep}` : undefined;
  
  return (
    <Accordion 
      type="single" 
      value={accordionValue}
      className="space-y-8"
      onValueChange={() => {
        // Prevent default accordion scroll behavior
      }}
    >
      {children}
    </Accordion>
  );
});

StepAccordion.displayName = 'StepAccordion';

export default StepAccordion;
