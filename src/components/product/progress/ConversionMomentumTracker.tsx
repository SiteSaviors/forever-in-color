
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, Target, Clock, Star } from "lucide-react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";

const ConversionMomentumTracker = () => {
  const { state } = useProgressOrchestrator();
  const [showMomentumBoost, setShowMomentumBoost] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);

  // Track momentum changes and show celebrations
  useEffect(() => {
    if (state.conversionElements.momentumScore > previousScore && previousScore > 0) {
      setShowMomentumBoost(true);
      setTimeout(() => setShowMomentumBoost(false), 3000);
    }
    setPreviousScore(state.conversionElements.momentumScore);
  }, [state.conversionElements.momentumScore, previousScore]);

  const getMomentumLevel = () => {
    const score = state.conversionElements.momentumScore;
    if (score >= 75) return { level: 'High', color: 'green', icon: Star };
    if (score >= 50) return { level: 'Medium', color: 'yellow', icon: TrendingUp };
    if (score >= 25) return { level: 'Building', color: 'blue', icon: Zap };
    return { level: 'Starting', color: 'gray', icon: Target };
  };

  const getPersonalizationMessage = () => {
    const level = state.conversionElements.personalizationLevel;
    const timeSpent = Math.floor(state.conversionElements.timeSpentOnPlatform / 60);
    
    switch (level) {
      case 'high':
        return `You've been creating for ${timeSpent}m - your unique masterpiece is almost ready!`;
      case 'medium':
        return `${timeSpent}m in - you're building something special!`;
      case 'low':
        return `Welcome! Let's create your personalized artwork.`;
      default:
        return "Let's get started on your masterpiece!";
    }
  };

  const momentum = getMomentumLevel();
  const MomentumIcon = momentum.icon;

  if (state.conversionElements.momentumScore === 0) return null;

  return (
    <>
      {/* Momentum Boost Celebration */}
      {showMomentumBoost && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 text-center shadow-2xl">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold text-lg mb-1">Momentum Boost!</h3>
            <p className="text-sm opacity-90">+{state.conversionElements.momentumScore - previousScore} points</p>
          </Card>
        </div>
      )}

      {/* Momentum Tracker Widget */}
      <div className="fixed top-20 right-6 z-30 max-w-xs">
        <Card className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-200/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              momentum.color === 'green' ? 'bg-green-500' :
              momentum.color === 'yellow' ? 'bg-yellow-500' :
              momentum.color === 'blue' ? 'bg-blue-500' :
              'bg-gray-500'
            } text-white`}>
              <MomentumIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Momentum</h4>
              <Badge variant="secondary" className={`text-xs ${
                momentum.color === 'green' ? 'bg-green-100 text-green-700' :
                momentum.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                momentum.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {momentum.level}
              </Badge>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{state.conversionElements.momentumScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  momentum.color === 'green' ? 'bg-green-500' :
                  momentum.color === 'yellow' ? 'bg-yellow-500' :
                  momentum.color === 'blue' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}
                style={{ width: `${state.conversionElements.momentumScore}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {getPersonalizationMessage()}
          </p>

          {/* Time indicator */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{Math.floor(state.conversionElements.timeSpentOnPlatform / 60)}m active</span>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ConversionMomentumTracker;
