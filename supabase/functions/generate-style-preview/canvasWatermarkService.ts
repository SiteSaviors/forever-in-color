
export class CanvasWatermarkService {
  private static watermarkUrl = "/lovable-uploads/6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";

  static async createWatermarkedImage(
    imageUrl: string, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<string> {
    console.log('Creating watermarked image using Canvas API approach');
    
    try {
      console.log('Loading original image from:', imageUrl.substring(0, 50) + '...');
      
      // Load both images as ImageBitmap
      const [originalBitmap, logoBitmap] = await Promise.all([
        this.loadImageBitmap(imageUrl),
        isPreview ? this.loadImageBitmap(`https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`) : null
      ]);

      console.log('Original image loaded successfully:', { width: originalBitmap.width, height: originalBitmap.height });

      // Create canvas with original image dimensions
      const canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Draw original image
      ctx.drawImage(originalBitmap, 0, 0);

      // Apply watermark if preview
      if (isPreview && logoBitmap) {
        console.log('Logo loaded successfully, applying watermark...');
        
        // Calculate logo dimensions (20% of image width)
        const logoScale = (canvas.width * 0.2) / logoBitmap.width;
        const logoWidth = Math.round(logoBitmap.width * logoScale);
        const logoHeight = Math.round(logoBitmap.height * logoScale);
        
        // Calculate center position
        const logoX = Math.round((canvas.width - logoWidth) / 2);
        const logoY = Math.round((canvas.height - logoHeight) / 2);
        
        // Set 40% opacity
        ctx.globalAlpha = 0.4;
        
        // Draw watermark
        ctx.drawImage(logoBitmap, logoX, logoY, logoWidth, logoHeight);
        
        // Reset opacity
        ctx.globalAlpha = 1.0;
        
        console.log('Infinity logo watermark added successfully at center:', { 
          x: logoX, 
          y: logoY, 
          width: logoWidth, 
          height: logoHeight,
          opacity: '40%'
        });
      }

      // Convert to blob
      const blob = await canvas.convertToBlob({ 
        type: 'image/png',
        quality: 1 
      });
      
      // Convert to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const watermarkedDataUrl = `data:image/png;base64,${base64}`;

      console.log('Canvas watermarking completed successfully');
      return watermarkedDataUrl;

    } catch (error) {
      console.error('Canvas watermarking failed:', error);
      // Return original URL if watermarking fails
      return imageUrl;
    }
  }

  private static async loadImageBitmap(url: string): Promise<ImageBitmap> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    return await createImageBitmap(blob);
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
