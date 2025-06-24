
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
      setPreviewUrl(preGeneratedPreview);
      setHasGeneratedPreview(true);
      console.log(`Using pre-generated preview for ${style.name}:`, preGeneratedPreview);
    }
  }, [preGeneratedPreview, style.name]);

  const isStyleGenerated = hasGeneratedPreview && !!(preGeneratedPreview || previewUrl);

  // Convert selected orientation to GPT-Image-1 supported aspect ratios
  const getGenerationAspectRatio = useCallback(() => {
    console.log('Converting selected orientation to GPT-Image-1 aspect ratio:', selectedOrientation);
    
    switch (selectedOrientation) {
      case 'vertical':
        console.log('Using 2:3 aspect ratio for vertical orientation (GPT-Image-1 supported)');
        return '2:3';
      case 'horizontal':
        console.log('Using 3:2 aspect ratio for horizontal orientation (GPT-Image-1 supported)');
        return '3:2';
      case 'square':
      default:
        console.log('Using 1:1 aspect ratio for square orientation');
        return '1:1';
    }
  }, [selectedOrientation]);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1 || preGeneratedPreview) return;

    const aspectRatio = getGenerationAspectRatio();
    console.log(`Starting GPT-Image-1 preview generation for style: ${style.name} (ID: ${style.id}) with orientation: ${selectedOrientation} -> aspect ratio: ${aspectRatio}`);
    
    setIsLoading(true);
    
    try {
      console.log(`Generating GPT-Image-1 preview for ${style.name} with CONFIRMED aspect ratio: ${aspectRatio}`);
      
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      console.log(`API call parameters:`, {
        styleName: style.name,
        tempPhotoId,
        aspectRatio,
        selectedOrientation
      });
      
      const previewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, aspectRatio);

      if (previewUrl) {
        console.log(`GPT-Image-1 preview generated successfully for ${style.name} with aspect ratio ${aspectRatio}, adding watermark...`);
        
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
        console.error(`Failed to generate GPT-Image-1 preview for ${style.name}: No preview URL returned`);
      }
    } catch (error) {
      console.error(`Error generating GPT-Image-1 preview for ${style.name}:`, error);
    } finally {
      setIsLoading(false);
      console.log(`GPT-Image-1 preview generation completed for ${style.name} (ID: ${style.id})`);
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, getGenerationAspectRatio, selectedOrientation]);

  const handleClick = useCallback(() => {
    console.log(`Style clicked: ${style.name} (ID: ${style.id}) with orientation: ${selectedOrientation}`);
    onStyleClick(style);
    
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      console.log(`Auto-generating GPT-Image-1 preview for style: ${style.name} with orientation ${selectedOrientation}`);
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
