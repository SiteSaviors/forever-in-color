
import { Badge } from "@/components/ui/badge";

interface StyleFloatingBadgeProps {
  styleId: number;
  styleName: string;
}

const StyleFloatingBadge = ({ styleId, styleName }: StyleFloatingBadgeProps) => {
  // Style-specific configurations with emojis and colors
  const getStyleConfig = () => {
    const configs: { [key: number]: { emoji: string; color: string; bgColor: string; borderColor: string } } = {
      1: { emoji: "📸", color: "text-gray-700", bgColor: "bg-white/95", borderColor: "border-gray-200/50" },
      2: { emoji: "🎨", color: "text-amber-700", bgColor: "bg-amber-50/95", borderColor: "border-amber-200/50" },
      4: { emoji: "🌊", color: "text-blue-700", bgColor: "bg-blue-50/95", borderColor: "border-blue-200/50" },
      5: { emoji: "🌸", color: "text-pink-700", bgColor: "bg-pink-50/95", borderColor: "border-pink-200/50" },
      6: { emoji: "💎", color: "text-purple-700", bgColor: "bg-purple-50/95", borderColor: "border-purple-200/50" },
      7: { emoji: "🎬", color: "text-cyan-700", bgColor: "bg-cyan-50/95", borderColor: "border-cyan-200/50" },
      8: { emoji: "✏️", color: "text-slate-700", bgColor: "bg-slate-50/95", borderColor: "border-slate-200/50" },
      9: { emoji: "💥", color: "text-rose-700", bgColor: "bg-rose-50/95", borderColor: "border-rose-200/50" },
      10: { emoji: "⚡", color: "text-emerald-700", bgColor: "bg-emerald-50/95", borderColor: "border-emerald-200/50" },
      11: { emoji: "🌟", color: "text-violet-700", bgColor: "bg-violet-50/95", borderColor: "border-violet-200/50" },
      13: { emoji: "🎭", color: "text-indigo-700", bgColor: "bg-indigo-50/95", borderColor: "border-indigo-200/50" },
      15: { emoji: "👑", color: "text-yellow-700", bgColor: "bg-yellow-50/95", borderColor: "border-yellow-200/50" },
    };
    
    return configs[styleId] || configs[1];
  };

  const config = getStyleConfig();

  return (
    <div className="absolute top-3 left-3 z-30">
      <Badge 
        className={`
          ${config.bgColor} ${config.color} ${config.borderColor}
          font-medium text-xs px-3 py-1.5 
          backdrop-blur-sm border
          shadow-lg hover:shadow-xl
          transition-all duration-300
          flex items-center gap-1.5
          rounded-full
        `}
      >
        <span className="text-sm">{config.emoji}</span>
        <span className="font-semibold tracking-wide">{styleName.split(' ')[0]}</span>
      </Badge>
    </div>
  );
};

export default StyleFloatingBadge;
