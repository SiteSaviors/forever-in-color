
import { REPLICATE_CONFIG } from './replicate/config.ts';
import { PromptEnhancer } from './replicate/promptEnhancer.ts';
import { PollingService } from './replicate/pollingService.ts';
import { ReplicateApiClient } from './replicate/apiClient.ts';
import { ReplicateGenerationResponse } from './replicate/types.ts';

export class ReplicateService {
  private apiToken: string;
  private openaiApiKey: string;
  private apiClient: ReplicateApiClient;
  private pollingService: PollingService;

  constructor(apiToken: string, openaiApiKey: string) {
    // Clean the tokens in case they have extra text
    this.apiToken = apiToken.replace(/^export\s+REPLICATE_API_TOKEN=/, '').trim();
    this.openaiApiKey = openaiApiKey;
    
    // Debug logging to see what token we actually have
    console.log("ReplicateService initialized for GPT-Image-1 with token:", this.apiToken);
    console.log("Token starts with 'r8_':", this.apiToken?.startsWith('r8_'));
    console.log("Token length:", this.apiToken?.length);

    this.apiClient = new ReplicateApiClient(this.apiToken);
    this.pollingService = new PollingService(this.apiToken);
  }

  async generateImageToImage(imageData: string, prompt: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<ReplicateGenerationResponse> {
    console.log('=== REPLICATE SERVICE GENERATION ===');
    console.log('Starting GPT-Image-1 generation via Replicate with prompt:', prompt);
    console.log('ASPECT RATIO RECEIVED IN REPLICATE SERVICE:', aspectRatio);
    
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

    if (!this.openaiApiKey || this.openaiApiKey === 'undefined' || this.openaiApiKey.trim() === '') {
      console.error('Invalid OpenAI API key detected');
      return {
        ok: false,
        error: 'Invalid or missing OpenAI API key'
      };
    }
    
    try {
      const requestBody = {
        input: {
          prompt: prompt,
          input_images: [imageData],
          openai_api_key: this.openaiApiKey,
          aspect_ratio: aspectRatio, // CRITICAL: Ensure this is set
          quality: quality
        }
      };

      console.log('REPLICATE REQUEST BODY INPUT:', JSON.stringify(requestBody.input, null, 2));
      console.log('ASPECT RATIO IN REQUEST BODY:', requestBody.input.aspect_ratio);

      const data = await this.apiClient.createPrediction(requestBody);

      if (!data.ok) {
        return data;
      }

      // With "Prefer: wait" header, the response should contain the final result
      if (data.status === "succeeded" && data.output) {
        console.log('GPT-Image-1 generation succeeded with aspect ratio:', aspectRatio, 'Output:', data.output);
        return {
          ok: true,
          output: data.output
        };
      } else if (data.status === "failed") {
        console.error('GPT-Image-1 generation failed:', data.error);
        return {
          ok: false,
          error: data.error || "GPT-Image-1 generation failed"
        };
      } else {
        // Fallback to polling if needed
        return await this.pollingService.pollForCompletion(data.id!, data.urls?.get!);
      }
    } catch (error) {
      console.error('GPT-Image-1 Replicate error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ReplicateGenerationResponse> {
    return this.apiClient.getPredictionStatus(predictionId);
  }
}
