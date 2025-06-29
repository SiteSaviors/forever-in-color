
import { useState } from "react";

interface StylePreviewProps {
  originalImage: string;
  previewUrl: string;
  styleName: string;
  onSelect: () => void;
  isSelected: boolean;
  isLoading?: boolean;
}

const StylePreview = ({ 
  originalImage, 
  previewUrl, 
  styleName, 
  onSelect, 
  isSelected,
  isLoading = false 
}: StylePreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="aspect-square bg-gray-100">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <img 
            src={previewUrl || originalImage}
            alt={styleName}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="text-white text-sm font-medium">{styleName}</p>
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          ✓
        </div>
      )}
    </div>
  );
};

export default StylePreview;
