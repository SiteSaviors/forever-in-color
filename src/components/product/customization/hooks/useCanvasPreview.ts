
export const useCanvasPreview = (selectedOrientation: string) => {
  // Get proper canvas frame based on orientation
  const getCanvasFrame = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  };

  // Get positioning for artwork overlay based on orientation
  const getArtworkPosition = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return {
          top: '18%',
          left: '15%',
          width: '70%',
          height: '64%'
        };
      case 'vertical':
        return {
          top: '15%',
          left: '20%',
          width: '60%',
          height: '70%'
        };
      case 'square':
      default:
        return {
          top: '5.2%',
          left: '4.7%',
          width: '89.3%',
          height: '89.3%'
        };
    }
  };

  return {
    canvasFrame: getCanvasFrame(),
    artworkPosition: getArtworkPosition()
  };
};
