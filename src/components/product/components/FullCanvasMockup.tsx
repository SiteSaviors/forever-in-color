
import React from 'react';

interface FullCanvasMockupProps {
  imageUrl: string;
  orientation: string;
  styleName: string;
}

const FullCanvasMockup = ({ imageUrl, orientation, styleName }: FullCanvasMockupProps) => {
  const getCanvasFrame = () => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/0c7d3c87-930b-4e39-98a8-2e9893b05344.png';
      default:
        return '/lovable-uploads/0c7d3c87-930b-4e39-98a8-2e9893b05344.png';
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
          transform: 'perspective(1000px) rotateX(8deg) rotateY(-12deg) rotateZ(2deg)'
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
          top: '16%', 
          left: '16%', 
          width: '68%', 
          height: '68%',
          transform: 'perspective(1000px) rotateX(6deg) rotateY(-10deg) rotateZ(1.5deg)'
        };
      default:
        return { 
          top: '16%', 
          left: '16%', 
          width: '68%', 
          height: '68%',
          transform: 'perspective(1000px) rotateX(6deg) rotateY(-10deg) rotateZ(1.5deg)'
        };
    }
  };

  const canvasFrame = getCanvasFrame();
  const imagePosition = getImagePosition();

  return (
    <div className="relative max-w-4xl mx-auto">
      <img 
        src={canvasFrame}
        alt={`${styleName} on ${orientation} canvas`}
        className="w-full h-auto object-contain"
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
          alt={`${styleName} artwork`}
          className="w-full h-full object-cover"
          style={{
            transform: imagePosition.transform,
            transformOrigin: 'center center',
            filter: 'brightness(0.95) contrast(1.05)',
          }}
        />
      </div>
      
      {/* Style and orientation label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {styleName} • {orientation.charAt(0).toUpperCase() + orientation.slice(1)} Canvas
        </div>
      </div>
    </div>
  );
};

export default FullCanvasMockup;
