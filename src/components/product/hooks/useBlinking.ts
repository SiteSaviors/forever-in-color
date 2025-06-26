
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const { isGenerating } = options;
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Simple logic: blink when generating and no preview exists
    const shouldBlink = isGenerating && !previewUrl;
    
    console.log('🔔 useBlinking state (simplified):', {
      previewUrl: previewUrl ? 'exists' : 'null',
      isGenerating,
      shouldBlink,
      currentlyBlinking: isBlinking
    });

    setIsBlinking(shouldBlink);
  }, [previewUrl, isGenerating]);

  // Force stop blinking when preview is ready - this is the critical fix
  useEffect(() => {
    if (previewUrl) {
      console.log('🛑 Force stopping blink - preview is ready');
      setIsBlinking(false);
    }
  }, [previewUrl]);

  return { isBlinking };
};
