
import { CheckCircle, Circle, Loader } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepLabels?: string[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ProgressIndicator Component
 * 
 * Visual progress indicator for multi-step processes.
 * Shows current position, completed steps, and upcoming steps.
 */
const ProgressIndicator = ({
  currentStep,
  totalSteps,
  completedSteps,
  stepLabels = [],
  showLabels = true,
  size = 'md'
}: ProgressIndicatorProps) => {
  const sizeClasses = {
    sm: { circle: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs' },
    md: { circle: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { circle: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' }
  };

  const classes = sizeClasses[size];

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${classes.icon} text-green-500`} />;
      case 'current':
        return <Loader className={`${classes.icon} text-purple-500 animate-spin`} />;
      default:
        return <Circle className={`${classes.icon} text-gray-300`} />;
    }
  };

  const getStepColor = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-purple-500 border-purple-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getConnectorColor = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) || stepNumber < currentStep
      ? 'bg-green-500'
      : 'bg-gray-300';
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isLast = stepNumber === totalSteps;
          
          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    ${classes.circle} rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 ${getStepColor(stepNumber)}
                  `}
                >
                  {getStepIcon(stepNumber)}
                </div>
                
                {/* Step Label */}
                {showLabels && stepLabels[index] && (
                  <span className={`mt-2 ${classes.text} text-center text-gray-600 font-medium`}>
                    {stepLabels[index]}
                  </span>
                )}
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    w-12 h-0.5 mx-2 transition-all duration-300
                    ${getConnectorColor(stepNumber)}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
