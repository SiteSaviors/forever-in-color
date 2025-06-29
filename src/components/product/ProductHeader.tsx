
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload } from "lucide-react";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep: number;
  onUploadClick: () => void;
}

const ProductHeader = ({ completedSteps, totalSteps, currentStep, onUploadClick }: ProductHeaderProps) => {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'pending';
  };

  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Header Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Custom Canvas
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transform your photos into stunning canvas artwork with our AI-powered styles. Follow the steps below to create your masterpiece.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Steps Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { number: 1, title: "Upload Photo", description: "Add your image" },
              { number: 2, title: "Choose Style", description: "Select art style" },
              { number: 3, title: "Size & Options", description: "Configure canvas" },
              { number: 4, title: "Review & Order", description: "Complete purchase" }
            ].map((step) => (
              <Card 
                key={step.number}
                className={`${
                  getStepStatus(step.number) === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : getStepStatus(step.number) === 'active'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      getStepStatus(step.number) === 'completed'
                        ? 'bg-green-500 text-white'
                        : getStepStatus(step.number) === 'active'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {getStepStatus(step.number) === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <h3 className="ml-2 font-medium text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          {currentStep === 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={onUploadClick}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Start Creating Your Canvas
              </button>
            </div>
          )}

          {/* Live Activity Indicator */}
          <div className="mt-4 flex justify-center">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              24 people creating canvases right now
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
