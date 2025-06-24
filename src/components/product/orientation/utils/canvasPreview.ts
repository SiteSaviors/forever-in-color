
export const getCanvasPreview = (orientation: string, size: string) => {
  const baseClasses = "bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mx-auto border border-purple-200 shadow-sm";
  
  switch (orientation) {
    case 'horizontal':
      return (
        <div className={`${baseClasses} h-16 w-24`}>
          <span className="text-purple-700 font-medium text-xs">
            {size.replace(/"/g, '')}
          </span>
        </div>
      );
    case 'vertical':
      return (
        <div className={`${baseClasses} h-24 w-16`}>
          <span className="text-purple-700 font-medium text-xs transform -rotate-90 whitespace-nowrap">
            {size.replace(/"/g, '')}
          </span>
        </div>
      );
    case 'square':
      return (
        <div className={`${baseClasses} h-20 w-20`}>
          <span className="text-purple-700 font-medium text-xs">
            {size.replace(/"/g, '')}
          </span>
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} h-20 w-24`}>
          <span className="text-purple-700 font-medium text-sm">
            {size.replace(/"/g, '')}
          </span>
        </div>
      );
  }
};
