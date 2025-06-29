
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WidgetHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const WidgetHeader = memo(({ isExpanded, onToggle }: WidgetHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Live Activity</span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </Button>
    </div>
  );
});

WidgetHeader.displayName = 'WidgetHeader';

export default WidgetHeader;
