
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
        resolve(detectedOrientation);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      reject(new Error('Failed to load image for orientation detection'));
    };
    
    img.src = imageUrl;
  });
};

// Legacy function - now uses consolidated logic
export const convertOrientationToAspectRatio = (orientation: string) => {
  return getAspectRatio(orientation);
};

// Validation helper for API calls
export const validateOrientationForGeneration = (
  selectedOrientation: string,
  generationAspectRatio: string
) => {
  return validateOrientationFlow(selectedOrientation, generationAspectRatio);
};
