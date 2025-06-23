
export class ReplicateService {
  private apiToken: string;
  private baseUrl = "https://api.replicate.com/v1";

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async generateImageToImage(imageData: string, prompt: string): Promise<any> {
    console.log('Starting Flux Kontext Max generation with prompt:', prompt);
    
    try {
      // Step 1: Create prediction
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-kontext-max:latest", // Using latest version
          input: {
            image: imageData, // Base64 or URL
            prompt: prompt,
            num_inference_steps: 28,
            guidance_scale: 7.5,
            output_format: "webp",
            output_quality: 90
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Replicate API error:', response.status, errorData);
        return {
          ok: false,
          error: `API request failed: ${response.status} - ${errorData}`
        };
      }

      const data = await response.json();
      console.log('Prediction created:', data.id);

      // Step 2: Poll for completion
      return await this.pollForCompletion(data.id, data.urls.get);
    } catch (error) {
      console.error('Replicate error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  async pollForCompletion(predictionId: string, pollUrl: string): Promise<any> {
    console.log('Polling for completion:', predictionId);
    
    const maxAttempts = 30; // 1 minute max (2 seconds * 30)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(pollUrl, {
          headers: {
            "Authorization": `Token ${this.apiToken}`,
          },
        });

        if (!response.ok) {
          console.error('Polling failed:', response.status);
          return {
            ok: false,
            error: `Polling failed: ${response.status}`
          };
        }

        const result = await response.json();
        console.log(`Poll attempt ${attempts + 1}, status:`, result.status);

        if (result.status === "succeeded") {
          console.log('Generation succeeded:', result.output);
          return {
            ok: true,
            output: result.output
          };
        } else if (result.status === "failed") {
          console.error('Generation failed:', result.error);
          return {
            ok: false,
            error: result.error || "Image generation failed"
          };
        } else if (result.status === "canceled") {
          return {
            ok: false,
            error: "Generation was canceled"
          };
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      ok: false,
      error: "Generation timed out after 1 minute"
    };
  }

  async getPredictionStatus(predictionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Token ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        return {
          ok: false,
          error: `Status check failed: ${response.status}`
        };
      }

      const result = await response.json();
      return {
        ok: true,
        ...result
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
