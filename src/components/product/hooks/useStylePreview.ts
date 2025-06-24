
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
  preGeneratedPreview?: string;
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

  const isStyleGenerated = hasGeneratedPreview && !!(preGeneratedPreview || previewUrl);

  // Convert crop aspect ratio to generation aspect ratio string
  const getGenerationAspectRatio = useCallback(() => {
    console.log('Converting crop aspect ratio to generation aspect ratio:', cropAspectRatio);
    
    // Handle specific aspect ratios based on crop ratio
    if (Math.abs(cropAspectRatio - 1) < 0.1) {
      console.log('Detected square aspect ratio');
      return '1:1';
    } else if (cropAspectRatio > 1) {
      console.log('Detected horizontal aspect ratio');
      return '4:3';
    } else {
      console.log('Detected vertical aspect ratio');
      return '3:4';
    }
  }, [cropAspectRatio]);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1 || preGeneratedPreview) return;

    console.log(`Starting GPT-IMG-1 preview generation for style: ${style.name} (ID: ${style.id})`);
    setIsLoading(true);
    
    try {
      console.log(`Generating GPT-IMG-1 preview for style: ${style.name}`);
      
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      const aspectRatio = getGenerationAspectRatio();
      
      console.log(`Using aspect ratio ${aspectRatio} for generation based on crop aspect ratio ${cropAspectRatio}`);
      
      const previewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, aspectRatio);

      if (previewUrl) {
        console.log(`GPT-IMG-1 preview generated successfully for ${style.name}, adding watermark...`);
        
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
