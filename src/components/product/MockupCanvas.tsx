
import React from 'react';

interface MockupCanvasProps {
  previewUrl: string | null;
  orientation: 'square' | 'horizontal' | 'vertical';
  className?: string;
}

export function MockupCanvas({ previewUrl, orientation, className = "" }: MockupCanvasProps) {
  // Map orientation to canvas assets - using the new horizontal canvas
  const blankSrc = {
    square: '/lovable-uploads/1308e62b-7d30-4d01-bad3-ef128e25924b.png', // Using the uploaded blank canvas
    horizontal: '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png', // New horizontal canvas from user
    vertical: '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png', // Existing vertical canvas
  }[orientation];

  // Determine if we should show loading state - only when no preview is available
  const isLoading = !previewUrl;

  // Enhanced debug logging to track state changes
  console.log('🖼️ MockupCanvas render:', { 
    previewUrl: previewUrl ? previewUrl.substring(0, 50) + '...' : 'NULL', 
    isLoading, 
    orientation,
    hasPreview: !!previewUrl
  });

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Base canvas mockup */}
      <img 
        src={blankSrc} 
        alt={`Blank ${orientation} canvas`} 
        className="block w-full h-auto"
      />

      {/* Overlay actual preview when ready */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Generated art preview"
          className="
            absolute
            object-cover
            shadow-lg
            transition-opacity duration-300
            opacity-100
          "
          style={{
            // Adjusted positioning for different orientations
            top: orientation === 'horizontal' ? '6%' : orientation === 'square' ? '8%' : '6%',
            left: orientation === 'horizontal' ? '6%' : orientation === 'square' ? '8%' : '6%',
            width: orientation === 'horizontal' ? '88%' : orientation === 'square' ? '84%' : '88%',
            height: orientation === 'horizontal' ? '88%' : orientation === 'square' ? '84%' : '88%',
            borderRadius: '6px',
          }}
          onLoad={() => console.log('✅ MockupCanvas: Preview image loaded successfully')}
          onError={() => console.log('❌ MockupCanvas: Preview image failed to load')}
        />
      )}

      {/* Loading state overlay - only show when actually loading */}
      {isLoading && (
        <div className="
          absolute
          flex items-center justify-center
          bg-gradient-to-br from-gray-100 to-gray-200
          border-2 border-dashed border-gray-300
        "
        style={{
          top: orientation === 'horizontal' ? '6%' : orientation === 'square' ? '8%' : '6%',
          left: orientation === 'horizontal' ? '6%' : orientation === 'square' ? '8%' : '6%',
          width: orientation === 'horizontal' ? '88%' : orientation === 'square' ? '84%' : '88%',
          height: orientation === 'horizontal' ? '88%' : orientation === 'square' ? '84%' : '88%',
          borderRadius: '6px',
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
