
import React from 'react';

interface MiniCanvasPreviewProps {
  imageUrl: string;
  orientation: string;
  className?: string;
}

const MiniCanvasPreview = ({ imageUrl, orientation, className = "" }: MiniCanvasPreviewProps) => {
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
        return { top: '18%', left: '15%', width: '70%', height: '64%' };
      case 'vertical':
        return { top: '15%', left: '20%', width: '60%', height: '70%' };
      case 'square':
        return { top: '16%', left: '16%', width: '68%', height: '68%' };
      default:
        return { top: '16%', left: '16%', width: '68%', height: '68%' };
    }
  };

  const canvasFrame = getCanvasFrame();
  const imagePosition = getImagePosition();

  return (
    <div className={`relative w-12 h-12 ${className}`}>
      <img 
        src={canvasFrame}
        alt="Canvas preview"
        className="w-full h-full object-contain"
      />
      <div 
        className="absolute"
        style={{
          top: imagePosition.top,
          left: imagePosition.left,
          width: imagePosition.width,
          height: imagePosition.height,
        }}
      >
        <img 
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default MiniCanvasPreview;
