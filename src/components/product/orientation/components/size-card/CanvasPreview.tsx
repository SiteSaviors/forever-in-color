
import { useState, useCallback, useMemo } from "react";

interface CanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
}

const CanvasPreview = ({ orientation, userImageUrl }: CanvasPreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasFrame = useMemo(() => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  }, [orientation]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <div className="mb-4 flex justify-center">
      <div className="w-24 h-24 relative">
        {!imageLoaded && (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
        )}
        <img 
          src={canvasFrame} 
          alt={`${orientation} canvas frame`} 
          className={`w-full h-full object-contain transition-opacity duration-150 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={handleImageLoad}
        />
      </div>
    </div>
  );
};

export default CanvasPreview;
