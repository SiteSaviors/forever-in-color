
import { Badge } from "@/components/ui/badge";

interface StyleFloatingBadgeProps {
  styleId: number;
  styleName: string;
}

const StyleFloatingBadge = ({ styleId, styleName }: StyleFloatingBadgeProps) => {
  // Style-specific configurations - clean, no emojis, professional colors
  const getStyleConfig = () => {
    const configs: { [key: number]: { color: string; bgColor: string; borderColor: string } } = {
      1: { color: "text-gray-700", bgColor: "bg-white/95", borderColor: "border-gray-200/50" },
      2: { color: "text-amber-800", bgColor: "bg-amber-50/95", borderColor: "border-amber-200/50" },
      4: { color: "text-blue-700", bgColor: "bg-blue-50/95", borderColor: "border-blue-200/50" },
      5: { color: "text-pink-700", bgColor: "bg-pink-50/95", borderColor: "border-pink-200/50" },
      6: { color: "text-purple-700", bgColor: "bg-purple-50/95", borderColor: "border-purple-200/50" },
      7: { color: "text-cyan-700", bgColor: "bg-cyan-50/95", borderColor: "border-cyan-200/50" },
      8: { color: "text-slate-700", bgColor: "bg-slate-50/95", borderColor: "border-slate-200/50" },
      9: { color: "text-rose-700", bgColor: "bg-rose-50/95", borderColor: "border-rose-200/50" },
      10: { color: "text-emerald-700", bgColor: "bg-emerald-50/95", borderColor: "border-emerald-200/50" },
      11: { color: "text-violet-700", bgColor: "bg-violet-50/95", borderColor: "border-violet-200/50" },
      13: { color: "text-indigo-700", bgColor: "bg-indigo-50/95", borderColor: "border-indigo-200/50" },
      15: { color: "text-yellow-700", bgColor: "bg-yellow-50/95", borderColor: "border-yellow-200/50" },
    };
    
    return configs[styleId] || configs[1];
  };

  const config = getStyleConfig();

  return (
    <div className="absolute top-3 left-3 z-30">
      <Badge 
        className={`
          ${config.bgColor} ${config.color} ${config.borderColor}
          font-poppins font-semibold text-sm px-4 py-2
          backdrop-blur-sm border
          shadow-lg hover:shadow-xl
          transition-all duration-300
          rounded-full
        `}
      >
        {styleName}
      </Badge>
    </div>
  );
};

export default StyleFloatingBadge;
