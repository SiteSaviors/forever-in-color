
export class ImageGenerationService {
  constructor(private apiKey: string) {}

  async generateImageToImage(imageData: string, prompt: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    console.log('Using GPT-IMG-1 for direct image transformation with prompt:', prompt);
    
    try {
      // Use GPT-IMG-1 for direct image-to-image transformation
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt, // Use the exact prompt without modification
          image: imageData, // Send the uploaded image directly
          n: 1,
          size: '1024x1024',
          quality: 'high',
          output_format: 'png'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GPT-IMG-1 API error:', errorData);
        return {
          ok: false,
          error: errorData.error?.message || 'Image generation failed'
        };
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].b64_json) {
        // Convert base64 to data URL
        const base64Image = `data:image/png;base64,${data.data[0].b64_json}`;
        console.log('GPT-IMG-1 generation successful with exact prompt');
        
        return {
          ok: true,
          output: base64Image
        };
      }

      return {
        ok: false,
        error: 'No image data returned from GPT-IMG-1'
      };

    } catch (error) {
      console.error('GPT-IMG-1 generation error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }
}
