
import React, { memo, useMemo, useState, useEffect } from "react";
import { FixedSizeGrid as Grid } from 'react-window';
import StyleCard from "../../StyleCard";
import { artStyles } from "@/data/artStyles";
import { useIsMobile } from '@/hooks/use-mobile';

interface ActiveStyleGridProps {
  croppedImage: string;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    styles: typeof artStyles;
    croppedImage: string;
    selectedStyle: number | null;
    cropAspectRatio: number;
    selectedOrientation: string;
    onStyleSelect: (styleId: number, styleName: string) => void;
    onComplete: () => void;
    columnsPerRow: number;
    popularStyleIds: number[];
  };
}

const GridItem = memo(({ columnIndex, rowIndex, style, data }: GridItemProps) => {
  const itemIndex = rowIndex * data.columnsPerRow + columnIndex;
  
  if (itemIndex >= data.styles.length) {
    return <div style={style} />;
  }

  const artStyle = data.styles[itemIndex];
  const isPopularStyle = data.popularStyleIds.includes(artStyle.id);
  const isOriginalImage = artStyle.id === 1;
  const shouldBlur = data.croppedImage && !isOriginalImage && !isPopularStyle;

  return (
    <div style={{ ...style, padding: '8px' }}>
      <StyleCard
        style={artStyle}
        croppedImage={data.croppedImage}
        selectedStyle={data.selectedStyle}
        isPopular={isPopularStyle}
        cropAspectRatio={data.cropAspectRatio}
        selectedOrientation={data.selectedOrientation}
        showContinueButton={false}
        onStyleClick={() => data.onStyleSelect(artStyle.id, artStyle.name)}
        onContinue={data.onComplete}
        shouldBlur={shouldBlur}
      />
    </div>
  );
});

GridItem.displayName = 'GridItem';

const ActiveStyleGrid = memo(({
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete
}: ActiveStyleGridProps) => {
  const isMobile = useIsMobile();
  const [containerDimensions, setContainerDimensions] = useState({ width: 1200, height: 800 });
  
  // Popular styles that auto-generate: Classic Oil (2), Watercolor Dreams (4), Pastel Bliss (5)
  const popularStyleIds = useMemo(() => [2, 4, 5], []);

  // Calculate grid dimensions based on screen size
  const { columnsPerRow, itemWidth, itemHeight, rowCount } = useMemo(() => {
    const cols = isMobile ? 1 : window.innerWidth < 768 ? 2 : 3;
    const width = Math.floor(containerDimensions.width / cols);
    const height = Math.floor(width * cropAspectRatio) + 120; // Add space for info
    const rows = Math.ceil(artStyles.length / cols);
    
    return {
      columnsPerRow: cols,
      itemWidth: width,
      itemHeight: height,
      rowCount: rows
    };
  }, [isMobile, containerDimensions.width, cropAspectRatio]);

  // Memoize grid data to prevent unnecessary re-renders
  const gridData = useMemo(() => ({
    styles: artStyles,
    croppedImage,
    selectedStyle,
    cropAspectRatio,
    selectedOrientation,
    onStyleSelect,
    onComplete,
    columnsPerRow,
    popularStyleIds
  }), [
    croppedImage,
    selectedStyle,
    cropAspectRatio,
    selectedOrientation,
    onStyleSelect,
    onComplete,
    columnsPerRow,
    popularStyleIds
  ]);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setContainerDimensions({
        width: window.innerWidth - 64, // Account for padding
        height: Math.min(window.innerHeight - 200, 800)
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // For smaller lists, use regular grid to avoid virtualization overhead
  if (artStyles.length <= 12) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {artStyles.map((style) => {
          const isPopularStyle = popularStyleIds.includes(style.id);
          const isOriginalImage = style.id === 1;
          const shouldBlur = croppedImage && !isOriginalImage && !isPopularStyle;
          
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
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={columnsPerRow}
        columnWidth={itemWidth}
        height={containerDimensions.height}
        rowCount={rowCount}
        rowHeight={itemHeight}
        width={containerDimensions.width}
        itemData={gridData}
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {GridItem}
      </Grid>
    </div>
  );
});

ActiveStyleGrid.displayName = 'ActiveStyleGrid';

export default ActiveStyleGrid;
