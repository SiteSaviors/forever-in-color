
import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  selectedSize: string;
  availableSizes: string[];
  onSizeSelect: (size: string) => void;
  onContinue: () => void;
  isEnabled?: boolean;
}

export const useKeyboardNavigation = ({
  selectedSize,
  availableSizes,
  onSizeSelect,
  onContinue,
  isEnabled = true
}: UseKeyboardNavigationProps) => {
  
  const announceSelection = useCallback((size: string) => {
    // Create screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Selected ${size} canvas size`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled || availableSizes.length === 0) return;

    const currentIndex = selectedSize ? availableSizes.indexOf(selectedSize) : -1;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          const newSize = availableSizes[currentIndex - 1];
          onSizeSelect(newSize);
          announceSelection(newSize);
        } else if (currentIndex === -1 && availableSizes.length > 0) {
          const newSize = availableSizes[0];
          onSizeSelect(newSize);
          announceSelection(newSize);
        }
        break;
        
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < availableSizes.length - 1) {
          const newSize = availableSizes[currentIndex + 1];
          onSizeSelect(newSize);
          announceSelection(newSize);
        } else if (currentIndex === -1 && availableSizes.length > 0) {
          const newSize = availableSizes[0];
          onSizeSelect(newSize);
          announceSelection(newSize);
        }
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedSize) {
          onContinue();
          // Announce continuation
          const announcement = document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.className = 'sr-only';
          announcement.textContent = `Continuing with ${selectedSize} canvas size`;
          document.body.appendChild(announcement);
          setTimeout(() => document.body.removeChild(announcement), 1000);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        if (availableSizes.length > 0) {
          const newSize = availableSizes[0];
          onSizeSelect(newSize);
          announceSelection(newSize);
        }
        break;
        
      case 'End':
        event.preventDefault();
        if (availableSizes.length > 0) {
          const newSize = availableSizes[availableSizes.length - 1];
          onSizeSelect(newSize);
          announceSelection(newSize);
        }
        break;
    }
  }, [isEnabled, availableSizes, selectedSize, onSizeSelect, onContinue, announceSelection]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);

  return { announceSelection };
};
