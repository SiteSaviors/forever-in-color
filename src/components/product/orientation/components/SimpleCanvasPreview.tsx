
import { useCanvasPreview } from "./hooks/useCanvasPreview";

interface SimpleCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
}

const SimpleCanvasPreview = ({ orientation, userImageUrl }: SimpleCanvasPreviewProps) => {
  const { imageLoaded, canvasFrame, handleImageLoad } = useCanvasPreview({
    orientation,
    userImageUrl,
    variant: 'simple'
  });

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

export default SimpleCanvasPreview;
