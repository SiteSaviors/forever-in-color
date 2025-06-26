
export const detectOrientationFromImage = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let detectedOrientation = 'square';
      
      if (aspectRatio > 1.2) {
        detectedOrientation = 'horizontal';
      } else if (aspectRatio < 0.8) {
        detectedOrientation = 'vertical';
      } else {
        detectedOrientation = 'square';
      }
      
      console.log(`🎯 Auto-detected canvas orientation: ${detectedOrientation} (aspect ratio: ${aspectRatio.toFixed(2)})`);
      resolve(detectedOrientation);
    };
    img.src = imageUrl;
  });
};

export const convertOrientationToAspectRatio = (orientation: string) => {
  console.log('Converting orientation to GPT-Image-1 aspect ratio:', orientation);
  switch (orientation) {
    case 'vertical':
      console.log('Using 2:3 for vertical orientation (GPT-Image-1 supported)');
      return '2:3';
    case 'horizontal':
      console.log('Using 3:2 for horizontal orientation (GPT-Image-1 supported)');
      return '3:2';
    case 'square':
    default:
      console.log('Using 1:1 for square orientation');
      return '1:1';
  }
};
