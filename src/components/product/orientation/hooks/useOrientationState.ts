
import { useState, useCallback, useMemo } from 'react';

interface UseOrientationStateProps {
  initialOrientation: string;
  initialSize: string;
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
}

export const useOrientationState = ({
  initialOrientation,
  initialSize,
  onOrientationChange,
  onSizeChange
}: UseOrientationStateProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // Debounced orientation change to prevent rapid updates
  const handleOrientationSelect = useCallback((orientation: string) => {
    const now = Date.now();
    if (isUpdating || now - lastUpdateTime < 100) return;
    
    console.log('🔄 Orientation change initiated:', orientation);
    setIsUpdating(true);
    setLastUpdateTime(now);
    
    // Batch the state updates
    onOrientationChange(orientation);
    onSizeChange(""); // Reset size when orientation changes
    
    // Use a single RAF to ensure smooth transitions
    requestAnimationFrame(() => {
      setIsUpdating(false);
    });
  }, [onOrientationChange, onSizeChange, isUpdating, lastUpdateTime]);

  // Memoized navigation state
  const canContinueToNext = useMemo(() => {
    return Boolean(initialOrientation && initialSize && !isUpdating);
  }, [initialOrientation, initialSize, isUpdating]);

  return {
    isUpdating,
    handleOrientationSelect,
    canContinueToNext
  };
};
