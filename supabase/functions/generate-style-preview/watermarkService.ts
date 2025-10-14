export class WatermarkService {
  private static fontCache: ArrayBuffer | null = null;

  /**
   * Load Agbalumo font from Google Fonts for text rendering
   */
  private static async loadFont(): Promise<ArrayBuffer | null> {
    if (this.fontCache) {
      return this.fontCache;
    }

    try {
      // Fetch Agbalumo font from Google Fonts
      const fontUrl = 'https://fonts.gstatic.com/s/agbalumo/v6/55xvey5uMdT2N37KZcMF.ttf';
      const response = await fetch(fontUrl);
      if (!response.ok) {
        console.error('[WatermarkService] Failed to fetch Agbalumo font:', response.status);
        throw new Error(`Font fetch failed: ${response.status}`);
      }
      this.fontCache = await response.arrayBuffer();
      console.log('[WatermarkService] Agbalumo font loaded successfully');
      return this.fontCache;
    } catch (error) {
      console.error('[WatermarkService] Font loading failed:', error);
      throw error; // Re-throw to be caught by createWatermarkedImage
    }
  }

  /**
   * Apply Wondertone's five-point watermark treatment:
   *  - Four "WONDERTONE" text watermarks in each corner
   *  - One large diagonal "WONDERTONE" text watermark across center
   * Falls back to the original buffer on any failure to avoid breaking preview delivery.
   */
  static async createWatermarkedImage(
    imageBuffer: ArrayBuffer,
    _sessionId: string,
    _isPreview: boolean = true
  ): Promise<ArrayBuffer> {
    const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');

    try {
      const baseImage = await Image.decode(new Uint8Array(imageBuffer));
      const width = baseImage.width;
      const height = baseImage.height;
      const baseDimension = Math.min(width, height);

      // Load font for text rendering
      let fontBuffer: ArrayBuffer | null;
      try {
        fontBuffer = await this.loadFont();
      } catch (error) {
        console.error('[WatermarkService] Font loading failed, returning original image:', error);
        return imageBuffer; // Return unwatermarked image if font fails
      }

      if (!fontBuffer) {
        console.error('[WatermarkService] No font available, returning original image');
        return imageBuffer;
      }

      // ImageScript.renderText expects font as Uint8Array buffer directly
      const fontBytes = new Uint8Array(fontBuffer);
      const watermarkText = 'WONDERTONE';

      // Corner watermarks - small text, 35% opacity, white
      const cornerFontSize = Math.floor(baseDimension * 0.025); // Smaller, more subtle
      const margin = Math.max(Math.round(baseDimension * 0.02), 10);

      const cornerPositions = [
        [margin, margin], // Top-left
        [width - margin, margin], // Top-right (will adjust after measuring)
        [margin, height - margin], // Bottom-left (will adjust after measuring)
        [width - margin, height - margin], // Bottom-right (will adjust after measuring)
      ];

      // Apply corner watermarks
      for (let i = 0; i < cornerPositions.length; i++) {
        const [baseX, baseY] = cornerPositions[i];
        try {
          // Image.renderText(fontBuffer, fontSize, text, color)
          const textImage = await Image.renderText(fontBytes, cornerFontSize, watermarkText, 0xFFFFFFFF);
          if (textImage) {
            textImage.opacity(0.35); // 35% opacity for subtlety

            // Adjust positioning based on corner
            let x = baseX;
            let y = baseY;
            if (i === 1 || i === 3) { // Right side
              x = baseX - textImage.width;
            }
            if (i === 2 || i === 3) { // Bottom side
              y = baseY - textImage.height;
            }

            baseImage.composite(textImage, Math.max(0, x), Math.max(0, y));
          }
        } catch (error) {
          console.warn(`[WatermarkService] Failed to render corner watermark ${i}:`, error);
        }
      }

      // Center watermark - large diagonal text, 20% opacity
      const centerFontSize = Math.floor(baseDimension * 0.06);
      try {
        const centerText = await Image.renderText(fontBytes, centerFontSize, watermarkText, 0xFFFFFFFF);
        if (centerText) {
          centerText.opacity(0.20); // Very subtle
          const rotated = centerText.rotate(-30); // Diagonal

          const centerX = Math.floor((width - rotated.width) / 2);
          const centerY = Math.floor((height - rotated.height) / 2);

          baseImage.composite(rotated, Math.max(0, centerX), Math.max(0, centerY));
        }
      } catch (error) {
        console.warn('[WatermarkService] Failed to render center watermark:', error);
      }

      const output = await baseImage.encodeJPEG(90);
      console.log('[WatermarkService] Successfully applied 5-point text watermark');
      return output.buffer;
    } catch (error) {
      console.error('[WatermarkService] Failed to apply watermark', error);
      return imageBuffer;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
