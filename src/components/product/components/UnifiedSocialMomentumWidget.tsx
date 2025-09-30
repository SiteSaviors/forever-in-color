import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  useSocialProof,
  useUserBehavior,
  useTooltip,
  useConversionElements,
  useAIStatus
} from "../progress/hooks/useProgressSelectors";
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

const activityFallback = "Artists are turning their photos into premium canvases right now";

const UnifiedSocialMomentumWidget = ({
  currentStep,
  uploadedImage,
  showWidget
}: UnifiedSocialMomentumWidgetProps) => {
  const socialProof = useSocialProof();
  const userBehavior = useUserBehavior();
  const contextualHelp = useTooltip();
  const conversionElements = useConversionElements();
  const aiStatus = useAIStatus();

  const activities = socialProof?.recentActivity ?? [];
  const completionRate = socialProof?.completionRate ?? 0;
  const recentCompletions = socialProof?.recentCompletions ?? 0;
  const initialLiveUsers = socialProof?.liveUserCount ?? 238;
  const momentumScore = conversionElements?.momentumScore ?? 0;
  const timeSpentOnPlatform = conversionElements?.timeSpentOnPlatform ?? 0;

  const [currentActivity, setCurrentActivity] = useState(0);
  const [showExpanded, setShowExpanded] = useState(false);
  const [liveUsers, setLiveUsers] = useState(initialLiveUsers);

  const momentum = useMemo(() => {
    if (momentumScore >= 75) {
      return { level: "High", color: "green", bgColor: "bg-green-500" };
    }
    if (momentumScore >= 50) {
      return { level: "Medium", color: "yellow", bgColor: "bg-yellow-500" };
    }
    if (momentumScore >= 25) {
      return { level: "Building", color: "blue", bgColor: "bg-blue-500" };
    }
    return { level: "Starting", color: "gray", bgColor: "bg-gray-500" };
  }, [momentumScore]);

  // Rotate through activities from social proof to reinforce momentum
  useEffect(() => {
    if (!showWidget || activities.length === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % activities.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [activities.length, showWidget]);

  // Simulate live user momentum to keep the widget feeling active
  useEffect(() => {
    if (!showWidget) {
      return undefined;
    }

    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(0, prev + Math.floor(Math.random() * 6) - 2));
    }, 12000);

    return () => clearInterval(interval);
  }, [showWidget]);

  // Auto-expand when the customer hesitates on the current step
  useEffect(() => {
    if (!showWidget) {
      return;
    }

    const timeSinceLastInteraction = Date.now() - userBehavior.lastInteraction;
    const hesitationThreshold = currentStep === 1 ? 20000 : 15000;
    const collapseThreshold = currentStep === 1 ? 8000 : 6000;

    if (timeSinceLastInteraction > hesitationThreshold && !contextualHelp.showTooltip) {
      setShowExpanded(true);
    } else if (timeSinceLastInteraction < collapseThreshold) {
      setShowExpanded(false);
    }
  }, [contextualHelp.showTooltip, currentStep, showWidget, userBehavior.lastInteraction]);

  // Keep live user count aligned with global engagement state
  useEffect(() => {
    setLiveUsers(initialLiveUsers);
  }, [initialLiveUsers]);

  if (!showWidget || !uploadedImage) {
    return null;
  }

  const activity = activities[currentActivity] ?? activityFallback;
  const handleToggleExpanded = () => {
    setShowExpanded(prev => !prev);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-slide-in-left">
      <Card
        className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={handleToggleExpanded}
      >
        <CardContent className="p-4 space-y-3">
          <WidgetHeader momentum={momentum} />
          <ActivityDisplay activity={activity} completionRate={completionRate} />
          <MomentumIndicator momentumScore={momentumScore} timeSpentOnPlatform={timeSpentOnPlatform} />
          <LiveStats liveUsers={liveUsers} timeSpentOnPlatform={timeSpentOnPlatform} />
          {showExpanded && (
            <ExpandedContent
              recentCompletions={recentCompletions}
              imageType={aiStatus.imageType}
              momentumScore={momentumScore}
            />
          )}
        </CardContent>

        <div className="bg-gray-50 px-4 py-2 text-center">
          <div
            className={`w-8 h-1 bg-gray-300 rounded-full mx-auto transition-transform duration-300 ${
              showExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </Card>
    </div>
  );
};

export default UnifiedSocialMomentumWidget;
