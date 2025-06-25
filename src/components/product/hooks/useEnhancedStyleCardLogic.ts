
import { useState, useCallback } from "react";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { EnhancedWatermarkService, WatermarkResult } from "@/utils/enhancedWatermarkService";
import { useToast } from "@/hooks/use-toast";

interface UseEnhancedStyleCardLogicProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  shouldBlur?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

export const useEnhancedStyleCardLogic = ({
  style,
  croppedImage,
  selectedStyle,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: UseEnhancedStyleCardLogicProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [watermarkResult, setWatermarkResult] = useState<WatermarkResult | null>(null);
  
  const { toast } = useToast();
  const maxRetries = 3;

  const isSelected = selectedStyle === style.id;
  const showError = !!error && !isGenerating;
  const imageToShow = previewUrl || croppedImage || style.image;
  const showContinueInCard = style.id === 1 || hasGeneratedPreview;
  const hasPreviewOrCropped = !!(previewUrl || croppedImage);
  const showGeneratedBadge = hasGeneratedPreview && style.id !== 1;
  const shouldShowBlur = shouldBlur && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1;

  // Enhanced generation with comprehensive error handling
  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1) {
      console.log(`Cannot generate preview for ${style.name}: croppedImage=${!!croppedImage}, styleId=${style.id}`);
      return;
    }

    console.log(`🎨 Starting enhanced preview generation for ${style.name} (attempt ${retryCount + 1}/${maxRetries})`);
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      // Generate the preview without server-side watermarking
      const rawPreviewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, '1:1', {
        watermark: false
      });

      if (rawPreviewUrl) {
        console.log(`✅ Raw preview generated for ${style.name}, applying enhanced watermarking...`);
        
        // Apply enhanced watermarking with fallbacks
        const watermarkResult = await EnhancedWatermarkService.applyWatermarkWithFallbacks(rawPreviewUrl);
        setWatermarkResult(watermarkResult);
        
        // Set the preview URL (watermarked or original)
        setPreviewUrl(watermarkResult.url);
        setHasGeneratedPreview(true);
        setRetryCount(0); // Reset retry count on success
        
        // Show toast if watermarking failed but generation succeeded
        const watermarkMessage = EnhancedWatermarkService.getWatermarkMessage(watermarkResult);
        if (watermarkMessage) {
          toast({
            title: "Preview Generated",
            description: watermarkMessage,
            variant: "default"
          });
        }
        
        console.log(`✅ Enhanced preview generation completed for ${style.name}`);
      } else {
        throw new Error('No preview URL returned from generation service');
      }
    } catch (error) {
      console.error(`❌ Enhanced generation failed for ${style.name}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Show user-friendly error toast
      toast({
        title: "Generation Failed",
        description: `Failed to generate ${style.name} preview. ${retryCount < maxRetries - 1 ? 'You can try again.' : 'Please try a different style or image.'}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [croppedImage, style.id, style.name, retryCount, maxRetries, toast]);

  // Enhanced retry with attempt tracking
  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      console.log(`❌ Maximum retries (${maxRetries}) reached for ${style.name}`);
      return;
    }
    
    console.log(`🔄 Retrying generation for ${style.name} (attempt ${retryCount + 1}/${maxRetries})`);
    setRetryCount(prev => prev + 1);
    setError(null);
    await generatePreview();
  }, [retryCount, maxRetries, style.name, generatePreview]);

  // Skip generation and continue with original
  const handleSkip = useCallback(() => {
    console.log(`⏭️ Skipping generation for ${style.name}, using original image`);
    setError(null);
    setPreviewUrl(croppedImage);
    setHasGeneratedPreview(true);
    onStyleClick(style);
    
    toast({
      title: "Using Original",
      description: `Continuing with your original image for ${style.name}.`,
      variant: "default"
    });
  }, [style, croppedImage, onStyleClick, toast]);

  // Main card click handler
  const handleClick = useCallback(() => {
    console.log(`🎯 Enhanced card click for ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Auto-generate if conditions are met
    if (croppedImage && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for clicked style: ${style.name}`);
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isGenerating, showError, onStyleClick, generatePreview]);

  // Continue handler
  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      console.log(`Continue clicked for ${style.name} - proceeding to next step`);
      onContinue();
    }
  }, [style.name, onContinue]);

  return {
    isSelected,
    isGenerating,
    hasGeneratedPreview,
    previewUrl,
    error,
    showError,
    imageToShow,
    showContinueInCard,
    hasPreviewOrCropped,
    showGeneratedBadge,
    shouldShowBlur,
    retryCount,
    maxRetries,
    watermarkResult,
    handleClick,
    handleRetry,
    handleSkip,
    handleContinueClick,
    generatePreview
  };
};
