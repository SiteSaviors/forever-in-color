import { memo, useCallback, useMemo } from 'react';
import CanvasSizeCard from '@/components/studio/CanvasSizeCard';
import { CANVAS_SIZE_OPTIONS } from '@/utils/canvasSizes';
import { getCanvasRecommendation } from '@/utils/canvasRecommendations';
import { SHOW_SIZE_RECOMMENDATIONS } from '@/config/featureFlags';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { useCanvasConfigActions, useCanvasSelection } from '@/store/hooks/useCanvasConfigStore';
import { trackCheckoutRecommendationSelected } from '@/utils/telemetry';

type CanvasSizeSelectorProps = {
  floatingFrameEnabled: boolean;
  onFrameShimmer: () => void;
  hasAutoExpandedOnce: boolean;
  onAutoExpandDrawer: () => void;
};

const CanvasSizeSelectorComponent = ({
  floatingFrameEnabled,
  onFrameShimmer,
  hasAutoExpandedOnce,
  onAutoExpandDrawer,
}: CanvasSizeSelectorProps) => {
  const { orientation, smartCrops } = useUploadState();
  const { selectedCanvasSize } = useCanvasSelection();
  const { setCanvasSize } = useCanvasConfigActions();

  const sizeOptions = CANVAS_SIZE_OPTIONS[orientation];

  const recommendation = useMemo(() => {
    const currentCrop = smartCrops[orientation];
    return getCanvasRecommendation(
      orientation,
      currentCrop?.imageDimensions?.width,
      currentCrop?.imageDimensions?.height
    );
  }, [orientation, smartCrops]);

  const handleSizeSelect = useCallback(
    (optionId: string, isRecommended: boolean, isMostPopular: boolean) => {
      setCanvasSize(optionId);
      trackCheckoutRecommendationSelected(optionId, isRecommended, isMostPopular);

      if (floatingFrameEnabled) {
        onFrameShimmer();
      }

      if (!hasAutoExpandedOnce) {
        onAutoExpandDrawer();
      }
    },
    [floatingFrameEnabled, hasAutoExpandedOnce, onAutoExpandDrawer, onFrameShimmer, setCanvasSize]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sizeOptions.map((option) => {
        const isRecommended = option.id === recommendation.recommendedSize;
        const isMostPopular = option.id === recommendation.mostPopularSize;

        return (
          <CanvasSizeCard
            key={option.id}
            option={option}
            isSelected={selectedCanvasSize === option.id}
            isRecommended={SHOW_SIZE_RECOMMENDATIONS && isRecommended}
            isMostPopular={SHOW_SIZE_RECOMMENDATIONS && isMostPopular}
            onSelect={() => handleSizeSelect(option.id, isRecommended, isMostPopular)}
            showSocialProof={false}
            _enableCountAnimation={false}
          />
        );
      })}
    </div>
  );
};

const CanvasSizeSelector = memo(CanvasSizeSelectorComponent);

export default CanvasSizeSelector;
