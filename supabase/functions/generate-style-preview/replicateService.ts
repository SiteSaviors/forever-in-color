import { REPLICATE_CONFIG as _REPLICATE_CONFIG } from './replicate/config.ts';
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
    
    this.apiClient = new ReplicateApiClient(this.apiToken);
    this.pollingService = new PollingService(this.apiToken);
  }

  async generateImageToImage(imageData: string, prompt: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<ReplicateGenerationResponse> {
    // Enhanced validation and logging
    console.log(`🔧 [DEBUG] generateImageToImage called with:`, {
      imageDataLength: imageData?.length || 0,
      imageDataPrefix: imageData?.substring(0, 50) || 'null',
      promptLength: prompt?.length || 0,
      aspectRatio,
      quality
    });

    if (!this.apiToken || this.apiToken === 'undefined' || this.apiToken.trim() === '') {
      console.error(`🔧 [DEBUG] Invalid Replicate API token:`, this.apiToken);
      throw new Error('Invalid or missing Replicate API token');
    }

    if (!this.openaiApiKey || this.openaiApiKey === 'undefined' || this.openaiApiKey.trim() === '') {
      console.error(`🔧 [DEBUG] Invalid OpenAI API key:`, this.openaiApiKey);
      throw new Error('Invalid or missing OpenAI API key');
    }

    // Validate image data format
    if (!imageData || !imageData.startsWith('data:image/')) {
      console.error(`🔧 [DEBUG] Invalid image data format. Expected data:image/... but got:`, imageData?.substring(0, 100));
      throw new Error('Invalid image data format. Expected base64 data URL.');
    }

    // Enhance prompt with identity preservation rules
    const enhancedPrompt = PromptEnhancer.enhanceForIdentityPreservation(prompt);
    
    console.log(`🔧 [DEBUG] Enhanced prompt:`, {
      originalLength: prompt.length,
      enhancedLength: enhancedPrompt.length,
      identityRulesAdded: enhancedPrompt.includes('IDENTITY PRESERVATION RULES')
    });

    const requestBody = {
      input: {
        prompt: enhancedPrompt,
        input_images: [imageData],
        openai_api_key: this.openaiApiKey,
        aspect_ratio: aspectRatio, // 🎯 CRITICAL: This must be the correct aspect ratio
        quality: quality
      }
    };

    console.log(`🔧 [DEBUG] Request body structure:`, {
      input: {
        prompt: prompt.substring(0, 100) + '...',
        input_images_count: requestBody.input.input_images.length,
        input_images_sample: requestBody.input.input_images[0]?.substring(0, 100) + '...',
        openai_api_key_present: !!requestBody.input.openai_api_key,
        openai_api_key_prefix: requestBody.input.openai_api_key?.substring(0, 10) + '...',
        aspect_ratio: requestBody.input.aspect_ratio,
        quality: requestBody.input.quality
      }
    });

    try {
      // Execute with retry logic
      const result = await executeWithRetry(async () => {
        const data = await this.apiClient.createPrediction(requestBody);

        if (!data.ok) {
          console.error('🔧 [DEBUG] Replicate createPrediction failure', {
            status: data.status,
            error: data.error,
            technicalError: data.technicalError
          });
          throw new Error(data.error || 'API call failed');
        }

        // Handle immediate success
        if (data.status === "succeeded" && data.output) {
          return {
            ok: true,
            output: data.output
          };
        } 
        
        // Handle immediate failure
        if (data.status === "failed") {
          const errorMsg = data.error || "GPT-Image-1 generation failed";
          
          
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
          return await this.pollingService.pollForCompletion(data.id!, data.urls?.get!);
        }

        throw new Error(`Unexpected status: ${data.status}`);
      }, 'GPT-Image-1 Generation');

      if (!result.ok) {
        console.error('🔧 [DEBUG] Replicate result not ok', {
          error: result.error,
          technicalError: result.technicalError,
          errorType: result.errorType
        });
      }

      return result;

    } catch (_error) {
      // Convert to user-friendly error
      const parsedError = EnhancedErrorHandler.parseError(error);
      const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
      console.error('🔧 [DEBUG] Replicate generateImageToImage exception', {
        error: error.message,
        stack: error.stack,
        parsedError,
        userMessage
      });
      
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
