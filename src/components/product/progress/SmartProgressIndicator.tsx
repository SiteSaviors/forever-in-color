
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Users, Trophy, Zap, Clock, TrendingUp } from "lucide-react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";

const SmartProgressIndicator = () => {
  const { state, triggerHaptic } = useProgressOrchestrator();
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [predictiveProgress, setPredictiveProgress] = useState(0);

  const steps = [
    { 
      id: 1, 
      name: "Upload & Style", 
      subSteps: ["upload", "analyzing", "style-selection"],
      icon: Sparkles,
      description: "AI analyzing your photo",
      weight: 30
    },
    { 
      id: 2, 
      name: "Perfect Size", 
      subSteps: ["orientation", "size-selection"],
      icon: Trophy,
      description: "Optimizing for your space",
      weight: 25
    },
    { 
      id: 3, 
      name: "Customize", 
      subSteps: ["frame", "enhancements"],
      icon: Zap,
      description: "Adding premium touches",
      weight: 25
    },
    { 
      id: 4, 
      name: "Complete", 
      subSteps: ["review", "payment"],
      icon: Users,
      description: "Your masterpiece awaits",
      weight: 20
    }
  ];

  // Celebrate step completion with enhanced animations
  useEffect(() => {
    const lastCompleted = Math.max(...state.completedSteps, 0);
    if (lastCompleted > 0 && !animatingStep) {
      setAnimatingStep(lastCompleted);
      setShowMilestone(true);
      triggerHaptic();
      
      // Extended celebration for conversion momentum
      setTimeout(() => {
        setShowMilestone(false);
        setAnimatingStep(null);
      }, 3000);
    }
  }, [state.completedSteps]);

  // Predictive progress during AI analysis
  useEffect(() => {
    if (state.aiAnalysis.isAnalyzing) {
      const interval = setInterval(() => {
        setPredictiveProgress(prev => {
          const increment = Math.random() * 5 + 2;
          return Math.min(85, prev + increment);
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setPredictiveProgress(0);
    }
  }, [state.aiAnalysis.isAnalyzing]);

  const getStepProgress = (stepId: number) => {
    if (state.completedSteps.includes(stepId)) return 100;
    if (state.currentStep === stepId) {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        const subStepIndex = step.subSteps.indexOf(state.currentSubStep);
        let baseProgress = Math.max(20, ((subStepIndex + 1) / step.subSteps.length) * 100);
        
        // Add predictive progress during AI analysis
        if (state.aiAnalysis.isAnalyzing && stepId === 1) {
          baseProgress = Math.max(baseProgress, predictiveProgress);
        }
        
        return Math.min(100, baseProgress);
      }
    }
    return 0;
  };

  const getOverallProgress = () => {
    let totalProgress = 0;
    steps.forEach(step => {
      const stepProgress = getStepProgress(step.id);
      totalProgress += (stepProgress / 100) * step.weight;
    });
    return Math.round(totalProgress);
  };

  const getMomentumMessage = () => {
    const momentum = state.conversionElements.momentumScore;
    if (momentum >= 75) return "🚀 Amazing momentum! You're almost there!";
    if (momentum >= 50) return "⭐ Great progress! Keep going!";
    if (momentum >= 25) return "✨ You're building something beautiful!";
    return "🎨 Let's create your masterpiece!";
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-purple-100/50 relative overflow-hidden">
      {/* Milestone Celebration - Enhanced */}
      {showMilestone && animatingStep && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse flex items-center justify-center z-10">
          <div className="bg-white rounded-full p-6 shadow-2xl animate-bounce">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
              <span className="font-bold text-green-700">Step {animatingStep} Complete!</span>
              <span className="text-sm text-gray-600">+25 momentum points</span>
            </div>
          </div>
        </div>
      )}

      {/* Header with enhanced progress info */}
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
          <p className="text-xs text-purple-600 font-medium">{getMomentumMessage()}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {getOverallProgress()}%
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

      {/* Enhanced Overall Progress Bar */}
      <div className="mb-6">
        <Progress 
          value={getOverallProgress()} 
          className="h-4 mb-2 bg-gray-100 progress-enhanced"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Started {Math.floor(state.conversionElements.timeSpentOnPlatform / 60)}m ago</span>
          <span>{4 - state.completedSteps.length} steps remaining</span>
        </div>
      </div>

      {/* Step Details with Micro-Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {steps.map((step) => {
          const Icon = step.icon;
          const progress = getStepProgress(step.id);
          const isActive = state.currentStep === step.id;
          const isCompleted = state.completedSteps.includes(step.id);
          const isAnimating = animatingStep === step.id;

          return (
            <div 
              key={step.id}
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
        })}
      </div>

      {/* Enhanced Social Proof */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600">
              {state.socialProof.completionRate}% of users complete their masterpiece
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              {state.socialProof.liveUserCount} creating now
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              <Clock className="w-3 h-3 mr-1" />
              {state.socialProof.recentCompletions} completed today
            </Badge>
          </div>
        </div>
        
        {/* Urgency messaging */}
        {state.conversionElements.urgencyMessage && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-amber-800 font-medium text-sm">
              {state.conversionElements.urgencyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartProgressIndicator;
