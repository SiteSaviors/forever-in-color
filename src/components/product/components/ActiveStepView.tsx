
import React, { useState, useCallback } from "react";
import { AccordionItem, AccordionContent } from "@/components/ui/accordion";
import { MobileTypography } from "@/components/ui/mobile-typography";
import ErrorBoundary from "./ErrorBoundary";
import StepContainer from "./ActiveStepView/StepContainer";
import StepOverlays from "./ActiveStepView/StepOverlays";
import StepTrigger from "./ActiveStepView/StepTrigger";

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
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <ErrorBoundary>
      <AccordionItem 
        value={`step-${stepNumber}`}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <StepContainer
          isActive={isActive}
          canAccess={canAccess}
          isCompleted={isCompleted}
          stepNumber={stepNumber}
        >
          <StepOverlays
            isActive={isActive}
            canAccess={canAccess}
            isCompleted={isCompleted}
          />
          
          <StepTrigger
            stepNumber={stepNumber}
            title={title}
            description={description}
            isActive={isActive}
            isCompleted={isCompleted}
            canAccess={canAccess}
            onStepClick={onStepClick}
            selectedStyle={selectedStyle}
          />
          
          <AccordionContent className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 animate-accordion-down">
            <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-4 sm:pt-6 relative">
              <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-8 border border-gray-100/50 shadow-inner animate-fade-in">
                <ErrorBoundary fallback={
                  <div className="text-center py-4">
                    <MobileTypography variant="body" className="text-gray-600">
                      Unable to load step content. Please refresh the page.
                    </MobileTypography>
                  </div>
                }>
                  {children}
                </ErrorBoundary>
              </div>
            </div>
          </AccordionContent>
        </StepContainer>
      </AccordionItem>
    </ErrorBoundary>
  );
};

export default ActiveStepView;
