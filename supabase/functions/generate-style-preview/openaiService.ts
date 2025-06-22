
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
    // Simplified analysis prompt to avoid content policy issues
    const analysisPrompt = `Create a detailed description for generating an artistic version of this image with the following style: ${stylePrompt}

Please describe:
- The main subject and their key visual characteristics
- The setting and background elements
- The composition and lighting
- How to apply the artistic style transformation

Keep the description factual and suitable for image generation. Provide only the generation prompt.`;

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
