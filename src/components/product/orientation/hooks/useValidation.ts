
import { useState, useMemo } from 'react';

interface ValidationError {
  field: 'orientation' | 'size' | 'general';
  message: string;
  type: 'error' | 'warning';
}

interface UseValidationProps {
  selectedOrientation: string;
  selectedSize: string;
  isRequired?: boolean;
}

export const useValidation = ({
  selectedOrientation,
  selectedSize,
  isRequired = true
}: UseValidationProps) => {
  const [showErrors, setShowErrors] = useState(false);

  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (isRequired) {
      if (!selectedOrientation) {
        errors.push({
          field: 'orientation',
          message: 'Please select a layout orientation for your canvas',
          type: 'error'
        });
      }

      if (!selectedSize) {
        errors.push({
          field: 'size',
          message: 'Please choose a size for your canvas',
          type: 'error'
        });
      }
    }

    // Add warnings for specific combinations
    if (selectedOrientation && selectedSize) {
      if (selectedSize.includes('24') || selectedSize.includes('36')) {
        errors.push({
          field: 'size',
          message: 'Large sizes may require additional processing time',
          type: 'warning'
        });
      }
    }

    return errors;
  }, [selectedOrientation, selectedSize, isRequired]);

  const isValid = useMemo(() => {
    return validationErrors.filter(error => error.type === 'error').length === 0;
  }, [validationErrors]);

  const canContinue = useMemo(() => {
    return isValid && selectedOrientation && selectedSize;
  }, [isValid, selectedOrientation, selectedSize]);

  const getFieldErrors = (field: 'orientation' | 'size') => {
    return validationErrors.filter(error => error.field === field);
  };

  const validateAndShowErrors = () => {
    setShowErrors(true);
    return isValid;
  };

  const clearErrors = () => {
    setShowErrors(false);
  };

  return {
    validationErrors,
    isValid,
    canContinue,
    showErrors,
    getFieldErrors,
    validateAndShowErrors,
    clearErrors
  };
};
