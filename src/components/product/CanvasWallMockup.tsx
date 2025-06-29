
interface CanvasWallMockupProps {
  imageUrl: string;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: {
      enabled: boolean;
      color: 'white' | 'black' | 'espresso';
    };
  };
  className?: string;
}

const CanvasWallMockup = ({ 
  imageUrl, 
  selectedSize, 
  selectedOrientation, 
  customizations,
  className = ""
}: CanvasWallMockupProps) => {
  // Get the appropriate canvas frame based on orientation - using new horizontal canvas
  const getCanvasFrame = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png'; // New horizontal canvas
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  };

  // Calculate positioning for different orientations
  const getImagePosition = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return {
          top: '6%',
          left: '6%',
          width: '88%',
          height: '88%',
          transform: 'none' // Clean positioning like the square canvas
        };
      case 'vertical':
        return {
          top: '15%',
          left: '20%',
          width: '60%',
          height: '70%',
          transform: 'perspective(1000px) rotateX(5deg) rotateY(-8deg) rotateZ(1deg)'
        };
      case 'square':
        return {
          top: '5.2%',
          left: '4.7%',
          width: '89.3%',
          height: '89.3%',
          transform: 'none'
        };
      default:
        return {
          top: '5.2%',
          left: '4.7%',
          width: '89.3%',
          height: '89.3%',
          transform: 'none'
        };
    }
  };

  const canvasFrame = getCanvasFrame();
  const imagePosition = getImagePosition();

  return (
    <div className={`relative ${className}`}>
      {/* Canvas Frame Background */}
      <div className="relative w-full max-w-lg mx-auto">
        <img 
          src={canvasFrame}
          alt={`${selectedOrientation} canvas frame`}
          className="w-full h-auto object-contain"
        />
        
        {/* User's Image Overlay */}
        <div 
          className="absolute overflow-hidden"
          style={{
            top: imagePosition.top,
            left: imagePosition.left,
            width: imagePosition.width,
            height: imagePosition.height,
            transformStyle: 'preserve-3d',
          }}
        >
          <img 
            src={imageUrl}
            alt="User's styled artwork"
            className="w-full h-full object-cover"
            style={{
              transform: imagePosition.transform,
              transformOrigin: 'center center',
              filter: 'brightness(0.95) contrast(1.05)',
            }}
          />
        </div>

        {/* Size and orientation indicator */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-lg border">
            {selectedSize} • {selectedOrientation}
          </div>
        </div>
      </div>

      {/* Floating frame effect overlay (if enabled) */}
      {customizations.floatingFrame.enabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-opacity-20 rounded-lg"
               style={{
                 borderColor: customizations.floatingFrame.color === 'white' ? '#ffffff' :
                            customizations.floatingFrame.color === 'black' ? '#000000' : '#8B4513'
               }}>
          </div>
        </div>
      )}

      {/* Subtle shadow for depth */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-6 bg-gray-400/20 blur-xl rounded-full"></div>
    </div>
  );
};

export default CanvasWallMockup;
