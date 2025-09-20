
import React, { useMemo } from "react";

interface StepContainerProps {
  isActive: boolean;
  canAccess: boolean;
  isCompleted: boolean;
  stepNumber: number;
  children: React.ReactNode;
}

const StepContainer = React.memo(({
  isActive,
  canAccess,
  isCompleted,
  stepNumber,
  children
}: StepContainerProps) => {
  const containerClasses = useMemo(() => {
    const isNextStep = !isCompleted && canAccess && !isActive;
    
    return `
      relative bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden 
      transition-all duration-500 ease-out hover:shadow-xl mx-2 sm:mx-0 will-change-transform transform-gpu contain-layout contain-style
      ${isActive && canAccess ? 'ring-2 ring-purple-200 shadow-xl transform3d(0,0,0) scale-[1.01] animate-fade-in' : ''}
      ${isNextStep && canAccess ? 'ring-1 ring-purple-100 hover:ring-2 hover:ring-purple-200 animate-pulse' : ''}
    `;
  }, [isActive, canAccess, isCompleted]);

  return (
    <div
      data-step={stepNumber}
      className={containerClasses}
      style={{
        willChange: isActive || canAccess ? 'transform, box-shadow' : 'auto',
        transform: 'translate3d(0,0,0)' // Force GPU layer
      }}
    >
      {children}
    </div>
  );
});

StepContainer.displayName = 'StepContainer';

export default StepContainer;
