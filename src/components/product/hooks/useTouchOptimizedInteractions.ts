
import { useCallback, useRef, useState, useEffect } from 'react';

interface TouchInteractionOptions {
  onTap?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  longPressDuration?: number;
  doubleTapDelay?: number;
  debounceDelay?: number;
  leading?: boolean;
}

export const useTouchOptimizedInteractions = (options: TouchInteractionOptions = {}) => {
  const {
    onTap,
    onLongPress,
    onDoubleTap,
    longPressDuration = 500,
    doubleTapDelay = 300,
    debounceDelay = 100,
    leading = false
  } = options;

  const [isPressed, setIsPressed] = useState(false);
  const [immediateValue, setImmediateValue] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(false);
  
  const touchStartTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const lastTapTime = useRef<number>(0);
  const tapCount = useRef<number>(0);

  // Debounced interaction handling
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, debounceDelay);

    // If leading is true, update immediately on first change
    if (leading && immediateValue !== debouncedValue) {
      setDebouncedValue(immediateValue);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [immediateValue, debounceDelay, leading, debouncedValue]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    touchStartTime.current = now;
    setIsPressed(true);
    setImmediateValue(true);

    // Clear any existing long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Set up long press detection
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
        setImmediateValue(false);
      }, longPressDuration);
    }

    // Prevent text selection on touch
    e.preventDefault();
  }, [onLongPress, longPressDuration]);

  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    const touchDuration = now - touchStartTime.current;
    
    setIsPressed(false);
    setImmediateValue(false);
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Handle tap/double tap if not a long press
    if (touchDuration < longPressDuration) {
      tapCount.current++;
      
      if (onDoubleTap && now - lastTapTime.current < doubleTapDelay) {
        // Double tap detected
        tapCount.current = 0;
        onDoubleTap();
      } else {
        // Single tap - wait to see if double tap follows
        setTimeout(() => {
          if (tapCount.current === 1 && onTap) {
            onTap();
          }
          tapCount.current = 0;
        }, doubleTapDelay);
      }
      
      lastTapTime.current = now;
    }
  }, [onTap, onDoubleTap, onLongPress, longPressDuration, doubleTapDelay]);

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);
    setImmediateValue(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const setValue = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setImmediateValue(value);
  }, []);

  return {
    isPressed,
    debouncedInteraction: [debouncedValue, setValue, immediateValue] as const,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    }
  };
};
