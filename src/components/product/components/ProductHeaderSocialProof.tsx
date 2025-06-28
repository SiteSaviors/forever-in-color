
import { useState, useEffect } from "react";

interface ProductHeaderSocialProofProps {}

const ProductHeaderSocialProof = ({}: ProductHeaderSocialProofProps) => {
  const [liveUsers, setLiveUsers] = useState(127);
  const [todayCreations, setTodayCreations] = useState(2847);

  // Simulate live activity with more dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(85, prev + Math.floor(Math.random() * 5) - 2));
      setTodayCreations(prev => prev + (Math.random() > 0.3 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-200/50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-700 font-semibold text-sm">
            {liveUsers} people creating art right now
          </span>
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="text-gray-600 text-sm font-medium">
          {todayCreations.toLocaleString()} created today
        </div>
      </div>
    </div>
  );
};

export default ProductHeaderSocialProof;
