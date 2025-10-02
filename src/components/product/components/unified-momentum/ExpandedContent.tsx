
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Star } from "@/components/ui/icons";

interface ExpandedContentProps {
  recentCompletions: number;
  imageType: string;
  momentumScore: number;
}

const ExpandedContent = ({ recentCompletions, imageType, momentumScore }: ExpandedContentProps) => {
  const getPersonalizedRecommendation = () => {
    if (imageType === 'portrait') {
      return "Classic Oil & Pop Art are favorites for portraits";
    }
    if (imageType === 'landscape') {
      return "Abstract Fusion works beautifully with landscapes";
    }
    return "Upload your photo to see personalized recommendations";
  };

  return (
    <div className="animate-scale-in border-t border-gray-100 pt-3">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-lg text-blue-600">
              {recentCompletions}
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
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-green-800">Top Choice</span>
        </div>
        <p className="text-xs text-green-600">
          {getPersonalizedRecommendation()}
        </p>
      </div>

      {/* Conversion Psychology */}
      {momentumScore > 25 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-800">Perfect Timing!</span>
          </div>
          <p className="text-xs text-green-600">
            Users at your progress level choose their style within the next 3 minutes
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpandedContent;
