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
    
    // Check if the image URL is a data URL (base64 encoded image)
    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
    
    try {
      // Verify the image URL is accessible before returning it
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Image not accessible: ${response.status}`);
      }
      
      
      return imageUrl;
      
    } catch (_error) {
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
  }
}