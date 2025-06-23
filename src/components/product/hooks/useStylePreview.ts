
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
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

export const useStylePreview = ({
  style,
  croppedImage,
  isPopular,
  onStyleClick
}: UseStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  // Only mark as generated if we actually have a preview URL
  const isStyleGenerated = hasGeneratedPreview && !!previewUrl;

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1) return;

    console.log(`Starting preview generation for style: ${style.name} (ID: ${style.id})`);
    setIsLoading(true);
    
    try {
      console.log(`Generating preview for style: ${style.name}`);
      
      // Generate a temporary photo ID for the preview (in a real app, this would come from uploaded photo)
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      const previewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId);

      if (previewUrl) {
        console.log(`Preview generated successfully for ${style.name}, adding watermark...`);
        
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
        console.error(`Failed to generate preview for ${style.name}: No preview URL returned`);
      }
    } catch (error) {
      console.error(`Error generating preview for ${style.name}:`, error);
    } finally {
      setIsLoading(false);
      console.log(`Preview generation completed for ${style.name} (ID: ${style.id})`);
    }
  }, [croppedImage, style.id, style.name]);

  const handleClick = useCallback(() => {
    console.log(`Style clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Auto-generate preview for ALL styles when clicked (if not already generated and we have a cropped image)
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1) {
      console.log(`Auto-generating preview for style: ${style.name}`);
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isLoading, onStyleClick, generatePreview]);

  return {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    handleClick,
    generatePreview
  };
};
