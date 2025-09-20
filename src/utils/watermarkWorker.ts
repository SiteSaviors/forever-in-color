
// Web Worker for watermarking operations
const watermarkWorker = () => {
  self.onmessage = async (event) => {
    const { imageData, watermarkData, options } = event.data;
    
    try {
      // Create canvas in worker context
      const canvas = new OffscreenCanvas(options.width, options.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Create image from data
      const img = new Image();
      img.onload = async () => {
        // Draw original image
        ctx.drawImage(img, 0, 0, options.width, options.height);
        
        // Add watermark
        if (watermarkData) {
          const watermark = new Image();
          watermark.onload = async () => {
            const wmWidth = options.width * 0.2;
            const wmHeight = (watermark.height * wmWidth) / watermark.width;
            
            ctx.globalAlpha = 0.7;
            ctx.drawImage(
              watermark,
              options.width - wmWidth - 20,
              options.height - wmHeight - 20,
              wmWidth,
              wmHeight
            );
            
            // Convert to blob
            const blob = await canvas.convertToBlob({ 
              type: 'image/png', 
              quality: options.quality || 0.9 
            });
            
            // Send result back
            self.postMessage({ 
              success: true, 
              blob,
              url: URL.createObjectURL(blob)
            });
          };
          watermark.src = watermarkData;
        }
      };
      img.src = imageData;
      
    } catch (error) {
      self.postMessage({ 
        success: false, 
        error: error.message 
      });
    }
  };
};

export const createWatermarkWorker = () => {
  const blob = new Blob([`(${watermarkWorker.toString()})()`], {
    type: 'application/javascript'
  });
  return new Worker(URL.createObjectURL(blob));
};
