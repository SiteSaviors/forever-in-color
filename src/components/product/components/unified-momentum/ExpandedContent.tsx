
import { memo } from "react";
import { Clock, User } from "lucide-react";

interface Activity {
  user: string;
  action: string;
  time: string;
}

interface ExpandedContentProps {
  recentActivity: Activity[];
}

const ExpandedContent = memo(({ recentActivity }: ExpandedContentProps) => {
  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
      <div className="space-y-2">
        {recentActivity.slice(0, 3).map((activity, index) => (
          <div key={index} className="flex items-start space-x-2 text-xs">
            <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
            <div>
              <User className="w-3 h-3 inline mr-1" />
              <span className="font-medium">{activity.user}</span>
              <span className="text-gray-600"> {activity.action}</span>
              <div className="text-gray-400">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ExpandedContent.displayName = 'ExpandedContent';

export default ExpandedContent;
