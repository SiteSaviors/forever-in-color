
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
