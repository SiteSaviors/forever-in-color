
import { REPLICATE_CONFIG } from './replicate/config.ts';
import { PromptEnhancer } from './replicate/promptEnhancer.ts';
import { PollingService } from './replicate/pollingService.ts';
import { ReplicateApiClient } from './replicate/apiClient.ts';
import { ReplicateGenerationResponse } from './replicate/types.ts';

export class ReplicateService {
  private apiToken: string;
  private apiClient: ReplicateApiClient;
  private pollingService: PollingService;

  constructor(apiToken: string) {
    // Clean the token in case it has extra text
    this.apiToken = apiToken.replace(/^export\s+REPLICATE_API_TOKEN=/, '').trim();
    
    // Debug logging to see what token we actually have
    console.log("ReplicateService initialized with token:", this.apiToken);
    console.log("Token starts with 'r8_':", this.apiToken?.startsWith('r8_'));
    console.log("Token length:", this.apiToken?.length);

    this.apiClient = new ReplicateApiClient(this.apiToken);
    this.pollingService = new PollingService(this.apiToken);
  }

  async generateImageToImage(imageData: string, prompt: string): Promise<ReplicateGenerationResponse> {
    console.log('Starting Flux Kontext Pro generation with enhanced identity preservation prompt:', prompt);
    
    // Additional debug logging
    if (!this.apiToken || this.apiToken === 'undefined' || this.apiToken.trim() === '') {
      console.error('Invalid API token detected:', { 
        token: this.apiToken, 
        type: typeof this.apiToken,
        isEmpty: !this.apiToken 
      });
      return {
        ok: false,
        error: 'Invalid or missing Replicate API token'
      };
    }
    
    try {
      // Enhanced prompt with stronger identity preservation
      const enhancedPrompt = PromptEnhancer.enhanceForIdentityPreservation(prompt);

      const requestBody = {
        input: {
          prompt: enhancedPrompt,
          input_image: imageData,
          output_format: REPLICATE_CONFIG.defaultOutputFormat
        }
      };

      console.log('Making request to flux-kontext-pro model with enhanced identity preservation');

      const data = await this.apiClient.createPrediction(requestBody);

      if (!data.ok) {
        return data;
      }

      // With "Prefer: wait" header, the response should contain the final result
      if (data.status === "succeeded" && data.output) {
        console.log('Generation succeeded:', data.output);
        return {
          ok: true,
          output: data.output
        };
      } else if (data.status === "failed") {
        console.error('Generation failed:', data.error);
        return {
          ok: false,
          error: data.error || "Image generation failed"
        };
      } else {
        // Fallback to polling if needed
        return await this.pollingService.pollForCompletion(data.id!, data.urls?.get!);
      }
    } catch (error) {
      console.error('Replicate error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ReplicateGenerationResponse> {
    return this.apiClient.getPredictionStatus(predictionId);
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
