
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
    const analysisPrompt = `Analyze this image in EXTREME detail and create a comprehensive description for DALL-E 3 to recreate it with this transformation: ${stylePrompt}. 

CRITICAL REQUIREMENTS:
1. Describe EVERY visible detail of the subject: exact breed, size, age, facial features, eye color and shape, ear position, fur color patterns, markings, pose, expression
2. Describe the exact composition: subject position, angle, background elements, lighting direction
3. Include precise spatial relationships and proportions
4. Apply the artistic transformation while keeping everything else identical
5. Start with "Recreate this exact scene with perfect accuracy:"
6. Be extremely specific about preserving the original subject's unique characteristics
7. Keep under 1000 characters for DALL-E 3

Provide ONLY the detailed generation prompt.`;

    return await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.1
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
