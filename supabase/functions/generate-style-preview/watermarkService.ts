export class WatermarkService {
  private static watermarkUrl = "/lovable-uploads/781d4b89-6ecc-4101-aeaf-c5743efce1c1.png";

  /**
   * Apply Wondertone's five-point watermark treatment:
   *  - Four smaller marks in each corner
   *  - One large, low-opacity mark centered horizontally
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
      const logoImage = await this.loadWatermarkAsset();
      if (!logoImage) {
        return imageBuffer;
      }

      const width = baseImage.width;
      const height = baseImage.height;
      const logoAspect = logoImage.width > 0 ? logoImage.height / logoImage.width : 1;
      const baseDimension = Math.min(width, height);
      const cornerWidth = Math.floor(Math.max(baseDimension * 0.22, 120));
      const cornerHeight = Math.floor(cornerWidth * logoAspect);
      const margin = Math.max(Math.round(baseDimension * 0.05), 28);
      const centerWidth = Math.floor(Math.max(width * 0.72, cornerWidth * 2.5));
      const centerHeight = Math.floor(centerWidth * logoAspect);

      const cornerLogo = logoImage
        .clone()
        .resize(cornerWidth, cornerHeight)
        .opacity(0.42);

      const cornerPositions: Array<[number, number]> = [
        [margin, margin],
        [width - cornerLogo.width - margin, margin],
        [margin, height - cornerLogo.height - margin],
        [width - cornerLogo.width - margin, height - cornerLogo.height - margin],
      ];

      for (const [x, y] of cornerPositions) {
        baseImage.composite(cornerLogo.clone(), Math.max(0, Math.floor(x)), Math.max(0, Math.floor(y)));
      }

      const centerLogo = logoImage
        .clone()
        .resize(centerWidth, centerHeight)
        .opacity(0.24);
      const centerX = Math.max(0, Math.floor((width - centerLogo.width) / 2));
      const centerY = Math.max(0, Math.floor((height - centerLogo.height) / 2));
      baseImage.composite(centerLogo, centerX, centerY);

      const output = await baseImage.encodeJPEG(90);
      return output.buffer;
    } catch (error) {
      console.error('[WatermarkService] Failed to apply watermark', error);
      return imageBuffer;
    }
  }

  private static async loadWatermarkAsset() {
    try {
      const response = await fetch(`https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`);
      if (!response.ok) {
        console.warn('[WatermarkService] Failed to fetch watermark asset', response.status);
        return null;
      }
      const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
      const buffer = await response.arrayBuffer();
      return await Image.decode(new Uint8Array(buffer));
    } catch (error) {
      console.error('[WatermarkService] Error loading watermark asset', error);
      return null;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
