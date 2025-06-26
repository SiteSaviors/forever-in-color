
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Palette, Settings, ShoppingBag } from "lucide-react";

interface StepCardProps {
  step: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    active: boolean;
  };
  showPersonalizedMessage: boolean;
}

const StepCard = ({ step, showPersonalizedMessage }: StepCardProps) => {
  const getIcon = (stepId: number) => {
    switch (stepId) {
      case 1: return Upload;
      case 2: return Settings;
      case 3: return Palette;
      case 4: return ShoppingBag;
      default: return Upload;
    }
  };

  const Icon = getIcon(step.id);

  return (
    <div 
      className={`text-center p-4 rounded-xl transition-all duration-500 ${
        step.active 
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 scale-105 shadow-lg' 
          : step.completed 
            ? 'bg-green-50 border-2 border-green-200 shadow-md'
            : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
        step.completed 
          ? 'bg-green-500 text-white shadow-lg' 
          : step.active 
            ? 'bg-purple-500 text-white shadow-lg animate-pulse-glow' 
            : 'bg-gray-300 text-gray-500'
      }`}>
        {step.completed ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      
      <h4 className={`font-semibold text-sm mb-2 ${
        step.completed ? 'text-green-700' : step.active ? 'text-purple-700' : 'text-gray-500'
      }`}>
        {step.title}
      </h4>
      
      <p className="text-xs text-gray-600">{step.description}</p>
      
      {step.completed && (
        <div className="mt-2">
          <Badge className="bg-green-500 text-white text-xs">
            ✓ Complete
          </Badge>
        </div>
      )}
      
      {step.active && showPersonalizedMessage && (
        <div className="mt-2">
          <Badge className="bg-purple-500 text-white text-xs animate-pulse">
            In Progress...
          </Badge>
        </div>
      )}
    </div>
  );
};

export default StepCard;
