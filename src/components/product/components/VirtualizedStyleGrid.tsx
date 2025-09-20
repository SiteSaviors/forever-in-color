
import { memo, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { useIsMobile } from '@/hooks/use-mobile';
import StyleCard from '../StyleCard';
import { artStyles } from '@/data/artStyles';

interface VirtualizedStyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
  containerWidth?: number;
  containerHeight?: number;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    styles: typeof artStyles;
    croppedImage: string | null;
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

const VirtualizedStyleGrid = memo(({
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete,
  containerWidth = 1200,
  containerHeight = 800
}: VirtualizedStyleGridProps) => {
  const isMobile = useIsMobile();
  const popularStyleIds = [2, 4, 5];

  const { columnsPerRow, itemWidth, itemHeight, rowCount } = useMemo(() => {
    const cols = isMobile ? 1 : window.innerWidth < 768 ? 2 : 3;
    const width = Math.floor(containerWidth / cols);
    const height = Math.floor(width * cropAspectRatio) + 120; // Add space for info
    const rows = Math.ceil(artStyles.length / cols);
    
    return {
      columnsPerRow: cols,
      itemWidth: width,
      itemHeight: height,
      rowCount: rows
    };
  }, [isMobile, containerWidth, cropAspectRatio]);

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
    columnsPerRow
  ]);

  return (
    <div className="w-full">
      <Grid
        columnCount={columnsPerRow}
        columnWidth={itemWidth}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={itemHeight}
        width={containerWidth}
        itemData={gridData}
      >
        {GridItem}
      </Grid>
    </div>
  );
});

VirtualizedStyleGrid.displayName = 'VirtualizedStyleGrid';

export default VirtualizedStyleGrid;
