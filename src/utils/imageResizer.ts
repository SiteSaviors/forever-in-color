
export const resizeImageForProcessing = (
  imageDataUrl: string, 
  maxWidth: number = 768, 
  maxHeight: number = 768,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert back to data URL with compression
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      console.log(`Image resized from ${img.width}x${img.height} to ${width}x${height}`);
      resolve(resizedDataUrl);
    };
    
    img.src = imageDataUrl;
  });
};
