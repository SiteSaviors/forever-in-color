
import { useCallback, useMemo } from 'react';
import { 
  validateOrientationFlow, 
  isValidAspectRatio,
  getAspectRatio
} from '../utils';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  correctedValue?: string;
}

export const useAspectRatioValidator = () => {
  const { toast } = useToast();

  const validateWithRecovery = useCallback((orientation: string, aspectRatio: string) => {
    // Supported aspect ratios for GPT-Image-1
    const supportedRatios = ['1:1', '3:2', '2:3'];
    
    console.log(`🔍 Validating aspect ratio: ${aspectRatio} for orientation: ${orientation}`);
    
    if (supportedRatios.includes(aspectRatio)) {
      return { isValid: true, correctedValue: null, error: null };
    }
    
    // Auto-correct unsupported ratios
    let correctedValue: string;
    switch (aspectRatio) {
      case '4:3':
        correctedValue = '3:2'; // Closest landscape ratio
        break;
      case '3:4':
        correctedValue = '2:3'; // Closest portrait ratio
        break;
      case '16:9':
        correctedValue = '3:2'; // Closest landscape ratio
        break;
      case '9:16':
        correctedValue = '2:3'; // Closest portrait ratio
        break;
      default:
        correctedValue = '1:1'; // Default fallback
    }
    
    console.log(`✅ Auto-corrected ${aspectRatio} to ${correctedValue}`);
    
    return {
      isValid: false,
      correctedValue,
      error: `Aspect ratio ${aspectRatio} not supported, auto-corrected to ${correctedValue}`
    };
  }, []);

  const autoCorrect = useCallback((orientation: string): string => {
    switch (orientation.toLowerCase()) {
      case 'square':
        return 'square';
      case 'landscape':
      case 'horizontal':
        return 'landscape';
      case 'portrait':
      case 'vertical':
        return 'portrait';
      default:
        return 'square';
    }
  }, []);

  const memoizedValidator = useMemo(() => ({
    validateWithRecovery,
    autoCorrect,
    isValidAspectRatio
  }), [validateWithRecovery, autoCorrect]);

  return memoizedValidator;
};
