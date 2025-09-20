
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";

interface ProgressSectionProps {
  completedSteps: number[];
  totalSteps: number;
}

const ProgressSection = ({ completedSteps, totalSteps }: ProgressSectionProps) => {
  const progress = Math.round((completedSteps.length / totalSteps) * 100);
  
  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            
            return (
              <div key={stepNumber} className="flex items-center gap-1">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                {i < totalSteps - 1 && (
                  <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
          {progress}% Complete
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 font-medium">
        Step {completedSteps.length} of {totalSteps} • Almost there!
      </p>
    </div>
  );
};

export default ProgressSection;
