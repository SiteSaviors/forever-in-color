

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

      // If not preview mode, return original URL
      if (!isPreview) {
        console.log('[Watermark] Not preview mode, returning original');
        return imageUrl;
      }

      // Try direct HTML Image approach instead of createImageBitmap
      const watermarkedDataUrl = await this.createWatermarkWithHTMLImage(imageUrl, sessionId);
      
      if (watermarkedDataUrl && watermarkedDataUrl !== imageUrl) {
        console.log('[Watermark] HTML Image approach succeeded');
        return watermarkedDataUrl;
      }

      console.log('[Watermark] HTML Image approach failed, trying simple overlay');
      
      // Final fallback - return original if all methods fail
      console.warn('[Watermark] All watermarking methods failed, returning original');
      return imageUrl;

    } catch (error) {
      console.error('[Watermark] Unexpected error:', error);
      console.error('[Watermark] Error stack:', error.stack);
      return imageUrl;
    }
  }

  /**
   * Create watermark using HTML Image elements instead of createImageBitmap
   */
  private static async createWatermarkWithHTMLImage(
    imageUrl: string,
    sessionId: string
  ): Promise<string> {
    console.log('[Watermark] Using HTML Image approach');

    return new Promise(async (resolve) => {
      try {
        // Get the logo URL
        const logoUrl = this.getSupabaseStorageUrl();
        console.log(`[Watermark] Logo URL: ${logoUrl}`);

        // Create image elements
        const originalImg = new Image();
        const logoImg = new Image();
        
        // Track loading
        let originalLoaded = false;
        let logoLoaded = false;
        let hasResolved = false;

        const tryComposite = () => {
          if (originalLoaded && logoLoaded && !hasResolved) {
            hasResolved = true;
            console.log('[Watermark] Both images loaded, compositing...');
            
            try {
              // Create canvas
              const canvas = new OffscreenCanvas(originalImg.width || 1024, originalImg.height || 1024);
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                console.error('[Watermark] Failed to get canvas context');
                resolve(imageUrl);
                return;
              }

              // Draw original image
              ctx.drawImage(originalImg, 0, 0);
              console.log('[Watermark] Original image drawn');

              // Calculate logo size (20% of image width)
              const logoSize = (originalImg.width || 1024) * 0.2;
              const logoWidth = logoSize;
              const logoHeight = (logoImg.height / logoImg.width) * logoSize;
              
              // Calculate center position
              const logoX = ((originalImg.width || 1024) - logoWidth) / 2;
              const logoY = ((originalImg.height || 1024) - logoHeight) / 2;
              
              // Draw logo with opacity
              ctx.globalAlpha = 0.4;
              ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
              ctx.globalAlpha = 1.0;
              
              console.log('[Watermark] Logo drawn, converting to data URL');

              // Convert to blob and then to data URL
              canvas.convertToBlob({ type: 'image/png' })
                .then(async (blob) => {
                  const arrayBuffer = await blob.arrayBuffer();
                  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                  const dataUrl = `data:image/png;base64,${base64}`;
                  console.log(`[Watermark] Success! Data URL length: ${dataUrl.length}`);
                  resolve(dataUrl);
                })
                .catch((error) => {
                  console.error('[Watermark] Blob conversion failed:', error);
                  resolve(imageUrl);
                });

            } catch (error) {
              console.error('[Watermark] Compositing failed:', error);
              resolve(imageUrl);
            }
          }
        };

        // Set up original image loading
        originalImg.onload = () => {
          console.log(`[Watermark] Original image loaded: ${originalImg.width}x${originalImg.height}`);
          originalLoaded = true;
          tryComposite();
        };

        originalImg.onerror = (error) => {
          console.error('[Watermark] Original image load failed:', error);
          if (!hasResolved) {
            hasResolved = true;
            resolve(imageUrl);
          }
        };

        // Set up logo image loading
        logoImg.onload = () => {
          console.log(`[Watermark] Logo loaded: ${logoImg.width}x${logoImg.height}`);
          logoLoaded = true;
          tryComposite();
        };

        logoImg.onerror = (error) => {
          console.error('[Watermark] Logo load failed:', error);
          // Continue without logo - just return original with text overlay
          if (!hasResolved && originalLoaded) {
            hasResolved = true;
            console.log('[Watermark] Proceeding without logo');
            resolve(this.addTextWatermark(imageUrl, sessionId));
          }
        };

        // Set crossOrigin and start loading
        originalImg.crossOrigin = 'anonymous';
        logoImg.crossOrigin = 'anonymous';
        
        // Start loading images
        originalImg.src = imageUrl;
        logoImg.src = logoUrl;

        // Timeout fallback
        setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true;
            console.warn('[Watermark] Timeout reached, returning original');
            resolve(imageUrl);
          }
        }, 30000); // 30 second timeout

      } catch (error) {
        console.error('[Watermark] HTML Image method error:', error);
        resolve(imageUrl);
      }
    });
  }

  /**
   * Fallback method - add simple text watermark
   */
  private static async addTextWatermark(imageUrl: string, sessionId: string): Promise<string> {
    console.log('[Watermark] Adding text watermark as fallback');
    
    try {
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            const canvas = new OffscreenCanvas(img.width || 1024, img.height || 1024);
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(imageUrl);
              return;
            }

            // Draw original
            ctx.drawImage(img, 0, 0);
            
            // Add text watermark
            const fontSize = Math.max(24, (img.width || 1024) / 40);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText('PREVIEW', (img.width || 1024) / 2, (img.height || 1024) / 2);
            
            // Convert to data URL
            const blob = await canvas.convertToBlob({ type: 'image/png' });
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            resolve(`data:image/png;base64,${base64}`);
            
          } catch (error) {
            console.error('[Watermark] Text watermark failed:', error);
            resolve(imageUrl);
          }
        };
        
        img.onerror = () => resolve(imageUrl);
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
      });
      
    } catch (error) {
      console.error('[Watermark] Text watermark setup failed:', error);
      return imageUrl;
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

// Debug helper to diagnose watermark issues
export class WatermarkDebugHelper {
  static async diagnoseWatermarkService(): Promise<void> {
    console.log('=== WATERMARK SERVICE DIAGNOSTIC ===');
    
    // Test 1: Check Supabase Storage URL
    const projectRef = "fvjganetpyyrguuxjtqi";
    const bucketName = "lovable-uploads";
    const filePath = "6789ee1d-5679-4b94-bae6-e76ffd4f7526.png";
    
    const urls = [
      // Wrong format (what was previously used)
      `https://${projectRef}.supabase.co/${bucketName}/${filePath}`,
      // Correct format
      `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`,
    ];
    
    console.log('\n1. Testing Supabase Storage URLs:');
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`   ${response.ok ? '✓' : '✗'} ${response.status} - ${url}`);
        
        if (response.ok) {
          console.log(`     Content-Type: ${response.headers.get('content-type')}`);
          console.log(`     Content-Length: ${response.headers.get('content-length')}`);
        }
      } catch (error) {
        console.log(`   ✗ ERROR - ${url}`);
        console.log(`     ${error.message}`);
      }
    }
    
    // Test 2: Canvas API availability
    console.log('\n2. Testing Canvas API availability:');
    try {
      const canvas = new OffscreenCanvas(100, 100);
      console.log('   ✓ OffscreenCanvas is available');
      
      const ctx = canvas.getContext('2d');
      console.log(`   ${ctx ? '✓' : '✗'} 2D context is available`);
      
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 50, 50);
        
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        console.log(`   ✓ convertToBlob works (blob size: ${blob.size})`);
      }
    } catch (error) {
      console.log('   ✗ Canvas API error:', error.message);
    }
    
    console.log('\n=== END DIAGNOSTIC ===\n');
  }
}

