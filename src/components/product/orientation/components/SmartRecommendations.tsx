
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Users } from "lucide-react";

interface SmartRecommendationsProps {
  selectedOrientation: string;
  userImageUrl: string | null;
}

const SmartRecommendations = ({ selectedOrientation, userImageUrl }: SmartRecommendationsProps) => {
  // Smart recommendation logic based on image analysis
  const getRecommendedOrientation = () => {
    // For now, we'll use smart defaults, but this could be enhanced with actual image analysis
    if (!userImageUrl) return 'square';
    
    // This would be where we'd analyze the image aspect ratio and content
    // For demo purposes, let's assume square is most versatile
    return 'square';
  };

  const getRecommendationReason = (orientation: string) => {
    const reasons = {
      'square': 'Most versatile for social sharing and fits any space perfectly',
      'horizontal': 'Perfect for landscape photos and wide wall spaces',
      'vertical': 'Ideal for portraits and creates dramatic visual impact'
    };
    return reasons[orientation as keyof typeof reasons] || '';
  };

  const getPopularityData = (orientation: string) => {
    const data = {
      'square': { percentage: 68, trend: 'up' },
      'horizontal': { percentage: 45, trend: 'stable' },
      'vertical': { percentage: 52, trend: 'up' }
    };
    return data[orientation as keyof typeof data] || { percentage: 50, trend: 'stable' };
  };

  const recommendedOrientation = getRecommendedOrientation();
  const isRecommended = selectedOrientation === recommendedOrientation;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">AI Insights</h4>
      </div>

      {isRecommended && (
        <div className="mb-3 p-3 bg-white/80 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              Perfect Choice
            </Badge>
          </div>
          <p className="text-sm text-gray-700">
            {getRecommendationReason(selectedOrientation)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* Popularity Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Customer Choice</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-purple-600">
              {getPopularityData(selectedOrientation).percentage}%
            </span>
            <TrendingUp className="w-3 h-3 text-green-500" />
          </div>
        </div>

        {/* Quick Tip */}
        <div className="text-xs text-gray-600 bg-white/60 rounded-lg p-2">
          💡 <strong>Pro Tip:</strong> {getRecommendationReason(selectedOrientation)}
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;
