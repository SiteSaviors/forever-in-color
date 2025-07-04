
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

interface LiveActivityBarProps {
  liveUsers: number;
  progressPercentage: number;
}

const LiveActivityBar = ({ liveUsers, progressPercentage }: LiveActivityBarProps) => {
  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-3 mb-2 md:mb-3 overflow-x-auto md:overflow-x-visible flex-nowrap md:flex-wrap pb-1 md:pb-0">
      {/* Live Users with mobile-optimized styling and text */}
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/25 to-green-500/25 backdrop-blur-xl px-1.5 md:px-2.5 py-0.5 md:py-1.5 rounded-full border border-emerald-400/40 shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 hover:scale-105 group flex-shrink-0">
        <div className="relative">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/60"></div>
          <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-emerald-100 font-bold text-xs group-hover:text-emerald-50 transition-colors whitespace-nowrap">
          {/* Mobile-specific shortened text */}
          <span className="md:hidden">
            {liveUsers} live
          </span>
          <span className="hidden md:inline">
            {liveUsers} creating now
          </span>
        </span>
      </div>
      
      {/* AI Badge with mobile-optimized styling and text */}
      <div className="relative flex-shrink-0">
        <Badge className="bg-gradient-to-r from-violet-500/25 to-purple-500/25 backdrop-blur-xl text-violet-100 border-violet-300/40 px-1.5 md:px-2.5 py-0.5 md:py-1.5 shadow-lg hover:shadow-violet-500/25 transition-all duration-200 hover:scale-105 group">
          <Sparkles className="w-3 h-3 mr-1 animate-pulse group-hover:animate-spin" />
          <span className="font-bold text-xs whitespace-nowrap">
            {/* Mobile-specific shortened text */}
            <span className="md:hidden">AI Magic</span>
            <span className="hidden md:inline">AI-Powered Magic</span>
          </span>
        </Badge>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-md -z-10 animate-pulse"></div>
      </div>
      
      {/* Dynamic Progress Badge with mobile-optimized styling and text */}
      <Badge className={`border-2 transition-all duration-300 px-1.5 md:px-2.5 py-0.5 md:py-1.5 backdrop-blur-xl shadow-lg hover:scale-105 group flex-shrink-0 ${
        progressPercentage > 0 
          ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-100 border-emerald-300/60 hover:shadow-emerald-500/25' 
          : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-100 border-amber-300/60 hover:shadow-amber-500/25'
      }`}>
        <TrendingUp className="w-3 h-3 mr-1 group-hover:animate-pulse" />
        <span className="font-bold text-xs whitespace-nowrap">
          {/* Mobile-specific shortened text */}
          <span className="md:hidden">
            {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Done` : 'Ready'}
          </span>
          <span className="hidden md:inline">
            {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Complete` : 'Ready to Start'}
          </span>
        </span>
      </Badge>
    </div>
  );
};

export default LiveActivityBar;
