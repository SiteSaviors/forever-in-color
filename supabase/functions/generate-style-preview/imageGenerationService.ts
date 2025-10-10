import { resolvePreviewTimingConfig } from './replicate/config.ts';

/**
 * Maps Wondertone quality setting to SeeDream size parameter
 */
function mapQualityToSize(quality: string): string {
  switch (quality.toLowerCase()) {
    case 'low':
      return '1K';
    case 'high':
      return '4K';
    case 'medium':
    default:
      return '2K';
  }
}

export class ImageGenerationService {
  constructor(private replicateApiToken: string) {}

  async generateImageToImage(imageData: string, prompt: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<{ ok: boolean; output?: string; error?: string }> {

    try {
      // Use Replicate's SeeDream 4.0 endpoint
      const seedreamSize = mapQualityToSize(quality);
      const requestBody = {
        input: {
          prompt: prompt,
          image_input: [imageData],
          aspect_ratio: aspectRatio, // SeeDream supports 1:1, 3:2, 2:3, 4:3, 16:9
          size: seedreamSize, // 1K, 2K, or 4K
          max_images: 1
        }
      };


      const response = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.replicateApiToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          ok: false,
          error: errorData.detail || errorData.error || 'Image generation failed'
        };
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.status === 'succeeded' && data.output) {
        let outputUrl = data.output;
        // If output is an array, take the first image
        if (Array.isArray(outputUrl)) {
          outputUrl = outputUrl[0];
        }
        
        
        return {
          ok: true,
          output: outputUrl
        };
      } else if (data.status === 'failed') {
        return {
          ok: false,
          error: data.error || 'Image generation failed'
        };
      } else if (data.status === 'processing' || data.status === 'starting') {
        // If we need to poll for completion
        return await this.pollForCompletion(data.id);
      }

      return {
        ok: false,
        error: 'Unexpected response format from Replicate'
      };

    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  private async pollForCompletion(predictionId: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    
    const { maxAttempts, pollIntervalMs } = resolvePreviewTimingConfig(); // defaults: 30 attempts, 2000ms interval
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Bearer ${this.replicateApiToken}`,
          },
        });

        if (!response.ok) {
          return {
            ok: false,
            error: `Polling failed: ${response.status}`
          };
        }

        const result = await response.json();

        if (result.status === 'succeeded') {
          let outputUrl = result.output;
          if (Array.isArray(outputUrl)) {
            outputUrl = outputUrl[0];
          }
          
          
          return {
            ok: true,
            output: outputUrl
          };
        } else if (result.status === 'failed') {
          return {
            ok: false,
            error: result.error || 'Image generation failed'
          };
        } else if (result.status === 'canceled') {
          return {
            ok: false,
            error: 'Generation was canceled'
          };
        }

        // Wait before next poll using configurable interval
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        attempts++;
      } catch (_error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      }
    }

    return {
      ok: false,
      error: `Generation timed out after ${Math.round((maxAttempts * pollIntervalMs) / 1000)} seconds`
    };
  }
}
