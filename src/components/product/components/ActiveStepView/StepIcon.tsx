
import { memo } from "react";

interface StepIconProps {
  children: React.ReactNode;
  isCompleted: boolean;
}

const StepIcon = memo(({ children, isCompleted }: StepIconProps) => {
  return (
    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
      isCompleted 
        ? 'bg-green-500 text-white' 
        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
    }`}>
      {children}
    </div>
  );
});

StepIcon.displayName = 'StepIcon';

export default StepIcon;
