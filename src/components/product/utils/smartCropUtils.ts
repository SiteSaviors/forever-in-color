
export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const detectFaceRegion = (imageUrl: string): Promise<CropRegion | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // For portrait images, assume face is in upper portion
      const aspectRatio = img.width / img.height;
      
      if (aspectRatio < 0.8) { // Portrait orientation
        // Focus on upper 60% of image to capture face and upper body
        const cropRegion: CropRegion = {
          x: 0,
          y: 0,
          width: img.width,
          height: Math.min(img.height, img.width * 1.3) // Maintain portrait aspect ratio
        };
        resolve(cropRegion);
      } else if (aspectRatio > 1.2) { // Landscape orientation
        // Center crop for landscape
        const targetWidth = img.height * 1.2;
        const cropRegion: CropRegion = {
          x: Math.max(0, (img.width - targetWidth) / 2),
          y: 0,
          width: Math.min(img.width, targetWidth),
          height: img.height
        };
        resolve(cropRegion);
      } else { // Square-ish
        // Center crop to perfect square
        const size = Math.min(img.width, img.height);
        const cropRegion: CropRegion = {
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          width: size,
          height: size
        };
        resolve(cropRegion);
      }
    };
    img.src = imageUrl;
  });
};

export const applyCropToImage = async (imageUrl: string, cropRegion: CropRegion): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = cropRegion.width;
      canvas.height = cropRegion.height;
      
      ctx.drawImage(
        img,
        cropRegion.x,
        cropRegion.y,
        cropRegion.width,
        cropRegion.height,
        0,
        0,
        cropRegion.width,
        cropRegion.height
      );
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

export const generateSmartCrop = async (imageUrl: string, orientation: string): Promise<string> => {
  console.log(`🎯 Generating smart crop for ${orientation} orientation`);
  
  try {
    const cropRegion = await detectFaceRegion(imageUrl);
    
    if (!cropRegion) {
      console.log('No crop region detected, returning original image');
      return imageUrl;
    }
    
    console.log('Applying crop region:', cropRegion);
    const croppedImageUrl = await applyCropToImage(imageUrl, cropRegion);
    
    console.log('✅ Smart crop generated successfully');
    return croppedImageUrl;
    
  } catch (error) {
    console.error('Error generating smart crop:', error);
    return imageUrl; // Fallback to original image
  }
};
