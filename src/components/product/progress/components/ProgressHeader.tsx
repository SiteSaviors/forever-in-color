
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

interface ProgressHeaderProps {
  completedStepsCount: number;
  personalizedMessages: string[];
  overallProgress: number;
  hasUploadedImage: boolean;
}

const ProgressHeader = ({ 
  completedStepsCount, 
  personalizedMessages, 
  overallProgress, 
  hasUploadedImage 
}: ProgressHeaderProps) => {
  const momentumMessage = personalizedMessages.length > 0 ? personalizedMessages[personalizedMessages.length - 1] : "Getting started...";

  // Better progress messaging based on actual state
  const getProgressMessage = () => {
    if (!hasUploadedImage) {
      return "Ready to start your artistic journey";
    }
    
    if (completedStepsCount === 0) {
      return "AI is analyzing your photo for perfect recommendations";
    } else if (completedStepsCount === 1) {
      return "Finding the ideal size for your space";
    } else if (completedStepsCount === 2) {
      return "Adding premium finishing touches";
    } else {
      return "Almost ready to transform your photo!";
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Creating Your Masterpiece</h3>
        <p className="text-sm text-gray-600 mb-2">
          {getProgressMessage()}
        </p>
        {hasUploadedImage && (
          <p className="text-xs text-purple-600 font-medium">{momentumMessage}</p>
        )}
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-purple-600 mb-1">
          {Math.round(overallProgress)}%
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-2">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
        {overallProgress > 0 && hasUploadedImage && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            {Math.floor(overallProgress)}% momentum
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressHeader;
