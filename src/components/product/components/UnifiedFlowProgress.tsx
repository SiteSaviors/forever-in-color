
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Crop, Monitor, Sparkles, TrendingUp } from "lucide-react";

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

  const completedCount = stages.filter(stage => stage.completed).length;
  const progressPercentage = Math.round((completedCount / stages.length) * 100);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-100/80 backdrop-blur-sm">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Creating Masterpiece</h3>
            <p className="text-xs text-gray-500">AI-Powered Art Creation</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-purple-600">{progressPercentage}%</div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>Progress</span>
          </div>
        </div>
      </div>

      {/* Compact Progress Steps */}
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.id} className="relative">
              <div className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                stage.active 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50' 
                  : stage.completed 
                    ? 'bg-green-50/80 border border-green-200/50'
                    : 'bg-gray-50/50 border border-gray-200/50'
              }`}>
                {/* Compact Icon */}
                <div className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  stage.completed 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : stage.active 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {stage.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className={`w-4 h-4 ${stage.processing ? 'animate-pulse' : ''}`} />
                  )}
                  
                  {stage.processing && (
                    <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-ping opacity-75"></div>
                  )}
                </div>

                {/* Compact Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-medium truncate ${
                      stage.completed ? 'text-green-700' : stage.active ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {stage.title}
                    </h4>
                    {stage.completed && (
                      <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 h-5">✓</Badge>
                    )}
                    {stage.processing && (
                      <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0.5 h-5 animate-pulse">
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{stage.description}</p>
                </div>
              </div>

              {/* Compact Connector Line */}
              {!isLast && (
                <div className={`w-0.5 h-2 ml-3.5 transition-colors duration-300 ${
                  stage.completed ? 'bg-green-300' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compact Progress Bar */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600 font-medium">Overall Progress</span>
          <span className="font-bold text-purple-600">{progressPercentage}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedFlowProgress;
