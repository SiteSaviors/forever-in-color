
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles } from "lucide-react";
import { ProgressState } from "../types";

interface StepCardProps {
  step: {
    id: number;
    name: string;
    subSteps: string[];
    icon: React.ComponentType<any>;
    description: string;
    weight: number;
  };
  progress: number;
  state: ProgressState;
  isActive: boolean;
  isCompleted: boolean;
  isAnimating: boolean;
}

const StepCard = ({ step, progress, state, isActive, isCompleted, isAnimating }: StepCardProps) => {
  const Icon = step.icon;

  return (
    <div 
      className={`text-center p-4 rounded-xl transition-all duration-500 ${
        isActive 
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 scale-105 shadow-lg' 
          : isCompleted 
            ? 'bg-green-50 border-2 border-green-200 shadow-md'
            : 'bg-gray-50 border border-gray-200'
      } ${isAnimating ? 'animate-milestone' : ''}`}
    >
      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
        isCompleted 
          ? 'bg-green-500 text-white shadow-lg' 
          : isActive 
            ? 'bg-purple-500 text-white shadow-lg animate-pulse-glow' 
            : 'bg-gray-300 text-gray-500'
      }`}>
        {isCompleted ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      
      <h4 className={`font-semibold text-sm mb-2 ${
        isCompleted ? 'text-green-700' : isActive ? 'text-purple-700' : 'text-gray-500'
      }`}>
        {step.name}
      </h4>
      
      {isActive && (
        <div className="mt-2">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-gray-600 mb-2">{step.description}</p>
          {state.aiAnalysis.isAnalyzing && step.id === 1 && (
            <Badge className="bg-purple-500 text-white text-xs animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              Analyzing...
            </Badge>
          )}
        </div>
      )}
      
      {isCompleted && (
        <div className="mt-2">
          <Badge className="bg-green-500 text-white text-xs mb-1">
            ✓ Complete
          </Badge>
          <div className="text-xs text-green-600">+{step.weight} points</div>
        </div>
      )}
      
      {!isActive && !isCompleted && (
        <div className="text-xs text-gray-400 mt-2">
          Worth {step.weight} points
        </div>
      )}
    </div>
  );
};

export default StepCard;
