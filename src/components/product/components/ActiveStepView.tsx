
import React, { useState, useCallback } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import CascadeErrorBoundary from "./ErrorBoundaries/CascadeErrorBoundary";
import StepContainer from "./ActiveStepView/StepContainer";
import StepOverlays from "./ActiveStepView/StepOverlays";
import StepHeader from "./ActiveStepView/StepHeader";
import StepFooter from "./ActiveStepView/StepFooter";

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

const ActiveStepView = React.memo(({
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
  // Simple local state to prevent double-clicks during transition
  const [isTransitioning, setIsTransitioning] = useState(false);

  // This is the preserved click-handling logic, simplified.
  const handleStepClick = useCallback(() => {
    // Prevent clicking if the step is inaccessible or if we're already transitioning
    if (!canAccess || isTransitioning) {
      return;
    }

    // Set transitioning state to true to block further clicks
    setIsTransitioning(true);
    
    // Perform the actual step change after a short delay
    setTimeout(() => {
      onStepClick();
      // After the action is done, allow clicks again
      setIsTransitioning(false);
    }, 150);
  }, [canAccess, isTransitioning, onStepClick]);

  return (
    <CascadeErrorBoundary
      stepNumber={stepNumber}
      enableAnalytics={true}
      maxRetries={3}
      onNavigateHome={() => window.location.href = '/'}
    >
      <AccordionItem 
        value={`step-${stepNumber}`}
        // The complex JS-based hover handlers are removed.
        // Simple CSS will now handle hover states.
        className={`accordion-item-optimized ${isActive ? 'is-active' : ''} ${
          canAccess && !isActive ? 'is-interactive' : ''
        }`}
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
          
          <StepHeader
            stepNumber={stepNumber}
            title={title}
            description={description}
            isActive={isActive}
            isCompleted={isCompleted}
            canAccess={canAccess}
            // We pass our new, simple click handler here
            onStepClick={handleStepClick}
            selectedStyle={selectedStyle}
          />
          
          <StepFooter>
            {children}
          </StepFooter>
        </StepContainer>
      </AccordionItem>
    </CascadeErrorBoundary>
  );
});

ActiveStepView.displayName = 'ActiveStepView';

export default ActiveStepView;