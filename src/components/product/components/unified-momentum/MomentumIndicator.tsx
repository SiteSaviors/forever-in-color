
import { Progress } from "@/components/ui/progress";

interface MomentumIndicatorProps {
  momentumScore: number;
  timeSpentOnPlatform: number;
}

const MomentumIndicator = ({ momentumScore, timeSpentOnPlatform }: MomentumIndicatorProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Your Progress</span>
        <span className="text-sm font-bold text-purple-600">{Math.round(momentumScore)}%</span>
      </div>
      <div className="relative">
        <Progress value={momentumScore} className="h-2 bg-gray-200" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
             style={{ width: `${momentumScore}%` }} />
      </div>
      <div className="flex items-center justify-center mt-2 text-xs text-gray-600">
        <span>{Math.floor(timeSpentOnPlatform / 60)}m active</span>
      </div>
    </div>
  );
};

export default MomentumIndicator;
