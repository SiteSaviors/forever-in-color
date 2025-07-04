
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
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
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
            isPressed={isPressed}
          />
        )}
      </div>

      {/* Info Section */}
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
      />
    </div>
  );
});

StyleCardContent.displayName = 'StyleCardContent';

export default StyleCardContent;
