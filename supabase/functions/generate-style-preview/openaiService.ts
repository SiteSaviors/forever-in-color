
import { OpenAIImageResponse, OpenAIAnalysisResponse } from './types.ts';
import { createImageEditFormData } from './imageUtils.ts';

export class OpenAIService {
  constructor(private apiKey: string) {}

  async editImage(imageData: string, prompt: string): Promise<Response> {
    const formData = createImageEditFormData(imageData, prompt);
    
    return await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData
    });
  }

  async analyzeImage(imageData: string, stylePrompt: string): Promise<Response> {
    // Create a focused analysis prompt for better image-to-image transformation
    const analysisPrompt = `Please analyze this image and create a detailed prompt for DALL-E 3 to generate a stylized version.

Style to apply: ${stylePrompt}

Provide a complete generation prompt that includes:
1. A detailed description of the main subject(s) in the image
2. The setting, background, and environmental details
3. Lighting, mood, and atmosphere
4. How to apply the specific artistic style transformation
5. Composition and perspective details

Make the prompt detailed and specific for high-quality generation. Focus on preserving the essence and key elements of the original image while applying the artistic transformation.

Return only the generation prompt, nothing else.`;

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
        max_tokens: 500,
        temperature: 0.2
      })
    });
  }

  async generateWithDallE3(prompt: string): Promise<Response> {
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
}
