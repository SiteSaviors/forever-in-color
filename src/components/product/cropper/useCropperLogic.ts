
import { useState, useCallback } from "react";

export const useCropperLogic = (selectedOrientation: string, onCropComplete: (croppedImage: string, aspectRatio: number) => void) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const getAspectRatioFromOrientation = (orientation: string) => {
    switch (orientation) {
      case 'vertical':
        return 3/4;
      case 'horizontal':
        return 4/3;
      case 'square':
      default:
        return 1;
    }
  };

  const [cropAspect, setCropAspect] = useState(getAspectRatioFromOrientation(selectedOrientation));

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
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

  const handleCropSave = async (imageUrl: string) => {
    if (croppedAreaPixels && imageUrl) {
      try {
        const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
        onCropComplete(croppedImage, cropAspect);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAutoCenterCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleOrientationChange = (newAspect: number, orientationId: string, onOrientationChange?: (orientation: string) => void) => {
    console.log('PhotoCropper: Orientation changed to:', orientationId, 'with aspect ratio:', newAspect);
    setCropAspect(newAspect);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    
    if (onOrientationChange) {
      console.log('PhotoCropper: Notifying parent of orientation change:', orientationId);
      onOrientationChange(orientationId);
    }
  };

  return {
    crop,
    zoom,
    cropAspect,
    croppedAreaPixels,
    setCrop,
    setZoom,
    onCropCompleteHandler,
    handleCropSave,
    handleAutoCenterCrop,
    handleOrientationChange
  };
};
