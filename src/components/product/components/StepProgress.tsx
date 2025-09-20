
import { Check, Circle, ArrowRight } from "lucide-react";

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

  const stepDescriptions = [
    "Choose your photo and art style",
    "Pick your canvas size and orientation",
    "Add personal touches",
    "Complete your order"
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      {/* Enhanced Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-4 left-0 w-full h-2 bg-gray-200 rounded-full" />
        <div 
          className="absolute top-4 left-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-700 shadow-md"
          style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
        />
        
        {/* Enhanced Step Indicators */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;
            
            return (
              <div key={stepNumber} className="flex flex-col items-center max-w-xs">
                {/* Step Circle */}
                <div className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10 border-4
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-lg transform scale-110' 
                    : isCurrent
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300 shadow-lg animate-pulse transform scale-110'
                    : 'bg-white border-gray-300 shadow-sm'}
                `}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white font-bold" />
                  ) : (
                    <span className={`text-sm font-bold ${ 
                      isCurrent ? 'text-white' : 'text-gray-500'
                    }`}>
                      {stepNumber}
                    </span>
                  )}
                  
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-30 animate-ping" />
                  )}
                </div>
                
                {/* Desktop Step Details */}
                <div className="mt-4 text-center hidden lg:block">
                  <div className={`text-sm font-semibold transition-colors duration-300 mb-1 ${
                    isCompleted ? 'text-green-700' : 
                    isCurrent ? 'text-purple-700' : 
                    'text-gray-500'
                  }`}>
                    {stepNames[index]}
                  </div>
                  <div className={`text-xs transition-colors duration-300 ${
                    isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-purple-600' : 
                    'text-gray-400'
                  }`}>
                    {stepDescriptions[index]}
                  </div>
                  
                  {/* Status Badge */}
                  {isCompleted && (
                    <div className="mt-2 inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      ✓ Complete
                    </div>
                  )}
                  {isCurrent && (
                    <div className="mt-2 inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                      In Progress
                    </div>
                  )}
                </div>
                
                {/* Mobile - Show current step name only */}
                {isCurrent && (
                  <div className="mt-3 text-center lg:hidden">
                    <div className="text-sm font-semibold text-purple-700 mb-1">
                      {stepNames[index]}
                    </div>
                    <div className="text-xs text-purple-600 mb-2">
                      {stepDescriptions[index]}
                    </div>
                    <div className="text-xs text-gray-500">
                      Step {stepNumber} of {totalSteps}
                    </div>
                  </div>
                )}

                {/* Next Step Arrow (Desktop) */}
                {isCurrent && index < totalSteps - 1 && (
                  <div className="hidden lg:block absolute top-4 left-full transform -translate-y-1/2 translate-x-4">
                    <ArrowRight className="w-4 h-4 text-purple-500 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress Stats */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-100">
          <div className="text-sm">
            <span className="text-gray-600">Progress: </span>
            <span className="font-bold text-purple-700">
              {Math.round((completedSteps.length / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="text-sm">
            <span className="text-gray-600">Steps completed: </span>
            <span className="font-bold text-green-700">
              {completedSteps.length} of {totalSteps}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
