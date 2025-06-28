
import React from "react";
import { AccordionContent } from "@/components/ui/accordion";

interface StepFooterProps {
  children: React.ReactNode;
}

const StepFooter = React.memo(({ children }: StepFooterProps) => {
  return (
    <AccordionContent className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 accordion-content-optimized">
      <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-4 sm:pt-6 relative">
        {children}
      </div>
    </AccordionContent>
  );
});

StepFooter.displayName = 'StepFooter';

export default StepFooter;
