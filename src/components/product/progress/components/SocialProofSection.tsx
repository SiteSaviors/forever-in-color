
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";

const SocialProofSection = () => {
  // Default social proof data
  const completionRate = 89;
  const liveUserCount = 23;
  const recentCompletions = 47;

  return (
    <div className="pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">
            {completionRate}% of users complete their masterpiece
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            {liveUserCount} creating now
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Clock className="w-3 h-3 mr-1" />
            {recentCompletions} completed today
          </Badge>
        </div>
      </div>
      
      {/* Motivational messaging */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 text-center">
        <p className="text-amber-800 font-medium text-sm">
          🎨 Join thousands creating their perfect canvas art today!
        </p>
      </div>
    </div>
  );
};

export default SocialProofSection;
