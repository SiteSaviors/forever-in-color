
import { Progress } from "@/components/ui/progress";
import { ProgressState } from "../types";

interface ProgressBarProps {
  overallProgress: number;
  state: ProgressState;
  completedStepsCount: number;
}

const ProgressBar = ({ overallProgress, state, completedStepsCount }: ProgressBarProps) => {
  return (
    <div className="mb-6">
      <Progress 
        value={overallProgress} 
        className="h-4 mb-2 bg-gray-100 progress-enhanced"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Started {Math.floor(state.conversionElements.timeSpentOnPlatform / 60)}m ago</span>
        <span>{4 - completedStepsCount} steps remaining</span>
      </div>
    </div>
  );
};

export default ProgressBar;
