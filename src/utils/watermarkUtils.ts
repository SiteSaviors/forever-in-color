
export const addWatermarkToImage = async (
  imageUrl: string, 
  logoUrl: string = "/lovable-uploads/c4c5b902-8aa4-467b-9565-a8a53dfe7ff0.png"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const mainImage = new Image();
    mainImage.crossOrigin = 'anonymous';
    
    mainImage.onload = () => {
      // Set canvas size to match the main image
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;
      
      // Draw the main image
      ctx.drawImage(mainImage, 0, 0);
      
      // Load and draw the watermark
      const watermarkImage = new Image();
      watermarkImage.crossOrigin = 'anonymous';
      
      watermarkImage.onload = () => {
        // Calculate watermark size (10% of image width, maintaining aspect ratio)
        const watermarkWidth = mainImage.width * 0.1;
        const aspectRatio = watermarkImage.height / watermarkImage.width;
        const watermarkHeight = watermarkWidth * aspectRatio;
        
        // Position watermark in center
        const x = (mainImage.width - watermarkWidth) / 2;
        const y = (mainImage.height - watermarkHeight) / 2;
        
        // Set opacity for watermark
        ctx.globalAlpha = 0.3;
        
        // Draw watermark
        ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
        
        // Convert to data URL
        const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(watermarkedImageUrl);
      };
      
      watermarkImage.onerror = () => {
        console.warn('Failed to load watermark, returning original image');
        resolve(imageUrl);
      };
      
      watermarkImage.src = logoUrl;
    };
    
    mainImage.onerror = () => {
      reject(new Error('Failed to load main image'));
    };
    
    mainImage.src = imageUrl;
  });
};
