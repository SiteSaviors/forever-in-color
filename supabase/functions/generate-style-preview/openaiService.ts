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
    // Simple analysis prompt for image editing
    const analysisPrompt = `Analyze this image and create a brief description focusing on the main subject, composition, and lighting. Keep it under 100 words for use with image transformation.`;

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
        max_tokens: 150,
        temperature: 0.3
      })
    });
  }

  // Keep the DALL-E 3 method as fallback but rename it
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
