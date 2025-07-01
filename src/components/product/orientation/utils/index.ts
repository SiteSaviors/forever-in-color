
// Single source of truth for all orientation and aspect ratio mappings

export type OrientationType = 'square' | 'horizontal' | 'vertical';

// Core mapping configuration - updated for GPT-Image-1 compatibility
const ORIENTATION_CONFIG = {
  square: {
    aspectRatio: '1:1' as AspectRatioString,
    displayRatio: 1,
    numericRatio: 1,
    label: 'Square',
    description: 'Perfect for social media and balanced compositions'
  },
  horizontal: {
    aspectRatio: '3:2' as AspectRatioString, // Changed from 4:3 to 3:2 for GPT-Image-1 compatibility
    displayRatio: 3/2,
    numericRatio: 1.5, // Updated to match 3:2
    label: 'Horizontal',
    description: 'Ideal for landscapes and wide compositions'
  },
  vertical: {
    aspectRatio: '2:3' as AspectRatioString, // Changed from 3:4 to 2:3 for GPT-Image-1 compatibility
    displayRatio: 2/3,
    numericRatio: 0.67, // Updated to match 2:3
    label: 'Vertical',
    description: 'Perfect for portraits and tall compositions'
  }
} as const;

// Validation function to ensure orientation is valid
export const isValidOrientation = (orientation: string): orientation is OrientationType => {
  return orientation in ORIENTATION_CONFIG;
};

// Validation function to ensure aspect ratio is valid for GPT-Image-1
export const isValidAspectRatio = (aspectRatio: string): aspectRatio is AspectRatioString => {
  const validRatios: AspectRatioString[] = ['1:1', '3:2', '2:3'];
  return validRatios.includes(aspectRatio as AspectRatioString);
};

// Primary function to get aspect ratio string from orientation
export const getAspectRatio = (orientation: string): AspectRatioString => {
  console.log('🎯 getAspectRatio called with orientation:', orientation);
  
  if (!isValidOrientation(orientation)) {
    console.warn(`⚠️ Invalid orientation "${orientation}", defaulting to square`);
    return ORIENTATION_CONFIG.square.aspectRatio;
  }
  
  const aspectRatio = ORIENTATION_CONFIG[orientation].aspectRatio;
  console.log(`✅ Mapped ${orientation} → ${aspectRatio} (GPT-Image-1 compatible)`);
  
  return aspectRatio;
};

// Function to detect orientation from image dimensions
export const detectOrientationFromDimensions = (width: number, height: number): OrientationType => {
  const aspectRatio = width / height;
  
  console.log(`🎯 Detecting orientation from dimensions: ${width}x${height} (ratio: ${aspectRatio.toFixed(2)})`);
  
  if (aspectRatio > 1.2) {
    console.log('✅ Detected: horizontal (will use 3:2 for GPT-Image-1)');
    return 'horizontal';
  } else if (aspectRatio < 0.8) {
    console.log('✅ Detected: vertical (will use 2:3 for GPT-Image-1)');
    return 'vertical';
  } else {
    console.log('✅ Detected: square (will use 1:1 for GPT-Image-1)');
    return 'square';
  }
};

// Function to validate orientation → aspect ratio → generation flow
export const validateOrientationFlow = (
  selectedOrientation: string,
  generationAspectRatio: string
): { isValid: boolean; expectedRatio: string; error?: string } => {
  console.log('🔍 Validating orientation flow:', { selectedOrientation, generationAspectRatio });
  
  if (!isValidOrientation(selectedOrientation)) {
    return {
      isValid: false,
      expectedRatio: '1:1',
      error: `Invalid orientation: ${selectedOrientation}`
    };
  }
  
  const expectedRatio = getAspectRatio(selectedOrientation);
  
  // Additional validation for GPT-Image-1 compatibility
  if (!isValidAspectRatio(generationAspectRatio)) {
    console.warn(`⚠️ Invalid aspect ratio for GPT-Image-1: ${generationAspectRatio}, correcting to ${expectedRatio}`);
    return {
      isValid: false,
      expectedRatio,
      error: `Aspect ratio ${generationAspectRatio} not supported by GPT-Image-1. Using ${expectedRatio} instead.`
    };
  }
  
  const isValid = expectedRatio === generationAspectRatio;
  
  console.log(`${isValid ? '✅' : '❌'} Validation result:`, {
    selectedOrientation,
    expectedRatio,
    generationAspectRatio,
    isValid,
    gptImage1Compatible: isValidAspectRatio(expectedRatio)
  });
  
  return {
    isValid,
    expectedRatio,
    error: isValid ? undefined : `Aspect ratio mismatch: expected ${expectedRatio}, got ${generationAspectRatio}`
  };
};