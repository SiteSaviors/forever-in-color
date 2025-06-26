
import { useState, useEffect } from "react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";
import ProgressHeader from "./components/ProgressHeader";
import ProgressBar from "./components/ProgressBar";
import StepCard from "./components/StepCard";
import SocialProofSection from "./components/SocialProofSection";
import MilestoneOverlay from "./components/MilestoneOverlay";

interface SmartProgressIndicatorProps {
  uploadedImage: string | null;
}

const SmartProgressIndicator = ({ uploadedImage }: SmartProgressIndicatorProps) => {
  const { state } = useProgressOrchestrator();
  const [showMilestone, setShowMilestone] = useState(false);
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);

  // Calculate progress based on actual completion, not just momentum
  const completedStepsCount = state.completedSteps?.length || 0;
  
  // Better progress calculation that reflects actual user progress
  const calculateActualProgress = () => {
    // If no image uploaded, progress should be 0%
    if (!uploadedImage) {
      return 0;
    }
    
    // Base progress on completed steps (25% per step)
    let baseProgress = (completedStepsCount / 4) * 100;
    
    // Add momentum bonus only if user has actually started (has an image)
    if (uploadedImage && state.conversionElements.momentumScore > 0) {
      // Cap momentum bonus at 10% to avoid inflating progress too much
      const momentumBonus = Math.min(state.conversionElements.momentumScore * 0.1, 10);
      baseProgress += momentumBonus;
    }
    
    return Math.min(baseProgress, 100);
  };
  
  const overallProgress = calculateActualProgress();
  
  // Effect to handle milestone animations
  useEffect(() => {
    if (state.completedSteps && state.completedSteps.length > 0) {
      const lastCompletedStep = Math.max(...state.completedSteps);
      setAnimatingStep(lastCompletedStep);
      setShowMilestone(true);
      
      setTimeout(() => {
        setShowMilestone(false);
        setAnimatingStep(null);
      }, 3000);
    }
  }, [state.completedSteps]);

  // Don't render anything if no image is uploaded
  if (!uploadedImage) {
    return null;
  }

  const steps = [
    {
      id: 1,
      title: "Photo & Style",
      description: "Upload photo and choose art style",
      completed: state.completedSteps?.includes(1) || false,
      active: state.currentStep === 1
    },
    {
      id: 2,
      title: "Size & Format",
      description: "Select canvas size and orientation",
      completed: state.completedSteps?.includes(2) || false,
      active: state.currentStep === 2
    },
    {
      id: 3,
      title: "Customize",
      description: "Add premium features",
      completed: state.completedSteps?.includes(3) || false,
      active: state.currentStep === 3
    },
    {
      id: 4,
      title: "Review & Order",
      description: "Complete your purchase",
      completed: state.completedSteps?.includes(4) || false,
      active: state.currentStep === 4
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
      <MilestoneOverlay show={showMilestone} animatingStep={animatingStep} />
      
      <div className="p-8">
        <ProgressHeader 
          completedStepsCount={completedStepsCount}
          personalizedMessages={state.personalizedMessages}
          overallProgress={overallProgress}
          hasUploadedImage={!!uploadedImage}
        />
        
        <ProgressBar 
          overallProgress={overallProgress}
          state={state}
          completedStepsCount={completedStepsCount}
        />

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {steps.map((step) => (
            <StepCard 
              key={step.id}
              step={step}
              showPersonalizedMessage={state.personalizedMessages.length > 0}
            />
          ))}
        </div>

        <SocialProofSection />
      </div>
    </div>
  );
};

export default SmartProgressIndicator;
