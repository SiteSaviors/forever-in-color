
import { memo } from 'react';
import ProgressiveStyleImage from './ProgressiveStyleImage';
import StyleCardInfo from './StyleCardInfo';
import EnhancedStyleCardLoadingOverlay from './EnhancedStyleCardLoadingOverlay';

interface StyleCardContentProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio?: number;
  isPopular: boolean;
  isSelected: boolean;
  hasGeneratedPreview: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur: boolean;
  hasErrorBoolean: boolean;
  errorMessage: string;
  effectiveIsLoading: boolean;
  isPermanentlyGenerated: boolean;
  showLockedFeedback: boolean;
  touchHandlers: any;
  isPressed: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: (e: React.MouseEvent) => void;
  onRetryClick: (e: React.MouseEvent) => void;
  onImageExpand: (e: React.MouseEvent) => void;
}

const StyleCardContent = memo(({
  style,
  imageToShow,
  cropAspectRatio,
  isPopular,
  isSelected,
  hasGeneratedPreview,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur,
  hasErrorBoolean,
  errorMessage,
  effectiveIsLoading,
  isPermanentlyGenerated,
  showLockedFeedback,
  touchHandlers,
  isPressed,
  onContinueClick,
  onGenerateClick,
  onRetryClick,
  onImageExpand
}: StyleCardContentProps) => {
  // Determine if this is a horizontal/landscape orientation
  const isHorizontal = cropAspectRatio ? cropAspectRatio > 1.2 : false;
  const isVertical = cropAspectRatio ? cropAspectRatio < 0.8 : false;
  
  // Calculate optimal image container aspect ratio based on orientation
  const getImageContainerClass = () => {
    if (isHorizontal) {
      return "relative aspect-[4/3] overflow-hidden"; // Wider aspect for horizontal images
    } else if (isVertical) {
      return "relative aspect-[3/4] overflow-hidden"; // Taller aspect for vertical images
    }
    return "relative aspect-square overflow-hidden"; // Default square
  };

  // Get orientation-specific padding for the info section
  const getInfoPadding = () => {
    if (isHorizontal) {
      return "p-2.5"; // Slightly reduced padding for horizontal to compensate for wider image
    }
    return "p-3"; // Standard padding for square and vertical
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {/* Image Section - Dynamic aspect ratio */}
      <div className={getImageContainerClass()}>
        <ProgressiveStyleImage
          src={imageToShow}
          alt={`${style.name} preview`}
          aspectRatio={cropAspectRatio}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={onImageExpand}
          {...touchHandlers}
        />
        
        {/* Loading Overlay */}
        {effectiveIsLoading && !isPermanentlyGenerated && (
          <EnhancedStyleCardLoadingOverlay
            styleName={style.name}
            isBlinking={false}
            isLoading={effectiveIsLoading}
          />
        )}
      </div>

      {/* Info Section - Flexible height to fill remaining space */}
      <div className={`${getInfoPadding()} flex-1 flex flex-col justify-between min-h-0`}>
        <StyleCardInfo
          style={style}
          hasGeneratedPreview={hasGeneratedPreview}
          isPopular={isPopular}
          isSelected={isSelected}
          showGeneratedBadge={showGeneratedBadge}
          showContinueInCard={showContinueInCard}
          shouldBlur={shouldBlur}
          showError={hasErrorBoolean}
          onContinueClick={onContinueClick}
          onGenerateClick={onGenerateClick}
          onRetryClick={onRetryClick}
          imageUrl={hasGeneratedPreview ? imageToShow : undefined}
          isHorizontalOrientation={isHorizontal}
        />
      </div>
    </div>
  );
});

StyleCardContent.displayName = 'StyleCardContent';

export default StyleCardContent;
