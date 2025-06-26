
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
  console.log('🎯 CRITICAL: Converting orientation to GPT-Image-1 aspect ratio:', orientation);
  
  const orientationMap = {
    'square': '1:1',
    'horizontal': '4:3', 
    'vertical': '3:4'
  };
  
  const aspectRatio = orientationMap[orientation as keyof typeof orientationMap] || '1:1';
  console.log(`🔥 FINAL MAPPING: ${orientation} -> ${aspectRatio}`);
  
  return aspectRatio;
};
