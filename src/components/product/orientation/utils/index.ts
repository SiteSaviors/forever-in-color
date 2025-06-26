
// Utility functions for orientation handling

export const getAspectRatio = (orientation: string): string => {
  console.log('Converting orientation to GPT-Image-1 aspect ratio:', orientation);
  
  const orientationMap = {
    'square': '1:1',
    'horizontal': '4:3', 
    'vertical': '3:4'
  };
  
  const aspectRatio = orientationMap[orientation as keyof typeof orientationMap] || '1:1';
  console.log(`Mapped ${orientation} to aspect ratio: ${aspectRatio}`);
  
  return aspectRatio;
};

export const getDisplayAspectRatio = (orientation: string): number => {
  const ratioMap = {
    'square': 1,
    'horizontal': 4/3,
    'vertical': 3/4
  };
  
  return ratioMap[orientation as keyof typeof ratioMap] || 1;
};
