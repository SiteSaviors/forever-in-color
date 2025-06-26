
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Sparkles, Heart, CheckCircle } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

const SocialProofFeed = () => {
  const { state } = useProgressOrchestrator();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Rotate through activities
  useEffect(() => {
    if (state.socialProof.recentActivity.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentActivity(prev => 
        (prev + 1) % state.socialProof.recentActivity.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [state.socialProof.recentActivity.length]);

  // Hide during certain interactions
  useEffect(() => {
    const shouldShow = state.currentSubStep !== 'payment' && state.currentStep < 4;
    setIsVisible(shouldShow);
  }, [state.currentSubStep, state.currentStep]);

  if (!isVisible || state.socialProof.recentActivity.length === 0) return null;

  const activity = state.socialProof.recentActivity[currentActivity];

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm animate-slide-in-left">
      <Card className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/50 p-4 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start gap-3">
          {/* Animated Icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 font-medium leading-relaxed">
              {activity}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Just now
              </Badge>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {state.socialProof.completionRate}% satisfaction
              </span>
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">Live Activity</span>
          </div>
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Users className="w-3 h-3 mr-1" />
            <span className="text-xs">Active users</span>
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default SocialProofFeed;
