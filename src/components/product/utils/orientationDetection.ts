
import { 
  detectOrientationFromDimensions, 
  getAspectRatio, 
  type OrientationType,
  validateOrientationFlow
} from '../orientation/utils';

export const detectOrientationFromImage = (imageUrl: string): Promise<OrientationType> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const detectedOrientation = detectOrientationFromDimensions(img.width, img.height);
        console.log(`🎯 Auto-detected canvas orientation: ${detectedOrientation} from ${img.width}x${img.height}`);
        resolve(detectedOrientation);
      } catch (error) {
        console.error('❌ Error in orientation detection:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('❌ Error loading image for orientation detection:', error);
      reject(new Error('Failed to load image for orientation detection'));
    };
    
    img.src = imageUrl;
  });
};

// Legacy function - now uses consolidated logic
export const convertOrientationToAspectRatio = (orientation: string) => {
  console.log('⚠️ DEPRECATED: convertOrientationToAspectRatio called. Use getAspectRatio instead.');
  return getAspectRatio(orientation);
};

// Validation helper for API calls
export const validateOrientationForGeneration = (
  selectedOrientation: string,
  generationAspectRatio: string
) => {
  return validateOrientationFlow(selectedOrientation, generationAspectRatio);
};
