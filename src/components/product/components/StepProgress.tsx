
import { Check, Circle } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
}

const StepProgress = ({ currentStep, completedSteps, totalSteps }: StepProgressProps) => {
  const stepNames = [
    "Upload & Style",
    "Layout & Size", 
    "Customize",
    "Review & Order"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            const isAccessible = stepNumber <= currentStep || isCompleted;
            
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200' 
                    : isCurrent && isAccessible
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                    : isAccessible
                    ? 'bg-white border-2 border-purple-200 text-purple-600'
                    : 'bg-gray-100 border-2 border-gray-200 text-gray-400'}
                `}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {stepNames[index]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Step {stepNumber} of {totalSteps}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
