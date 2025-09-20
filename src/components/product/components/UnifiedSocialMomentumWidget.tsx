import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
import WidgetHeader from "./unified-momentum/WidgetHeader";
import ActivityDisplay from "./unified-momentum/ActivityDisplay";
import MomentumIndicator from "./unified-momentum/MomentumIndicator";
import LiveStats from "./unified-momentum/LiveStats";
import ExpandedContent from "./unified-momentum/ExpandedContent";
interface UnifiedSocialMomentumWidgetProps {
  currentStep: number;
  uploadedImage: string | null;
  showWidget: boolean;
}
const UnifiedSocialMomentumWidget = ({
  currentStep,
  uploadedImage,
  showWidget
}: UnifiedSocialMomentumWidgetProps) => {
  const {
    state,
    trackClick
  } = useProgressOrchestrator();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [showExpanded, setShowExpanded] = useState(false);
  const [liveUsers, setLiveUsers] = useState(238);

  // Rotate through activities
  useEffect(() => {
    if (!showWidget || state.socialProof.recentActivity.length === 0) return;
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % state.socialProof.recentActivity.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [showWidget, state.socialProof.recentActivity.length]);

  // Simulate live user count fluctuations
  useEffect(() => {
    if (!showWidget) return;
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 6) - 2);
    }, 12000);
    return () => clearInterval(interval);
  }, [showWidget]);

  // Auto-expand logic based on hesitation
  useEffect(() => {
    if (!showWidget) return;
    const timeSinceLastInteraction = Date.now() - state.userBehavior.lastInteraction;
    if (timeSinceLastInteraction > 20000 && !state.contextualHelp.showTooltip) {
      setShowExpanded(true);
    } else if (timeSinceLastInteraction < 8000) {
      setShowExpanded(false);
    }
  }, [showWidget, state.userBehavior.lastInteraction, state.contextualHelp.showTooltip]);
  if (!showWidget || !uploadedImage) return null;
  const activity = state.socialProof.recentActivity[currentActivity];
  const momentumScore = state?.conversionElements?.momentumScore || 0;
  const getMomentumLevel = () => {
    if (momentumScore >= 75) return {
      level: 'High',
      color: 'green',
      bgColor: 'bg-green-500'
    };
    if (momentumScore >= 50) return {
      level: 'Medium',
      color: 'yellow',
      bgColor: 'bg-yellow-500'
    };
    if (momentumScore >= 25) return {
      level: 'Building',
      color: 'blue',
      bgColor: 'bg-blue-500'
    };
    return {
      level: 'Starting',
      color: 'gray',
      bgColor: 'bg-gray-500'
    };
  };
  const momentum = getMomentumLevel();
  const handleToggleExpanded = () => {
    setShowExpanded(!showExpanded);
    trackClick('unified-widget-expand');
  };
  return <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-slide-in-left">
      <Card className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden" onClick={handleToggleExpanded}>
        <CardContent className="p-0">
          

          {/* Subtle expand indicator */}
          <div className="bg-gray-50 px-4 py-2 text-center">
            <div className={`w-8 h-1 bg-gray-300 rounded-full mx-auto transition-transform duration-300 ${showExpanded ? 'rotate-180' : ''}`} />
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default UnifiedSocialMomentumWidget;