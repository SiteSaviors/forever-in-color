
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Upload, Sparkles, Palette, Package } from "lucide-react";

interface UnifiedFlowProgressProps {
  currentStep: number;
  completedSteps: number[];
  uploadedImage?: string | null;
  selectedStyle?: number | null;
  selectedSize?: string | null;
}

const steps = [
  { icon: Upload, label: "Photo Upload", key: "upload" },
  { icon: Sparkles, label: "AI Analysis", key: "analysis" },
  { icon: Palette, label: "Style Selection", key: "style" },
  { icon: Package, label: "Finalization", key: "finalization" }
];

const UnifiedFlowProgress = memo(({
  currentStep,
  completedSteps,
  uploadedImage,
  selectedStyle,
  selectedSize
}: UnifiedFlowProgressProps) => {
  const getStepStatus = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (currentStep === stepNumber) return 'active';
    return 'pending';
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const IconComponent = step.icon;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : status === 'active'
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : status === 'active' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>
                
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {step.label}
                </span>
                
                {index < steps.length - 1 && (
                  <div className="ml-4 w-12 h-0.5 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            {uploadedImage && <span>✓ Photo uploaded</span>}
            {selectedStyle && <span>✓ Style selected</span>}
            {selectedSize && <span>✓ Size chosen</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

UnifiedFlowProgress.displayName = 'UnifiedFlowProgress';

export default UnifiedFlowProgress;
