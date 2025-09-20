import { useState, useEffect } from "react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, Settings, Palette, ShoppingBag, Sparkles, TrendingUp, Users, Clock } from "lucide-react";
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
    if (state.completedSteps && state.completedSteps.length > 0) {
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 3000);
    }
  }, [state.completedSteps]);

  // Don't render anything if no image is uploaded
  if (!uploadedImage) {
    return null;
  }
  const steps = [{
    id: 1,
    icon: Upload,
    title: "Photo & Style",
    completed: state.completedSteps?.includes(1) || false
  }, {
    id: 2,
    icon: Settings,
    title: "Size & Format",
    completed: state.completedSteps?.includes(2) || false
  }, {
    id: 3,
    icon: Palette,
    title: "Customize",
    completed: state.completedSteps?.includes(3) || false
  }, {
    id: 4,
    icon: ShoppingBag,
    title: "Review & Order",
    completed: state.completedSteps?.includes(4) || false
  }];
  const getCurrentStepMessage = () => {
    if (completedStepsCount === 0) return "AI is analyzing your photo for perfect recommendations";
    if (completedStepsCount === 1) return "Finding the ideal size for your space";
    if (completedStepsCount === 2) return "Adding premium finishing touches";
    if (completedStepsCount >= 3) return "Almost ready to transform your photo!";
    return "Getting started...";
  };
  return <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
      {/* Milestone celebration overlay */}
      {showMilestone && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse z-10 pointer-events-none" />}
      
      
    </div>;
};
export default SmartProgressIndicator;