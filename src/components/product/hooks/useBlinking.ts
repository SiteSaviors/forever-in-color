
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  // Always return false - no blinking animation
  return { isBlinking: false };
};
