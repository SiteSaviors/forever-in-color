
import { useEffect, useState } from "react";
import { Sparkles, Users, Trophy, Zap } from "lucide-react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";
import ProgressHeader from "./components/ProgressHeader";
import ProgressBar from "./components/ProgressBar";
import StepCard from "./components/StepCard";
import SocialProofSection from "./components/SocialProofSection";
import MilestoneOverlay from "./components/MilestoneOverlay";

interface SmartProgressIndicatorProps {
  uploadedImage?: string | null;
}

const SmartProgressIndicator = ({ uploadedImage }: SmartProgressIndicatorProps) => {
  const { state, triggerHaptic } = useProgressOrchestrator();
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [predictiveProgress, setPredictiveProgress] = useState(0);

  // Don't render the progress indicator if no photo has been uploaded
  if (!uploadedImage) {
    return null;
  }

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

  const overallProgress = getOverallProgress();
  const momentumMessage = getMomentumMessage();

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-purple-100/50 relative overflow-hidden">
      <MilestoneOverlay show={showMilestone} animatingStep={animatingStep} />
      
      <ProgressHeader 
        state={state} 
        overallProgress={overallProgress} 
        momentumMessage={momentumMessage} 
      />
      
      <ProgressBar 
        overallProgress={overallProgress} 
        state={state} 
        completedStepsCount={state.completedSteps.length} 
      />

      {/* Step Details with Micro-Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {steps.map((step) => {
          const progress = getStepProgress(step.id);
          const isActive = state.currentStep === step.id;
          const isCompleted = state.completedSteps.includes(step.id);
          const isAnimating = animatingStep === step.id;

          return (
            <StepCard
              key={step.id}
              step={step}
              progress={progress}
              state={state}
              isActive={isActive}
              isCompleted={isCompleted}
              isAnimating={isAnimating}
            />
          );
        })}
      </div>

      <SocialProofSection state={state} />
    </div>
  );
};

export default SmartProgressIndicator;
