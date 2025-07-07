
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
      relative bg-gradient-to-br from-cyan-950/90 via-violet-900/90 to-fuchsia-950/90 rounded-2xl sm:rounded-3xl shadow-2xl border-2 overflow-hidden 
      transition-all duration-700 ease-out mx-2 sm:mx-0 will-change-transform transform-gpu contain-layout contain-style group cursor-pointer
      ${isActive && canAccess ? 'ring-4 ring-gradient-to-r ring-cyan-400/60 shadow-3xl shadow-fuchsia-500/30 transform3d(0,0,0) scale-[1.05] animate-fade-in bg-gradient-to-br from-cyan-900/95 via-violet-800/95 to-fuchsia-900/95 premium-pulse' : 'border-gradient-to-r border-cyan-500/30 border-violet-500/30 border-fuchsia-500/30'}
      ${isNextStep && canAccess ? 'ring-2 ring-cyan-300/50 hover:ring-4 hover:ring-fuchsia-400/60 hover:shadow-cyan-400/20 animate-pulse glow-pulse hover:scale-[1.02] hover:backdrop-blur-2xl hover:-translate-y-2' : 'hover:shadow-3xl hover:scale-[1.01] hover:backdrop-blur-2xl hover:-translate-y-1'}
      ${canAccess ? 'hover:ring-3 hover:ring-cyan-400/40 hover:shadow-2xl hover:shadow-fuchsia-400/20' : ''}
      backdrop-blur-xl float-gentle
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
      {/* Premium hero-style overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 opacity-70" />
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-violet-500 via-fuchsia-500 to-rose-400 opacity-90 shadow-lg" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      {/* Hero-style floating shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

StepContainer.displayName = 'StepContainer';

export default StepContainer;
