export class ReplicateService {
  constructor(private apiKey: string) {}

  async generateImageToImage(imageData: string, prompt: string): Promise<Response> {
    console.log('Using Replicate flux-kontext-max for image-to-image transformation with prompt:', prompt);
    
    return await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "ae580b36d6ce8fc7a4d9c79c36fca78e86c8db3cd2b60b3ff4ed24b3b8a5c6ec", // flux-kontext-max
        input: {
          image: imageData,
          prompt: prompt,
          strength: 0.8, // How much to transform vs preserve original
          num_inference_steps: 28,
          guidance_scale: 7.5,
          output_format: "webp",
          output_quality: 90
        }
      })
    });
  }

  async getPredictionStatus(predictionId: string): Promise<Response> {
    return await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      }
    });
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
