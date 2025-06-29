
import { LucideIcon, Upload, Palette, Settings, ShoppingCart } from "lucide-react";

export const getStepIcon = (stepNumber: number): LucideIcon => {
  switch (stepNumber) {
    case 1:
      return Upload;
    case 2:
      return Palette;
    case 3:
      return Settings;
    case 4:
      return ShoppingCart;
    default:
      return Upload;
  }
};

export const getLockStatus = (isCompleted: boolean, canAccess: boolean) => {
  if (isCompleted) return "completed";
  if (canAccess) return "unlocked";
  return "locked";
};

export const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};
