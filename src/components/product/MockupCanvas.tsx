
import React from 'react';

interface MockupCanvasProps {
  previewUrl: string | null;
  orientation: 'square' | 'horizontal' | 'vertical';
  className?: string;
}

export function MockupCanvas({ previewUrl, orientation, className = "" }: MockupCanvasProps) {
  // Map orientation to existing blank canvas assets
  const blankSrc = {
    square: '/lovable-uploads/1308e62b-7d30-4d01-bad3-ef128e25924b.png', // Using the uploaded blank canvas
    horizontal: '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png', // Existing horizontal canvas
    vertical: '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png', // Existing vertical canvas
  }[orientation];

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Base canvas mockup */}
      <img 
        src={blankSrc} 
        alt={`Blank ${orientation} canvas`} 
        className="block w-full h-auto"
      />

      {/* Overlay preview when ready */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Generated art preview"
          className="
            absolute top-0 left-0
            w-[calc(100%-2rem)] h-[calc(100%-2rem)]
            m-4
            object-cover
            rounded-sm
            shadow-lg
            transition-opacity duration-300
          "
          style={{
            // Fine-tune positioning based on canvas frame
            top: orientation === 'square' ? '4%' : '3%',
            left: orientation === 'square' ? '4%' : '3%',
            width: orientation === 'square' ? '92%' : '94%',
            height: orientation === 'square' ? '92%' : '94%',
          }}
        />
      )}

      {/* Loading state overlay */}
      {!previewUrl && (
        <div className="
          absolute top-0 left-0
          w-[calc(100%-2rem)] h-[calc(100%-2rem)]
          m-4
          flex items-center justify-center
          bg-gradient-to-br from-gray-100 to-gray-200
          rounded-sm
          border-2 border-dashed border-gray-300
        "
        style={{
          top: orientation === 'square' ? '4%' : '3%',
          left: orientation === 'square' ? '4%' : '3%',
          width: orientation === 'square' ? '92%' : '94%',
          height: orientation === 'square' ? '92%' : '94%',
        }}>
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500"></div>
            <p className="text-xs font-medium">Generating Preview...</p>
          </div>
        </div>
      )}
    </div>
  );
}
