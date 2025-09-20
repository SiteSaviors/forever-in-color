
export function validateInput(imageUrl: string, style: string, aspectRatio: string) {
  
  // Check required fields
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { isValid: false, error: 'Image URL is required and must be a string' };
  }

  if (!style || typeof style !== 'string') {
    return { isValid: false, error: 'Style is required and must be a string' };
  }

  // Updated aspect ratio validation to support the ratios we're actually sending
  const validAspectRatios = [
    '1:1',        // Square
    '2:3',        // Vertical (portrait) - GPT-Image-1 supported
    '3:2',        // Horizontal (landscape) - GPT-Image-1 supported
    '3:4',        // Standard portrait
    '4:3',        // Standard landscape
    '16:9',       // Widescreen
    '9:16',       // Tall mobile
    'portrait',   // Generic portrait
    'landscape',  // Generic landscape
    'square'      // Generic square
  ];

  if (!validAspectRatios.includes(aspectRatio)) {
    return { 
      isValid: false, 
      error: `Invalid aspect ratio. Must be one of: ${validAspectRatios.join(', ')}` 
    };
  }

  

  // Basic image URL validation
  if (!imageUrl.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid image format. Must be a data URL' };
  }

  // Style validation
  if (style.length > 100) {
    return { isValid: false, error: 'Style name too long' };
  }

  
  return { isValid: true };
}

export function extractImageData(imageUrl: string): string | null {
  try {
    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
    return null;
  } catch (error) {
    return null;
  }
}
