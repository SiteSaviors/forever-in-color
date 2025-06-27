
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, Target, Star } from "lucide-react";
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

  const momentum = getMomentumLevel();

  if (state.conversionElements.momentumScore === 0) return null;

  return (
    <>
      {/* Momentum Boost Celebration - Only show celebration overlay */}
      {showMomentumBoost && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 text-center shadow-2xl">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold text-lg mb-1">Momentum Boost!</h3>
            <p className="text-sm opacity-90">+{state.conversionElements.momentumScore - previousScore} points</p>
          </Card>
        </div>
      )}
    </>
  );
};

export default ConversionMomentumTracker;
