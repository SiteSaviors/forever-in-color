
import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';

interface UseProgressiveStylePreviewProps {
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

export const useProgressiveStylePreview = ({
  style,
  croppedImage,
  isPopular,
  onStyleClick
}: UseProgressiveStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lowQualityPreview, setLowQualityPreview] = useState<string | null>(null);
  const [highQualityPreview, setHighQualityPreview] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'none' | 'low' | 'high'>('none');

  // The final preview URL to show (high quality if available, otherwise low quality)
  const previewUrl = highQualityPreview || lowQualityPreview;
  const isStyleGenerated = hasGeneratedPreview && !!previewUrl;

  const generatePreview = useCallback(async (requestedQuality: 'low' | 'high' = 'low') => {
    if (!croppedImage || style.id === 1) return;

    console.log(`Starting GPT-IMG-1 ${requestedQuality} quality preview generation for style: ${style.name} (ID: ${style.id})`);
    
    if (requestedQuality === 'low') {
      setIsLoading(true);
    }
    
    try {
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      const previewUrl = await generateStylePreview(
        croppedImage, 
        style.name, 
        tempPhotoId,
        requestedQuality
      );

      if (previewUrl) {
        console.log(`GPT-IMG-1 ${requestedQuality} quality preview generated successfully for ${style.name}`);
        
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          
          if (requestedQuality === 'low') {
            setLowQualityPreview(watermarkedUrl);
            setCurrentQuality('low');
            setHasGeneratedPreview(true);
            setIsLoading(false);
            
            // Immediately start generating high quality version in background
            setTimeout(() => generatePreview('high'), 100);
          } else {
            setHighQualityPreview(watermarkedUrl);
            setCurrentQuality('high');
          }
          
        } catch (watermarkError) {
          console.warn(`Failed to add watermark for ${style.name}, using original image:`, watermarkError);
          
          if (requestedQuality === 'low') {
            setLowQualityPreview(previewUrl);
            setCurrentQuality('low');
            setHasGeneratedPreview(true);
            setIsLoading(false);
            setTimeout(() => generatePreview('high'), 100);
          } else {
            setHighQualityPreview(previewUrl);
            setCurrentQuality('high');
          }
        }
      } else {
        console.error(`Failed to generate GPT-IMG-1 ${requestedQuality} quality preview for ${style.name}`);
        if (requestedQuality === 'low') {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error(`Error generating GPT-IMG-1 ${requestedQuality} quality preview for ${style.name}:`, error);
      if (requestedQuality === 'low') {
        setIsLoading(false);
      }
    }
  }, [croppedImage, style.id, style.name]);

  const handleClick = useCallback(() => {
    console.log(`Style clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Auto-generate preview for ALL styles when clicked (if not already generated and we have a cropped image)
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1) {
      console.log(`Auto-generating progressive GPT-IMG-1 preview for style: ${style.name}`);
      generatePreview('low');
    }
  }, [style, croppedImage, hasGeneratedPreview, isLoading, onStyleClick, generatePreview]);

  return {
    isLoading,
    previewUrl,
    lowQualityPreview,
    highQualityPreview,
    hasGeneratedPreview,
    isStyleGenerated,
    currentQuality,
    isUpgrading: currentQuality === 'low' && !highQualityPreview,
    handleClick,
    generatePreview
  };
};
