
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Users, Trophy, Zap } from "lucide-react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";

const SmartProgressIndicator = () => {
  const { state, triggerHaptic } = useProgressOrchestrator();
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);

  const steps = [
    { 
      id: 1, 
      name: "Upload & Style", 
      subSteps: ["upload", "analyzing", "style-selection"],
      icon: Sparkles,
      description: "AI analyzing your photo"
    },
    { 
      id: 2, 
      name: "Perfect Size", 
      subSteps: ["orientation", "size-selection"],
      icon: Trophy,
      description: "Optimizing for your space"
    },
    { 
      id: 3, 
      name: "Customize", 
      subSteps: ["frame", "enhancements"],
      icon: Zap,
      description: "Adding premium touches"
    },
    { 
      id: 4, 
      name: "Complete", 
      subSteps: ["review", "payment"],
      icon: Users,
      description: "Your masterpiece awaits"
    }
  ];

  // Celebrate step completion
  useEffect(() => {
    const lastCompleted = Math.max(...state.completedSteps, 0);
    if (lastCompleted > 0 && !animatingStep) {
      setAnimatingStep(lastCompleted);
      setShowMilestone(true);
      triggerHaptic();
      
      setTimeout(() => {
        setShowMilestone(false);
        setAnimatingStep(null);
      }, 2000);
    }
  }, [state.completedSteps]);

  const getStepProgress = (stepId: number) => {
    if (state.completedSteps.includes(stepId)) return 100;
    if (state.currentStep === stepId) {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        const subStepIndex = step.subSteps.indexOf(state.currentSubStep);
        return Math.max(20, ((subStepIndex + 1) / step.subSteps.length) * 100);
      }
    }
    return 0;
  };

  const getOverallProgress = () => {
    const totalSteps = steps.length;
    const completedWeight = state.completedSteps.length;
    const currentStepProgress = getStepProgress(state.currentStep) / 100;
    return Math.round(((completedWeight + currentStepProgress) / totalSteps) * 100);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-purple-100/50 relative overflow-hidden">
      {/* Milestone Celebration */}
      {showMilestone && animatingStep && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse flex items-center justify-center z-10">
          <div className="bg-white rounded-full p-4 shadow-xl animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      )}

      {/* Header with overall progress */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Creating Your Masterpiece</h3>
          <p className="text-sm text-gray-600">
            {state.currentStep === 1 && "AI is analyzing your photo for perfect recommendations"}
            {state.currentStep === 2 && "Finding the ideal size for your space"}
            {state.currentStep === 3 && "Adding premium finishing touches"}
            {state.currentStep === 4 && "Almost ready to transform your photo!"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {getOverallProgress()}%
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Progress 
        value={getOverallProgress()} 
        className="h-3 mb-6 bg-gray-100"
      />

      {/* Step Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const progress = getStepProgress(step.id);
          const isActive = state.currentStep === step.id;
          const isCompleted = state.completedSteps.includes(step.id);
          const isAnimating = animatingStep === step.id;

          return (
            <div 
              key={step.id}
              className={`text-center p-3 rounded-xl transition-all duration-500 ${
                isActive 
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 scale-105' 
                  : isCompleted 
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border border-gray-200'
              } ${isAnimating ? 'animate-pulse' : ''}`}
            >
              <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isActive 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              
              <h4 className={`font-semibold text-sm mb-1 ${
                isCompleted ? 'text-green-700' : isActive ? 'text-purple-700' : 'text-gray-500'
              }`}>
                {step.name}
              </h4>
              
              {isActive && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                </div>
              )}
              
              {isCompleted && (
                <Badge className="bg-green-500 text-white text-xs mt-1">
                  ✓ Complete
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Social Proof */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600">
              {state.socialProof.completionRate}% of users complete their masterpiece
            </span>
          </div>
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            Live Activity
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SmartProgressIndicator;
