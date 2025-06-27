
import { useCallback } from 'react';

interface UseStyleCardHandlersProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  previewUrl: string | null;
  isPermanentlyGenerated: boolean;
  effectiveIsLoading: boolean;
  hasError: boolean;
  setShowError: (value: boolean) => void;
  setLocalIsLoading: (value: boolean) => void;
  setIsLightboxOpen: (value: boolean) => void;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
  generatePreview: () => Promise<void>;
}

export const useStyleCardHandlers = ({
  style,
  previewUrl,
  isPermanentlyGenerated,
  effectiveIsLoading,
  hasError,
  setShowError,
  setLocalIsLoading,
  setIsLightboxOpen,
  onStyleClick,
  onContinue,
  generatePreview
}: UseStyleCardHandlersProps) => {
  // Main card click handler
  const handleCardClick = useCallback(() => {
    console.log(`🎯 StyleCard clicked: ${style.name}, isPermanentlyGenerated: ${isPermanentlyGenerated}, isGenerating: ${effectiveIsLoading}`);
    
    // Always call onStyleClick to select the style
    onStyleClick(style);
    
    // CRITICAL: Never generate if permanently generated
    if (isPermanentlyGenerated) {
      console.log(`🚫 PERMANENT BLOCK - ${style.name} is permanently generated, no generation will occur`);
      return;
    }
    
    // Only generate if we don't have a preview AND not permanently generated AND not currently generating AND not Original style
    if (!previewUrl && !effectiveIsLoading && !hasError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for ${style.name} (first time only)`);
      handleGenerateClick({} as React.MouseEvent);
    } else {
      console.log(`🔒 No generation needed - previewUrl: ${!!previewUrl}, isLoading: ${effectiveIsLoading}, hasError: ${hasError}, styleId: ${style.id}`);
    }
  }, [style, previewUrl, isPermanentlyGenerated, effectiveIsLoading, hasError, onStyleClick]);

  // Continue button handler
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎯 Continue clicked for style: ${style.name}`);
    onContinue();
  };

  // Image expand handler
  const handleImageExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🔍 Expanding image for style: ${style.name}`);
    setIsLightboxOpen(true);
  };

  // Generate click handler
  const handleGenerateClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // CRITICAL: Never generate if permanently generated
    if (isPermanentlyGenerated) {
      console.log(`🚫 PERMANENT BLOCK - ${style.name} cannot be regenerated (generate button)`);
      return;
    }
    
    if (effectiveIsLoading) {
      console.log(`🚫 BUSY BLOCK - ${style.name} is already generating`);
      return;
    }
    
    console.log(`🎨 Starting generation for ${style.name}`);
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      console.log(`✅ Generation completed for ${style.name}`);
    } catch (error) {
      console.log(`❌ Generation failed for ${style.name}:`, error);
      setShowError(true);
    } finally {
      if (!isPermanentlyGenerated) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, isPermanentlyGenerated, effectiveIsLoading, style.name, setShowError, setLocalIsLoading]);

  // Retry click handler
  const handleRetryClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // CRITICAL: Never retry if permanently generated
    if (isPermanentlyGenerated) {
      console.log(`🚫 PERMANENT BLOCK - ${style.name} cannot be retried`);
      return;
    }
    
    if (effectiveIsLoading) {
      console.log(`🚫 BUSY BLOCK - ${style.name} is already generating`);
      return;
    }
    
    console.log(`🔄 Retrying generation for ${style.name}`);
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      console.log(`✅ Retry completed for ${style.name}`);
    } catch (error) {
      console.log(`❌ Retry failed for ${style.name}:`, error);
      setShowError(true);
    } finally {
      if (!isPermanentlyGenerated) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, isPermanentlyGenerated, effectiveIsLoading, style.name, setShowError, setLocalIsLoading]);

  return {
    handleCardClick,
    handleContinueClick,
    handleImageExpand,
    handleGenerateClick,
    handleRetryClick
  };
};
