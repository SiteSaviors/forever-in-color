// TEMPORARY FIX: Disable server-side watermarking
// This prevents the "Unsupported image type" error and allows users to see their images

export class CanvasWatermarkService {
  private static watermarkPath = "6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";
  private static bucketName = "lovable-uploads";
  private static projectRef = "fvjganetpyyrguuxjtqi";

  /**
   * TEMPORARY: Returns original image URL without watermarking
   * This prevents the ImageScript "Unsupported image type" error
   */
  static async createWatermarkedImage(
    imageUrl: string, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<string> {
    console.log(`[Watermark] TEMPORARY: Server-side watermarking disabled`);
    console.log(`[Watermark] Session: ${sessionId}, Preview: ${isPreview}`);
    console.log(`[Watermark] Returning original image: ${imageUrl.substring(0, 100)}...`);
    
    try {
      // Check if the imageUrl is a data URL (base64 encoded image)
      if (imageUrl.startsWith('data:image/')) {
        console.log('[Watermark] Data URL detected, skipping fetch verification');
        return imageUrl;
      }
      
      // Verify the image URL is accessible before returning it (only for regular URLs)
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error(`[Watermark] Image not accessible: ${response.status}`);
        throw new Error(`Image not accessible: ${response.status}`);
      }
      
      console.log('[Watermark] Image verified and accessible');
      return imageUrl;
      
    } catch (error) {
      console.error('[Watermark] Error verifying image:', error);
      throw error;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Constructs the correct Supabase Storage public URL (for future use)
   */
  private static getSupabaseStorageUrl(): string {
    return `https://${this.projectRef}.supabase.co/storage/v1/object/public/${this.bucketName}/${this.watermarkPath}`;
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
    
    console.log('\n2. Server-side watermarking status: DISABLED (temporary)');
    console.log('   Reason: ImageScript library incompatible with Replicate PNG format');
    console.log('   Solution: Frontend watermarking to be implemented');
    
    console.log('\n=== END DIAGNOSTIC ===\n');
  }
}