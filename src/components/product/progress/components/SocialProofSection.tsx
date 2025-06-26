
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { ProgressState } from "../types";

interface SocialProofSectionProps {
  state: ProgressState;
}

const SocialProofSection = ({ state }: SocialProofSectionProps) => {
  return (
    <div className="pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">
            {state.socialProof.completionRate}% of users complete their masterpiece
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            {state.socialProof.liveUserCount} creating now
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Clock className="w-3 h-3 mr-1" />
            {state.socialProof.recentCompletions} completed today
          </Badge>
        </div>
      </div>
      
      {/* Urgency messaging */}
      {state.conversionElements.urgencyMessage && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-amber-800 font-medium text-sm">
            {state.conversionElements.urgencyMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialProofSection;
