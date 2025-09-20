
import React from 'react';
import { Maximize2 } from 'lucide-react';

interface StyleCardImageProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio?: number;
  onImageExpand?: (e: React.MouseEvent) => void;
}

const StyleCardImage = ({
  style,
  imageToShow,
  cropAspectRatio,
  onImageExpand
}: StyleCardImageProps) => {
  const aspectRatio = cropAspectRatio || 1;

  return (
    <div 
      className="relative bg-gray-100 overflow-hidden group/image"
      style={{ aspectRatio }}
    >
      <img
        src={imageToShow}
        alt={style.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Expand button overlay - appears on hover */}
      {onImageExpand && (
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
          <button
            onClick={onImageExpand}
            className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all transform hover:scale-110"
            title="View full size"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StyleCardImage;
