
import { ArrowDown } from "lucide-react";

interface SizeTransitionIndicatorProps {
  selectedOrientation: string;
}

const SizeTransitionIndicator = ({ selectedOrientation }: SizeTransitionIndicatorProps) => {
  if (!selectedOrientation) return null;

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2 text-purple-600 animate-bounce">
        <ArrowDown className="w-4 h-4" />
        <span className="text-sm font-medium">Now choose your size</span>
        <ArrowDown className="w-4 h-4" />
      </div>
    </div>
  );
};

export default SizeTransitionIndicator;
