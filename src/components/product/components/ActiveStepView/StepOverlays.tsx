
import React from "react";
import { Sparkles } from "lucide-react";

interface StepOverlaysProps {
  isActive: boolean;
  canAccess: boolean;
  isCompleted: boolean;
}

const StepOverlays = ({ isActive, canAccess, isCompleted }: StepOverlaysProps) => {
  return (
    <>
      {/* Premium gradient overlay for active state */}
      {isActive && canAccess && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none animate-fade-in" />
      )}
      
      {/* Success sparkle effect */}
      {isCompleted && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-green-500 animate-pulse">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
    </>
  );
};

export default StepOverlays;
