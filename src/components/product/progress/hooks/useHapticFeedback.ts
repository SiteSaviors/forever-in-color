
import { useIsMobile } from "@/hooks/use-mobile";
import { ProgressState } from '../types';

export const useHapticFeedback = (state: ProgressState) => {
  const isMobile = useIsMobile();

  const triggerHaptic = () => {
    if (isMobile && 'vibrate' in navigator) {
      // Different vibration patterns based on action
      const pattern = state.completedSteps.length > 0 ? [50, 30, 50] : [50];
      navigator.vibrate(pattern);
    }
  };

  return { triggerHaptic };
};
