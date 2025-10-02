
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Camera, MapPin } from "@/components/ui/icons";

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "purchase",
      user: "Sarah from New York",
      action: "just ordered a Living Memory canvas",
      time: "2 minutes ago",
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "creation",
      user: "Mike from Austin",
      action: "created a Watercolor Dreams artwork",
      time: "5 minutes ago",
      icon: Camera,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "love",
      user: "Emma from Miami",
      action: "loved their Electric Bloom canvas",
      time: "8 minutes ago",
      icon: Heart,
      color: "text-pink-600"
    },
    {
      id: 4,
      type: "purchase",
      user: "David from Seattle",
      action: "ordered with voice matching",
      time: "12 minutes ago",
      icon: ShoppingCart,
      color: "text-purple-600"
    }
  ]);

  const [currentVisitors, setCurrentVisitors] = useState(47);
  const [todayOrders, setTodayOrders] = useState(89);

  useEffect(() => {
    // Simulate live activity updates
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: "purchase",
        user: `Customer from ${["Los Angeles", "Chicago", "Boston", "Phoenix", "Denver"][Math.floor(Math.random() * 5)]}`,
        action: "just started creating their canvas",
        time: "just now",
        icon: Camera,
        color: "text-blue-600"
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 3)]);
      setCurrentVisitors(prev => prev + Math.floor(Math.random() * 3) - 1);
      
      if (Math.random() > 0.7) {
        setTodayOrders(prev => prev + 1);
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Live Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-green-700">Live Now</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-green-800">{currentVisitors}</div>
          <div className="text-[10px] sm:text-xs text-green-600">people viewing</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
            <span className="text-xs sm:text-sm font-medium text-purple-700">Today</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-purple-800">{todayOrders}</div>
          <div className="text-[10px] sm:text-xs text-purple-600">orders placed</div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-700">Live Activity</span>
        </div>
        
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-2 sm:px-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${activity.color} flex-shrink-0`} />
              <div className="flex-1 text-xs sm:text-sm min-w-0">
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600"> {activity.action}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
            </div>
          );
        })}
      </div>
      
      {/* Popular Locations */}
      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Popular Today</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {["California", "Texas", "New York", "Florida", "Illinois"].map((state) => (
            <Badge key={state} variant="secondary" className="text-[10px] sm:text-xs">
              {state}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
