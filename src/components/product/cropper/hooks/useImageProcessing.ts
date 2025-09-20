
import { useState } from "react";

export const useImageProcessing = () => {
  const createImage = (url: string): Promise<HTMLImageElement> => 
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    
    return canvas.toDataURL('image/jpeg');
  };

  const detectRecommendedOrientation = (imageUrl: string, setRecommendedOrientation: (orientation: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let detected = 'square';
      
      if (aspectRatio > 1.2) {
        detected = 'horizontal';
      } else if (aspectRatio < 0.8) {
        detected = 'vertical';
      } else {
        detected = 'square';
      }
      
      setRecommendedOrientation(detected);
    };
    img.src = imageUrl;
  };

  return {
    getCroppedImg,
    detectRecommendedOrientation
  };
};
