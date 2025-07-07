
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
      relative bg-gradient-to-br from-white via-white to-violet-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-violet-100/50 overflow-hidden 
      transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-violet-500/10 mx-2 sm:mx-0 will-change-transform transform-gpu contain-layout contain-style
      ${isActive && canAccess ? 'ring-2 ring-violet-300/50 shadow-2xl shadow-violet-500/20 transform3d(0,0,0) scale-[1.02] animate-fade-in bg-gradient-to-br from-white to-violet-50/50' : ''}
      ${isNextStep && canAccess ? 'ring-1 ring-violet-200/50 hover:ring-2 hover:ring-violet-300/50 hover:shadow-violet-400/15 animate-pulse' : ''}
      backdrop-blur-sm
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
      {/* Premium overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-100/20 opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-75" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

StepContainer.displayName = 'StepContainer';

export default StepContainer;
