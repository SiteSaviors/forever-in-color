
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StyleCard from "./StyleCard";
import { artStyles } from "@/data/artStyles";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
}

const StyleGrid = ({ croppedImage, selectedStyle, onStyleSelect }: StyleGridProps) => {
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Updated popular styles: Original Image, Watercolor Dreams, Pastel Bliss
  const popularStyleIds = [1, 4, 5];
  const popularStyles = artStyles.filter(style => popularStyleIds.includes(style.id));
  const otherStyles = artStyles.filter(style => !popularStyleIds.includes(style.id));
  const displayedStyles = showAllStyles ? artStyles : popularStyles;

  const handleStyleClick = (style: typeof artStyles[0]) => {
    onStyleSelect(style.id, style.name);
  };

  return (
    <>
      {/* Style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedStyles.map(style => (
          <StyleCard
            key={style.id}
            style={style}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            isPopular={popularStyleIds.includes(style.id)}
            onStyleClick={handleStyleClick}
          />
        ))}
      </div>

      {/* Show More Styles Button */}
      {!showAllStyles && (
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => setShowAllStyles(true)}
            className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            See All {otherStyles.length} More Styles
          </Button>
        </div>
      )}
    </>
  );
};

export default StyleGrid;
