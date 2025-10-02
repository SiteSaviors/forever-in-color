
import React, { useMemo } from "react";
import { ChevronRight } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { TouchTarget } from "@/components/ui/mobile-touch-target";

interface StepActionsProps {
  isActive: boolean;
  canAccess: boolean;
  isCompleted: boolean;
}

const StepActions = ({ isActive, canAccess, isCompleted }: StepActionsProps) => {
  const isNextStep = useMemo(() => {
    return !isCompleted && canAccess && !isActive;
  }, [isCompleted, canAccess, isActive]);

  const chevronClasses = useMemo(() => `
    w-6 h-6 sm:w-8 sm:h-8 transition-all duration-700 ease-out drop-shadow-lg
    ${isActive && canAccess ? 'rotate-90 text-cyan-400 scale-125 glow-pulse' 
      : !canAccess ? 'text-white/30'
      : 'text-white/70 group-hover:text-fuchsia-400 group-hover:translate-x-2 group-hover:scale-125 group-hover:drop-shadow-2xl'}
  `, [isActive, canAccess]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      {isNextStep && canAccess && !isActive && (
        <Badge variant="outline" className="bg-gradient-to-r from-cyan-400/20 to-fuchsia-400/20 text-white border-cyan-300/50 px-3 py-2 text-sm sm:text-base font-bold rounded-full hidden sm:inline-flex animate-pulse premium-pulse backdrop-blur-sm shadow-lg">
          Next Step
        </Badge>
      )}
      
      <TouchTarget size="sm" interactive={false}>
        <ChevronRight className={chevronClasses} />
      </TouchTarget>
    </div>
  );
};

export default StepActions;
