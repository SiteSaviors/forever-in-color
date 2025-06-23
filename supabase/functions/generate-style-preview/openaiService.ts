
import { OpenAIImageResponse, OpenAIAnalysisResponse } from './types.ts';

export class OpenAIService {
  constructor(private apiKey: string, private supabase: any) {}

  async generateImageToImage(imageData: string, styleName: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    console.log('Using GPT-IMG-1 for image transformation with style:', styleName);
    
    try {
      // First, analyze the image to create a detailed transformation prompt
      const analysisResult = await this.analyzeImageForTransformation(imageData, styleName);
      
      if (!analysisResult.ok) {
        const analysisData = await analysisResult.json();
        console.error('Image analysis failed:', analysisData);
        // Use fallback prompt if analysis fails
      }

      let transformationPrompt = '';
      
      if (analysisResult.ok) {
        const analysisData = await analysisResult.json();
        transformationPrompt = analysisData.choices[0]?.message?.content || '';
        console.log('Generated transformation prompt:', transformationPrompt);
      }

      // If analysis failed or returned empty, use style-specific fallback from Supabase
      if (!transformationPrompt) {
        const stylePrompt = await this.getStylePromptFromSupabase(styleName);
        transformationPrompt = stylePrompt || `Transform this image in ${styleName} style while preserving the subject, composition and pose exactly.`;
        console.log('Using Supabase prompt for style:', styleName, '- Prompt:', transformationPrompt);
      }

      // Generate image using GPT-IMG-1
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
          output_format: 'png',
          response_format: 'b64_json' // GPT-IMG-1 always returns base64
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
        console.log('GPT-IMG-1 generation successful');
        
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

  async analyzeImageForTransformation(imageData: string, styleName: string): Promise<Response> {
    // Get style-specific transformation instructions from Supabase
    const baseStylePrompt = await this.getStylePromptFromSupabase(styleName) || `${styleName} artistic style`;
    
    const analysisPrompt = `Analyze this image in detail and create a comprehensive prompt for GPT-IMG-1 image generation.

Your task:
1. Describe the main subject, their pose, expression, clothing, and any key features
2. Describe the background, lighting, and composition
3. Apply this artistic transformation: "${baseStylePrompt}"

CRITICAL REQUIREMENTS:
- Keep the EXACT same subject, face, expression, pose, and composition
- Only change the artistic style and rendering technique
- Preserve all identifying features and anatomical proportions
- Maintain the same background elements and lighting setup

Create a detailed prompt that will generate the same image but rendered in the specified artistic style.

Format your response as a single, detailed prompt for image generation.`;

    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
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
        max_tokens: 300,
        temperature: 0.3
      })
    });
  }

  private async getStylePromptFromSupabase(styleName: string): Promise<string | null> {
    try {
      const styleId = this.getStyleIdByName(styleName);
      
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

      return data?.prompt || null;
    } catch (error) {
      console.warn('Error fetching style prompt from Supabase:', error);
      return null;
    }
  }

  private getStyleIdByName(styleName: string): number {
    const styleNameToId: { [key: string]: number } = {
      'Original Image': 1,
      'Classic Oil Painting': 2,
      'Watercolor Dreams': 4,
      'Pastel Bliss': 5,
      'Gemstone Poly': 6,
      '3D Storybook': 7,
      'Artisan Charcoal': 8,
      'Pop Art Burst': 9,
      'Neon Splash': 10,
      'Electric Bloom': 11,
      'Abstract Fusion': 13,
      'Deco Luxe': 15
    };
    
    return styleNameToId[styleName] || 1;
  }
}
