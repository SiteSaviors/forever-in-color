
import { useState, useCallback, useMemo, useRef } from 'react';

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
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orientationChangeRef = useRef<string | null>(null);

  // Enhanced debounced orientation change with state batching
  const handleOrientationSelect = useCallback((orientation: string) => {
    const now = Date.now();
    
    // Prevent rapid successive updates
    if (isUpdating || now - lastUpdateTime < 150) {
      orientationChangeRef.current = orientation;
      return;
    }
    
    console.log('🔄 Orientation change initiated:', orientation);
    setIsUpdating(true);
    setLastUpdateTime(now);
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Batch the state updates with proper sequencing
    updateTimeoutRef.current = setTimeout(() => {
      try {
        onOrientationChange(orientation);
        onSizeChange(""); // Reset size when orientation changes
        
        // Complete the update cycle
        requestAnimationFrame(() => {
          setIsUpdating(false);
          
          // Process any queued orientation change
          if (orientationChangeRef.current && orientationChangeRef.current !== orientation) {
            const queuedOrientation = orientationChangeRef.current;
            orientationChangeRef.current = null;
            handleOrientationSelect(queuedOrientation);
          }
        });
      } catch (error) {
        console.error('🚨 Error during orientation update:', error);
        setIsUpdating(false);
      }
    }, 50);
  }, [onOrientationChange, onSizeChange, isUpdating, lastUpdateTime]);

  // Enhanced size change with validation
  const handleSizeSelect = useCallback((size: string) => {
    if (isUpdating) {
      console.log('⏳ Size change blocked - update in progress');
      return;
    }
    
    console.log('📏 Size change initiated:', size);
    
    try {
      onSizeChange(size);
    } catch (error) {
      console.error('🚨 Error during size update:', error);
    }
  }, [onSizeChange, isUpdating]);

  // Cleanup effect
  const cleanup = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    orientationChangeRef.current = null;
  }, []);

  // Memoized navigation state with safety checks
  const canContinueToNext = useMemo(() => {
    return Boolean(
      initialOrientation && 
      initialOrientation.trim() && 
      initialSize && 
      initialSize.trim() && 
      !isUpdating
    );
  }, [initialOrientation, initialSize, isUpdating]);

  return {
    isUpdating,
    handleOrientationSelect,
    handleSizeSelect,
    canContinueToNext,
    cleanup
  };
};
