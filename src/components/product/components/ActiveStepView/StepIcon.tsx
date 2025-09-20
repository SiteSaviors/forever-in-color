
import React, { useMemo } from "react";
import { Check, ChevronRight } from "lucide-react";
import { TouchTarget } from "@/components/ui/mobile-touch-target";
import { getStepIcon } from "../ProductStepUtils";

interface StepIconProps {
  stepNumber: number;
  isCompleted: boolean;
  isActive: boolean;
  canAccess: boolean;
}

const StepIcon = ({ stepNumber, isCompleted, isActive, canAccess }: StepIconProps) => {
  const Icon = useMemo(() => {
    try {
      return getStepIcon(stepNumber);
    } catch (error) {
      console.error('Error getting step icon:', error);
      return ChevronRight;
    }
  }, [stepNumber]);

  const iconClasses = useMemo(() => `
    relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center 
    transition-all duration-500 shadow-lg transform
    ${isCompleted 
      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200/50 scale-105' 
      : isActive && canAccess
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 scale-105 animate-pulse'
      : !canAccess
      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400'
      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-500 group-hover:scale-105'}
  `, [isCompleted, isActive, canAccess]);

  return (
    <TouchTarget size="lg" className="flex-shrink-0">
      <div className={iconClasses}>
        {isCompleted ? (
          <Check className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-in zoom-in duration-500" />
        ) : (
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform duration-300" />
        )}
      </div>
    </TouchTarget>
  );
};

export default StepIcon;
