
import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { getAspectRatio } from '../orientation/utils';

interface UseStylePreviewProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  isPopular: boolean;
  preGeneratedPreview?: string;
  selectedOrientation?: string;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

export const useStylePreview = ({
  style,
  croppedImage,
  isPopular,
  preGeneratedPreview,
  selectedOrientation = "square",
  onStyleClick
}: UseStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  // Initialize with pre-generated preview if available
  useEffect(() => {
    if (preGeneratedPreview) {
      // Apply watermark to pre-generated preview
      const applyWatermark = async () => {
        try {
          const watermarkedUrl = await addWatermarkToImage(preGeneratedPreview);
          setPreviewUrl(watermarkedUrl);
          setHasGeneratedPreview(true);
          console.log(`✅ Watermark applied to pre-generated preview for ${style.name}`);
        } catch (error) {
          console.warn(`⚠️ Watermarking failed for ${style.name}, using original:`, error);
          setPreviewUrl(preGeneratedPreview);
          setHasGeneratedPreview(true);
        }
      };
      
      applyWatermark();
    }
  }, [preGeneratedPreview, style.name]);

  const isStyleGenerated = hasGeneratedPreview && !!(preGeneratedPreview || previewUrl);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1 || preGeneratedPreview) {
      console.log(`Cannot generate preview for ${style.name}: croppedImage=${!!croppedImage}, styleId=${style.id}, preGenerated=${!!preGeneratedPreview}`);
      return;
    }

    console.log('');
    console.log('🔥🔥🔥 STYLE PREVIEW GENERATION START 🔥🔥🔥');
    console.log('🔥 Style Name:', style.name);
    console.log('🔥 Style ID:', style.id);
    console.log('🔥 Selected Orientation FROM PROPS:', selectedOrientation);
    
    // CRITICAL FIX: Map orientation to correct aspect ratio BEFORE API call
    const aspectRatio = getAspectRatio(selectedOrientation);
    console.log('🔥🔥🔥 MAPPED ASPECT RATIO:', aspectRatio, '🔥🔥🔥');
    console.log('🔥🔥🔥 CALLING API WITH ASPECT RATIO:', aspectRatio, '🔥🔥🔥');
    
    setIsLoading(true);
    
    try {
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      console.log('🔥 About to call generateStylePreview API...');
      
      // Generate the preview without server-side watermarking
      const rawPreviewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, aspectRatio, {
        watermark: false // Disable server-side watermarking
      });

      if (rawPreviewUrl) {
        console.log(`✅ Raw preview generated for ${style.name} with aspect ratio ${aspectRatio}`);
        
        try {
          // Apply client-side watermarking
          const watermarkedUrl = await addWatermarkToImage(rawPreviewUrl);
          console.log(`✅ Client-side watermark applied successfully for ${style.name}`);
          setPreviewUrl(watermarkedUrl);
        } catch (watermarkError) {
          console.warn(`⚠️ Client-side watermarking failed for ${style.name}, using original:`, watermarkError);
          setPreviewUrl(rawPreviewUrl);
        }
        
        setHasGeneratedPreview(true);
      } else {
        console.error(`❌ Failed to generate preview for ${style.name}: No preview URL returned`);
      }
    } catch (error) {
      console.error(`❌ Error generating preview for ${style.name}:`, error);
    } finally {
      setIsLoading(false);
      console.log('🔥🔥🔥 STYLE PREVIEW GENERATION END 🔥🔥🔥');
      console.log('');
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation]);

  const handleClick = useCallback(() => {
    console.log('');
    console.log('🔥🔥🔥 STYLE CLICK HANDLER 🔥🔥🔥');
    console.log('🔥 Style clicked:', style.name, '(ID:', style.id, ')');
    console.log('🔥 Current orientation:', selectedOrientation);
    console.log('🔥🔥🔥 END STYLE CLICK 🔥🔥🔥');
    console.log('');
    
    onStyleClick(style);
    
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      console.log(`🚀 Auto-generating preview for style: ${style.name} with orientation ${selectedOrientation}`);
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isLoading, onStyleClick, generatePreview, preGeneratedPreview, selectedOrientation]);

  return {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    handleClick,
    generatePreview
  };
};
