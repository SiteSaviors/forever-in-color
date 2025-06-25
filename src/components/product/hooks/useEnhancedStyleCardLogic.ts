import { useState, useCallback, useEffect } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { previewCache } from '@/utils/previewCache';
import { convertOrientationToAspectRatio } from '../utils/orientationDetection';

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

interface WatermarkResult {
  success: boolean;
  url: string;
  error?: string;
}

export const useEnhancedStyleCardLogic = ({
  style,
  croppedImage,
  selectedStyle,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: UseEnhancedStyleCardLogicProps) => {
  // Core state
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [watermarkResult, setWatermarkResult] = useState<WatermarkResult | null>(null);

  // Constants
  const maxRetries = 3;
  const isSelected = selectedStyle === style.id;
  const isOriginalImage = style.id === 1;
  
  // Derived states
  const showError = Boolean(error && !isGenerating);
  const imageToShow = hasGeneratedPreview && previewUrl ? previewUrl : 
                    isOriginalImage && croppedImage ? croppedImage : style.image;
  const showContinueInCard = isSelected && hasGeneratedPreview && !shouldBlur;
  const hasPreviewOrCropped = Boolean(previewUrl || (isOriginalImage && croppedImage));
  const showGeneratedBadge = hasGeneratedPreview && Boolean(previewUrl);
  const shouldShowBlur = shouldBlur && !isGenerating && !hasGeneratedPreview && !isOriginalImage;

  /**
   * Generate AI preview for the style
   * Handles caching, watermarking, and error states
   */
  const generatePreview = useCallback(async () => {
    if (!croppedImage || isOriginalImage || isGenerating) {
      return;
    }

    console.log(`🎨 Generating preview for ${style.name} (attempt ${retryCount + 1}/${maxRetries})`);
    
    setIsGenerating(true);
    setError(null);

    try {
      const aspectRatio = convertOrientationToAspectRatio('square'); // Default to square for now
      
      // Check cache first
      const cachedPreview = previewCache.getCachedPreview(croppedImage, style.id, aspectRatio);
      if (cachedPreview) {
        setPreviewUrl(cachedPreview);
        setHasGeneratedPreview(true);
        setIsGenerating(false);
        console.log(`✅ Using cached preview for ${style.name}`);
        return;
      }

      // Generate new preview
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      const rawPreviewUrl = await generateStylePreview(
        croppedImage, 
        style.name, 
        tempPhotoId, 
        aspectRatio,
        { watermark: false }
      );

      if (rawPreviewUrl) {
        try {
          // Apply watermark
          const watermarkedUrl = await addWatermarkToImage(rawPreviewUrl);
          setWatermarkResult({ success: true, url: watermarkedUrl });
          
          // Cache and set preview
          previewCache.cachePreview(croppedImage, style.id, style.name, aspectRatio, watermarkedUrl);
          setPreviewUrl(watermarkedUrl);
          setHasGeneratedPreview(true);
          
          console.log(`✅ Preview generated and watermarked for ${style.name}`);
        } catch (watermarkError) {
          console.warn(`⚠️ Watermarking failed for ${style.name}:`, watermarkError);
          setWatermarkResult({ success: false, url: rawPreviewUrl, error: String(watermarkError) });
          
          // Use unwatermarked version as fallback
          setPreviewUrl(rawPreviewUrl);
          setHasGeneratedPreview(true);
        }
      } else {
        throw new Error('No preview URL returned from generation service');
      }
    } catch (genError) {
      const errorMessage = genError instanceof Error ? genError.message : 'Unknown generation error';
      console.error(`❌ Preview generation failed for ${style.name}:`, errorMessage);
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsGenerating(false);
    }
  }, [croppedImage, style.id, style.name, isOriginalImage, isGenerating, retryCount, maxRetries]);

  /**
   * Handle style card click
   * Triggers selection and auto-generation if needed
   */
  const handleClick = useCallback(() => {
    console.log(`🎯 StyleCard clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Auto-generate preview if conditions are met
    if (croppedImage && !hasGeneratedPreview && !isGenerating && !isOriginalImage && !previewUrl) {
      console.log(`🚀 Auto-generating preview for ${style.name}`);
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isGenerating, isOriginalImage, previewUrl, onStyleClick, generatePreview]);

  /**
   * Handle retry after error
   * Resets error state and attempts generation again
   */
  const handleRetry = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (retryCount >= maxRetries) {
      console.warn(`⚠️ Maximum retries (${maxRetries}) reached for ${style.name}`);
      return;
    }
    
    console.log(`🔄 Retrying preview generation for ${style.name} (attempt ${retryCount + 1})`);
    setError(null);
    generatePreview();
  }, [retryCount, maxRetries, style.name, generatePreview]);

  /**
   * Handle skip after multiple failures
   * Allows user to continue without preview
   */
  const handleSkip = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    console.log(`⏭️ Skipping preview generation for ${style.name}`);
    setError(null);
    setIsGenerating(false);
    // Don't set hasGeneratedPreview to true - keep it as skipped state
  }, [style.name]);

  /**
   * Handle continue button click
   * Proceeds to next step when style is selected and ready
   */
  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`➡️ Continue clicked for ${style.name}`);
    if (onContinue) {
      onContinue();
    }
  }, [style.name, onContinue]);

  // Reset error state when croppedImage changes
  useEffect(() => {
    setError(null);
    setRetryCount(0);
  }, [croppedImage]);

  return {
    // State
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
    
    // Actions
    handleClick,
    handleRetry,
    handleSkip,
    handleContinueClick,
    generatePreview
  };
};
