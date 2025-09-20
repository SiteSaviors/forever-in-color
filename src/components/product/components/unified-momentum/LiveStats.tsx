
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";

interface LiveStatsProps {
  liveUsers: number;
  timeSpentOnPlatform: number;
}

const LiveStats = ({ liveUsers, timeSpentOnPlatform }: LiveStatsProps) => {
  return (
    <div className="flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{Math.floor(timeSpentOnPlatform / 60)}m active</span>
      </div>
      <Badge variant="outline" className="text-purple-600 border-purple-200">
        <Users className="w-3 h-3 mr-1" />
        {liveUsers} online
      </Badge>
    </div>
  );
};

export default LiveStats;
