
import StyleCardBadges from './StyleCardBadges';

interface StyleCardHeaderProps {
  style: {
    id: number;
    name: string;
    description: string;
  };
  isPopular: boolean;
  showGeneratedBadge: boolean;
  existingPurchase: any;
  isHorizontalOrientation?: boolean;
}

const StyleCardHeader = ({ 
  style, 
  isPopular, 
  showGeneratedBadge, 
  existingPurchase,
  isHorizontalOrientation = false 
}: StyleCardHeaderProps) => {
  const getStyleEmoji = (styleId: number) => {
    const emojiMap: {
      [key: number]: string;
    } = {
      1: "📸",
      2: "🎨",
      4: "🌊",
      5: "🌸",
      6: "💎",
      7: "📚",
      8: "✏️",
      9: "💥",
      10: "⚡",
      11: "🌸",
      13: "🔮",
      15: "✨"
    };
    return emojiMap[styleId] || "🎨";
  };

  const getDescriptionClasses = () => {
    if (isHorizontalOrientation) {
      return "text-xs text-gray-600 line-clamp-1 mt-0.5 font-poppins leading-relaxed transition-colors duration-200";
    }
    return "text-xs text-gray-600 line-clamp-2 mt-0.5 font-poppins leading-relaxed transition-colors duration-200";
  };

  const styleEmoji = getStyleEmoji(style.id);

  return (
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-poppins font-semibold text-gray-900 truncate text-sm leading-tight transition-colors duration-200 hover:text-gray-700">
          {styleEmoji} {style.name}
        </h3>
        <p className={getDescriptionClasses()}>
          {style.description}
        </p>
      </div>
      
      <StyleCardBadges 
        isPopular={isPopular}
        showGeneratedBadge={showGeneratedBadge}
        existingPurchase={existingPurchase}
      />
    </div>
  );
};

export default StyleCardHeader;
