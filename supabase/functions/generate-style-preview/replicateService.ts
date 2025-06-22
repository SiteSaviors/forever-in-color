
import Replicate from "https://esm.sh/replicate@0.25.2";

export class ReplicateService {
  private replicate: Replicate;

  constructor(apiKey: string) {
    this.replicate = new Replicate({
      auth: apiKey,
    });
  }

  async generateImageToImage(imageData: string, prompt: string): Promise<any> {
    console.log('Using Replicate flux-kontext-max for image-to-image transformation with prompt:', prompt);
    
    try {
      const output = await this.replicate.run(
        "black-forest-labs/flux-kontext-max",
        {
          input: {
            image: imageData,
            prompt: prompt,
            strength: 0.8, // How much to transform vs preserve original
            num_inference_steps: 28,
            guidance_scale: 7.5,
            output_format: "webp",
            output_quality: 90
          }
        }
      );

      console.log('Replicate output:', output);
      return {
        ok: true,
        output: output
      };
    } catch (error) {
      console.error('Replicate error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<any> {
    try {
      const prediction = await this.replicate.predictions.get(predictionId);
      return {
        ok: true,
        ...prediction
      };
    } catch (error) {
      console.error('Error getting prediction status:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  async analyzeImageForTransformation(imageData: string, stylePrompt: string): Promise<Response> {
    // Still use OpenAI for image analysis to create better prompts
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found for image analysis');
    }

    const analysisPrompt = `Analyze this image and create a detailed transformation prompt for image-to-image AI generation. 

Style to apply: "${stylePrompt}"

Create a prompt that will transform this image while keeping the same subject, pose, and composition. Focus on the artistic style transformation only.

Format: "Transform this image into [style description], maintaining the same subject and composition"`;

    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
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
        max_tokens: 200,
        temperature: 0.3
      })
    });
  }
}
