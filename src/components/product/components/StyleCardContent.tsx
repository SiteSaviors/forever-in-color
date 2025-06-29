
import React, { memo } from 'react';
import ProgressiveStyleImage from './ProgressiveStyleImage';
import EnhancedStyleCardLoadingOverlay from './EnhancedStyleCardLoadingOverlay';
import StyleCardInfo from './StyleCardInfo';

interface StyleCardContentProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio?: number;
  isPopular?: boolean;
  isSelected: boolean;
  hasGeneratedPreview: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur?: boolean;
  hasErrorBoolean: boolean;
  errorMessage: string;
  effectiveIsLoading: boolean;
  isPermanentlyGenerated: boolean;
  showLockedFeedback: boolean;
  touchHandlers: any;
  isPressed: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: () => void;
  onRetryClick: () => void;
}

const StyleCardContent = memo(({
  style,
  imageToShow,
  cropAspectRatio,
  isPopular = false,
  isSelected,
  hasGeneratedPreview,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur = false,
  hasErrorBoolean,
  errorMessage,
  effectiveIsLoading,
  isPermanentlyGenerated,
  showLockedFeedback,
  touchHandlers,
  isPressed,
  onContinueClick,
  onGenerateClick,
  onRetryClick
}: StyleCardContentProps) => {
  return (
    <div 
      {...touchHandlers}
      className={`performance-container ${isPressed ? 'scale-95' : ''} transition-transform duration-100`}
    >
      {/* Image Section with Progressive Loading */}
      <div className="relative flex-1">
        <ProgressiveStyleImage
          src={imageToShow}
          alt={style.name}
          aspectRatio={cropAspectRatio || 1}
          className="transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
          priority={isPopular || isSelected}
          onLoad={() => {}}
        />
        
        {/* Subtle locked state indicator */}
        {showLockedFeedback && (
          <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            ✓ Generated
          </div>
        )}
        
        {/* Loading Overlay - CRITICAL: Never show if permanently generated */}
        {!isPermanentlyGenerated && (
          <EnhancedStyleCardLoadingOverlay
            isBlinking={false}
            styleName={style.name}
            isLoading={effectiveIsLoading}
            error={hasErrorBoolean ? errorMessage : null}
            onRetry={onRetryClick}
          />
        )}
      </div>

      {/* Info Section */}
      <StyleCardInfo
        style={style}
        hasGeneratedPreview={hasGeneratedPreview || isPermanentlyGenerated}
        isPopular={isPopular}
        isSelected={isSelected}
        showGeneratedBadge={showGeneratedBadge || isPermanentlyGenerated}
        showContinueInCard={showContinueInCard}
        shouldBlur={shouldBlur}
        showError={hasErrorBoolean}
        onContinueClick={onContinueClick}
        onGenerateClick={onGenerateClick}
        onRetryClick={onRetryClick}
      />
    </div>
  );
});

StyleCardContent.displayName = 'StyleCardContent';

export default StyleCardContent;
