
// Utility functions for orientation handling

export const getAspectRatio = (orientation: string): string => {
  console.log('🎯 CRITICAL: Converting orientation to aspect ratio:', orientation);
  
  const orientationMap = {
    'square': '1:1',
    'horizontal': '4:3', 
    'vertical': '3:4'
  };
  
  const aspectRatio = orientationMap[orientation as keyof typeof orientationMap] || '1:1';
  console.log(`🔥 MAPPED: ${orientation} -> ${aspectRatio}`);
  
  return aspectRatio;
};

export const getDisplayAspectRatio = (orientation: string): number => {
  console.log('🎯 Converting orientation to display ratio:', orientation);
  
  const ratioMap = {
    'square': 1,
    'horizontal': 4/3,
    'vertical': 3/4
  };
  
  const displayRatio = ratioMap[orientation as keyof typeof ratioMap] || 1;
  console.log(`🔥 DISPLAY RATIO: ${orientation} -> ${displayRatio}`);
  
  return displayRatio;
};
