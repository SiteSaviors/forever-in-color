
export class ImageGenerationService {
  constructor(private openaiApiKey: string, private replicateApiToken: string) {}

  async generateImageToImage(imageData: string, prompt: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<{ ok: boolean; output?: string; error?: string }> {
    console.log('Using Replicate GPT-Image-1 for image transformation with prompt:', prompt);
    console.log('Generating with aspect ratio:', aspectRatio);
    
    try {
      // Use Replicate's GPT-Image-1 endpoint
      const response = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.replicateApiToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            input_images: [imageData],
            openai_api_key: this.openaiApiKey,
            aspect_ratio: aspectRatio,
            quality: quality
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Replicate GPT-Image-1 API error:', errorData);
        return {
          ok: false,
          error: errorData.detail || errorData.error || 'Image generation failed'
        };
      }

      const data = await response.json();
      console.log('Replicate response:', data);
      
      // Handle different response formats
      if (data.status === 'succeeded' && data.output) {
        let outputUrl = data.output;
        // If output is an array, take the first image
        if (Array.isArray(outputUrl)) {
          outputUrl = outputUrl[0];
        }
        
        console.log('GPT-Image-1 generation successful via Replicate with aspect ratio:', aspectRatio);
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
      console.error('Replicate GPT-Image-1 generation error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  private async pollForCompletion(predictionId: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    console.log('Polling for completion:', predictionId);
    
    const maxAttempts = 30; // Max 30 attempts (60 seconds with 2s intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Bearer ${this.replicateApiToken}`,
          },
        });

        if (!response.ok) {
          console.error('Polling failed:', response.status);
          return {
            ok: false,
            error: `Polling failed: ${response.status}`
          };
        }

        const result = await response.json();
        console.log(`Poll attempt ${attempts + 1}, status:`, result.status);

        if (result.status === 'succeeded') {
          let outputUrl = result.output;
          if (Array.isArray(outputUrl)) {
            outputUrl = outputUrl[0];
          }
          
          console.log('Generation succeeded:', outputUrl);
          return {
            ok: true,
            output: outputUrl
          };
        } else if (result.status === 'failed') {
          console.error('Generation failed:', result.error);
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

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      ok: false,
      error: 'Generation timed out after 60 seconds'
    };
  }
}
