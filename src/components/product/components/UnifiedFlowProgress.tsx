
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Crop, Monitor, Sparkles } from "lucide-react";

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
  const stages = [
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload Photo',
      description: 'Choose your image',
      completed: hasImage,
      active: currentStage === 'upload' || currentStage === 'analyzing'
    },
    {
      id: 'crop',
      icon: Crop,
      title: 'Smart Crop',
      description: 'AI finds perfect composition',
      completed: cropAccepted,
      active: currentStage === 'crop-preview',
      processing: currentStage === 'analyzing'
    },
    {
      id: 'orientation',
      icon: Monitor,
      title: 'Canvas Format',
      description: 'Select optimal orientation',
      completed: orientationSelected,
      active: currentStage === 'orientation'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Creating Your Masterpiece</h3>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.id} className="relative">
              <div className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                stage.active 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200' 
                  : stage.completed 
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                {/* Icon */}
                <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                  stage.completed 
                    ? 'bg-green-500 text-white' 
                    : stage.active 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {stage.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className={`w-5 h-5 ${stage.processing ? 'animate-pulse' : ''}`} />
                  )}
                  
                  {stage.processing && (
                    <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-ping"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      stage.completed ? 'text-green-700' : stage.active ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {stage.title}
                    </h4>
                    {stage.completed && (
                      <Badge className="bg-green-500 text-white text-xs">✓</Badge>
                    )}
                    {stage.processing && (
                      <Badge className="bg-purple-500 text-white text-xs animate-pulse">
                        Processing...
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className={`w-0.5 h-4 ml-6 transition-colors duration-300 ${
                  stage.completed ? 'bg-green-300' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-purple-600">
            {Math.round(((hasImage ? 1 : 0) + (cropAccepted ? 1 : 0) + (orientationSelected ? 1 : 0)) / 3 * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${((hasImage ? 1 : 0) + (cropAccepted ? 1 : 0) + (orientationSelected ? 1 : 0)) / 3 * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedFlowProgress;
