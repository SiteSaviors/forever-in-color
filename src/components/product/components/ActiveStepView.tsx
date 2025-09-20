
import React, { useCallback, useEffect } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import CascadeErrorBoundary from "./ErrorBoundaries/CascadeErrorBoundary";
import StepContainer from "./ActiveStepView/StepContainer";
import StepOverlays from "./ActiveStepView/StepOverlays";
import StepHeader from "./ActiveStepView/StepHeader";
import StepFooter from "./ActiveStepView/StepFooter";
import { useAccordionState } from "../contexts/AccordionStateContext";
import "../styles/animations/performance-optimized.css";

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
  // Use centralized accordion state
  const { 
    getStepState, 
    setStepInteractionState, 
    startAnimation, 
    endAnimation,
    isStepAnimating 
  } = useAccordionState();

  const stepState = getStepState(stepNumber);
  const isAnimating = isStepAnimating(stepNumber);

  // Sync interaction states with context
  useEffect(() => {
    const interactionState = !canAccess ? 'disabled' : 
      isActive ? 'selected' : 
      isCompleted ? 'idle' : 'idle';
    
    if (stepState.interactionState !== interactionState) {
      setStepInteractionState(stepNumber, interactionState);
    }
  }, [canAccess, isActive, isCompleted, stepNumber, stepState.interactionState, setStepInteractionState]);

  const handleMouseEnter = useCallback(() => {
    if (canAccess && !isAnimating) {
      setStepInteractionState(stepNumber, 'hovering');
    }
  }, [canAccess, isAnimating, stepNumber, setStepInteractionState]);

  const handleMouseLeave = useCallback(() => {
    if (canAccess && !isAnimating && !isActive) {
      setStepInteractionState(stepNumber, 'idle');
    }
  }, [canAccess, isAnimating, isActive, stepNumber, setStepInteractionState]);

  const handleStepClick = useCallback(() => {
    if (!canAccess || isAnimating) {
      return;
    }

    startAnimation(stepNumber);
    
    // Perform step action after brief delay for animation
    setTimeout(() => {
      onStepClick();
      endAnimation(stepNumber);
    }, 150);
  }, [canAccess, isAnimating, stepNumber, onStepClick, startAnimation, endAnimation]);

  return (
    <CascadeErrorBoundary
      stepNumber={stepNumber}
      enableAnalytics={true}
      maxRetries={3}
      onNavigateHome={() => window.location.href = '/'}
    >
      <AccordionItem 
        value={`step-${stepNumber}`}
        className={`accordion-item-optimized ${isActive ? 'is-active' : ''} ${
          canAccess && !isActive ? 'is-interactive' : ''
        }`}
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
    </CascadeErrorBoundary>
  );
});

ActiveStepView.displayName = 'ActiveStepView';

export default ActiveStepView;
