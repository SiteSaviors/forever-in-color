
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Heart, Clock, Zap, TrendingUp, Star, CheckCircle, Camera } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

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
  const { state, trackClick } = useProgressOrchestrator();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [showExpanded, setShowExpanded] = useState(false);
  const [liveUsers, setLiveUsers] = useState(238);

  // Rotate through activities
  useEffect(() => {
    if (!showWidget || state.socialProof.recentActivity.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentActivity(prev => 
        (prev + 1) % state.socialProof.recentActivity.length
      );
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
    if (momentumScore >= 75) return { level: 'High', color: 'green', bgColor: 'bg-green-500' };
    if (momentumScore >= 50) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-500' };
    if (momentumScore >= 25) return { level: 'Building', color: 'blue', bgColor: 'bg-blue-500' };
    return { level: 'Starting', color: 'gray', bgColor: 'bg-gray-500' };
  };

  const momentum = getMomentumLevel();

  const getActivityIcon = (activity: string) => {
    if (activity.includes('created') || activity.includes('masterpiece')) return CheckCircle;
    if (activity.includes('selected') || activity.includes('chose')) return Heart;
    if (activity.includes('ordered') || activity.includes('completed')) return Star;
    return Camera;
  };

  const ActivityIcon = getActivityIcon(activity);

  const handleToggleExpanded = () => {
    setShowExpanded(!showExpanded);
    trackClick('unified-widget-expand');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-slide-in-left">
      <Card className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={handleToggleExpanded}>
        <CardContent className="p-0">
          {/* Main Content */}
          <div className="p-4">
            {/* Header with Live Activity + Momentum */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Activity</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${momentum.bgColor}`}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-gray-900">Momentum</div>
                  <div className={`text-xs px-1.5 py-0.5 rounded-full ${
                    momentum.color === 'green' ? 'bg-green-100 text-green-700' :
                    momentum.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    momentum.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {momentum.level}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                <ActivityIcon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {activity}
                </p>
                <div className="flex items-center gap-2 mt-1">
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

            {/* Momentum Progress */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm font-bold text-purple-600">{Math.round(momentumScore)}%</span>
              </div>
              <div className="relative">
                <Progress value={momentumScore} className="h-2 bg-gray-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
                     style={{ width: `${momentumScore}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor((state?.conversionElements?.timeSpentOnPlatform || 0) / 60)}m active</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Users className="w-3 h-3 mr-1" />
                  {liveUsers} online
                </Badge>
              </div>
            </div>

            {/* Expanded Content */}
            {showExpanded && (
              <div className="animate-scale-in border-t border-gray-100 pt-3">
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
                
                {/* Personalized Recommendation */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-800">Perfect Timing!</span>
                  </div>
                  <p className="text-xs text-green-600">
                    Users at your progress level choose their style within the next 3 minutes
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Subtle expand indicator */}
          <div className="bg-gray-50 px-4 py-2 text-center">
            <div className={`w-8 h-1 bg-gray-300 rounded-full mx-auto transition-transform duration-300 ${
              showExpanded ? 'rotate-180' : ''
            }`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedSocialMomentumWidget;
