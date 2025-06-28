
import { useRef, useCallback } from 'react';

export const useFileInputTrigger = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      return true;
    }
    return false;
  }, []);

  return {
    fileInputRef,
    triggerFileInput
  };
};
