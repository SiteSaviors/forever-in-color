
import { Camera, Palette, Settings, ShoppingCart } from 'lucide-react';

// Fix the require issue by using proper ES6 imports
export const getStepIcon = (step: number) => {
  console.log('🎯 Getting step icon for step:', step);
  
  try {
    switch (step) {
      case 1:
        return Camera;
      case 2:
        return Palette;
      case 3:
        return Settings;
      case 4:
        return ShoppingCart;
      default:
        console.warn(`⚠️ Unknown step: ${step}, defaulting to Camera`);
        return Camera;
    }
  } catch (error) {
    console.error('❌ Error getting step icon:', error);
    return Camera; // Safe fallback
  }
};

export const getStepDescription = (step: number): string => {
  switch (step) {
    case 1:
      return 'Upload your photo and choose your artistic style';
    case 2:
      return 'Select your canvas size and orientation';
    case 3:
      return 'Add custom touches and premium features';
    case 4:
      return 'Review your masterpiece and complete your order';
    default:
      return '';
  }
};

// Add missing functions that are imported by other components
export const getLockStatus = (isCompleted: boolean, canAccess: boolean): 'completed' | 'accessible' | 'locked' => {
  if (isCompleted) return 'completed';
  if (canAccess) return 'accessible';
  return 'locked';
};

export const triggerHapticFeedback = () => {
  try {
    // Check if the device supports haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Light haptic feedback
    }
  } catch (error) {
    console.log('Haptic feedback not supported:', error);
  }
};
