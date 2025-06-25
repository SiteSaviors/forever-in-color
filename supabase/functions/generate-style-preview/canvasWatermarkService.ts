// Simple fallback watermarking service for Deno Edge Functions
// This replaces the complex Canvas-based approach with a working imagescript solution

export class CanvasWatermarkService {
  private static watermarkPath = "6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";
  private static bucketName = "lovable-uploads";
  private static projectRef = "fvjganetpyyrguuxjtqi";

  /**
   * Creates a watermarked image using imagescript (working approach)
   */
  static async createWatermarkedImage(
    imageUrl: string, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<string> {
    console.log(`[Watermark] Starting watermark process for session: ${sessionId}`);
    console.log(`[Watermark] Image URL: ${imageUrl.substring(0, 100)}...`);
    console.log(`[Watermark] Is Preview: ${isPreview}`);

    try {
      // If not preview mode, return original URL
      if (!isPreview) {
        console.log('[Watermark] Not preview mode, returning original');
        return imageUrl;
      }

      // Use the working imagescript approach
      console.log('[Watermark] Using imagescript watermarking approach');
      
      // Fetch the original image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error('[Watermark] Failed to fetch original image');
        return imageUrl;
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      console.log(`[Watermark] Fetched image buffer: ${imageBuffer.byteLength} bytes`);

      // Apply watermark using imagescript
      const watermarkedBuffer = await this.applyImagescriptWatermark(imageBuffer, sessionId, isPreview);
      
      // Convert to data URL
      const base64 = btoa(String.fromCharCode(...new Uint8Array(watermarkedBuffer)));
      const dataUrl = `data:image/png;base64,${base64}`;
      
      console.log(`[Watermark] Successfully created watermarked image: ${dataUrl.length} characters`);
      return dataUrl;

    } catch (error) {
      console.error('[Watermark] Error during watermarking:', error);
      console.error('[Watermark] Returning original image');
      return imageUrl;
    }
  }

  /**
   * Apply watermark using imagescript (the working approach from WatermarkService)
   */
  private static async applyImagescriptWatermark(
    imageBuffer: ArrayBuffer, 
    sessionId: string, 
    isPreview: boolean
  ): Promise<ArrayBuffer> {
    try {
      // Import imagescript for Deno edge runtime
      const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
      
      console.log('[Watermark] Imagescript imported successfully');
      
      // Load the original generated image
      const originalImage = await Image.decode(new Uint8Array(imageBuffer));
      console.log(`[Watermark] Original image loaded: ${originalImage.width}x${originalImage.height}`);

      if (isPreview) {
        // Try to load and apply the logo watermark
        try {
          const logoUrl = this.getSupabaseStorageUrl();
          console.log(`[Watermark] Fetching logo from: ${logoUrl}`);
          
          const logoResponse = await fetch(logoUrl);
          if (logoResponse.ok) {
            const logoBuffer = await logoResponse.arrayBuffer();
            const logoImage = await Image.decode(new Uint8Array(logoBuffer));
            
            // Resize logo to be proportional to image (about 15% of image width)
            const logoSize = Math.floor(originalImage.width * 0.15);
            const resizedLogo = logoImage.resize(logoSize, Math.floor(logoSize * (logoImage.height / logoImage.width)));

            // Position logo in center
            const logoTop = Math.floor((originalImage.height - resizedLogo.height) / 2);
            const logoLeft = Math.floor((originalImage.width - resizedLogo.width) / 2);

            // Composite logo with transparency
            originalImage.composite(resizedLogo, logoLeft, logoTop);
            
            console.log('[Watermark] Logo watermark applied successfully');
          } else {
            console.warn('[Watermark] Could not load logo, skipping logo watermark');
          }
        } catch (logoError) {
          console.warn('[Watermark] Logo watermark failed:', logoError);
        }
      }

      // Encode the final watermarked image
      const outputBuffer = await originalImage.encode();
      console.log(`[Watermark] Watermarked image encoded: ${outputBuffer.buffer.byteLength} bytes`);

      return outputBuffer.buffer;

    } catch (error) {
      console.error('[Watermark] Imagescript watermarking failed:', error);
      // Return original image if watermarking fails
      return imageBuffer;
    }
  }

  /**
   * Constructs the correct Supabase Storage public URL
   */
  private static getSupabaseStorageUrl(): string {
    return `https://${this.projectRef}.supabase.co/storage/v1/object/public/${this.bucketName}/${this.watermarkPath}`;
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Keep the debug helper for troubleshooting
export class WatermarkDebugHelper {
  static async diagnoseWatermarkService(): Promise<void> {
    console.log('=== WATERMARK SERVICE DIAGNOSTIC ===');
    
    // Test Supabase Storage URL
    const projectRef = "fvjganetpyyrguuxjtqi";
    const bucketName = "lovable-uploads";
    const filePath = "6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";
    const correctUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
    
    console.log('\n1. Testing Supabase Storage URL:');
    try {
      const response = await fetch(correctUrl, { method: 'HEAD' });
      console.log(`   ${response.ok ? '✓' : '✗'} ${response.status} - ${correctUrl}`);
      
      if (response.ok) {
        console.log(`     Content-Type: ${response.headers.get('content-type')}`);
        console.log(`     Content-Length: ${response.headers.get('content-length')}`);
      }
    } catch (error) {
      console.log(`   ✗ ERROR - ${correctUrl}`);
      console.log(`     ${error.message}`);
    }
    
    // Test imagescript
    console.log('\n2. Testing imagescript:');
    try {
      const { Image } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
      console.log('   ✓ Imagescript imported successfully');
      
      // Test with a simple image
      const testImage = new Image(100, 100);
      testImage.fill(0xFF0000FF); // Red
      const encoded = await testImage.encode();
      console.log(`   ✓ Test image created and encoded: ${encoded.length} bytes`);
    } catch (error) {
      console.log('   ✗ Imagescript error:', error.message);
    }
    
    console.log('\n=== END DIAGNOSTIC ===\n');
  }
}
