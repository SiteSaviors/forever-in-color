
import { useEffect, ReactNode, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentSubStep, useUserBehavior } from "../progress/hooks/useProgressSelectors";
import { Badge } from "@/components/ui/badge";
import { Smartphone, ArrowLeftRight, Hand } from "lucide-react";

interface MobileGestureHandlerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enableHaptic?: boolean;
  showGestureHints?: boolean;
}

const MobileGestureHandler = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  enableHaptic = true,
  showGestureHints = true
}: MobileGestureHandlerProps) => {
  const isMobile = useIsMobile();
  const currentSubStep = useCurrentSubStep();
  const userBehavior = useUserBehavior();
  const [showHint, setShowHint] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  // Show gesture hints for mobile users
  useEffect(() => {
    if (!isMobile || !showGestureHints) return;

    const timer = setTimeout(() => {
      // Show hints during style selection or when user seems stuck
      if (currentSubStep === 'style-selection' || 
          (Date.now() - userBehavior.lastInteraction > 20000)) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [isMobile, showGestureHints, currentSubStep, userBehavior.lastInteraction]);

  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let touchId: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      touchId = touch.identifier;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling during horizontal swipes
      const touch = Array.from(e.touches).find(t => t.identifier === touchId);
      if (!touch) return;

      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);
      
      if (deltaX > deltaY && deltaX > 30) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
      if (!touch) return;

      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Enhanced swipe detection
      if (
        Math.abs(deltaX) > 60 && // Minimum distance
        Math.abs(deltaY) < 150 && // Not too vertical
        deltaTime < 500 && // Fast enough
        velocity > 0.1 // Minimum velocity
      ) {
        if (enableHaptic) {
          // Different haptic patterns for different gestures
          const pattern = deltaX > 0 ? [50, 30, 50] : [30, 50, 30];
          if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
          }
        }

        const gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
        setLastGesture(gestureType);

        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }

        // Clear gesture indicator after a moment
        setTimeout(() => setLastGesture(null), 1000);
      }

      touchId = null;
    };

    // Enhanced touch handling with passive listeners where appropriate
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, onSwipeLeft, onSwipeRight, enableHaptic]);

  return (
    <div className="relative">
      {children}
      
      {/* Mobile Gesture Hints */}
      {isMobile && showHint && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
          <div className="bg-black/80 text-white rounded-2xl p-4 max-w-xs text-center backdrop-blur-md">
            <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h3 className="font-semibold mb-2">Mobile Tip</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ArrowLeftRight className="w-4 h-4" />
              <span className="text-sm">Swipe to browse styles</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Hand className="w-4 h-4" />
              <span className="text-sm">Tap to select</span>
            </div>
          </div>
        </div>
      )}

      {/* Gesture Feedback */}
      {lastGesture && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 animate-scale-in">
          <Badge className="bg-purple-500 text-white px-4 py-2">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            {lastGesture === 'swipe-left' ? 'Swiped Left' : 'Swiped Right'}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default MobileGestureHandler;
