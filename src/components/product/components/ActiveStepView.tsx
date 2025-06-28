
import React, { useCallback } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import ErrorBoundary from "./ErrorBoundary";
import StepContainer from "./ActiveStepView/StepContainer";
import StepOverlays from "./ActiveStepView/StepOverlays";
import StepHeader from "./ActiveStepView/StepHeader";
import StepFooter from "./ActiveStepView/StepFooter";
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
          
          <StepHeader
            stepNumber={stepNumber}
            title={title}
            description={description}
            isActive={isActive}
            isCompleted={isCompleted}
            canAccess={canAccess}
            onStepClick={handleStepClick}
            selectedStyle={selectedStyle}
          />
          
          <StepFooter>
            {children}
          </StepFooter>
        </StepContainer>
      </AccordionItem>
    </ErrorBoundary>
  );
});

ActiveStepView.displayName = 'ActiveStepView';

export default ActiveStepView;
