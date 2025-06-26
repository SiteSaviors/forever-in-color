
// Haptic feedback utility
export const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

// Icon mapping utility
export const getStepIcon = (stepNum: number) => {
  const { Upload, Palette, Settings, ShoppingCart, Circle } = require("lucide-react");
  
  const icons = {
    1: Upload,
    2: Palette, 
    3: Settings,
    4: ShoppingCart
  };
  return icons[stepNum as keyof typeof icons] || Circle;
};

// Status utilities
export const getLockStatus = (isCompleted: boolean, canAccess: boolean) => {
  if (isCompleted) return "complete";
  if (!canAccess) return "locked";
  return "none";
};
