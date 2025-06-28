
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface UnifiedFlowProgressProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  uploadedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
}

const UnifiedFlowProgress = ({
  currentStep,
  completedSteps,
  totalSteps,
  uploadedImage,
  selectedStyle
}: UnifiedFlowProgressProps) => {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (currentStep === stepNumber) return 'active';
    if (currentStep > stepNumber) return 'completed';
    return 'pending';
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const steps = [
    { number: 1, title: "Upload & Style", description: "Photo and art style" },
    { number: 2, title: "Canvas Size", description: "Orientation and dimensions" },
    { number: 3, title: "Customization", description: "Personal touches" },
    { number: 4, title: "Review & Order", description: "Final details" }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center space-x-3">
            {getStepIcon(step.number)}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  getStepStatus(step.number) === 'completed' ? 'text-green-700' :
                  getStepStatus(step.number) === 'active' ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>
                <span className="text-xs text-gray-500">
                  {step.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedFlowProgress;
