
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
        // Using exact pixel coordinates from Photoshop template (768x768px base)
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
