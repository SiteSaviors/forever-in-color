
export const detectOrientationFromImage = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      
      if (aspectRatio > 1.2) {
        resolve('horizontal');
      } else if (aspectRatio < 0.8) {
        resolve('vertical');
      } else {
        resolve('square');
      }
    };
    img.onerror = () => {
      resolve('square'); // fallback
    };
    img.src = imageUrl;
  });
};

export const convertOrientationToAspectRatio = (orientation: string): number => {
  switch (orientation) {
    case 'horizontal':
      return 3/2; // 1.5
    case 'vertical':
      return 2/3; // 0.67
    case 'square':
    default:
      return 1; // 1.0
  }
};
