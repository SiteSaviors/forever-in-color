
import { memo } from "react";
import { AccordionContent } from "@/components/ui/accordion";
import StepContentWrapper from "./StepContentWrapper";

interface StepContentProps {
  children: React.ReactNode;
}

const StepContent = memo(({ children }: StepContentProps) => {
  return (
    <AccordionContent className="px-4 pb-0 sm:px-6 md:px-8 accordion-content-optimized">
      <StepContentWrapper>
        {children}
      </StepContentWrapper>
    </AccordionContent>
  );
});

StepContent.displayName = 'StepContent';

export default StepContent;
