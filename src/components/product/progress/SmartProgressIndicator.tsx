import { useState, useEffect } from "react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";
interface SmartProgressIndicatorProps {
  uploadedImage: string | null;
}
const SmartProgressIndicator = ({
  uploadedImage
}: SmartProgressIndicatorProps) => {
  const {
    state
  } = useProgressOrchestrator();
  const [showMilestone, setShowMilestone] = useState(false);
  const completedStepsCount = state.completedSteps?.length || 0;
  const overallProgress = Math.min(completedStepsCount / 4 * 100, 100);

  // Effect to handle milestone animations
  useEffect(() => {
    if (!state.completedSteps || state.completedSteps.length === 0) {
      return;
    }

    setShowMilestone(true);
    const timeoutId = window.setTimeout(() => setShowMilestone(false), 3000);

    return () => window.clearTimeout(timeoutId);
  }, [state.completedSteps]);

  // Don't render anything if no image is uploaded
  if (!uploadedImage) {
    return null;
  }
  const getCurrentStepMessage = () => {
    if (completedStepsCount === 0) return "AI is analyzing your photo for perfect recommendations";
    if (completedStepsCount === 1) return "Finding the ideal size for your space";
    if (completedStepsCount === 2) return "Adding premium finishing touches";
    if (completedStepsCount >= 3) return "Almost ready to transform your photo!";
    return "Getting started...";
  };
  return <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative" aria-live="polite">
      {/* Milestone celebration overlay */}
      {showMilestone && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse z-10 pointer-events-none" />}
      <span className="sr-only">
        {`Progress ${Math.round(overallProgress)} percent complete. ${getCurrentStepMessage()}`}
      </span>
    </div>;
};
export default SmartProgressIndicator;
