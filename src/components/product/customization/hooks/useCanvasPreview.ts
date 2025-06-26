
export const useCanvasPreview = (selectedOrientation: string) => {
  // Get clean canvas (without frame) based on orientation
  const getCanvasFrame = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
      default:
        return '/lovable-uploads/1308e62b-7d30-4d01-bad3-ef128e25924b.png'; // Clean canvas without frame
    }
  };

  // Get positioning for artwork overlay based on orientation
  const getArtworkPosition = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return {
          top: '8%',
          left: '8%',
          width: '84%',
          height: '84%'
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
