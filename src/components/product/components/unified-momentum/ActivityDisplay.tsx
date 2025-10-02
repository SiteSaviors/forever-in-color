
import { Badge } from "@/components/ui/badge";
import { Heart, CheckCircle, Star, Camera } from "@/components/ui/icons";

interface ActivityDisplayProps {
  activity: string;
  completionRate: number;
}

const ActivityDisplay = ({ activity, completionRate }: ActivityDisplayProps) => {
  const getActivityIcon = (activity: string) => {
    if (activity.includes('created') || activity.includes('masterpiece')) return CheckCircle;
    if (activity.includes('selected') || activity.includes('chose')) return Heart;
    if (activity.includes('ordered') || activity.includes('completed')) return Star;
    return Camera;
  };

  const ActivityIcon = getActivityIcon(activity);

  return (
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
            {completionRate}% satisfaction
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityDisplay;
