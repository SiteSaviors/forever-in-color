
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateOrientationSelection = (orientation: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const validOrientations = ['square', 'horizontal', 'vertical'];
  
  if (!orientation) {
    errors.push('Please select an orientation for your canvas');
  } else if (!validOrientations.includes(orientation)) {
    errors.push('Invalid orientation selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateSizeSelection = (size: string, orientation: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!size) {
    errors.push('Please select a size for your canvas');
    return { isValid: false, errors, warnings };
  }
  
  if (!orientation) {
    errors.push('Orientation must be selected before choosing size');
    return { isValid: false, errors, warnings };
  }
  
  // Validate size format (e.g., "16x20", "12" x 16"")
  const sizeFormats = [
    /^\d+x\d+$/, // Format: 16x20
    /^\d+"\s*x\s*\d+"$/, // Format: 16" x 20"
    /^\d+"\s*x\s*\d+"$/ // Format: 16"x20"
  ];
  
  const isValidFormat = sizeFormats.some(format => format.test(size));
  
  if (!isValidFormat) {
    errors.push('Invalid size format selected');
  }
  
  // Size-specific warnings
  if (size.includes('24') || size.includes('36')) {
    warnings.push('Large sizes may take longer to ship');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateStep2Completion = (orientation: string, size: string): ValidationResult => {
  const orientationResult = validateOrientationSelection(orientation);
  const sizeResult = validateSizeSelection(size, orientation);
  
  return {
    isValid: orientationResult.isValid && sizeResult.isValid,
    errors: [...orientationResult.errors, ...sizeResult.errors],
    warnings: [...orientationResult.warnings, ...sizeResult.warnings]
  };
};
