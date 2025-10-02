
import React from "react";
import { Sparkles } from "@/components/ui/icons";

interface StepOverlaysProps {
  isActive: boolean;
  canAccess: boolean;
  isCompleted: boolean;
}

const StepOverlays = React.memo(({ isActive, canAccess, isCompleted }: StepOverlaysProps) => {
  return (
    <>
      {/* Premium gradient overlay for active state - using pseudo-element for performance */}
      {isActive && canAccess && (
        <div 
          className="absolute inset-0 pointer-events-none animate-fade-in will-change-opacity transform-gpu"
          style={{
            background: 'linear-gradient(90deg, rgba(168,85,247,0.05) 0%, rgba(236,72,153,0.05) 100%)',
            transform: 'translate3d(0,0,0)'
          }}
        />
      )}
      
      {/* Success sparkle effect */}
      {isCompleted && (
        <div 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-green-500 animate-pulse will-change-transform transform-gpu"
          style={{ transform: 'translate3d(0,0,0)' }}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
    </>
  );
});

StepOverlays.displayName = 'StepOverlays';

export default StepOverlays;
