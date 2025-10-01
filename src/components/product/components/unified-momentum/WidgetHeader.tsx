
import { Zap } from "lucide-react";

interface WidgetHeaderProps {
  momentum: {
    level: string;
    color: string;
    bgColor: string;
  };
}

const WidgetHeader = ({ momentum }: WidgetHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Live Activity</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${momentum.bgColor}`}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="text-xs">
          <div className="font-semibold text-gray-900">Momentum</div>
          <div className={`text-xs px-1.5 py-0.5 rounded-full ${
            momentum.color === 'green' ? 'bg-green-100 text-green-700' :
            momentum.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
            momentum.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {momentum.level}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetHeader;
