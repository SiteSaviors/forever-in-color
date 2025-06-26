
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
  
  // Fixed progress calculation that properly reflects user progress
  const calculateActualProgress = () => {
    // If no image uploaded, progress should be 0%
    if (!uploadedImage) {
      console.log('📊 Progress: 0% - No image uploaded');
      return 0;
    }
    
    // Base progress on completed steps (25% per step)
    let baseProgress = (completedStepsCount / 4) * 100;
    
    // Add small momentum bonus only if user has actually started (has an image)
    // and only for users who have made meaningful progress
    if (uploadedImage && completedStepsCount > 0 && state.conversionElements.momentumScore > 0) {
      // Cap momentum bonus at 5% to avoid inflating progress too much
      const momentumBonus = Math.min(state.conversionElements.momentumScore * 0.05, 5);
      baseProgress += momentumBonus;
      console.log('📊 Progress: Base:', Math.round(baseProgress - momentumBonus), '% + Momentum:', Math.round(momentumBonus), '%');
    }
    
    const finalProgress = Math.min(Math.max(baseProgress, 0), 100);
    console.log('📊 Final Progress:', Math.round(finalProgress), '%');
    return finalProgress;
  };
  
  const overallProgress = calculateActualProgress();
  
  // Effect to handle milestone animations with better validation
  useEffect(() => {
    if (state.completedSteps && state.completedSteps.length > 0 && uploadedImage) {
      const lastCompletedStep = Math.max(...state.completedSteps);
      
      // Only show milestone for valid steps
      if (lastCompletedStep >= 1 && lastCompletedStep <= 4) {
        setAnimatingStep(lastCompletedStep);
        setShowMilestone(true);
        
        console.log('🎉 Milestone triggered for step:', lastCompletedStep);
        
        const timeoutId = setTimeout(() => {
          setShowMilestone(false);
          setAnimatingStep(null);
        }, 3000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [state.completedSteps, uploadedImage]);

  // Don't render anything if no image is uploaded
  if (!uploadedImage) {
    console.log('🚫 SmartProgressIndicator: Not rendering - no uploaded image');
    return null;
  }

  // Validate state before rendering
  if (!state || typeof state.currentStep !== 'number') {
    console.warn('⚠️ SmartProgressIndicator: Invalid state', state);
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
          personalizedMessages={state.personalizedMessages || []}
          overallProgress={overallProgress}
          hasUploadedImage={!!uploadedImage}
        />
        
        <ProgressBar 
          overallProgress={overallProgress}
          state={state}
          completedStepsCount={completedStepsCount}
        />

        {/* Steps Grid with enhanced validation */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {steps.map((step) => (
            <StepCard 
              key={step.id}
              step={step}
              showPersonalizedMessage={(state.personalizedMessages?.length || 0) > 0}
            />
          ))}
        </div>

        <SocialProofSection />
      </div>
    </div>
  );
};

export default SmartProgressIndicator;
