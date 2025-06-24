
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  hasGeneratedPreview: boolean;
  isPopular: boolean;
  isSelected: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur?: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick?: (e: React.MouseEvent) => void;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur = false,
  onContinueClick,
  onGenerateClick
}: StyleCardInfoProps) => {
  // Don't show generate button for Original Image (ID: 1) or when blurred
  const showGenerateButton = style.id !== 1 && !shouldBlur;
  
  // Get style-specific badges and emoji
  const getStyleInfo = () => {
    const styleConfigs: { [key: number]: { badges: string[], emoji: string, badgeColors: string[] } } = {
      1: { badges: ["Natural", "Pure"], emoji: "📷", badgeColors: ["bg-gradient-to-r from-gray-400 to-gray-600", "bg-gradient-to-r from-slate-400 to-slate-600"] },
      2: { badges: ["Classic", "Refined"], emoji: "🖌️", badgeColors: ["bg-gradient-to-r from-amber-400 to-orange-500", "bg-gradient-to-r from-yellow-400 to-amber-500"] },
      4: { badges: ["Serene", "Abstract"], emoji: "☁️", badgeColors: ["bg-gradient-to-r from-blue-400 to-cyan-500", "bg-gradient-to-r from-orange-400 to-red-500"] },
      5: { badges: ["Dreamy", "Soft"], emoji: "🌸", badgeColors: ["bg-gradient-to-r from-pink-400 to-rose-500", "bg-gradient-to-r from-purple-400 to-pink-500"] },
      6: { badges: ["Modern", "Geometric"], emoji: "💎", badgeColors: ["bg-gradient-to-r from-emerald-400 to-teal-500", "bg-gradient-to-r from-blue-400 to-purple-500"] },
      7: { badges: ["Whimsical", "3D"], emoji: "📚", badgeColors: ["bg-gradient-to-r from-cyan-400 to-blue-500", "bg-gradient-to-r from-indigo-400 to-purple-500"] },
      8: { badges: ["Artistic", "Sketch"], emoji: "✏️", badgeColors: ["bg-gradient-to-r from-slate-400 to-gray-600", "bg-gradient-to-r from-zinc-400 to-slate-500"] },
      9: { badges: ["Bold", "Vibrant"], emoji: "🎨", badgeColors: ["bg-gradient-to-r from-pink-400 to-red-500", "bg-gradient-to-r from-yellow-400 to-orange-500"] },
      10: { badges: ["Electric", "Neon"], emoji: "⚡", badgeColors: ["bg-gradient-to-r from-green-400 to-emerald-500", "bg-gradient-to-r from-cyan-400 to-blue-500"] },
      11: { badges: ["Floral", "Bloom"], emoji: "🌺", badgeColors: ["bg-gradient-to-r from-purple-400 to-pink-500", "bg-gradient-to-r from-violet-400 to-purple-500"] },
      13: { badges: ["Abstract", "Fusion"], emoji: "🎭", badgeColors: ["bg-gradient-to-r from-indigo-400 to-blue-500", "bg-gradient-to-r from-cyan-400 to-teal-500"] },
      15: { badges: ["Luxe", "Deco"], emoji: "✨", badgeColors: ["bg-gradient-to-r from-yellow-400 to-amber-500", "bg-gradient-to-r from-orange-400 to-red-500"] },
    };
    
    return styleConfigs[style.id] || styleConfigs[1];
  };

  const styleInfo = getStyleInfo();
  
  return (
    <div className={`p-5 space-y-4 min-h-[140px] flex flex-col relative ${shouldBlur ? 'opacity-50' : ''}`}>
      {/* Generated badge - absolute positioned */}
      {showGeneratedBadge && hasGeneratedPreview && isPopular && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1 h-auto absolute top-3 right-3 z-10">
          <Sparkles className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Generated</span>
        </Badge>
      )}

      {/* Style badges - smaller and more refined */}
      <div className="flex gap-1.5 justify-center">
        {styleInfo.badges.map((badge, index) => (
          <div
            key={badge}
            className={`${styleInfo.badgeColors[index]} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md`}
          >
            {badge}
          </div>
        ))}
      </div>

      {/* Title with emoji - better spacing */}
      <div className="text-center px-2">
        <h5 className="font-poppins font-bold text-gray-900 text-lg leading-tight tracking-tight">
          {styleInfo.emoji} {style.name}
        </h5>
      </div>

      {/* Description in rounded container - improved spacing */}
      <div className="bg-gray-50 rounded-xl p-3 text-center flex-1 flex items-center">
        <p className="font-inter font-medium text-gray-700 text-sm leading-relaxed w-full">
          {style.description}
        </p>
      </div>
      
      {/* Action buttons - consistent spacing */}
      {showGenerateButton && hasGeneratedPreview && (
        <div className="pt-1">
          <Button 
            onClick={onContinueClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2.5 h-auto font-medium rounded-lg"
          >
            Continue with Style
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
