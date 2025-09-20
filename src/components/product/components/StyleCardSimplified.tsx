import React, { memo } from 'react';

interface StyleCardSimplifiedProps {
  children: React.ReactNode;
  isSelected: boolean;
  styleId: number;
  styleName: string;
  shouldBlur?: boolean;
  isGenerating?: boolean;
  hasError?: boolean;
  canAccess?: boolean;
  onClick?: () => void;
}

const StyleCardSimplified = memo(({
  children,
  isSelected,
  styleId,
  styleName,
  shouldBlur = false,
  isGenerating = false,
  hasError = false,
  canAccess = true,
  onClick
}: StyleCardSimplifiedProps) => {
  
  const handleClick = () => {
    if (canAccess && onClick) {
      console.log(`🎯 Direct click on ${styleName} (ID: ${styleId})`);
      onClick();
    }
  };

  const getCursorClass = () => {
    if (!canAccess) return 'cursor-not-allowed';
    if (isGenerating) return 'cursor-wait';
    return 'cursor-pointer';
  };

  const getContainerClasses = () => {
    const base = "group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 border-0 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] flex flex-col w-full touch-manipulation select-none transform-gpu";
    
    let classes = base;
    
    if (!canAccess) {
      classes += " opacity-60 grayscale-[0.3] shadow-lg cursor-not-allowed";
    } else if (isSelected) {
      classes += " ring-3 sm:ring-4 ring-purple-400/70 shadow-2xl shadow-purple-200/60 scale-[1.02] sm:scale-[1.03] -translate-y-1 sm:-translate-y-2 bg-gradient-to-br from-white to-purple-50/30";
    } else {
      classes += " shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-purple-200/50 hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-0.5 sm:hover:-translate-y-1";
    }
    
    if (shouldBlur) classes += " blur-sm opacity-60";
    if (isGenerating) classes += " animate-pulse";
    if (hasError) classes += " ring-2 ring-red-200 shadow-red-100";
    
    classes += ` ${getCursorClass()}`;
    
    return classes;
  };

  return (
    <div
      className={getContainerClasses()}
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

StyleCardSimplified.displayName = 'StyleCardSimplified';

export default StyleCardSimplified;