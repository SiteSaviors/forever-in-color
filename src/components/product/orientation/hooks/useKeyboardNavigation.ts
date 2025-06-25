
import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  selectedOrientation: string;
  selectedSize: string;
  orientationOptions: string[];
  sizeOptions: string[];
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
  disabled?: boolean;
}

export const useKeyboardNavigation = ({
  selectedOrientation,
  selectedSize,
  orientationOptions,
  sizeOptions,
  onOrientationChange,
  onSizeChange,
  onContinue,
  disabled = false
}: UseKeyboardNavigationProps) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    const { key, ctrlKey, metaKey } = event;
    
    // Handle orientation navigation
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      
      const currentIndex = orientationOptions.indexOf(selectedOrientation);
      if (currentIndex === -1) return;
      
      let newIndex;
      if (key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : orientationOptions.length - 1;
      } else {
        newIndex = currentIndex < orientationOptions.length - 1 ? currentIndex + 1 : 0;
      }
      
      onOrientationChange(orientationOptions[newIndex]);
    }
    
    // Handle size navigation
    if ((key === 'ArrowUp' || key === 'ArrowDown') && selectedOrientation) {
      event.preventDefault();
      
      const currentSizeIndex = sizeOptions.indexOf(selectedSize);
      if (currentSizeIndex === -1 && sizeOptions.length > 0) {
        onSizeChange(sizeOptions[0]);
        return;
      }
      
      let newIndex;
      if (key === 'ArrowUp') {
        newIndex = currentSizeIndex > 0 ? currentSizeIndex - 1 : sizeOptions.length - 1;
      } else {
        newIndex = currentSizeIndex < sizeOptions.length - 1 ? currentSizeIndex + 1 : 0;
      }
      
      onSizeChange(sizeOptions[newIndex]);
    }
    
    // Handle continue action
    if (key === 'Enter' && (ctrlKey || metaKey) && selectedOrientation && selectedSize) {
      event.preventDefault();
      if (onContinue) {
        onContinue();
      }
    }
  }, [
    disabled,
    selectedOrientation,
    selectedSize,
    orientationOptions,
    sizeOptions,
    onOrientationChange,
    onSizeChange,
    onContinue
  ]);

  useEffect(() => {
    if (disabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, disabled]);

  return {
    // Return helper functions if needed
    getNavigationInstructions: () => ({
      orientation: 'Use ← → arrow keys to change orientation',
      size: 'Use ↑ ↓ arrow keys to change size',
      continue: 'Press Ctrl/Cmd + Enter to continue'
    })
  };
};
