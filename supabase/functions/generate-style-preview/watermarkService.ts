
export class WatermarkService {
  private static watermarkUrl = "/lovable-uploads/c4c5b902-8aa4-467b-9565-a8a53dfe7ff0.png";

  static async createWatermarkedImage(
    imageBuffer: ArrayBuffer, 
    sessionId: string, 
    isPreview: boolean = true
  ): Promise<ArrayBuffer> {
    // Import Sharp dynamically for Deno edge runtime
    const { default: sharp } = await import('npm:sharp@0.33.0');
    
    console.log('Creating watermarked image with Sharp');
    
    try {
      // Load the original generated image
      const originalImage = sharp(Buffer.from(imageBuffer));
      const metadata = await originalImage.metadata();
      
      console.log('Original image metadata:', { width: metadata.width, height: metadata.height });

      // Create watermark components
      const watermarkComponents = [];

      // 1. Logo watermark in bottom-right
      try {
        const logoResponse = await fetch(`https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`);
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer();
          const logoSize = Math.floor((metadata.width || 512) * 0.12); // 12% of image width
          
          watermarkComponents.push({
            input: Buffer.from(logoBuffer),
            gravity: 'southeast' as const,
            blend: 'over' as const,
            opacity: 0.4
          });
          
          console.log('Added logo watermark');
        }
      } catch (logoError) {
        console.warn('Could not load logo watermark:', logoError);
      }

      // 2. Session ID text watermark in bottom-left (for previews only)
      if (isPreview && sessionId) {
        const sessionText = sessionId.slice(0, 8);
        const timestamp = new Date().toISOString().slice(0, 10);
        const watermarkText = `${sessionText} • ${timestamp}`;
        
        const textSvg = `
          <svg width="300" height="40">
            <text x="10" y="30" 
                  font-family="Arial, sans-serif" 
                  font-size="16" 
                  font-weight="500"
                  fill="rgba(255,255,255,0.8)" 
                  stroke="rgba(0,0,0,0.3)" 
                  stroke-width="1">
              ${watermarkText}
            </text>
          </svg>
        `;

        watermarkComponents.push({
          input: Buffer.from(textSvg),
          gravity: 'southwest' as const,
          blend: 'over' as const
        });
        
        console.log('Added session text watermark:', watermarkText);
      }

      // 3. Central semi-transparent brand text for previews
      if (isPreview) {
        const centralTextSvg = `
          <svg width="${metadata.width}" height="${metadata.height}">
            <text x="50%" y="50%" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-size="${Math.floor((metadata.width || 512) * 0.08)}" 
                  font-weight="bold"
                  fill="rgba(255,255,255,0.15)" 
                  stroke="rgba(0,0,0,0.1)" 
                  stroke-width="2"
                  transform="rotate(-15 ${metadata.width! / 2} ${metadata.height! / 2})">
              PREVIEW
            </text>
          </svg>
        `;

        watermarkComponents.push({
          input: Buffer.from(centralTextSvg),
          gravity: 'center' as const,
          blend: 'over' as const
        });
        
        console.log('Added central preview watermark');
      }

      // Apply all watermarks
      let result = originalImage;
      if (watermarkComponents.length > 0) {
        result = originalImage.composite(watermarkComponents);
      }

      // Set output quality based on preview vs final
      const outputBuffer = await result
        .png({ 
          quality: isPreview ? 85 : 95,
          compressionLevel: isPreview ? 8 : 6
        })
        .toBuffer();

      console.log('Watermarking completed successfully');
      return outputBuffer.buffer;

    } catch (error) {
      console.error('Watermarking failed:', error);
      // Return original image if watermarking fails
      return imageBuffer;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
