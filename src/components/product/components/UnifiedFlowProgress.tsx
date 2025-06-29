
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, Crop, Palette, Eye } from "lucide-react";

interface UnifiedFlowProgressProps {
  currentStage: 'upload' | 'analyzing' | 'crop-preview' | 'orientation' | 'complete';
  hasImage: boolean;
  analysisComplete: boolean;
  cropAccepted: boolean;
  orientationSelected: boolean;
}

const UnifiedFlowProgress = ({ 
  currentStage, 
  hasImage, 
  analysisComplete, 
  cropAccepted, 
  orientationSelected 
}: UnifiedFlowProgressProps) => {
  const getProgressValue = () => {
    switch (currentStage) {
      case 'upload': return hasImage ? 25 : 0;
      case 'analyzing': return 50;
      case 'crop-preview': return analysisComplete ? 75 : 50;
      case 'orientation': return 85;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStageText = () => {
    switch (currentStage) {
      case 'upload': return hasImage ? 'Photo uploaded' : 'Upload your photo';
      case 'analyzing': return 'AI analyzing your photo...';
      case 'crop-preview': return analysisComplete ? 'Smart crop ready' : 'Processing...';
      case 'orientation': return 'Adjusting crop';
      case 'complete': return 'Ready for styling';
      default: return 'Starting...';
    }
  };

  const steps = [
    { id: 'upload', icon: Upload, label: 'Upload', completed: hasImage },
    { id: 'analyze', icon: Eye, label: 'Analyze', completed: analysisComplete },
    { id: 'crop', icon: Crop, label: 'Crop', completed: cropAccepted },
    { id: 'style', icon: Palette, label: 'Style', completed: orientationSelected }
  ];

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Creating Your Art</h3>
          <span className="text-sm text-gray-600">{getProgressValue()}%</span>
        </div>
        
        <Progress value={getProgressValue()} className="h-2" />
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStage === step.id || 
                           (step.id === 'analyze' && currentStage === 'analyzing') ||
                           (step.id === 'crop' && currentStage === 'crop-preview') ||
                           (step.id === 'style' && currentStage === 'orientation');
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div className={`p-2 rounded-full transition-all duration-300 ${
                  step.completed 
                    ? 'bg-green-100 text-green-600' 
                    : isActive 
                      ? 'bg-purple-100 text-purple-600 animate-pulse' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  step.completed ? 'text-green-600' : isActive ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">{getStageText()}</p>
        </div>
      </div>
    </Card>
  );
};

export default UnifiedFlowProgress;
