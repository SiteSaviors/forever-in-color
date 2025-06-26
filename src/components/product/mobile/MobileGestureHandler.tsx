
import { useEffect, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

interface MobileGestureHandlerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enableHaptic?: boolean;
}

const MobileGestureHandler = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  enableHaptic = true 
}: MobileGestureHandlerProps) => {
  const isMobile = useIsMobile();
  const { triggerHaptic } = useProgressOrchestrator();

  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Check if it's a swipe (fast horizontal movement)
      if (
        Math.abs(deltaX) > 50 && // Minimum distance
        Math.abs(deltaY) < 100 && // Not too vertical
        deltaTime < 300 // Fast enough
      ) {
        if (enableHaptic) {
          triggerHaptic();
        }

        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, onSwipeLeft, onSwipeRight, enableHaptic, triggerHaptic]);

  return <>{children}</>;
};

export default MobileGestureHandler;
