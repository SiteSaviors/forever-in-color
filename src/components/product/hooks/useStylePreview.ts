
import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';

interface UseStylePreviewProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  isPopular: boolean;
  preGeneratedPreview?: string; // New prop for auto-generated previews
  cropAspectRatio?: number;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

export const useStylePreview = ({
  style,
  croppedImage,
  isPopular,
  preGeneratedPreview,
  cropAspectRatio = 1,
  onStyleClick
}: UseStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  // Initialize with pre-generated preview if available
  useEffect(() => {
    if (preGeneratedPreview) {
      setPreviewUrl(preGeneratedPreview);
      setHasGeneratedPreview(true);
      console.log(`Using pre-generated preview for ${style.name}:`, preGeneratedPreview);
    }
  }, [preGeneratedPreview, style.name]);

  // Only mark as generated if we actually have a preview URL (either pre-generated or hook-generated)
  const isStyleGenerated = hasGeneratedPreview && !!(preGeneratedPreview || previewUrl);

  // Convert crop aspect ratio to generation aspect ratio
  const getGenerationAspectRatio = useCallback(() => {
    if (cropAspectRatio === 1) return '1:1';
    if (cropAspectRatio > 1) return '4:3';
    return '3:4';
  }, [cropAspectRatio]);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1 || preGeneratedPreview) return;

    console.log(`Starting GPT-IMG-1 preview generation for style: ${style.name} (ID: ${style.id})`);
    setIsLoading(true);
    
    try {
      console.log(`Generating GPT-IMG-1 preview for style: ${style.name}`);
      
      // Generate a temporary photo ID for the preview (in a real app, this would come from uploaded photo)
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      // Get the correct aspect ratio based on crop ratio
      const aspectRatio = getGenerationAspectRatio();
      console.log(`Using aspect ratio ${aspectRatio} for generation based on crop aspect ratio ${cropAspectRatio}`);
      
      const previewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, aspectRatio);

      if (previewUrl) {
        console.log(`GPT-IMG-1 preview generated successfully for ${style.name}, adding watermark...`);
        
        // Add watermark to the generated image
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          console.log(`Watermark added successfully for ${style.name}`);
          setPreviewUrl(watermarkedUrl);
          console.log(`Preview URL set for ${style.name}:`, watermarkedUrl);
        } catch (watermarkError) {
          console.warn(`Failed to add watermark for ${style.name}, using original image:`, watermarkError);
          setPreviewUrl(previewUrl);
          console.log(`Preview URL set for ${style.name}:`, previewUrl);
        }
        
        setHasGeneratedPreview(true);
      } else {
        console.error(`Failed to generate GPT-IMG-1 preview for ${style.name}: No preview URL returned`);
      }
    } catch (error) {
      console.error(`Error generating GPT-IMG-1 preview for ${style.name}:`, error);
    } finally {
      setIsLoading(false);
      console.log(`GPT-IMG-1 preview generation completed for ${style.name} (ID: ${style.id})`);
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, getGenerationAspectRatio, cropAspectRatio]);

  const handleClick = useCallback(() => {
    console.log(`Style clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Only auto-generate preview for styles that don't already have a pre-generated one
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      console.log(`Auto-generating GPT-IMG-1 preview for style: ${style.name} with aspect ratio based on crop ratio ${cropAspectRatio}`);
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isLoading, onStyleClick, generatePreview, preGeneratedPreview, cropAspectRatio]);

  return {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    handleClick,
    generatePreview
  };
};
