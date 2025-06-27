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
    // Clean the tokens in case they have extra text
    this.apiToken = apiToken.replace(/^export\s+REPLICATE_API_TOKEN=/, '').trim();
    this.openaiApiKey = openaiApiKey.replace(/^export\s+OPENAI_API_KEY=/, '').trim();
    
    console.log("ReplicateService initialized for GPT-Image-1 with token length:", this.apiToken?.length);

    this.apiClient = new ReplicateApiClient(this.apiToken);
    this.pollingService = new PollingService(this.apiToken);
  }

  async generateImageToImage(imageData: string, prompt: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<ReplicateGenerationResponse> {
    console.log('=== REPLICATE SERVICE GENERATION ===');
    console.log('Starting GPT-Image-1 generation with enhanced error handling');
    console.log('🔥 CRITICAL: Replicate Service received aspect ratio:', aspectRatio);
    console.log('Prompt length:', prompt.length);
    
    // Validate inputs
    if (!this.apiToken || this.apiToken === 'undefined' || this.apiToken.trim() === '') {
      throw new Error('Invalid or missing Replicate API token');
    }

    if (!this.openaiApiKey || this.openaiApiKey === 'undefined' || this.openaiApiKey.trim() === '') {
      throw new Error('Invalid or missing OpenAI API key');
    }

    const requestBody = {
      input: {
        prompt: prompt,
        input_images: [imageData],
        openai_api_key: this.openaiApiKey,
        aspect_ratio: aspectRatio, // 🎯 CRITICAL: This must be the correct aspect ratio
        quality: quality
      }
    };

    console.log('🎯 CRITICAL: Request body aspect_ratio before API call:', requestBody.input.aspect_ratio);

    try {
      // Execute with retry logic
      const result = await executeWithRetry(async () => {
        console.log('Making API call to GPT-Image-1...');
        const data = await this.apiClient.createPrediction(requestBody);

        if (!data.ok) {
          throw new Error(data.error || 'API call failed');
        }

        // Handle immediate success
        if (data.status === "succeeded" && data.output) {
          console.log('GPT-Image-1 generation succeeded immediately');
          return {
            ok: true,
            output: data.output
          };
        } 
        
        // Handle immediate failure
        if (data.status === "failed") {
          const errorMsg = data.error || "GPT-Image-1 generation failed";
          console.error('GPT-Image-1 generation failed immediately:', errorMsg);
          
          // Check for specific error types
          if (errorMsg.includes('high demand') || errorMsg.includes('E003')) {
            const error = new Error(errorMsg);
            error.name = 'ServiceUnavailable';
            throw error;
          }
          
          throw new Error(errorMsg);
        }
        
        // Handle polling requirement
        if (data.status === "processing" || data.status === "starting") {
          console.log('GPT-Image-1 requires polling, prediction ID:', data.id);
          return await this.pollingService.pollForCompletion(data.id!, data.urls?.get!);
        }

        throw new Error(`Unexpected status: ${data.status}`);
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