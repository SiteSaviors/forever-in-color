
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
      return "text-sm text-gray-600 line-clamp-2 mt-1.5 font-poppins leading-normal transition-colors duration-200";
    }
    return "text-sm text-gray-600 line-clamp-3 mt-1.5 font-poppins leading-normal transition-colors duration-200";
  };

  const styleEmoji = getStyleEmoji(style.id);

  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-poppins font-bold text-gray-900 truncate text-base leading-tight transition-colors duration-200 hover:text-gray-700 mb-1">
          <span className="mr-2">{styleEmoji}</span>
          {style.name}
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
