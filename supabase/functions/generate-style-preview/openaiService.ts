
import { OpenAIImageResponse, OpenAIAnalysisResponse } from './types.ts';

export class OpenAIService {
  constructor(private apiKey: string) {}

  async generateImageToImage(imageData: string, prompt: string): Promise<Response> {
    // Use DALL-E 3 with image analysis for better img2img results
    console.log('Using DALL-E 3 for image-to-image generation with prompt:', prompt);
    
    return await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json'
      })
    });
  }

  async analyzeImageForTransformation(imageData: string, stylePrompt: string): Promise<Response> {
    // Analyze the image to create a detailed transformation prompt
    const analysisPrompt = `Analyze this image and create a detailed description that preserves the exact subject, pose, composition, and setting. Then transform it using this style: "${stylePrompt}". 

Important: Keep the same subject, same pose, same background, same composition - only change the artistic style. Describe what you see first, then apply the style transformation while maintaining all original elements.

Format: "A [detailed description of the subject, pose, setting] rendered in [style transformation]"`;

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
}
