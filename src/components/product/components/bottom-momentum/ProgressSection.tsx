
import { Progress } from "@/components/ui/progress";

interface ProgressSectionProps {
  completedSteps: number[];
  totalSteps: number;
}

const ProgressSection = ({ completedSteps, totalSteps }: ProgressSectionProps) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="mb-3 md:mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">Your Progress</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-purple-600">{Math.round(progressPercentage)}%</span>
          <span className="text-xs text-gray-500 hidden md:inline">Complete</span>
        </div>
      </div>
      <div className="relative">
        <Progress value={progressPercentage} className="h-2 bg-gray-200" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
             style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressSection;
