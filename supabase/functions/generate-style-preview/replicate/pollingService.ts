
import { ReplicateGenerationResponse } from './types.ts';
import { EnhancedErrorHandler, executeWithRetry } from '../errorHandling.ts';
import { resolvePreviewTimingConfig } from './config.ts';

export class PollingService {
  constructor(private apiToken: string) {}

  async pollForCompletion(predictionId: string, getUrl: string): Promise<ReplicateGenerationResponse> {
    
    const { maxAttempts, pollIntervalMs } = resolvePreviewTimingConfig(); // defaults: 30 attempts, 2000ms interval
    const pollInterval = pollIntervalMs;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        
        const result = await executeWithRetry(async () => {
          const response = await fetch(getUrl, {
            headers: {
              "Authorization": `Bearer ${this.apiToken}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            
            if (response.status === 503) {
              const error = new Error('Service temporarily unavailable');
              error.name = 'ServiceUnavailable';
              throw error;
            }
            
            throw new Error(`Polling failed: ${response.status} - ${errorText}`);
          }

          return await response.json();
        }, `Polling attempt ${attempt}`);

        

        if (result.status === 'succeeded') {
          let outputUrl = result.output;
          if (Array.isArray(outputUrl)) {
            outputUrl = outputUrl[0];
          }
          
          
          return {
            ok: true,
            output: outputUrl
          };
        }
        
        if (result.status === 'failed') {
          const errorMsg = result.error || 'Generation failed during polling';
          
          return {
            ok: false,
            error: EnhancedErrorHandler.createUserFriendlyMessage({
              type: 'service_unavailable',
              status: 500,
              message: errorMsg
            })
          };
        }
        
        if (result.status === 'canceled') {
          return {
            ok: false,
            error: 'Generation was canceled'
          };
        }

        // Continue polling for other statuses
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

      } catch (error) {
        
        // If this is the last attempt, return the error
        if (attempt >= maxAttempts) {
          const parsedError = EnhancedErrorHandler.parseError(error);
          return {
            ok: false,
            error: EnhancedErrorHandler.createUserFriendlyMessage(parsedError)
          };
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    
    return {
      ok: false,
      error: 'Generation is taking longer than expected. Please try again.'
    };
  }
}
