
import React, { memo, useCallback } from 'react';
import { useStyleCardInteractions } from '../hooks/useStyleCardInteractions';

interface StyleCardContainerProps {
  children: React.ReactNode;
  isSelected: boolean;
  styleId: number;
  styleName: string;
  shouldBlur?: boolean;
  isGenerating?: boolean;
  hasError?: boolean;
  canAccess?: boolean;
  onClick?: () => void;
  onGenerateStyle?: () => void;
}

const StyleCardContainer = memo(({
  children,
  isSelected,
  styleId,
  styleName,
  shouldBlur = false,
  isGenerating = false,
  hasError = false,
  canAccess = true,
  onClick,
  onGenerateStyle
}: StyleCardContainerProps) => {
  const {
    visualState,
    cssClasses,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleGenerateClick
  } = useStyleCardInteractions({
    styleId,
    styleName,
    isSelected,
    isGenerating,
    hasError,
    canAccess,
    onStyleClick: onClick || (() => {}),
    onGenerateStyle
  });

  // Memoized cursor class calculation
  const getCursorClass = useCallback(() => {
    if (!canAccess) return 'cursor-not-allowed';
    if (isGenerating) return 'cursor-wait';
    if (hasError) return 'cursor-pointer';
    return 'cursor-pointer';
  }, [canAccess, isGenerating, hasError]);

  const containerClasses = `
    ${cssClasses} 
    ${getCursorClass()}
    ${shouldBlur ? 'blur-sm opacity-60' : ''}
    ${isGenerating ? 'recommended-pulse' : ''}
    ${hasError ? 'ring-2 ring-red-200 shadow-red-100' : ''}
    will-change-transform
    contain-layout
  `.trim();

  return (
    <div
      className={containerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={canAccess ? 0 : -1}
      aria-label={`${styleName} style option${isSelected ? ' (selected)' : ''}${isGenerating ? ' (generating)' : ''}${hasError ? ' (error)' : ''}`}
      aria-disabled={!canAccess}
    >
      {children}
    </div>
  );
});

StyleCardContainer.displayName = 'StyleCardContainer';

export default StyleCardContainer;
