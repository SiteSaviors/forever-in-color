import { PromptEnhancer } from './replicate/promptEnhancer.ts';
import { PollingService } from './replicate/pollingService.ts';
import { ReplicateApiClient } from './replicate/apiClient.ts';
import { ReplicateGenerationResponse } from './replicate/types.ts';
import { EnhancedErrorHandler, executeWithRetry } from './errorHandling.ts';

/**
 * Maps Wondertone quality setting to SeeDream size parameter
 */
function mapQualityToSize(quality: string): string {
  switch (quality.toLowerCase()) {
    case 'low':
      return '1K';
    case 'high':
      return '4K';
    case 'medium':
    default:
      return '2K';
  }
}

export class ReplicateService {
  private apiToken: string;
  private apiClient: ReplicateApiClient;
  private pollingService: PollingService;

  constructor(apiToken: string) {
    // Clean the token in case it has extra text
    this.apiToken = apiToken.replace(/^export\s+REPLICATE_API_TOKEN=/, '').trim();

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

    const seedreamSize = mapQualityToSize(quality);

    const requestBody = {
      input: {
        prompt: enhancedPrompt,
        image_input: [imageData],
        aspect_ratio: aspectRatio, // SeeDream supports 1:1, 3:2, 2:3, 4:3, 16:9
        size: seedreamSize, // 1K, 2K, or 4K
        max_images: 1
      }
    };

    console.log(`🔧 [DEBUG] SeeDream request structure:`, {
      input: {
        prompt: prompt.substring(0, 100) + '...',
        image_input_count: requestBody.input.image_input.length,
        image_input_sample: requestBody.input.image_input[0]?.substring(0, 100) + '...',
        aspect_ratio: requestBody.input.aspect_ratio,
        size: requestBody.input.size,
        max_images: requestBody.input.max_images
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
          const errorMsg = data.error || "SeeDream generation failed";


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
          const predictionId = data.id;
          const getUrl = data.urls?.get;
          if (!predictionId || !getUrl) {
            throw new Error('Missing prediction ID or get URL for polling');
          }
          return await this.pollingService.pollForCompletion(predictionId, getUrl);
        }

        throw new Error(`Unexpected status: ${data.status}`);
      }, 'SeeDream Generation');

      if (!result.ok) {
        console.error('🔧 [DEBUG] Replicate result not ok', {
          error: result.error,
          technicalError: result.technicalError,
          errorType: result.errorType
        });
      }

      return result;

    } catch (error) {
      const parsedError = EnhancedErrorHandler.parseError(error);
      const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
      console.error('🔧 [DEBUG] Replicate generateImageToImage exception', {
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        parsedError,
        userMessage
      });
      
      return {
        ok: false,
        error: userMessage,
        technicalError: error instanceof Error ? error.message : String(error),
        errorType: parsedError.type
      };
    }
  }

  async generateImageToImageWithGpt(
    imageData: string,
    prompt: string,
    aspectRatio: string,
    quality: string,
    openAiApiKey: string
  ): Promise<ReplicateGenerationResponse> {
    if (!openAiApiKey) {
      return {
        ok: false,
        error: 'GPT-Image-1 fallback is disabled: OPENAI_API_KEY not configured'
      };
    }

    console.log('🔧 [DEBUG] generateImageToImageWithGpt invoked', {
      imageDataLength: imageData?.length || 0,
      aspectRatio,
      quality
    });

    const enhancedPrompt = PromptEnhancer.enhanceForIdentityPreservation(prompt);
    const requestBody = {
      input: {
        prompt: enhancedPrompt,
        input_images: [imageData],
        openai_api_key: openAiApiKey,
        aspect_ratio: aspectRatio,
        quality
      }
    };

    try {
      const result = await executeWithRetry(async () => {
        const data = await this.apiClient.createPrediction(requestBody, 'openai/gpt-image-1');

        if (!data.ok) {
          throw new Error(data.error || 'API call failed');
        }

        if (data.status === 'succeeded' && data.output) {
          return {
            ok: true,
            output: data.output
          };
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'GPT-Image-1 generation failed');
        }

        if (data.status === 'processing' || data.status === 'starting') {
          const predictionId = data.id;
          const getUrl = data.urls?.get;
          if (!predictionId || !getUrl) {
            throw new Error('Missing prediction ID or get URL for polling');
          }
          return await this.pollingService.pollForCompletion(predictionId, getUrl);
        }

        throw new Error(`Unexpected status: ${data.status}`);
      }, 'GPT-Image-1 Fallback');

      return result;
    } catch (error) {
      const parsedError = EnhancedErrorHandler.parseError(error);
      const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);

      console.error('🔧 [DEBUG] GPT-Image-1 fallback exception', {
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        parsedError,
        userMessage
      });

      return {
        ok: false,
        error: userMessage,
        technicalError: error instanceof Error ? error.message : String(error),
        errorType: parsedError.type
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ReplicateGenerationResponse> {
    return this.apiClient.getPredictionStatus(predictionId);
  }
}
