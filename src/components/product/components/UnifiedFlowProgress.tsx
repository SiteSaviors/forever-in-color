
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Crop, Monitor, Sparkles, TrendingUp, Eye, ArrowDown } from "lucide-react";

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

  // If no image uploaded yet, show minimal upload prompt
  if (!hasImage) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Ready to Start</span>
        </div>
        <p className="text-xs text-purple-600">Upload your photo to begin the AI transformation</p>
      </div>
    );
  }

  // If image uploaded but user hasn't seen preview yet, show connection indicator
  if (hasImage && !cropAccepted && currentStage !== 'crop-preview') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-green-800">Photo Uploaded Successfully!</h3>
              <p className="text-xs text-green-600">AI is analyzing your image...</p>
            </div>
          </div>
          <div className="animate-pulse">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-green-700 bg-green-100 rounded-md py-2 px-3">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Check your preview below</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    );
  }

  // Show full progress when actively working through steps
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Creating Your Art</h3>
            <p className="text-xs text-gray-500">AI-Powered Transformation</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-purple-600">{progressPercentage}%</div>
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
              <div className={`flex items-center gap-2 p-2 rounded-md transition-all duration-300 ${
                stage.active 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200' 
                  : stage.completed 
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                {/* Compact Icon */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
                  stage.completed 
                    ? 'bg-green-500 text-white' 
                    : stage.active 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {stage.completed ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Icon className={`w-3 h-3 ${stage.processing ? 'animate-pulse' : ''}`} />
                  )}
                </div>

                {/* Compact Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-medium truncate ${
                      stage.completed ? 'text-green-700' : stage.active ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {stage.title}
                    </h4>
                    {stage.completed && (
                      <Badge className="bg-green-500 text-white text-xs px-1 py-0 h-4">✓</Badge>
                    )}
                    {stage.processing && (
                      <Badge className="bg-purple-500 text-white text-xs px-1 py-0 h-4 animate-pulse">
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{stage.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className={`w-0.5 h-1 ml-3 transition-colors duration-300 ${
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
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
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
