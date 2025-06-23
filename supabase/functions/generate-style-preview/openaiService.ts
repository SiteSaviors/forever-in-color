
import { OpenAIImageResponse, OpenAIAnalysisResponse } from './types.ts';

export class OpenAIService {
  constructor(private apiKey: string, private supabase: any) {}

  async generateImageToImage(imageData: string, styleName: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    console.log('Using GPT-4 Vision + GPT-IMG-1 for image transformation with style:', styleName);
    
    try {
      // Step 1: Analyze the input image with GPT-4 Vision to create a detailed description
      const analysisResult = await this.analyzeImageWithVision(imageData);
      if (!analysisResult.ok) {
        console.error('Image analysis failed:', analysisResult.error);
        return analysisResult;
      }

      // Step 2: Get the style prompt from Supabase
      const stylePrompt = await this.getStylePromptFromSupabase(styleName);
      
      // Step 3: Combine the image description with the style prompt
      const combinedPrompt = this.createCombinedPrompt(analysisResult.description!, stylePrompt, styleName);
      
      console.log('Using combined prompt for style:', styleName, '- Length:', combinedPrompt.length);

      // Step 4: Generate image using GPT-IMG-1 with the combined prompt
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: combinedPrompt,
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
        console.log('GPT-IMG-1 generation successful with preserved subject');
        
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

  private async analyzeImageWithVision(imageData: string): Promise<{ ok: boolean; description?: string; error?: string }> {
    try {
      console.log('Analyzing image with GPT-4 Vision to preserve subject details');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and provide a detailed description focusing on: 1) The main subject (person, animal, object), 2) Their pose and positioning, 3) Physical characteristics and features, 4) Composition and framing, 5) Any important background elements. Be very specific about the subject type and characteristics so they can be preserved in an artistic transformation.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GPT-4 Vision analysis error:', errorData);
        return {
          ok: false,
          error: errorData.error?.message || 'Image analysis failed'
        };
      }

      const data = await response.json();
      const description = data.choices[0]?.message?.content;
      
      if (description) {
        console.log('Image analysis completed successfully');
        return {
          ok: true,
          description
        };
      }

      return {
        ok: false,
        error: 'No description returned from image analysis'
      };

    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  private createCombinedPrompt(imageDescription: string, stylePrompt: string | null, styleName: string): string {
    const baseStylePrompt = stylePrompt || `Transform this image in ${styleName} style while preserving the subject exactly.`;
    
    return `${imageDescription}

Transform this exact scene in the following artistic style: ${baseStylePrompt}

CRITICAL: Preserve the exact subject type, pose, and key characteristics described above. Do not change the subject into a different person, animal, or object. Maintain the same composition and framing while applying the artistic style transformation.`;
  }

  private async getStylePromptFromSupabase(styleName: string): Promise<string | null> {
    try {
      const styleId = this.getStyleIdByName(styleName);
      
      console.log('Fetching prompt for style:', styleName, 'with ID:', styleId);
      
      // Fetch the prompt from Supabase style_prompts table
      const { data, error } = await this.supabase
        .from('style_prompts')
        .select('prompt')
        .eq('style_id', styleId)
        .single();

      if (error) {
        console.warn('Could not fetch style prompt from Supabase:', error);
        return null;
      }

      console.log('Successfully fetched prompt from Supabase for', styleName);
      return data?.prompt || null;
    } catch (error) {
      console.warn('Error fetching style prompt from Supabase:', error);
      return null;
    }
  }

  private getStyleIdByName(styleName: string): number {
    // Updated mapping to match the exact style names used in the frontend
    const styleNameToId: { [key: string]: number } = {
      'Original Image': 1,
      'Classic Oil Painting': 2,
      'Calm WaterColor': 3,
      'Watercolor Dreams': 4,
      'Pastel Bliss': 5,
      'Gemstone Poly': 6,
      '3D Storybook': 7,
      'Artisan Charcoal': 8,
      'Pop Art Burst': 9,
      'Neon Splash': 10,
      'Electric Bloom': 11,
      'Artistic Mashup': 12,
      'Abstract Fusion': 13,
      'Modern Abstract': 13, // Alternative name for Abstract Fusion
      'Intricate Ink': 14,
      'Deco Luxe': 15
    };
    
    const styleId = styleNameToId[styleName];
    console.log('Style name:', styleName, 'mapped to ID:', styleId);
    
    return styleId || 1; // Default to Original Image if not found
  }
}
