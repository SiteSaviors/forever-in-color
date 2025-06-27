
import React from "react";

interface SizeCardCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  isSelected: boolean;
}

const SizeCardCanvasPreview: React.FC<SizeCardCanvasPreviewProps> = ({
  orientation,
  userImageUrl,
  isSelected
}) => {
  return (
    <div className="flex justify-center flex-1 items-center">
      <div className={`
        relative transition-all duration-300
        ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
      `}>
        <div className={`
          relative bg-gradient-to-br from-gray-100 to-gray-200 
          ${orientation === 'square' ? 'w-24 h-24' : 
            orientation === 'horizontal' ? 'w-32 h-20' : 'w-20 h-28'}
          rounded-lg shadow-md border-2 border-white
        `}>
          {userImageUrl && (
            <img 
              src={userImageUrl} 
              alt="Your photo preview" 
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeCardCanvasPreview;
