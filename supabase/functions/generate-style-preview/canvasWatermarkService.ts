
export class CanvasWatermarkService {
  private static watermarkPath = "6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";
  private static bucketName = "lovable-uploads";
  private static projectRef = "fvjganetpyyrguuxjtqi";

  /**
   * Creates a watermarked image with comprehensive error handling and fallbacks
   */
  static async createWatermarkedImage(
    imageUrl: string, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<string> {
    console.log(`[Watermark] Starting process for session: ${sessionId}`);
    console.log(`[Watermark] Image URL: ${imageUrl}`);
    console.log(`[Watermark] Is Preview: ${isPreview}`);

    try {
      // Validate input URL
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.error('[Watermark] Invalid image URL provided');
        return imageUrl;
      }

      // Load the original image with detailed error handling
      const originalBitmap = await this.loadImageWithRetry(imageUrl, 'original');
      if (!originalBitmap) {
        console.error('[Watermark] Failed to load original image');
        return imageUrl;
      }

      console.log(`[Watermark] Original image loaded: ${originalBitmap.width}x${originalBitmap.height}`);

      // If not preview mode, just re-encode the original
      if (!isPreview) {
        return await this.encodeImageToDataUrl(originalBitmap);
      }

      // Load watermark logo with proper Supabase Storage URL
      const logoUrl = this.getSupabaseStorageUrl();
      console.log(`[Watermark] Loading logo from: ${logoUrl}`);
      
      const logoBitmap = await this.loadImageWithRetry(logoUrl, 'logo');
      if (!logoBitmap) {
        console.error('[Watermark] Failed to load logo, returning original');
        return imageUrl;
      }

      console.log(`[Watermark] Logo loaded: ${logoBitmap.width}x${logoBitmap.height}`);

      // Create watermarked image
      const watermarkedDataUrl = await this.compositeImages(originalBitmap, logoBitmap);
      console.log('[Watermark] Watermarking completed successfully');
      
      return watermarkedDataUrl;
    } catch (error) {
      console.error('[Watermark] Unexpected error:', error);
      console.error('[Watermark] Error stack:', error.stack);
      return imageUrl;
    }
  }

  /**
   * Constructs the correct Supabase Storage public URL
   */
  private static getSupabaseStorageUrl(): string {
    return `https://${this.projectRef}.supabase.co/storage/v1/object/public/${this.bucketName}/${this.watermarkPath}`;
  }

  /**
   * Loads an image with retry logic and fallback mechanisms
   */
  private static async loadImageWithRetry(
    url: string, 
    imageType: string, 
    maxRetries: number = 2
  ): Promise<ImageBitmap | null> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Watermark] Loading ${imageType} - Attempt ${attempt + 1}`);
        
        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'image/*'
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`[Watermark] HTTP ${response.status} for ${imageType}`);
          if (response.status === 404) {
            console.error(`[Watermark] ${imageType} not found at: ${url}`);
            return null; // Don't retry 404s
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        console.log(`[Watermark] ${imageType} content-type: ${contentType}`);

        const blob = await response.blob();
        console.log(`[Watermark] ${imageType} size: ${blob.size} bytes`);

        // Try createImageBitmap with error handling
        try {
          const bitmap = await createImageBitmap(blob);
          console.log(`[Watermark] ${imageType} bitmap created successfully`);
          return bitmap;
        } catch (bitmapError) {
          console.error(`[Watermark] createImageBitmap failed for ${imageType}:`, bitmapError);
          
          // Fallback: Try different approach for problematic images
          if (attempt < maxRetries) {
            console.log(`[Watermark] Retrying with different approach...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
        }
      } catch (error) {
        console.error(`[Watermark] Error loading ${imageType} (attempt ${attempt + 1}):`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * Composites the logo onto the original image with proper positioning and opacity
   */
  private static async compositeImages(
    originalBitmap: ImageBitmap,
    logoBitmap: ImageBitmap
  ): Promise<string> {
    console.log('[Watermark] Starting image composition');
    
    // Create canvas
    const canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2d context from OffscreenCanvas');
    }

    // Draw original image
    ctx.drawImage(originalBitmap, 0, 0);
    console.log('[Watermark] Original image drawn to canvas');

    // Calculate watermark dimensions (20% of image width)
    const targetLogoWidth = originalBitmap.width * 0.2;
    const logoScale = targetLogoWidth / logoBitmap.width;
    const logoWidth = Math.round(logoBitmap.width * logoScale);
    const logoHeight = Math.round(logoBitmap.height * logoScale);
    
    // Calculate center position
    const logoX = Math.round((originalBitmap.width - logoWidth) / 2);
    const logoY = Math.round((originalBitmap.height - logoHeight) / 2);
    
    console.log(`[Watermark] Logo dimensions: ${logoWidth}x${logoHeight} at position (${logoX}, ${logoY})`);

    // Apply watermark with 40% opacity
    ctx.globalAlpha = 0.4;
    ctx.drawImage(logoBitmap, logoX, logoY, logoWidth, logoHeight);
    ctx.globalAlpha = 1.0;
    
    console.log('[Watermark] Logo composited successfully');

    // Convert to data URL
    return await this.canvasToDataUrl(canvas);
  }

  /**
   * Encodes an ImageBitmap directly to a data URL
   */
  private static async encodeImageToDataUrl(bitmap: ImageBitmap): Promise<string> {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }

    ctx.drawImage(bitmap, 0, 0);
    return await this.canvasToDataUrl(canvas);
  }

  /**
   * Converts a canvas to a data URL with error handling
   */
  private static async canvasToDataUrl(canvas: OffscreenCanvas): Promise<string> {
    try {
      // Method 1: convertToBlob (preferred)
      const blob = await canvas.convertToBlob({ 
        type: 'image/png',
        quality: 1 
      });
      
      console.log(`[Watermark] Blob created: ${blob.size} bytes`);
      
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid call stack issues with large images
      let base64 = '';
      const chunkSize = 32768; // 32KB chunks
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
      }
      
      const dataUrl = `data:image/png;base64,${base64}`;
      console.log(`[Watermark] Data URL created: ${dataUrl.length} characters`);
      
      return dataUrl;
    } catch (error) {
      console.error('[Watermark] Canvas to data URL conversion failed:', error);
      throw error;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
