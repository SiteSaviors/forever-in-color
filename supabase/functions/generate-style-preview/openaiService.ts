import { OpenAIImageResponse, OpenAIAnalysisResponse } from './types.ts';

export class OpenAIService {
  constructor(private apiKey: string, private supabase: any) {}

  async generateImageToImage(imageData: string, styleName: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    console.log('Using GPT-IMG-1 for image transformation with style:', styleName);
    
    try {
      // Get the style prompt directly from Supabase without analysis
      const stylePrompt = await this.getStylePromptFromSupabase(styleName);
      const transformationPrompt = stylePrompt || `Transform this image in ${styleName} style while preserving the subject, composition and pose exactly.`;
      
      console.log('Using prompt for style:', styleName, '- Prompt:', transformationPrompt.substring(0, 100) + '...');

      // Generate image using GPT-IMG-1 with correct parameters
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: transformationPrompt,
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
        console.log('GPT-IMG-1 generation successful with high quality');
        
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

  // Removed the analyzeImageForTransformation method since Leonardo doesn't use prompt enhancement

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
