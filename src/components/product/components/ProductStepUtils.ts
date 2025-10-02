
import { Camera, Palette, Settings, ShoppingCart } from '@/components/ui/icons';

// Fix the require issue by using proper ES6 imports
export const getStepIcon = (step: number) => {
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
        return Camera;
    }
  } catch (error) {
    return Camera; // Safe fallback
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
    // Haptic feedback not supported - silent fail
  }
};
