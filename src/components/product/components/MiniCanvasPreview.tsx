
import React from 'react';

interface MiniCanvasPreviewProps {
  imageUrl: string;
  orientation: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const MiniCanvasPreview = ({ imageUrl, orientation, className = "", onClick }: MiniCanvasPreviewProps) => {
  const getCanvasFrame = () => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png'; // New Photoshop template
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  };

  const getImagePosition = () => {
    switch (orientation) {
      case 'horizontal':
        return { 
          top: '18%', 
          left: '15%', 
          width: '70%', 
          height: '64%',
          transform: 'perspective(200px) rotateX(4deg) rotateY(-6deg) rotateZ(1deg)'
        };
      case 'vertical':
        return { 
          top: '15%', 
          left: '20%', 
          width: '60%', 
          height: '70%',
          transform: 'perspective(200px) rotateX(2.5deg) rotateY(-4deg) rotateZ(0.5deg)'
        };
      case 'square':
        // Using exact pixel coordinates from Photoshop template (scaled for mini version)
        return { 
          top: '5.2%',     // 40px / 768px = 5.2%
          left: '4.7%',    // 36px / 768px = 4.7%
          width: '89.3%',  // 686px / 768px = 89.3%
          height: '89.3%', // 686px / 768px = 89.3%
          transform: 'none' // No distortion needed as per specs
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

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={`relative w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200 ${className}`}
      onClick={handleClick}
      title="Click to view full canvas preview"
    >
      <img 
        src={canvasFrame}
        alt="Canvas preview"
        className="w-full h-full object-contain"
      />
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
          alt="Preview"
          className="w-full h-full object-cover"
          style={{
            transform: imagePosition.transform,
            transformOrigin: 'center center',
            filter: 'brightness(0.95) contrast(1.05)',
          }}
        />
      </div>
      
      {/* Hover overlay to indicate clickable */}
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-sm flex items-center justify-center">
        <div className="bg-black/70 text-white text-xs px-1 py-0.5 rounded">
          View
        </div>
      </div>
    </div>
  );
};

export default MiniCanvasPreview;
