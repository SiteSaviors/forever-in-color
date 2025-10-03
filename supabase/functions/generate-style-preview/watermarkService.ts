
export class WatermarkService {
  private static watermarkUrl = "/lovable-uploads/781d4b89-6ecc-4101-aeaf-c5743efce1c1.png";

  static async createWatermarkedImage(
    imageBuffer: ArrayBuffer, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<ArrayBuffer> {
    // Import imagescript for Deno edge runtime
    const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
    
    
    
    try {
      // Load the original generated image
      const originalImage = await Image.decode(new Uint8Array(imageBuffer));

      if (isPreview) {
        // 1. Load the transparent infinity logo
        try {
          const logoResponse = await fetch(`https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`);
          if (logoResponse.ok) {
            const logoBuffer = await logoResponse.arrayBuffer();
            const logoImage = await Image.decode(new Uint8Array(logoBuffer));
            
            // Resize logo to be proportional to image (about 15% of image width)
            const logoSize = Math.floor(originalImage.width * 0.15);
            const resizedLogo = logoImage.resize(logoSize, Math.floor(logoSize * (logoImage.height / logoImage.width)));

            // Position logo slightly above center
            const logoTop = Math.floor(originalImage.height * 0.35);
            const logoLeft = Math.floor((originalImage.width - logoSize) / 2);

            // Composite logo with transparency
            originalImage.composite(resizedLogo, logoLeft, logoTop);
          }
        } catch (_logoError) {
          // Logo loading failed, continue without logo
        }

        // 2. Create "FOREVER IN COLOR" text overlay
        // Since imagescript doesn't have built-in text rendering, we'll create a simple overlay
        // For now, we'll focus on the logo and session ID

        // 3. Add session ID text in bottom corner (simplified approach)
        if (sessionId) {
          const sessionText = sessionId.slice(0, 8);
          const timestamp = new Date().toISOString().slice(0, 10);
          const _watermarkText = `${sessionText} • ${timestamp}`;

          // Create a simple text overlay using a filled rectangle as placeholder
          // In a real implementation, you'd want to use a proper text rendering solution
          // For now, we'll just add the logo which is the main visual watermark
          // Future: Implement text rendering with _watermarkText
        }
      }

      // Encode the final watermarked image
      const outputBuffer = await originalImage.encode();
      return outputBuffer.buffer;

    } catch (error) {
      // Return original image if watermarking fails
      return imageBuffer;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
