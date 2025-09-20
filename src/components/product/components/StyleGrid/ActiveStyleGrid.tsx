
import React from "react";
import StyleCard from "../../StyleCard";
import { artStyles } from "@/data/artStyles";

interface ActiveStyleGridProps {
  croppedImage: string;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const ActiveStyleGrid = React.memo(({
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: ActiveStyleGridProps) => {
  // Popular styles that auto-generate: Classic Oil (2), Watercolor Dreams (4), Pastel Bliss (5)
  const popularStyleIds = [2, 4, 5];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {artStyles.map((style) => {
        const isPopularStyle = popularStyleIds.includes(style.id);
        const isOriginalImage = style.id === 1;
        // Only blur non-popular styles (excluding Original Image which should never be blurred)
        const shouldBlur = croppedImage && !isOriginalImage && !isPopularStyle;
        
        console.log(`🎨 Rendering StyleCard for ${style.name} with orientation: ${selectedOrientation}, cropAspectRatio: ${cropAspectRatio}, shouldBlur: ${shouldBlur}, isPopular: ${isPopularStyle}`);
        
        return (
          <StyleCard
            key={style.id}
            style={style}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            isPopular={isPopularStyle}
            cropAspectRatio={cropAspectRatio}
            selectedOrientation={selectedOrientation}
            showContinueButton={false}
            onStyleClick={() => onStyleSelect(style.id, style.name)}
            onContinue={onComplete}
            shouldBlur={shouldBlur}
          />
        );
      })}
    </div>
  );
});

ActiveStyleGrid.displayName = 'ActiveStyleGrid';

export default ActiveStyleGrid;
