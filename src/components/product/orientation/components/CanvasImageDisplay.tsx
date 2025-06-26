
import { useCanvasPreview } from "./hooks/useCanvasPreview";

interface CanvasImageDisplayProps {
  orientation: string;
  userImageUrl: string | null;
  variant: 'interactive' | 'morphing' | 'simple';
  imageLoaded: boolean;
}

const CanvasImageDisplay = ({ 
  orientation, 
  userImageUrl, 
  variant, 
  imageLoaded 
}: CanvasImageDisplayProps) => {
  const { canvasFrame, imagePosition, handleImageLoad } = useCanvasPreview({
    orientation,
    userImageUrl,
    variant
  });

  return (
    <div className="relative w-full h-full">
      <img 
        src={canvasFrame} 
        alt={`${orientation} canvas frame`} 
        className="w-full h-full object-contain relative z-10" 
      />
      
      {/* User's Image */}
      {userImageUrl && (
        <div 
          className={`absolute overflow-hidden transition-all duration-500 group-hover:brightness-110 z-15 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} 
          style={{
            top: imagePosition.top,
            left: imagePosition.left,
            width: imagePosition.width,
            height: imagePosition.height
          }}
        >
          <img 
            src={userImageUrl} 
            alt="Canvas preview" 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
            style={{
              filter: 'brightness(0.95) contrast(1.05) saturate(1.1)'
            }} 
            onLoad={handleImageLoad} 
          />
          
          {/* Image Glass Overlay for morphing variant */}
          {variant === 'morphing' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 pointer-events-none" />
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasImageDisplay;
