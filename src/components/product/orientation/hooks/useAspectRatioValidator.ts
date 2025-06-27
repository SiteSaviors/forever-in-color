import { useCallback, useMemo } from 'react';
import { 
  validateOrientationFlow, 
  isValidOrientation, 
  isValidAspectRatio,
  getAspectRatio,
  OrientationType 
} from '../utils';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  correctedValue?: string;
}

export const useAspectRatioValidator = () => {
  const { toast } = useToast();

  const validateWithRecovery = useCallback((
    orientation: string,
    aspectRatio?: string
  ): ValidationResult => {
    console.log('🔍 Running aspect ratio validation:', { orientation, aspectRatio });

    // Step 1: Validate orientation
    if (!isValidOrientation(orientation)) {
      const corrected = 'square'; // Fallback to square
      console.warn(`⚠️ Invalid orientation "${orientation}", correcting to "${corrected}"`);
      
      toast({
        title: "Image Format Adjusted",
        description: `We've adjusted your image to square format for the best results.`,
        duration: 3000,
      });

      return {
        isValid: false,
        error: `Invalid orientation: ${orientation}`,
        correctedValue: corrected
      };
    }

    // Step 2: Validate aspect ratio if provided
    if (aspectRatio && !isValidAspectRatio(aspectRatio)) {
      const correctedAspectRatio = getAspectRatio(orientation as OrientationType);
      console.warn(`⚠️ Invalid aspect ratio "${aspectRatio}", correcting to "${correctedAspectRatio}"`);
      
      return {
        isValid: false,
        error: `Invalid aspect ratio: ${aspectRatio}`,
        correctedValue: correctedAspectRatio
      };
    }

    // Step 3: Validate flow consistency
    const expectedAspectRatio = getAspectRatio(orientation as OrientationType);
    if (aspectRatio && aspectRatio !== expectedAspectRatio) {
      console.warn(`⚠️ Aspect ratio mismatch: expected ${expectedAspectRatio}, got ${aspectRatio}`);
      
      return {
        isValid: false,
        error: `Aspect ratio mismatch`,
        correctedValue: expectedAspectRatio
      };
    }

    const validation = validateOrientationFlow(orientation, expectedAspectRatio);
    
    if (!validation.isValid) {
      toast({
        title: "Processing Issue",
        description: "We're adjusting your image settings for optimal results.",
        duration: 2000,
      });
    }

    return {
      isValid: validation.isValid,
      error: validation.error,
      correctedValue: validation.expectedRatio
    };
  }, [toast]);

  const autoCorrect = useCallback((orientation: string): OrientationType => {
    if (isValidOrientation(orientation)) {
      return orientation as OrientationType;
    }

    // Smart correction based on common inputs
    const normalized = orientation.toLowerCase();
    if (normalized.includes('horizontal') || normalized.includes('landscape')) {
      return 'horizontal';
    }
    if (normalized.includes('vertical') || normalized.includes('portrait')) {
      return 'vertical';
    }
    
    console.log('🔧 Auto-correcting invalid orientation to square:', orientation);
    return 'square'; // Safe fallback
  }, []);

  const memoizedValidator = useMemo(() => ({
    validateWithRecovery,
    autoCorrect
  }), [validateWithRecovery, autoCorrect]);

  return memoizedValidator;
};