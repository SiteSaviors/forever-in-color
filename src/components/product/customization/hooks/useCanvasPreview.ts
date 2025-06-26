
export const useCanvasPreview = (selectedOrientation: string) => {
  // Get canvas frame based on orientation - using new horizontal canvas
  const getCanvasFrame = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png'; // New horizontal canvas
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
      default:
        return '/lovable-uploads/1308e62b-7d30-4d01-bad3-ef128e25924b.png';
    }
  };

  // Get positioning for artwork overlay based on orientation
  const getArtworkPosition = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return {
          top: '6%',
          left: '6%',
          width: '88%',
          height: '88%'
        };
      case 'vertical':
        return {
          top: '8%',
          left: '8%',
          width: '84%',
          height: '84%'
        };
      case 'square':
      default:
        return {
          top: '8%',
          left: '8%',
          width: '84%',
          height: '84%'
        };
    }
  };

  return {
    canvasFrame: getCanvasFrame(),
    artworkPosition: getArtworkPosition()
  };
};
