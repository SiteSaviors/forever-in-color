
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Sparkles, Heart, CheckCircle, TrendingUp, Clock, Star } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

const SocialProofFeed = () => {
  const { state, trackClick } = useProgressOrchestrator();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showExpanded, setShowExpanded] = useState(false);

  // Rotate through activities with smart timing
  useEffect(() => {
    if (state.socialProof.recentActivity.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentActivity(prev => 
        (prev + 1) % state.socialProof.recentActivity.length
      );
    }, 6000); // Slower for better readability

    return () => clearInterval(interval);
  }, [state.socialProof.recentActivity.length]);

  // Smart visibility based on user progress
  useEffect(() => {
    const shouldShow = state.currentSubStep !== 'payment' && state.currentStep < 4;
    setIsVisible(shouldShow);
  }, [state.currentSubStep, state.currentStep]);

  // Auto-expand during hesitation periods
  useEffect(() => {
    const timeSinceLastInteraction = Date.now() - state.userBehavior.lastInteraction;
    if (timeSinceLastInteraction > 25000 && !state.contextualHelp.showTooltip) {
      setShowExpanded(true);
    } else if (timeSinceLastInteraction < 10000) {
      setShowExpanded(false);
    }
  }, [state.userBehavior.lastInteraction, state.contextualHelp.showTooltip]);

  if (!isVisible || state.socialProof.recentActivity.length === 0) return null;

  const activity = state.socialProof.recentActivity[currentActivity];
  
  const getActivityIcon = (activity: string) => {
    if (activity.includes('created') || activity.includes('masterpiece')) return CheckCircle;
    if (activity.includes('selected') || activity.includes('chose')) return Heart;
    if (activity.includes('ordered') || activity.includes('completed')) return Star;
    return Sparkles;
  };

  const ActivityIcon = getActivityIcon(activity);

  const handleExpand = () => {
    setShowExpanded(!showExpanded);
    trackClick('social-proof-expand');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm animate-slide-in-left">
      <Card className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={handleExpand}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Animated Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
              <ActivityIcon className="w-5 h-5 text-white" />
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
              <span className="text-xs">{state.socialProof.liveUserCount} online</span>
            </Badge>
          </div>

          {/* Expanded Content */}
          {showExpanded && (
            <div className="mt-4 pt-3 border-t border-gray-100 animate-scale-in">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-lg text-blue-600">
                      {state.socialProof.recentCompletions}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Completed Today</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-lg text-purple-600">2.3m</span>
                  </div>
                  <p className="text-xs text-gray-600">Avg Time</p>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-800">Top Choice</span>
                </div>
                <p className="text-xs text-gray-600">
                  {state.aiAnalysis.imageType === 'portrait' 
                    ? "Classic Oil & Pop Art are favorites for portraits"
                    : state.aiAnalysis.imageType === 'landscape'
                    ? "Abstract Fusion works beautifully with landscapes" 
                    : "Upload your photo to see personalized recommendations"}
                </p>
              </div>

              {/* Conversion Psychology */}
              {state.conversionElements.momentumScore > 25 && (
                <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-800">You're on track!</span>
                  </div>
                  <p className="text-xs text-green-600">
                    Users with your progress have a {Math.min(95, 65 + state.conversionElements.momentumScore)}% completion rate
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SocialProofFeed;
