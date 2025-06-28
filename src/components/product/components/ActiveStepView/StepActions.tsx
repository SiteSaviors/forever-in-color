
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
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
    w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ease-out
    ${isActive && canAccess ? 'rotate-90 text-purple-500 scale-110' 
      : !canAccess ? 'text-gray-300'
      : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:scale-110'}
  `, [isActive, canAccess]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      {isNextStep && canAccess && !isActive && (
        <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 px-2 py-1 text-xs sm:text-sm font-medium rounded-full hidden sm:inline-flex animate-pulse">
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
