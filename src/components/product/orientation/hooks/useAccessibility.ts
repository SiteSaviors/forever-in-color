
import { useEffect, useCallback } from 'react';

interface UseAccessibilityProps {
  selectedOrientation: string;
  selectedSize: string;
  orientationOptions: string[];
  sizeOptions: string[];
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
  disabled?: boolean;
}

export const useAccessibility = ({
  selectedOrientation,
  selectedSize,
  orientationOptions,
  sizeOptions,
  onOrientationChange,
  onSizeChange,
  onContinue,
  disabled = false
}: UseAccessibilityProps) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    const { key, target } = event;
    const element = target as HTMLElement;
    
    // Handle orientation navigation with arrow keys
    if (element.closest('[data-orientation-group]')) {
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
        
        // Focus the newly selected option
        setTimeout(() => {
          const newOption = document.querySelector(`[data-orientation="${orientationOptions[newIndex]}"]`) as HTMLElement;
          newOption?.focus();
        }, 50);
      }
    }
    
    // Handle size navigation with arrow keys
    if (element.closest('[data-size-group]') && selectedOrientation) {
      if (key === 'ArrowUp' || key === 'ArrowDown') {
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
        
        // Focus the newly selected option
        setTimeout(() => {
          const newOption = document.querySelector(`[data-size="${sizeOptions[newIndex]}"]`) as HTMLElement;
          newOption?.focus();
        }, 50);
      }
    }
    
    // Handle Enter/Space for selection
    if (key === 'Enter' || key === ' ') {
      if (element.closest('[data-orientation]')) {
        event.preventDefault();
        const orientation = element.closest('[data-orientation]')?.getAttribute('data-orientation');
        if (orientation) {
          onOrientationChange(orientation);
        }
      }
      
      if (element.closest('[data-size]')) {
        event.preventDefault();
        const size = element.closest('[data-size]')?.getAttribute('data-size');
        if (size) {
          onSizeChange(size);
        }
      }
    }
    
    // Handle continue action with Ctrl/Cmd + Enter
    if (key === 'Enter' && (event.ctrlKey || event.metaKey) && selectedOrientation && selectedSize) {
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

  // Announce selection changes to screen readers
  const announceSelection = useCallback((type: 'orientation' | 'size', value: string) => {
    const announcement = type === 'orientation' 
      ? `${value} layout selected` 
      : `${value} size selected`;
    
    // Create temporary announcement element
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  }, []);

  return {
    announceSelection,
    getAriaLabel: (type: 'orientation' | 'size', value: string, isSelected: boolean) => {
      const base = type === 'orientation' ? `Select ${value} layout` : `Select ${value} size`;
      return isSelected ? `${base}, currently selected` : base;
    },
    getAriaPressed: (isSelected: boolean) => isSelected.toString(),
    getTabIndex: (isSelected: boolean) => isSelected ? 0 : -1
  };
};
