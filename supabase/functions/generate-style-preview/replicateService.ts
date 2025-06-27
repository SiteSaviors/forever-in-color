import { REPLICATE_CONFIG } from './replicate/config.ts';
import { PromptEnhancer } from './replicate/promptEnhancer.ts';
import { PollingService } from './replicate/pollingService.ts';
import { ReplicateApiClient } from './replicate/apiClient.ts';
import { ReplicateGenerationResponse } from './replicate/types.ts';
import { EnhancedErrorHandler, executeWithRetry } from './errorHandling.ts';

export class ReplicateService {
  private apiToken: string;
  private openaiApiKey: string;
  private apiClient: ReplicateApiClient;
  private pollingService: PollingService;

  constructor(apiToken: string, openaiApiKey: string) {
    // Store the tokens directly without any string manipulation
    this.apiToken = apiToken;
    this.openaiApiKey = openaiApiKey;
    
    console.log("ReplicateService initialized for GPT-Image-1 with token length:", this.apiToken?.length);

    this.apiClient = new ReplicateApiClient(this.apiToken);
    this.pollingService = new PollingService(this.apiToken);
  }

  async generateImageToImage(imageData: string, prompt: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<ReplicateGenerationResponse> {
    console.log('=== REPLICATE SERVICE GENERATION ===');
    console.log('Starting GPT-Image-1 generation with enhanced error handling');
    console.log('Prompt length:', prompt.length);
    
    // Validate inputs
    if (!this.apiToken || this.apiToken === 'undefined' || this.apiToken.trim() === '') {
      throw new Error('Invalid or missing Replicate API token');
    }

    if (!this.openaiApiKey || this.openaiApiKey === 'undefined' || this.openaiApiKey.trim() === '') {
      throw new Error('Invalid or missing OpenAI API key');
    }

    // Enhance the prompt with identity preservation rules
    const enhancedPrompt = PromptEnhancer.enhanceForIdentityPreservation(prompt);

    // Prepare the request body for GPT-Image-1 (removed quality parameter as it's not supported)
    const requestBody = {
      input: {
        prompt: enhancedPrompt,
        image: imageData,
        openai_api_key: this.openaiApiKey,
        negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation"
      }
    };

    try {
      // Execute with retry logic
      const result = await executeWithRetry(async () => {
        console.log('Making API call to GPT-Image-1...');
        const data = await this.apiClient.createPrediction(requestBody);

        if (!data.ok) {
          throw new Error(data.error || 'API call failed');
        }

        // For Replicate, we need to poll for the result
        if (data.id && data.urls?.get) {
          console.log('GPT-Image-1 requires polling, prediction ID:', data.id);
          return await this.pollingService.pollForCompletion(data.id, data.urls.get);
        }

        throw new Error(`Unexpected response format: ${JSON.stringify(data)}`);
      }, 'GPT-Image-1 Generation');

      return result;

    } catch (error) {
      console.error('GPT-Image-1 Replicate error after retries:', error);
      
      // Convert to user-friendly error
      const parsedError = EnhancedErrorHandler.parseError(error);
      const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
      
      return {
        ok: false,
        error: userMessage,
        technicalError: error.message,
        errorType: parsedError.type
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ReplicateGenerationResponse> {
    return this.apiClient.getPredictionStatus(predictionId);
  }
}