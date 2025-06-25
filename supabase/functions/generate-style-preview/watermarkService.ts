
export class WatermarkService {
  private static watermarkUrl = "/lovable-uploads/781d4b89-6ecc-4101-aeaf-c5743efce1c1.png";

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

      if (isPreview) {
        // 1. Load the transparent infinity logo
        try {
          const logoResponse = await fetch(`https://fvjganetpyyrguuxjtqi.supabase.co${this.watermarkUrl}`);
          if (logoResponse.ok) {
            const logoBuffer = await logoResponse.arrayBuffer();
            
            // Resize logo to be proportional to image (about 15% of image width)
            const logoSize = Math.floor((metadata.width || 512) * 0.15);
            const resizedLogo = await sharp(Buffer.from(logoBuffer))
              .resize(logoSize, null, { 
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .png()
              .toBuffer();

            // Position logo slightly above center
            const logoTop = Math.floor((metadata.height || 512) * 0.35);
            const logoLeft = Math.floor(((metadata.width || 512) - logoSize) / 2);

            watermarkComponents.push({
              input: resizedLogo,
              top: logoTop,
              left: logoLeft,
              blend: 'over' as const
            });
            
            console.log('Added infinity logo watermark');
          }
        } catch (logoError) {
          console.warn('Could not load logo watermark:', logoError);
        }

        // 2. Create "FOREVER IN COLOR" text below the logo
        const fontSize = Math.floor((metadata.width || 512) * 0.08);
        const textY = Math.floor((metadata.height || 512) * 0.6);
        
        const foreverTextSvg = `
          <svg width="${metadata.width}" height="100">
            <defs>
              <style>
                .watermark-text {
                  font-family: 'Arial Black', Arial, sans-serif;
                  font-weight: 900;
                  font-size: ${fontSize}px;
                  fill: rgba(255, 255, 255, 0.85);
                  text-anchor: middle;
                  letter-spacing: 3px;
                }
              </style>
            </defs>
            <text x="50%" y="50" class="watermark-text">FOREVER IN COLOR</text>
          </svg>
        `;

        watermarkComponents.push({
          input: Buffer.from(foreverTextSvg),
          top: textY,
          left: 0,
          blend: 'over' as const
        });
        
        console.log('Added FOREVER IN COLOR text watermark');

        // 3. Small session ID text in bottom corner (less prominent)
        if (sessionId) {
          const sessionText = sessionId.slice(0, 8);
          const timestamp = new Date().toISOString().slice(0, 10);
          const watermarkText = `${sessionText} • ${timestamp}`;
          
          const sessionTextSvg = `
            <svg width="300" height="40">
              <text x="10" y="30" 
                    font-family="Arial, sans-serif" 
                    font-size="14" 
                    font-weight="400"
                    fill="rgba(255,255,255,0.6)" 
                    stroke="rgba(0,0,0,0.2)" 
                    stroke-width="0.5">
                ${watermarkText}
              </text>
            </svg>
          `;

          watermarkComponents.push({
            input: Buffer.from(sessionTextSvg),
            top: (metadata.height || 512) - 50,
            left: 10,
            blend: 'over' as const
          });
          
          console.log('Added session text watermark:', watermarkText);
        }
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
