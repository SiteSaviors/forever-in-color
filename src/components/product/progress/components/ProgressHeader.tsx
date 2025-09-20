
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

interface ProgressHeaderProps {
  completedStepsCount: number;
  personalizedMessages: string[];
}

const ProgressHeader = ({ completedStepsCount, personalizedMessages }: ProgressHeaderProps) => {
  const overallProgress = Math.min((completedStepsCount / 4) * 100, 100);
  const momentumMessage = personalizedMessages.length > 0 ? personalizedMessages[personalizedMessages.length - 1] : "Getting started...";

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Creating Your Masterpiece</h3>
        <p className="text-sm text-gray-600 mb-2">
          {completedStepsCount === 0 && "AI is analyzing your photo for perfect recommendations"}
          {completedStepsCount === 1 && "Finding the ideal size for your space"}
          {completedStepsCount === 2 && "Adding premium finishing touches"}
          {completedStepsCount >= 3 && "Almost ready to transform your photo!"}
        </p>
        <p className="text-xs text-purple-600 font-medium">{momentumMessage}</p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-purple-600 mb-1">
          {overallProgress}%
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-2">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
        {overallProgress > 25 && (
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
