
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
    font-black transition-all duration-500 font-montserrat tracking-tight drop-shadow-2xl premium-pulse
    ${isCompleted || (isActive && canAccess) ? 'bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent' 
      : !canAccess ? 'text-gray-400'
      : 'text-white group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:via-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent'}
  `, [isCompleted, isActive, canAccess]);

  const styleNameElement = useMemo(() => {
    if (stepNumber === 1 && selectedStyle?.name) {
      return (
        <span className={`ml-2 sm:ml-3 font-bold text-lg sm:text-xl md:text-2xl transition-all duration-500 font-oswald tracking-tight ${
          isActive ? 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg' : 'text-white/90'
        }`}>
          - {selectedStyle.name}
        </span>
      );
    }
    return null;
  }, [stepNumber, selectedStyle?.name, isActive]);

  return (
    <div className="flex-1 text-left min-w-0">
      <div className="flex flex-col gap-1 sm:gap-3 mb-2 sm:mb-4">
        <div className="flex flex-row items-center gap-1 sm:gap-3 flex-wrap">
          <MobileTypography
            variant="h3"
            className={`${titleClasses} text-lg sm:text-2xl md:text-4xl lg:text-5xl animate-fade-in float-gentle`}
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
        className={`transition-all duration-500 font-poppins text-base sm:text-lg leading-relaxed font-semibold ${
          !canAccess ? 'text-white/40' : 'text-white/90'
        } ${isActive ? 'block' : 'hidden sm:block'}`}
      >
        {description}
      </MobileTypography>
    </div>
  );
};

export default StepContent;
