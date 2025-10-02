
import { Check, ArrowRight } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

interface StreamlinedProgressProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
}

const StreamlinedProgress = ({ currentStep, completedSteps, totalSteps }: StreamlinedProgressProps) => {
  const stepNames = [
    "Upload & Style",
    "Size & Layout", 
    "Personalize",
    "Complete Order"
  ];

  const progressPercentage = (completedSteps.length / totalSteps) * 100;
  
  // Show next step hint
  const getNextStepMessage = () => {
    if (currentStep === 1) return "Choose your perfect photo and artistic style";
    if (currentStep === 2) return "Select the ideal size for your space";
    if (currentStep === 3) return "Add your personal finishing touches";
    if (currentStep === 4) return "Review and complete your masterpiece";
    return "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Clean Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Your Progress</span>
          <span className="text-sm font-bold text-purple-600">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Minimalist Step Indicators */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 hidden md:block" />
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 hidden md:block"
          style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
        />
        
        {/* Step Circles */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                {/* Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-3 relative z-10
                  ${isCompleted 
                    ? 'bg-green-500 border-green-400 shadow-lg' 
                    : isCurrent
                    ? 'bg-white border-purple-500 shadow-lg ring-4 ring-purple-100'
                    : 'bg-white border-gray-300'}
                `}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${
                      isCurrent ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {stepNumber}
                    </span>
                  )}
                </div>
                
                {/* Step Label - Hidden on mobile for cleaner look */}
                <div className="mt-3 text-center hidden md:block">
                  <div className={`text-xs font-medium mb-1 ${
                    isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-purple-600' : 
                    'text-gray-400'
                  }`}>
                    {stepNames[index]}
                  </div>
                  
                  {/* Minimal Status Badge */}
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-700 text-xs py-0 px-2">
                      Done
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs py-0 px-2">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Focus - Simplified */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-purple-100">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-purple-700">
            Step {currentStep}: {getNextStepMessage()}
          </span>
          <ArrowRight className="w-4 h-4 text-purple-500" />
        </div>
      </div>
    </div>
  );
};

export default StreamlinedProgress;
