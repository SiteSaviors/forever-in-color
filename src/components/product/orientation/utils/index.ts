export const validateOrientationFlow = (orientation: string): string => {
  console.log(`Validating orientation flow for: ${orientation}`);

  switch (orientation.toLowerCase()) {
    case 'square':
      return 'square';
    case 'landscape':
    case 'horizontal':
      return 'landscape';
    case 'portrait':
    case 'vertical':
      return 'portrait';
    default:
      console.warn(`Unknown orientation: ${orientation}, defaulting to square`);
      return 'square';
  }
};

export const getAspectRatio = (orientation: string): string => {
  console.log(`🎯 getAspectRatio: Mapping orientation "${orientation}" to aspect ratio`);
  
  switch (orientation.toLowerCase()) {
    case 'square':
      return '1:1';
    case 'landscape':
    case 'horizontal':
      // Map 4:3 landscape to closest supported ratio
      return '3:2';
    case 'portrait':
    case 'vertical':
      // Map 3:4 portrait to closest supported ratio  
      return '2:3';
    default:
      console.warn(`⚠️ Unknown orientation "${orientation}", defaulting to 1:1`);
      return '1:1';
  }
};

export const isValidAspectRatio = (aspectRatio: string): boolean => {
  // GPT-Image-1 supported aspect ratios only
  const validRatios = ['1:1', '3:2', '2:3'];
  const isValid = validRatios.includes(aspectRatio);
  
  console.log(`🔍 isValidAspectRatio: "${aspectRatio}" is ${isValid ? 'valid' : 'invalid'}`);
  console.log(`✅ Supported ratios: ${validRatios.join(', ')}`);
  
  return isValid;
};
