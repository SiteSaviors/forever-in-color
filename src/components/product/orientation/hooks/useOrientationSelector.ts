
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sizeOptions } from "../data/sizeOptions";

interface UseOrientationSelectorProps {
  selectedOrientation: string;
  selectedSize: string;
  userImageUrl?: string | null;
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
}

export const useOrientationSelector = ({
  selectedOrientation,
  selectedSize,
  userImageUrl = null,
  onOrientationChange,
  onSizeChange,
  onContinue
}: UseOrientationSelectorProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const orientationSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);

  // Reset validation error when selections change
  useEffect(() => {
    if (selectedOrientation && selectedSize) {
      setValidationError(null);
    }
  }, [selectedOrientation, selectedSize]);

  // Optimized handlers with useCallback to prevent re-renders
  const handleOrientationSelect = useCallback((orientation: string) => {
    setValidationError(null);
    onOrientationChange(orientation);
    // Reset size when orientation changes
    onSizeChange("");
    
    // Scroll to size section after orientation is selected
    if (sizeSectionRef.current) {
      setTimeout(() => {
        sizeSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }
  }, [onOrientationChange, onSizeChange]);
  
  const handleSizeSelect = useCallback((size: string) => {
    setValidationError(null);
    onSizeChange(size);
  }, [onSizeChange]);

  const handleContinueClick = useCallback(() => {
    if (!selectedOrientation) {
      setValidationError("Please select an orientation before continuing");
      // Scroll to orientation section
      if (orientationSectionRef.current) {
        orientationSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }
    
    if (!selectedSize) {
      setValidationError("Please select a size before continuing");
      // Scroll to size section
      if (sizeSectionRef.current) {
        sizeSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }
    
    setValidationError(null);
    if (onContinue) {
      onContinue();
    }
  }, [selectedOrientation, selectedSize, onContinue]);
  
  const handleContinueWithSize = useCallback((size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSizeChange(size);
    handleContinueClick();
  }, [onSizeChange, handleContinueClick]);

  // Memoize expensive calculations
  const getRecommendedOrientation = useCallback(() => {
    if (!userImageUrl) return 'square';
    // This would analyze the image aspect ratio in a real implementation
    return 'square';
  }, [userImageUrl]);

  const getRecommendedSize = useCallback((orientation: string) => {
    const recommendations = {
      'square': '16" x 16"',
      'horizontal': '18" x 24"',
      'vertical': '16" x 20"'
    };
    return recommendations[orientation as keyof typeof recommendations] || '';
  }, []);
  
  const recommendedOrientation = useMemo(() => getRecommendedOrientation(), [getRecommendedOrientation]);
  const recommendedSize = useMemo(() => getRecommendedSize(selectedOrientation), [getRecommendedSize, selectedOrientation]);

  const canContinueToNext = useMemo(() => Boolean(selectedOrientation && selectedSize), [selectedOrientation, selectedSize]);

  // Get the current size option details for price display
  const getCurrentSizeOption = useCallback(() => {
    if (!selectedOrientation || !selectedSize) return null;
    return sizeOptions[selectedOrientation]?.find(opt => opt.size === selectedSize);
  }, [selectedOrientation, selectedSize]);

  const currentSizeOption = useMemo(() => getCurrentSizeOption(), [getCurrentSizeOption]);

  return {
    validationError,
    orientationSectionRef,
    sizeSectionRef,
    handleOrientationSelect,
    handleSizeSelect,
    handleContinueWithSize,
    handleContinueClick,
    recommendedOrientation,
    recommendedSize,
    canContinueToNext,
    currentSizeOption
  };
};
