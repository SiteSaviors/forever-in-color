import { CheckCircle, Upload, Crop, Monitor, Sparkles, Eye, ArrowDown } from "lucide-react";
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
  const stages = [{
    id: 'upload',
    icon: Upload,
    title: 'Upload Photo',
    description: 'Choose your image',
    completed: hasImage,
    active: currentStage === 'upload' || currentStage === 'analyzing'
  }, {
    id: 'crop',
    icon: Crop,
    title: 'Smart Crop',
    description: 'AI finds perfect composition',
    completed: cropAccepted,
    active: currentStage === 'crop-preview',
    processing: currentStage === 'analyzing'
  }, {
    id: 'orientation',
    icon: Monitor,
    title: 'Canvas Format',
    description: 'Select optimal orientation',
    completed: orientationSelected,
    active: currentStage === 'orientation'
  }];
  const completedCount = stages.filter(stage => stage.completed).length;
  const progressPercentage = Math.round(completedCount / stages.length * 100);

  // If no image uploaded yet, show minimal upload prompt
  if (!hasImage) {
    return <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Ready to Start</span>
        </div>
        <p className="text-xs text-purple-600">Upload your photo to begin the AI transformation</p>
      </div>;
  }

  // If image uploaded but user hasn't seen preview yet, show connection indicator
  if (hasImage && !cropAccepted && currentStage !== 'crop-preview') {
    return <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
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
      </div>;
  }

  // Show full progress when actively working through steps
  return;
};
export default UnifiedFlowProgress;
