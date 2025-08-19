
import React from 'react';

export const getCanvasPreview = (orientation: string, size: string) => {
  const baseClasses = "bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mx-auto border border-purple-200 shadow-sm";
  const sizeText = size.replace(/"/g, '');
  
  switch (orientation) {
    case 'horizontal':
      return (
        <div className={`${baseClasses} h-16 w-24`}>
          <span className="text-purple-700 font-medium text-xs">{sizeText}</span>
        </div>
      );
    case 'vertical':
      return (
        <div className={`${baseClasses} h-24 w-16`}>
          <span className="text-purple-700 font-medium text-xs transform -rotate-90 whitespace-nowrap">{sizeText}</span>
        </div>
      );
    case 'square':
      return (
        <div className={`${baseClasses} h-20 w-20`}>
          <span className="text-purple-700 font-medium text-xs">{sizeText}</span>
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} h-20 w-24`}>
          <span className="text-purple-700 font-medium text-sm">{sizeText}</span>
        </div>
      );
  }
};
