
import React, { useState, useCallback } from "react";
import { AccordionItem, AccordionContent } from "@/components/ui/accordion";
import { MobileTypography } from "@/components/ui/mobile-typography";
import ErrorBoundary from "./ErrorBoundary";
import StepContainer from "./ActiveStepView/StepContainer";
import StepOverlays from "./ActiveStepView/StepOverlays";
import StepTrigger from "./ActiveStepView/StepTrigger";
import { useInteractionStateMachine } from "../hooks/useInteractionStateMachine";
import "../styles/activeStepOptimized.css";

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
  // Use interaction state machine for step interactions
  const stepStateMachine = useInteractionStateMachine({
    initialState: !canAccess ? 'disabled' : isActive ? 'selected' : isCompleted ? 'idle' : 'idle',
    debounceDelay: 100,
    animationDuration: 300
  });

  // Sync external state with state machine
  React.useEffect(() => {
    if (!canAccess && !stepStateMachine.isDisabled) {
      stepStateMachine.transition('DISABLE', true);
    } else if (canAccess && stepStateMachine.isDisabled) {
      stepStateMachine.transition('ENABLE', true);
    }
    
    if (isActive && !stepStateMachine.isSelected) {
      stepStateMachine.transition('SELECT', true);
    } else if (!isActive && stepStateMachine.isSelected) {
      stepStateMachine.transition('DESELECT', true);
    }
  }, [canAccess, isActive, stepStateMachine]);

  const handleMouseEnter = useCallback(() => {
    if (stepStateMachine.isInteractive) {
      stepStateMachine.debouncedHoverStart();
    }
  }, [stepStateMachine]);

  const handleMouseLeave = useCallback(() => {
    if (stepStateMachine.isInteractive) {
      stepStateMachine.hoverEnd();
    }
  }, [stepStateMachine]);

  const handleStepClick = useCallback(() => {
    if (!stepStateMachine.isInteractive || stepStateMachine.isAnimating) {
      return;
    }

    stepStateMachine.queueAnimation(() => {
      onStepClick();
      stepStateMachine.transition('SELECT');
    });
  }, [stepStateMachine, onStepClick]);

  return (
    <ErrorBoundary>
      <AccordionItem 
        value={`step-${stepNumber}`}
        className="relative step-container-optimized"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          willChange: stepStateMachine.isAnimating ? 'transform, box-shadow' : 'auto',
          transform: 'translate3d(0,0,0)'
        }}
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
            onStepClick={handleStepClick}
            selectedStyle={selectedStyle}
          />
          
          <AccordionContent className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 accordion-content-optimized">
            <div className="border-t border-gradient-to-r from-purple-100 to-pink-100 pt-4 sm:pt-6 relative">
              <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-8 border border-gray-100/50 shadow-inner animate-fade-in content-container-optimized">
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
});

ActiveStepView.displayName = 'ActiveStepView';

export default ActiveStepView;
