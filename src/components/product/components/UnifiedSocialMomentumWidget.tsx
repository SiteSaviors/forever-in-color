
import { useState, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users, TrendingUp, Clock } from "lucide-react";

interface UnifiedSocialMomentumWidgetProps {
  currentStep: number;
  uploadedImage: string | null;
  showWidget: boolean;
}

const UnifiedSocialMomentumWidget = memo(({
  showWidget
}: UnifiedSocialMomentumWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentActivity] = useState([
    { user: "Sarah", action: "ordered Classic Oil style", time: "2 min ago" },
    { user: "Mike", action: "generated Watercolor Dreams", time: "5 min ago" },
    { user: "Emma", action: "selected Pop Art Burst", time: "8 min ago" }
  ]);

  // Mock live statistics
  const [stats, setStats] = useState({
    activeUsers: 47,
    recentOrders: 12,
    popularStyle: "Neon Splash"
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        recentOrders: prev.recentOrders + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!showWidget) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <Card className="shadow-lg border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Activity</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{stats.activeUsers} users browsing</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>{stats.recentOrders} recent orders</span>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                      <div className="text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

UnifiedSocialMomentumWidget.displayName = 'UnifiedSocialMomentumWidget';

export default UnifiedSocialMomentumWidget;
