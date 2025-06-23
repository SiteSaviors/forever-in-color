
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
  const [isStyleGenerated, setIsStyleGenerated] = useState(false);

  // Check if we already have a generated preview for this style
  useEffect(() => {
    const generatedStyles = JSON.parse(localStorage.getItem('generatedStyles') || '[]');
    if (generatedStyles.includes(style.id)) {
      setIsStyleGenerated(true);
    }
  }, [style.id]);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1) return;

    console.log(`Starting preview generation for style: ${style.name} (ID: ${style.id})`);
    setIsLoading(true);
    
    try {
      console.log(`Generating preview for style: ${style.name}`);
      
      const response = await generateStylePreview({
        imageData: croppedImage,
        styleId: style.id,
        styleName: style.name
      });

      if (response.success && response.previewUrl) {
        console.log(`Preview generated successfully for ${style.name}, adding watermark...`);
        
        // Add watermark to the generated image
        try {
          const watermarkedUrl = await addWatermarkToImage(response.previewUrl);
          console.log(`Watermark added successfully for ${style.name}`);
          setPreviewUrl(watermarkedUrl);
          console.log(`Preview URL set for ${style.name}:`, watermarkedUrl);
        } catch (watermarkError) {
          console.warn(`Failed to add watermark for ${style.name}, using original image:`, watermarkError);
          setPreviewUrl(response.previewUrl);
          console.log(`Preview URL set for ${style.name}:`, response.previewUrl);
        }
        
        setHasGeneratedPreview(true);
        
        // Mark this style as generated
        const generatedStyles = JSON.parse(localStorage.getItem('generatedStyles') || '[]');
        if (!generatedStyles.includes(style.id)) {
          generatedStyles.push(style.id);
          localStorage.setItem('generatedStyles', JSON.stringify(generatedStyles));
          setIsStyleGenerated(true);
        }
      } else {
        console.error(`Failed to generate preview for ${style.name}:`, response.error);
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
