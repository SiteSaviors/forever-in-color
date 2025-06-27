
import React from 'react';
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

const StyleCardContainer = ({
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

  // Enhanced cursor states for better UX feedback
  const getCursorClass = () => {
    if (!canAccess) return 'cursor-not-allowed';
    if (isGenerating) return 'cursor-wait';
    if (hasError) return 'cursor-pointer';
    return 'cursor-pointer';
  };

  const containerClasses = `
    ${cssClasses} 
    ${getCursorClass()}
    ${shouldBlur ? 'blur-sm opacity-60' : ''}
    ${isGenerating ? 'animate-pulse' : ''}
    ${hasError ? 'ring-2 ring-red-200 shadow-red-100' : ''}
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
};

export default StyleCardContainer;
