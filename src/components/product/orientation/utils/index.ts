
// Single source of truth for all orientation and aspect ratio mappings

export type OrientationType = 'square' | 'horizontal' | 'vertical';
export type AspectRatioString = '1:1' | '4:3' | '3:4';

// Core mapping configuration - single source of truth
const ORIENTATION_CONFIG = {
  square: {
    aspectRatio: '1:1' as AspectRatioString,
    displayRatio: 1,
    numericRatio: 1,
    label: 'Square',
    description: 'Perfect for social media and balanced compositions'
  },
  horizontal: {
    aspectRatio: '4:3' as AspectRatioString,
    displayRatio: 4/3,
    numericRatio: 1.33,
    label: 'Horizontal',
    description: 'Ideal for landscapes and wide compositions'
  },
  vertical: {
    aspectRatio: '3:4' as AspectRatioString,
    displayRatio: 3/4,
    numericRatio: 0.75,
    label: 'Vertical',
    description: 'Perfect for portraits and tall compositions'
  }
} as const;

// Validation function to ensure orientation is valid
export const isValidOrientation = (orientation: string): orientation is OrientationType => {
  return orientation in ORIENTATION_CONFIG;
};

// Validation function to ensure aspect ratio is valid
export const isValidAspectRatio = (aspectRatio: string): aspectRatio is AspectRatioString => {
  return Object.values(ORIENTATION_CONFIG).some(config => config.aspectRatio === aspectRatio);
};

// Primary function to get aspect ratio string from orientation
export const getAspectRatio = (orientation: string): AspectRatioString => {
  console.log('🎯 getAspectRatio called with orientation:', orientation);
  
  if (!isValidOrientation(orientation)) {
    console.warn(`⚠️ Invalid orientation "${orientation}", defaulting to square`);
    return ORIENTATION_CONFIG.square.aspectRatio;
  }
  
  const aspectRatio = ORIENTATION_CONFIG[orientation].aspectRatio;
  console.log(`✅ Mapped ${orientation} → ${aspectRatio}`);
  
  return aspectRatio;
};

// Function to get display aspect ratio (for UI components)
export const getDisplayAspectRatio = (orientation: string): number => {
  if (!isValidOrientation(orientation)) {
    console.warn(`⚠️ Invalid orientation "${orientation}" for display ratio, defaulting to 1`);
    return ORIENTATION_CONFIG.square.displayRatio;
  }
  
  return ORIENTATION_CONFIG[orientation].displayRatio;
};

// Function to get numeric aspect ratio for calculations
export const getNumericAspectRatio = (orientation: string): number => {
  if (!isValidOrientation(orientation)) {
    console.warn(`⚠️ Invalid orientation "${orientation}" for numeric ratio, defaulting to 1`);
    return ORIENTATION_CONFIG.square.numericRatio;
  }
  
  return ORIENTATION_CONFIG[orientation].numericRatio;
};

// Function to get orientation from aspect ratio string (reverse lookup)
export const getOrientationFromAspectRatio = (aspectRatio: string): OrientationType => {
  const entry = Object.entries(ORIENTATION_CONFIG).find(
    ([_, config]) => config.aspectRatio === aspectRatio
  );
  
  if (!entry) {
    console.warn(`⚠️ Invalid aspect ratio "${aspectRatio}", defaulting to square`);
    return 'square';
  }
  
  return entry[0] as OrientationType;
};

// Function to detect orientation from image dimensions
export const detectOrientationFromDimensions = (width: number, height: number): OrientationType => {
  const aspectRatio = width / height;
  
  console.log(`🎯 Detecting orientation from dimensions: ${width}x${height} (ratio: ${aspectRatio.toFixed(2)})`);
  
  if (aspectRatio > 1.2) {
    console.log('✅ Detected: horizontal');
    return 'horizontal';
  } else if (aspectRatio < 0.8) {
    console.log('✅ Detected: vertical');
    return 'vertical';
  } else {
    console.log('✅ Detected: square');
    return 'square';
  }
};

// Function to get orientation configuration
export const getOrientationConfig = (orientation: string) => {
  if (!isValidOrientation(orientation)) {
    console.warn(`⚠️ Invalid orientation "${orientation}", returning square config`);
    return ORIENTATION_CONFIG.square;
  }
  
  return ORIENTATION_CONFIG[orientation];
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
  const isValid = expectedRatio === generationAspectRatio;
  
  console.log(`${isValid ? '✅' : '❌'} Validation result:`, {
    selectedOrientation,
    expectedRatio,
    generationAspectRatio,
    isValid
  });
  
  return {
    isValid,
    expectedRatio,
    error: isValid ? undefined : `Aspect ratio mismatch: expected ${expectedRatio}, got ${generationAspectRatio}`
  };
};

// Export all orientation options for UI components
export const ORIENTATION_OPTIONS = Object.entries(ORIENTATION_CONFIG).map(([key, config]) => ({
  value: key as OrientationType,
  label: config.label,
  description: config.description,
  aspectRatio: config.aspectRatio,
  displayRatio: config.displayRatio
}));
