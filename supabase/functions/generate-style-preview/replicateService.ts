
export class ReplicateService {
  constructor(private apiKey: string) {}

  async generateImageToImage(imageData: string, prompt: string): Promise<Response> {
    console.log('Using Replicate SDXL for image-to-image transformation with prompt:', prompt);
    
    return await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL img2img
        input: {
          image: imageData,
          prompt: prompt,
          negative_prompt: "blurry, low quality, distorted, deformed",
          num_inference_steps: 20,
          guidance_scale: 7.5,
          strength: 0.8, // How much to transform the original image
          scheduler: "K_EULER"
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
