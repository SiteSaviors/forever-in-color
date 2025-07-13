
import React, { useMemo } from "react";
import { Lock } from "lucide-react";
import { MobileTypography } from "@/components/ui/mobile-typography";
import { getLockStatus } from "../ProductStepUtils";

interface StepContentProps {
  title: string;
  description: string;
  isCompleted: boolean;
  canAccess: boolean;
  isActive: boolean;
  stepNumber: number;
  selectedStyle?: { id: number; name: string } | null;
}

const StepContent = ({
  title,
  description,
  isCompleted,
  canAccess,
  isActive,
  stepNumber,
  selectedStyle
}: StepContentProps) => {
  const lockStatus = useMemo(() => {
    return getLockStatus(isCompleted, canAccess);
  }, [isCompleted, canAccess]);

  const titleClasses = useMemo(() => `
    font-bold transition-colors duration-300 font-poppins tracking-tight
    ${isCompleted || (isActive && canAccess) ? 'text-gray-900' 
      : !canAccess ? 'text-gray-500'
      : 'text-gray-600 group-hover:text-gray-800'}
  `, [isCompleted, isActive, canAccess]);

  const styleNameElement = useMemo(() => {
    if (stepNumber === 1 && selectedStyle?.name) {
      return (
        <span className={`ml-2 sm:ml-3 font-medium text-base sm:text-lg md:text-xl transition-colors duration-300 ${
          isActive ? 'text-purple-600' : 'text-gray-600'
        }`}>
          - {selectedStyle.name}
        </span>
      );
    }
    return null;
  }, [stepNumber, selectedStyle?.name, isActive]);

  return (
    <div className="flex-1 text-left min-w-0">
      <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
          <MobileTypography
            variant="h3"
            className={`${titleClasses} font-poppins-tight text-lg sm:text-xl md:text-2xl`}
          >
            {title}
            {styleNameElement}
          </MobileTypography>
          
          {lockStatus === "locked" && (
            <div className="transition-all duration-300 opacity-60 sm:self-center">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      <MobileTypography
        variant="body"
        className={`transition-all duration-300 font-poppins text-sm sm:text-base leading-relaxed ${
          !canAccess ? 'text-gray-400' : 'text-gray-600'
        } ${isActive ? 'block' : 'hidden sm:block'}`}
      >
        {description}
      </MobileTypography>
    </div>
  );
};

export default StepContent;
