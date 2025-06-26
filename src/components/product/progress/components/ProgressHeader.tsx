
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { ProgressState } from "../types";

interface ProgressHeaderProps {
  state: ProgressState;
  overallProgress: number;
  momentumMessage: string;
}

const ProgressHeader = ({ state, overallProgress, momentumMessage }: ProgressHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Creating Your Masterpiece</h3>
        <p className="text-sm text-gray-600 mb-2">
          {state.aiAnalysis.isAnalyzing && state.aiAnalysis.analysisStage ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
              {state.aiAnalysis.analysisStage}
            </span>
          ) : (
            <>
              {state.currentStep === 1 && "AI is analyzing your photo for perfect recommendations"}
              {state.currentStep === 2 && "Finding the ideal size for your space"}
              {state.currentStep === 3 && "Adding premium finishing touches"}
              {state.currentStep === 4 && "Almost ready to transform your photo!"}
            </>
          )}
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
        {state.conversionElements.momentumScore > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            {state.conversionElements.momentumScore}% momentum
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressHeader;
