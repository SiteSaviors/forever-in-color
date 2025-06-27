
import React, { useMemo, useCallback } from "react";
import LazyStyleCard from "../LazyStyleCard";
import { artStyles } from "@/data/artStyles";
import { useDebounce } from "../../hooks/useDebounce";

interface OptimizedActiveStyleGridProps {
  croppedImage: string;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const OptimizedActiveStyleGrid = React.memo(({
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: OptimizedActiveStyleGridProps) => {
  // Popular styles that auto-generate: Classic Oil (2), Watercolor Dreams (4), Pastel Bliss (5)
  const popularStyleIds = useMemo(() => [2, 4, 5], []);

  // Debounced style selection to prevent rapid API calls
  const debouncedOnStyleSelect = useDebounce(onStyleSelect, 150);

  // Memoized style processing
  const processedStyles = useMemo(() => {
    return artStyles.map((style) => {
      const isPopularStyle = popularStyleIds.includes(style.id);
      const isOriginalImage = style.id === 1;
      const shouldBlur = croppedImage && !isOriginalImage && !isPopularStyle;
      
      return {
        style,
        isPopularStyle,
        shouldBlur,
        key: `${style.id}-${selectedOrientation}-${cropAspectRatio}`
      };
    });
  }, [croppedImage, popularStyleIds, selectedOrientation, cropAspectRatio]);

  // Memoized click handler
  const handleStyleClick = useCallback((style: { id: number; name: string; description: string; image: string }) => {
    console.log(`🎨 Optimized StyleCard clicked: ${style.name} (ID: ${style.id})`);
    debouncedOnStyleSelect(style.id, style.name);
  }, [debouncedOnStyleSelect]);

  // Split styles into chunks for better rendering performance
  const styleChunks = useMemo(() => {
    const chunkSize = 6; // Render 6 cards at a time
    const chunks = [];
    for (let i = 0; i < processedStyles.length; i += chunkSize) {
      chunks.push(processedStyles.slice(i, i + chunkSize));
    }
    return chunks;
  }, [processedStyles]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {processedStyles.map(({ style, isPopularStyle, shouldBlur, key }) => (
        <LazyStyleCard
          key={key}
          style={style}
          croppedImage={croppedImage}
          selectedStyle={selectedStyle}
          isPopular={isPopularStyle}
          cropAspectRatio={cropAspectRatio}
          selectedOrientation={selectedOrientation}
          showContinueButton={false}
          onStyleClick={handleStyleClick}
          onContinue={onComplete}
          shouldBlur={shouldBlur}
        />
      ))}
    </div>
  );
});

OptimizedActiveStyleGrid.displayName = 'OptimizedActiveStyleGrid';

export default OptimizedActiveStyleGrid;
