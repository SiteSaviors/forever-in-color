/**
 * Wondertone Canva-Style Grid Watermark Service
 *
 * Applies professional diagonal grid watermark using pre-rendered orientation-specific PNGs.
 * Each PNG contains the full Canva-style grid + centered Wondertone logo at full opacity.
 * This service scales and composites them with context-specific opacity.
 *
 * @see docs/watermark-specification.md for full technical specification
 */

export type WatermarkContext = 'preview' | 'download' | 'canvas';
export type WatermarkOrientation = 'horizontal' | 'vertical' | 'square';

export class WatermarkService {
  private static watermarkCache: Map<WatermarkOrientation, ArrayBuffer> = new Map();
  private static readonly SUPABASE_URL = Deno.env.get('SUPABASE_URL');

  /**
   * Opacity levels by context (conversion-optimized)
   */
  private static readonly OPACITY_MAP: Record<WatermarkContext, number> = {
    preview: 0.80,   // Style generation viewport - highly visible
    download: 0.80,  // Downloads - same as preview
    canvas: 0.50,    // Canvas in-room viewport - moderately visible
  };

  /**
   * Get watermark PNG URL for orientation
   */
  private static getWatermarkUrl(orientation: WatermarkOrientation): string {
    const fileName = orientation === 'horizontal' ? 'Horizontal.png'
                   : orientation === 'vertical' ? 'Vertical.png'
                   : 'Square.png';

    return `${this.SUPABASE_URL}/storage/v1/object/public/assets/orientation-watermarks/${fileName}`;
  }

  /**
   * Load and cache watermark PNG for orientation
   */
  private static async loadWatermark(orientation: WatermarkOrientation): Promise<ArrayBuffer | null> {
    // Check cache first
    if (this.watermarkCache.has(orientation)) {
      return this.watermarkCache.get(orientation)!;
    }

    try {
      const url = this.getWatermarkUrl(orientation);
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[WatermarkService] Failed to fetch ${orientation} watermark:`, response.status);
        return null;
      }

      const buffer = await response.arrayBuffer();
      this.watermarkCache.set(orientation, buffer);
      console.log(`[WatermarkService] Loaded and cached ${orientation} watermark (${(buffer.byteLength / 1024).toFixed(1)} KB)`);

      return buffer;
    } catch (error) {
      console.error(`[WatermarkService] Failed to load ${orientation} watermark:`, error);
      return null;
    }
  }

  /**
   * Detect orientation from image dimensions
   */
  private static detectOrientation(width: number, height: number): WatermarkOrientation {
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1) < 0.1) {
      return 'square'; // Within 10% of 1:1
    } else if (aspectRatio > 1) {
      return 'horizontal'; // Landscape
    } else {
      return 'vertical'; // Portrait
    }
  }

  /**
   * Apply Canva-style diagonal grid watermark using pre-rendered PNG
   *
   * Process:
   * 1. Detect image orientation from aspect ratio
   * 2. Load corresponding pre-rendered watermark PNG (with full Canva grid + logo)
   * 3. Scale watermark to match image dimensions
   * 4. Apply context-specific opacity (preview: 38%, download: 40%, canvas: 23%)
   * 5. Composite watermark over base image
   *
   * Falls back to original buffer on any failure to avoid breaking preview delivery.
   *
   * @param imageBuffer - Source image as ArrayBuffer
   * @param context - Watermark context (determines opacity)
   * @param sessionId - Session identifier for logging
   * @returns Watermarked image as JPEG ArrayBuffer
   */
  static async createWatermarkedImage(
    imageBuffer: ArrayBuffer,
    context: WatermarkContext = 'preview',
    sessionId: string = 'unknown'
  ): Promise<ArrayBuffer> {
    const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');

    try {
      // Decode source image
      const baseImage = await Image.decode(new Uint8Array(imageBuffer));
      const width = baseImage.width;
      const height = baseImage.height;

      // Detect orientation
      const orientation = this.detectOrientation(width, height);

      console.log(`[WatermarkService] Applying ${context} watermark to ${width}x${height} image (${orientation} orientation, session: ${sessionId})`);

      // Get context-specific opacity
      const opacity = this.OPACITY_MAP[context];

      // Load pre-rendered watermark PNG for orientation
      const watermarkBuffer = await this.loadWatermark(orientation);

      if (!watermarkBuffer) {
        console.error('[WatermarkService] Failed to load watermark PNG, returning original image');
        return imageBuffer;
      }

      // Decode watermark PNG
      const watermarkImage = await Image.decode(new Uint8Array(watermarkBuffer));

      // Scale watermark to match base image dimensions
      const scaledWatermark = watermarkImage.resize(width, height);

      // Apply context-specific opacity to watermark
      scaledWatermark.opacity(opacity);

      // Composite watermark over base image
      baseImage.composite(scaledWatermark, 0, 0);

      // Encode as JPEG (92% quality for good balance of size/quality)
      const output = await baseImage.encodeJPEG(92);

      console.log(`[WatermarkService] Successfully applied ${orientation} watermark grid (${context}, ${(opacity * 100).toFixed(0)}% opacity)`);

      return output.buffer;
    } catch (error) {
      console.error('[WatermarkService] Failed to apply watermark, returning original:', error);
      return imageBuffer; // Fail gracefully
    }
  }

  /**
   * Preload all watermark PNGs into cache (call on function cold start)
   */
  static async preloadWatermarks(): Promise<void> {
    console.log('[WatermarkService] Preloading watermark assets...');

    const orientations: WatermarkOrientation[] = ['horizontal', 'vertical', 'square'];

    await Promise.all(
      orientations.map(orientation => this.loadWatermark(orientation))
    );

    console.log('[WatermarkService] Watermark preloading complete');
  }

  /**
   * Clear watermark cache (for testing/debugging)
   */
  static clearCache(): void {
    this.watermarkCache.clear();
    console.log('[WatermarkService] Watermark cache cleared');
  }

  /**
   * Generate unique session ID
   */
  static generateSessionId(): string {
    return `wm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
